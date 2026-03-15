/**
 * WebMCP Gateway — discovers and proxies WebMCP tools from websites.
 *
 * This module fetches a website, extracts WebMCP tool definitions from the HTML,
 * and makes them available as callable MCP tools.
 */

import type { ToolDefinition, ToolInputSchema } from '@webmcpregistry/core'

export interface GatewayConfig {
  /** The URL(s) to discover WebMCP tools from. */
  urls: string[]
  /** User agent string for fetching. */
  userAgent?: string
  /** Timeout for fetching pages (ms). */
  timeout?: number
}

export interface DiscoveredTool {
  /** The tool definition extracted from the page. */
  definition: ToolDefinition
  /** The URL where this tool was discovered. */
  sourceUrl: string
  /** Whether this was found via declarative attributes or JS detection. */
  discoveryMethod: 'declarative' | 'imperative' | 'inferred'
}

/**
 * WebMCP Gateway — discovers tools from websites and serves them as MCP tools.
 */
export class WebMCPGateway {
  private config: GatewayConfig
  private discoveredTools: DiscoveredTool[] = []

  constructor(config: GatewayConfig) {
    this.config = {
      userAgent: 'WebMCPGateway/0.1.0 (+https://webmcpregistry.com)',
      timeout: 15000,
      ...config,
    }
  }

  /**
   * Discover WebMCP tools from all configured URLs.
   */
  async discover(): Promise<DiscoveredTool[]> {
    this.discoveredTools = []

    for (const url of this.config.urls) {
      try {
        const tools = await this.discoverFromUrl(url)
        this.discoveredTools.push(...tools)
      } catch (err) {
        console.error(`[WebMCP Gateway] Failed to discover tools from ${url}:`, err)
      }
    }

    return this.discoveredTools
  }

  /**
   * Get all discovered tools.
   */
  getTools(): DiscoveredTool[] {
    return this.discoveredTools
  }

  /**
   * Get MCP-compatible tool definitions (for the MCP protocol response).
   */
  getMCPToolDefinitions(): Array<{
    name: string
    description: string
    inputSchema: ToolInputSchema & { type: 'object' }
  }> {
    return this.discoveredTools.map((dt) => ({
      name: dt.definition.name,
      description: `[${dt.sourceUrl}] ${dt.definition.description}`,
      inputSchema: dt.definition.inputSchema,
    }))
  }

  private async discoverFromUrl(url: string): Promise<DiscoveredTool[]> {
    const html = await this.fetchPage(url)
    if (!html) return []

    const tools: DiscoveredTool[] = []

    // 1. Detect declarative tools (toolname attributes on forms)
    tools.push(...this.extractDeclarativeTools(html, url))

    // 2. Detect imperative tools (registerTool calls in scripts)
    tools.push(...this.extractImperativeTools(html, url))

    // 3. Infer tools from page structure (forms, buttons, APIs)
    if (tools.length === 0) {
      tools.push(...this.inferToolsFromStructure(html, url))
    }

    return tools
  }

