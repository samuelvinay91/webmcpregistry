# @webmcpregistry/mcp-server

[![npm version](https://img.shields.io/npm/v/@webmcpregistry/mcp-server.svg)](https://www.npmjs.com/package/@webmcpregistry/mcp-server)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

MCP server that discovers, executes, and validates WebMCP tools on any website. Powered by Playwright for real browser execution. Connect Claude Desktop, Cursor, VS Code, or any MCP client to interact with website tools through natural language.

## Install

```bash
npm install @webmcpregistry/mcp-server
```

Playwright's Chromium browser is auto-installed on `postinstall`. To install manually:

```bash
npx playwright install chromium
```

## Claude Desktop Setup

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "my-site": {
      "command": "npx",
      "args": ["@webmcpregistry/mcp-server", "--url", "https://mysite.com"]
    }
  }
}
```

### Multiple URLs

```json
{
  "mcpServers": {
    "my-sites": {
      "command": "npx",
      "args": [
        "@webmcpregistry/mcp-server",
        "--url", "https://shop.example.com",
        "--url", "https://docs.example.com"
      ]
    }
  }
}
```

### With authentication

```json
{
  "mcpServers": {
    "my-app": {
      "command": "npx",
      "args": [
        "@webmcpregistry/mcp-server",
        "--url", "https://app.example.com",
        "--storage-state", "/path/to/auth.json"
      ]
    }
  }
}
```

## CLI Usage

```bash
# Basic -- discover tools from a URL
npx @webmcpregistry/mcp-server --url https://mysite.com

# Multiple sites
npx @webmcpregistry/mcp-server --url https://a.com --url https://b.com

# Visible browser window (for debugging)
npx @webmcpregistry/mcp-server --url https://mysite.com --headed

# Use Firefox instead of Chromium
npx @webmcpregistry/mcp-server --url https://mysite.com --browser firefox

# With saved auth state (cookies, localStorage)
npx @webmcpregistry/mcp-server --url https://app.com --storage-state auth.json
```

### CLI Options

| Option | Description |
|---|---|
| `--url <url>` | URL to discover tools from (repeatable) |
| `--headless` | Run browser headless (default) |
| `--headed`, `--no-headless` | Run browser with visible window |
| `--browser <type>` | Browser engine: `chromium` (default), `firefox`, `webkit` |
| `--storage-state <path>` | Path to auth state JSON (cookies, localStorage) |
| `--help`, `-h` | Show help |

## How It Works

```
+--------------+     MCP (stdio)    +--------------------------------------+
| Claude /     |<------------------>| WebMCP Gateway                       |
| Cursor /     |                    |                                      |
| VS Code      |  tools/list        | +----------+  +------------------+  |
|              |<-------------------| | Discovery |  | Playwright       |  |
|              |                    | | Engine    |--| Browser Manager  |  |
|              |  tools/call        | +----------+  |                  |  |
|              |------------------->| +----------+  | Page per URL     |  |
|              |                    | | Executor  |--| navigator.       |  |
|              |<-------------------| |           |  | modelContext     |  |
+--------------+  result            | +----------+  +------------------+  |
                                    | +----------+                        |
                                    | | Validator | (@webmcpregistry/core)|
                                    | +----------+                        |
                                    +--------------------------------------+
```

**Discovery strategies** (in priority order):

1. **Live API** -- evaluates `navigator.modelContext.getTools()` in the browser (most accurate, tools are executable)
2. **Declarative** -- parses `toolname` attributes from the HTML
3. **Imperative** -- finds `registerTool()` calls in inline scripts

## Meta-Tools

In addition to the discovered site tools, the server exposes three built-in meta-tools that the AI agent can invoke:

| Meta-tool | Description |
|---|---|
| `webmcp_rediscover` | Re-scan all configured URLs to discover new or changed tools |
| `webmcp_validate` | Run validation and security scanning on all discovered tools (uses `@webmcpregistry/core`) |
| `webmcp_report` | Get a detailed discovery report with tool sources, capabilities, and schemas |

## Programmatic Usage

```ts
import { WebMCPGateway } from '@webmcpregistry/mcp-server'

const gateway = new WebMCPGateway({
  urls: ['https://shop.example.com'],
  headless: true,
  browserType: 'chromium',
})

// Discover tools
const tools = await gateway.discover()
for (const tool of tools) {
  console.log(`${tool.definition.name} (${tool.discoveryMethod}, ${tool.executable ? 'executable' : 'definition only'})`)
}

// Call a tool
const result = await gateway.callTool('search_products', { query: 'shoes' })
console.log(result.content[0].text)

// Get MCP-formatted tool list
const mcpTools = gateway.getMCPTools()

// Clean up
await gateway.dispose()
```

### Start MCP server programmatically

```ts
import { WebMCPGateway, startMCPServer } from '@webmcpregistry/mcp-server'

const gateway = new WebMCPGateway({ urls: ['https://mysite.com'] })
await startMCPServer(gateway)
```

### Use the browser manager directly

```ts
import { BrowserManager } from '@webmcpregistry/mcp-server'

const browser = new BrowserManager({
  headless: true,
  browserType: 'chromium',
  timeout: 30000,
  maxPages: 10,
})

const page = await browser.getPage('https://mysite.com')
// ... interact with the page ...
await browser.dispose()
```

## API Reference

### Gateway

| Export | Description |
|---|---|
| `WebMCPGateway` | Main class. Orchestrates browser, discovery, execution, and validation. |
| `WebMCPGateway.discover()` | Launch browser, navigate to configured URLs, extract tools. Returns `DiscoveredTool[]`. |
| `WebMCPGateway.callTool(name, args)` | Execute a discovered tool or meta-tool. Returns MCP-formatted result. |
| `WebMCPGateway.getMCPTools()` | Get tools formatted for MCP `tools/list` response (includes meta-tools). |
| `WebMCPGateway.getDiscoveredTools()` | Get raw discovered tools. |
| `WebMCPGateway.dispose()` | Close browser and clean up. |

### Protocol

| Export | Description |
|---|---|
| `startMCPServer(gateway)` | Create and start an MCP server over stdio using `@modelcontextprotocol/sdk`. |

### Browser

| Export | Description |
|---|---|
| `BrowserManager` | Manages Playwright browser lifecycle. Pages are created per-URL and reused. |

### Discovery

| Export | Description |
|---|---|
| `discoverTools(page)` | Discover WebMCP tools on a Playwright page using all strategies. Returns `DiscoveredTool[]`. |

### Execution

| Export | Description |
|---|---|
| `executeTool(page, name, args)` | Execute a tool in the browser via `navigator.modelContext`. |
| `executeToolForMCP(page, name, args)` | Execute and format result for MCP protocol response. |

### Key Types

| Type | Description |
|---|---|
| `GatewayConfig` | `{ urls, headless?, browserType?, timeout?, userAgent?, storageState?, maxPages? }` |
| `DiscoveredTool` | `{ definition, sourceUrl, discoveryMethod, executable }` |
| `BrowserConfig` | `{ headless?, browserType?, timeout?, userAgent?, storageState?, maxPages? }` |

## License

Apache 2.0 -- [RAPHATECH OU](https://github.com/samuelvinay91/webmcpregistry)

Part of the [WebMCP Registry SDK](https://github.com/samuelvinay91/webmcpregistry) monorepo.
