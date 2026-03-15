/**
 * MCP Protocol handler — uses the official @modelcontextprotocol/sdk.
 *
 * Exposes the WebMCP Gateway as a proper MCP server that Claude Desktop,
 * Cursor, VS Code, and any MCP client can connect to.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import type { WebMCPGateway } from './gateway.js'

/**
 * Create and start an MCP server over stdio.
 *
 * This is what Claude Desktop / Cursor connects to.
 */
export async function startMCPServer(gateway: WebMCPGateway): Promise<void> {
  const server = new Server(
    {
      name: 'webmcp-gateway',
      version: '0.2.0',
    },
    {
      capabilities: {
        tools: {},
      },
    },
  )

  // Discover tools on startup
  const tools = await gateway.discover()
  console.error(`[WebMCP Gateway] Discovered ${tools.length} tool(s):`)
  for (const t of tools) {
    const exec = t.executable ? 'executable' : 'definition only'
    console.error(`  - ${t.definition.name} (${t.discoveryMethod}, ${exec})`)
  }

  // tools/list — return discovered tools + meta-tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: gateway.getMCPTools(),
    }
  })

  // tools/call — execute in browser or handle meta-tools
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const name = request.params.name
    const args = (request.params.arguments ?? {}) as Record<string, unknown>
    return gateway.callTool(name, args)
  })

  // Connect via stdio
  const transport = new StdioServerTransport()
  await server.connect(transport)

  // Clean up on exit
  const cleanup = async () => {
    await gateway.dispose()
    process.exit(0)
  }

  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)

  console.error(`[WebMCP Gateway] MCP server running on stdio. Ready for connections.`)
}
