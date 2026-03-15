/**
 * @webmcpregistry/mcp-server
 *
 * MCP server that discovers, executes, and validates WebMCP tools on any website.
 * Powered by Playwright for real browser execution.
 *
 * ## Quick Start
 *
 * ```bash
 * # Run as MCP server (Claude Desktop / Cursor / VS Code)
 * npx @webmcpregistry/mcp-server --url https://mysite.com
 * ```
 *
 * ## Claude Desktop Config
 *
 * ```json
 * {
 *   "mcpServers": {
 *     "my-site": {
 *       "command": "npx",
 *       "args": ["@webmcpregistry/mcp-server", "--url", "https://mysite.com"]
 *     }
 *   }
 * }
 * ```
 *
 * ## What the AI agent gets:
 *
 * 1. **All WebMCP tools** discovered on the site (via navigator.modelContext)
 * 2. **Real execution** — tools run in a real browser, not simulated
 * 3. **Meta-tools:**
 *    - `webmcp_rediscover` — re-scan for new/changed tools
 *    - `webmcp_validate` — run validation + security checks
 *    - `webmcp_report` — get detailed discovery report
 *
 * ## Programmatic Usage
 *
 * ```ts
 * import { WebMCPGateway } from '@webmcpregistry/mcp-server'
 *
 * const gateway = new WebMCPGateway({ urls: ['https://mysite.com'] })
 * const tools = await gateway.discover()
 * const result = await gateway.callTool('search_products', { query: 'shoes' })
 * await gateway.dispose()
 * ```
 */

export { WebMCPGateway } from './gateway.js'
export type { GatewayConfig, DiscoveredTool } from './gateway.js'
export { BrowserManager } from './browser.js'
export type { BrowserConfig } from './browser.js'
export { discoverTools } from './discovery.js'
export { executeTool, executeToolForMCP } from './executor.js'
export { startMCPServer } from './protocol.js'
