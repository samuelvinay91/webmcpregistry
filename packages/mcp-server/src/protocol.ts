/**
 * MCP Protocol handler — implements the MCP JSON-RPC protocol over stdio.
 *
 * This is a lightweight, zero-dependency MCP server implementation
 * that reads JSON-RPC messages from stdin and writes responses to stdout.
 *
 * Protocol reference: https://modelcontextprotocol.io/specification
 */

import type { WebMCPGateway } from './gateway.js'

interface MCPRequest {
  jsonrpc: '2.0'
  id: number | string
  method: string
  params?: Record<string, unknown>
}

interface MCPResponse {
  jsonrpc: '2.0'
  id: number | string
  result?: unknown
  error?: { code: number; message: string; data?: unknown }
}

interface MCPNotification {
  jsonrpc: '2.0'
  method: string
  params?: Record<string, unknown>
}

/**
 * Create an MCP protocol handler that bridges to a WebMCPGateway.
 */
export function createMCPProtocolHandler(gateway: WebMCPGateway) {
  return {
    /**
     * Handle an incoming MCP JSON-RPC request.
     */
    async handleRequest(request: MCPRequest): Promise<MCPResponse> {
      switch (request.method) {
        case 'initialize':
          return {
            jsonrpc: '2.0',
            id: request.id,
            result: {
              protocolVersion: '2024-11-05',
              capabilities: {
                tools: {},
              },
              serverInfo: {
                name: 'webmcp-gateway',
                version: '0.1.0',
              },
            },
          }

        case 'tools/list':
          return {
            jsonrpc: '2.0',
            id: request.id,
            result: {
              tools: gateway.getMCPToolDefinitions(),
            },
          }

        case 'tools/call': {
          const toolName = request.params?.['name'] as string
          const toolArgs = (request.params?.['arguments'] ?? {}) as Record<string, unknown>

          const discoveredTool = gateway.getTools().find(
            (t) => t.definition.name === toolName
          )

          if (!discoveredTool) {
            return {
              jsonrpc: '2.0',
              id: request.id,
              error: {
                code: -32602,
                message: `Tool "${toolName}" not found`,
              },
            }
          }

          // For now, return the tool info and args.
          // Full execution requires a browser runtime (Playwright integration).
          return {
            jsonrpc: '2.0',
            id: request.id,
            result: {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    tool: toolName,
                    source: discoveredTool.sourceUrl,
                    discoveryMethod: discoveredTool.discoveryMethod,
                    args: toolArgs,
                    note: 'Tool discovered from WebMCP. Full execution requires browser runtime.',
                    definition: {
                      description: discoveredTool.definition.description,
                      inputSchema: discoveredTool.definition.inputSchema,
                      safetyLevel: discoveredTool.definition.safetyLevel,
                    },
                  }, null, 2),
                },
              ],
            },
          }
        }

        default:
          return {
            jsonrpc: '2.0',
            id: request.id,
            error: {
              code: -32601,
              message: `Method "${request.method}" not found`,
            },
          }
      }
    },
  }
}

/**
 * Run the MCP server over stdio (for Claude Desktop, Cursor, etc.).
 */
export async function runStdioServer(gateway: WebMCPGateway): Promise<void> {
  const handler = createMCPProtocolHandler(gateway)

  // Discover tools on startup
  const tools = await gateway.discover()
  console.error(`[WebMCP Gateway] Discovered ${tools.length} tools from ${tools.map(t => t.sourceUrl).filter((v, i, a) => a.indexOf(v) === i).length} URL(s)`)
  for (const t of tools) {
    console.error(`  - ${t.definition.name} (${t.discoveryMethod}) from ${t.sourceUrl}`)
  }

  // Read JSON-RPC messages from stdin
  let buffer = ''

  process.stdin.setEncoding('utf-8')
  process.stdin.on('data', async (chunk: string) => {
    buffer += chunk

    // Process complete messages (newline-delimited JSON)
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      try {
        const request = JSON.parse(trimmed) as MCPRequest

        // Handle notifications (no id)
        if (!('id' in request)) {
          // Notifications like 'notifications/initialized' don't need a response
          continue
        }

        const response = await handler.handleRequest(request)
        process.stdout.write(JSON.stringify(response) + '\n')
      } catch (err) {
        const errorResponse: MCPResponse = {
          jsonrpc: '2.0',
          id: 0,
          error: {
            code: -32700,
            message: `Parse error: ${err instanceof Error ? err.message : String(err)}`,
          },
        }
        process.stdout.write(JSON.stringify(errorResponse) + '\n')
      }
    }
  })

  // Keep process alive
  process.stdin.resume()
}
