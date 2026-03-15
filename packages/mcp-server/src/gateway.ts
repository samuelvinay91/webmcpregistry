/**
 * WebMCP Gateway — the complete MCP server that discovers, executes, and validates
 * WebMCP tools on any website using Playwright.
 *
 * Architecture:
 * ┌──────────────┐     MCP (stdio)    ┌──────────────────────────────────────┐
 * │ Claude /     │◄──────────────────►│ WebMCP Gateway                       │
 * │ ChatGPT /   │                     │                                      │
 * │ Cursor      │  tools/list         │ ┌──────────┐  ┌──────────────────┐  │
 * │             │◄────────────────────│ │ Discovery │  │ Playwright       │  │
 * │             │                     │ │ Engine    │──│ Browser Manager  │  │
 * │             │  tools/call         │ └──────────┘  │                  │  │
 * │             │────────────────────►│ ┌──────────┐  │ Page per URL     │  │
 * │             │                     │ │ Executor  │──│ navigator.       │  │
 * │             │◄────────────────────│ │           │  │ modelContext     │  │
 * └──────────────┘  result            │ └──────────┘  └──────────────────┘  │
 *                                     │ ┌──────────┐                        │
 *                                     │ │ Validator │ (@webmcpregistry/core)│
 *                                     │ └──────────┘                        │
 *                                     └──────────────────────────────────────┘
 */

import { BrowserManager, type BrowserConfig } from './browser.js'
import { discoverTools, type DiscoveredTool } from './discovery.js'
import { executeToolForMCP } from './executor.js'
import {
  validateTools,
  runSecurityScan,
  type ValidationResult,
  type SecurityReport,
} from '@webmcpregistry/core'

export interface GatewayConfig extends BrowserConfig {
  /** URLs to discover WebMCP tools from. */
  urls: string[]
}

export { type DiscoveredTool } from './discovery.js'

export class WebMCPGateway {
  private config: GatewayConfig
  private browser: BrowserManager
  private tools: DiscoveredTool[] = []
  private toolPageMap = new Map<string, string>() // toolName → url
  private initialized = false

  constructor(config: GatewayConfig) {
    this.config = config
    this.browser = new BrowserManager(config)
  }

  /**
   * Discover WebMCP tools from all configured URLs.
   * Launches browser, navigates to each URL, and extracts tools.
   */
  async discover(): Promise<DiscoveredTool[]> {
    this.tools = []
    this.toolPageMap.clear()

    for (const url of this.config.urls) {
      try {
        const page = await this.browser.getPage(url)
        const discovered = await discoverTools(page)

        for (const tool of discovered) {
          // Deduplicate by name (keep first occurrence)
          if (!this.toolPageMap.has(tool.definition.name)) {
            this.tools.push(tool)
            this.toolPageMap.set(tool.definition.name, url)
          }
        }
      } catch (err) {
        console.error(`[WebMCP] Failed to discover tools from ${url}:`, err)
      }
    }

    this.initialized = true
    return this.tools
  }

  /**
   * Get all discovered tools.
   */
  getDiscoveredTools(): DiscoveredTool[] {
    return this.tools
  }

  /**
   * Get tools formatted for MCP tools/list response.
   */
  getMCPTools(): Array<{ name: string; description: string; inputSchema: object }> {
    // Include our built-in meta-tools alongside discovered tools
    return [
      ...this.tools.map((dt) => ({
        name: dt.definition.name,
        description: dt.definition.description,
        inputSchema: dt.definition.inputSchema ?? { type: 'object' as const, properties: {} },
      })),
      // Meta-tool: re-discover tools (useful if page state changes)
      {
        name: 'webmcp_rediscover',
        description: 'Re-scan all configured URLs to discover new or changed WebMCP tools',
        inputSchema: { type: 'object' as const, properties: {} },
      },
      // Meta-tool: validate all tools
      {
        name: 'webmcp_validate',
        description: 'Run validation and security scanning on all discovered WebMCP tools',
        inputSchema: { type: 'object' as const, properties: {} },
      },
      // Meta-tool: get discovery report
      {
        name: 'webmcp_report',
        description: 'Get a detailed report of all discovered WebMCP tools with their sources and capabilities',
        inputSchema: { type: 'object' as const, properties: {} },
      },
    ]
  }

