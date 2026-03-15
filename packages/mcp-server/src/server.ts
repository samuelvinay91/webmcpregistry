/**
 * CLI entry point for the WebMCP Gateway MCP server.
 *
 * Usage:
 *   npx @webmcpregistry/mcp-server --url https://shop.example.com
 *   npx @webmcpregistry/mcp-server --url https://a.com --url https://b.com
 *   npx @webmcpregistry/mcp-server --url https://mysite.com --headless --storage-state auth.json
 *
 * For Claude Desktop (claude_desktop_config.json):
 * {
 *   "mcpServers": {
 *     "my-site": {
 *       "command": "npx",
 *       "args": ["@webmcpregistry/mcp-server", "--url", "https://mysite.com"]
 *     }
 *   }
 * }
 *
 * What Claude can do once connected:
 * - See all WebMCP tools registered on your site
 * - Call any tool and get real results (executed in a real browser!)
 * - Run validation and security checks on your tools
 * - Re-discover tools if the page changes
 */

import { WebMCPGateway } from './gateway.js'
import { startMCPServer } from './protocol.js'

function parseArgs(argv: string[]) {
  const urls: string[] = []
  let headless = true
  let storageState = ''
  let browserType: 'chromium' | 'firefox' | 'webkit' = 'chromium'

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    const next = argv[i + 1]

    if (arg === '--url' && next) {
      urls.push(next)
      i++
    } else if (arg === '--no-headless' || arg === '--headed') {
      headless = false
    } else if (arg === '--headless') {
      headless = true
    } else if (arg === '--storage-state' && next) {
      storageState = next
      i++
    } else if (arg === '--browser' && next) {
      browserType = next as 'chromium' | 'firefox' | 'webkit'
      i++
    } else if (arg === '--help' || arg === '-h') {
      printHelp()
      process.exit(0)
    }
  }

  return { urls, headless, storageState, browserType }
}

function printHelp() {
  console.error(`
  WebMCP Gateway — MCP server for WebMCP tool discovery + execution

  Usage:
    npx @webmcpregistry/mcp-server --url <url> [options]

  Options:
    --url <url>              URL to discover tools from (can repeat)
    --headless               Run browser headless (default)
    --headed, --no-headless  Run browser with visible window
    --browser <type>         Browser: chromium, firefox, webkit (default: chromium)
    --storage-state <path>   Path to auth state JSON (cookies, localStorage)
    --help, -h               Show this help

  Examples:
    npx @webmcpregistry/mcp-server --url https://shop.example.com
    npx @webmcpregistry/mcp-server --url https://a.com --url https://b.com
    npx @webmcpregistry/mcp-server --url https://app.com --storage-state auth.json --headed

  Claude Desktop config (claude_desktop_config.json):
    {
      "mcpServers": {
        "my-site": {
          "command": "npx",
          "args": ["@webmcpregistry/mcp-server", "--url", "https://mysite.com"]
        }
      }
    }

  Meta-tools available to the AI agent:
    webmcp_rediscover  — Re-scan URLs for new/changed tools
    webmcp_validate    — Run validation + security checks
    webmcp_report      — Get detailed tool discovery report
`)
}

const args = parseArgs(process.argv.slice(2))

if (args.urls.length === 0) {
  console.error('Error: at least one --url is required\n')
  printHelp()
  process.exit(1)
}

const gateway = new WebMCPGateway({
  urls: args.urls,
  headless: args.headless,
  storageState: args.storageState || undefined,
  browserType: args.browserType,
})

startMCPServer(gateway)
