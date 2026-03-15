/**
 * @webmcpregistry/mcp-server
 *
 * An MCP (Model Context Protocol) server that bridges to WebMCP-enabled websites.
 *
 * This is the killer feature: any MCP-compatible AI tool (Claude Desktop, ChatGPT,
 * Cursor, VS Code Copilot) can connect to this server and directly call WebMCP
 * tools on any website — without needing a browser extension.
 *
 * Architecture:
 * ┌──────────────┐     MCP Protocol     ┌──────────────────┐     HTTP/Fetch     ┌──────────────────┐
 * │ Claude/Agent │ ◄──── stdio/SSE ────► │ WebMCP Gateway   │ ◄──────────────► │ Website with     │
 * │ (MCP Client) │                       │ (this server)    │                   │ WebMCP tools     │
 * └──────────────┘                       └──────────────────┘                   └──────────────────┘
 *
 * The gateway:
 * 1. Fetches the target website's HTML
 * 2. Detects WebMCP tool registrations (declarative + imperative)
 * 3. Exposes discovered tools as MCP tools to the connected AI agent
 * 4. When the agent calls a tool, proxies the call to the website's handler
 *
 * @example
 * ```json
 * // claude_desktop_config.json
 * {
 *   "mcpServers": {
 *     "webmcp": {
 *       "command": "npx",
 *       "args": ["@webmcpregistry/mcp-server", "--url", "https://shop.example.com"]
 *     }
 *   }
 * }
 * ```
 */

export { WebMCPGateway } from './gateway.js'
export type { GatewayConfig, DiscoveredTool } from './gateway.js'
export { createMCPProtocolHandler } from './protocol.js'