  /**
   * Call a tool — either a discovered WebMCP tool or a meta-tool.
   */
  async callTool(
    name: string,
    args: Record<string, unknown>,
  ): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
    // Handle meta-tools
    if (name === 'webmcp_rediscover') {
      const tools = await this.discover()
      return {
        content: [{
          type: 'text',
          text: `Re-discovered ${tools.length} tool(s) from ${this.config.urls.length} URL(s):\n${tools.map((t) => `  - ${t.definition.name} (${t.discoveryMethod}, ${t.executable ? 'executable' : 'definition only'})`).join('\n')}`,
        }],
      }
    }

    if (name === 'webmcp_validate') {
      return this.handleValidation()
    }

    if (name === 'webmcp_report') {
      return this.handleReport()
    }

    // Handle discovered WebMCP tools
    const url = this.toolPageMap.get(name)
    if (!url) {
      return {
        content: [{
          type: 'text',
          text: `Tool "${name}" not found. Available tools: ${this.tools.map((t) => t.definition.name).join(', ')}`,
        }],
        isError: true,
      }
    }

    const tool = this.tools.find((t) => t.definition.name === name)
    if (!tool?.executable) {
      return {
        content: [{
          type: 'text',
          text: `Tool "${name}" was discovered from HTML but is not executable (no live handler in browser). It was found via ${tool?.discoveryMethod} at ${url}.\n\nDefinition:\n${JSON.stringify(tool?.definition, null, 2)}`,
        }],
      }
    }

    // Execute in browser
    const page = await this.browser.getPage(url)
    return executeToolForMCP(page, name, args)
  }

  /**
   * Validate all discovered tools and return results.
   */
  private handleValidation(): { content: Array<{ type: string; text: string }> } {
    const definitions = this.tools.map((t) => t.definition)
    const validation: ValidationResult = validateTools(definitions)
    const security: SecurityReport = runSecurityScan(definitions)

    const lines: string[] = [
      `WebMCP Validation Report`,
      `========================`,
      ``,
      `Tools: ${definitions.length}`,
      `Validation score: ${validation.score}/100 (${validation.valid ? 'PASS' : 'FAIL'})`,
      `Security: ${security.status} (${security.score}/100)`,
      ``,
    ]

    if (validation.issues.length > 0) {
      lines.push(`Validation Issues:`)
      for (const issue of validation.issues) {
        lines.push(`  [${issue.severity.toUpperCase()}] ${issue.message}`)
      }
      lines.push(``)
    }

    if (security.findings.length > 0) {
      lines.push(`Security Findings:`)
      for (const finding of security.findings) {
        lines.push(`  [${finding.severity.toUpperCase()}] ${finding.description}`)
      }
      lines.push(``)
    }

    if (validation.issues.length === 0 && security.findings.length === 0) {
      lines.push(`All clear — no validation or security issues found.`)
    }

    return { content: [{ type: 'text', text: lines.join('\n') }] }
  }

  /**
   * Generate a detailed report of discovered tools.
   */
  private handleReport(): { content: Array<{ type: string; text: string }> } {
    const lines: string[] = [
      `WebMCP Discovery Report`,
      `=======================`,
      ``,
      `URLs scanned: ${this.config.urls.join(', ')}`,
      `Total tools: ${this.tools.length}`,
      `Executable: ${this.tools.filter((t) => t.executable).length}`,
      `Definition only: ${this.tools.filter((t) => !t.executable).length}`,
      ``,
    ]

    for (const tool of this.tools) {
      const d = tool.definition
      lines.push(`--- ${d.name} ---`)
      lines.push(`  Description: ${d.description}`)
      lines.push(`  Safety: ${d.safetyLevel ?? 'read'}`)
      lines.push(`  Source: ${tool.sourceUrl}`)
      lines.push(`  Discovery: ${tool.discoveryMethod}`)
      lines.push(`  Executable: ${tool.executable}`)
      const schema = d.inputSchema ?? { type: 'object' as const, properties: {} }
      const props = Object.keys(schema.properties ?? {})
      if (props.length > 0) {
        lines.push(`  Inputs: ${props.join(', ')}`)
        if (schema.required?.length) {
          lines.push(`  Required: ${schema.required.join(', ')}`)
        }
      }
      lines.push(``)
    }

    return { content: [{ type: 'text', text: lines.join('\n') }] }
  }

  /**
   * Clean up — close browser.
   */
  async dispose(): Promise<void> {
    await this.browser.dispose()
  }
}
