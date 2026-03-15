/**
 * CLI entry point for the WebMCP Gateway MCP server.
 *
 * Usage:
 *   npx @webmcpregistry/mcp-server --url https://shop.example.com
 *   npx @webmcpregistry/mcp-server --url https://a.com --url https://b.com
 *
 * For Claude Desktop (claude_desktop_config.json):
 * {
 *   "mcpServers": {
 *     "webmcp-shop": {
 *       "command": "npx",
 *       "args": ["@webmcpregistry/mcp-server", "--url", "https://shop.example.com"]
 *     }
 *   }
 * }
 */

import { WebMCPGateway } from './gateway.js'
import { runStdioServer } from './protocol.js'

const args = process.argv.slice(2)
const urls: string[] = []

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--url' && args[i + 1]) {
    urls.push(args[i + 1]!)
    i++
  }
}

if (urls.length === 0) {
  console.error('Usage: webmcp-server --url <url> [--url <url2> ...]')
  console.error('')
  console.error('Starts an MCP server that discovers WebMCP tools from the given URL(s)')
  console.error('and exposes them as MCP tools over stdio.')
  console.error('')
  console.error('Example:')
  console.error('  webmcp-server --url https://shop.example.com')
  process.exit(1)
}

const gateway = new WebMCPGateway({ urls })
runStdioServer(gateway)