  private async fetchPage(url: string): Promise<string | null> {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': this.config.userAgent!,
          Accept: 'text/html',
        },
        signal: AbortSignal.timeout(this.config.timeout!),
        redirect: 'follow',
      })
      if (!res.ok) return null
      return await res.text()
    } catch {
      return null
    }
  }

  private extractDeclarativeTools(html: string, url: string): DiscoveredTool[] {
    const tools: DiscoveredTool[] = []
    const regex = /toolname=["']([^"']+)["']/gi
    let match

    while ((match = regex.exec(html)) !== null) {
      const name = match[1]!
      const nearby = html.slice(Math.max(0, match.index - 500), match.index + 500)
      const descMatch = nearby.match(/tooldescription=["']([^"']+)["']/i)

      const inputSchema = this.extractSchemaFromHTML(nearby)

      tools.push({
        definition: {
          name,
          description: descMatch?.[1] ?? `Tool: ${name}`,
          inputSchema,
          safetyLevel: this.inferSafety(name, nearby),
        },
        sourceUrl: url,
        discoveryMethod: 'declarative',
      })
    }

    return tools
  }

  private extractImperativeTools(html: string, url: string): DiscoveredTool[] {
    const tools: DiscoveredTool[] = []
    const regex = /registerTool\s*\(\s*\{[^}]*name:\s*["']([^"']+)["']/gi
    let match

    while ((match = regex.exec(html)) !== null) {
      const name = match[1]!
      // Try to extract description from nearby code
      const nearby = html.slice(match.index, match.index + 500)
      const descMatch = nearby.match(/description:\s*["']([^"']+)["']/i)

      tools.push({
        definition: {
          name,
          description: descMatch?.[1] ?? `Registered tool: ${name}`,
          inputSchema: { type: 'object', properties: {} },
          safetyLevel: this.inferSafety(name, nearby),
        },
        sourceUrl: url,
        discoveryMethod: 'imperative',
      })
    }

    return tools
  }

  private inferToolsFromStructure(html: string, url: string): DiscoveredTool[] {
    const tools: DiscoveredTool[] = []

    // Find forms and infer tools from them
    const formRegex = /<form[^>]*>([\s\S]*?)<\/form>/gi
    let match

    while ((match = formRegex.exec(html)) !== null) {
      const formHtml = match[0]!
      const formContent = match[1]!

      // Try to get form identity
      const idMatch = formHtml.match(/id=["']([^"']+)["']/i)
      const nameMatch = formHtml.match(/name=["']([^"']+)["']/i)
      const actionMatch = formHtml.match(/action=["']([^"']+)["']/i)

      const formId = idMatch?.[1] ?? nameMatch?.[1] ?? actionMatch?.[1]
      if (!formId) continue

      const toolName = this.toSnakeCase(formId)
      if (toolName.length < 3) continue

      // Extract submit button text for description
      const submitMatch = formContent.match(/<button[^>]*>([\s\S]*?)<\/button>/i)
      const submitText = submitMatch?.[1]?.replace(/<[^>]+>/g, '').trim() ?? formId

      const inputSchema = this.extractSchemaFromHTML(formContent)

      tools.push({
        definition: {
          name: toolName,
          description: `Submit form: ${submitText}`,
          inputSchema,
          safetyLevel: this.inferSafety(toolName, formHtml),
        },
        sourceUrl: url,
        discoveryMethod: 'inferred',
      })
    }

    return tools
  }

  private extractSchemaFromHTML(html: string): ToolInputSchema {
    const properties: Record<string, { type: 'string'; description?: string }> = {}
    const required: string[] = []

    const inputRegex = /<input[^>]*name=["']([^"']+)["'][^>]*>/gi
    let match

    while ((match = inputRegex.exec(html)) !== null) {
      const name = match[1]!
      if (['submit', 'hidden', 'button'].some((t) => match![0]!.includes(`type="${t}"`))) continue

      const descMatch = match[0]!.match(/(?:placeholder|aria-label|toolparamdescription)=["']([^"']+)["']/i)

      properties[name] = {
        type: 'string',
        description: descMatch?.[1],
      }

      if (match[0]!.includes('required')) {
        required.push(name)
      }
    }

    return {
      type: 'object',
      properties,
      required: required.length > 0 ? required : undefined,
    }
  }

  private inferSafety(name: string, context: string): 'read' | 'write' | 'danger' {
    const combined = `${name} ${context}`.toLowerCase()
    const dangerKw = ['delete', 'remove', 'destroy', 'purchase', 'pay', 'checkout', 'transfer']
    const writeKw = ['add', 'create', 'update', 'edit', 'save', 'submit', 'post', 'send']
    if (dangerKw.some((k) => combined.includes(k))) return 'danger'
    if (writeKw.some((k) => combined.includes(k))) return 'write'
    return 'read'
  }

  private toSnakeCase(str: string): string {
    return str
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s_-]/g, '')
      .replace(/[\s-]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
  }
}
