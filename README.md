<p align="center">
  <br />
  <strong><code>WebMCP Registry SDK</code></strong>
  <br /><br />
  <em>Make any website callable by AI agents.</em>
  <br /><br />
  <a href="https://www.npmjs.com/package/@webmcpregistry/core"><img src="https://img.shields.io/npm/v/@webmcpregistry/core?style=flat-square&label=%40webmcpregistry%2Fcore&color=0a0a0a" alt="npm version" /></a>
  <a href="https://github.com/samuelvinay91/webmcpregistry/actions/workflows/ci.yml"><img src="https://github.com/samuelvinay91/webmcpregistry/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache%202.0-blue?style=flat-square" alt="License" /></a>
</p>

---

The WebMCP Registry SDK is a TypeScript monorepo that implements the [W3C Web Model Context Protocol](https://webmachinelearning.github.io/webmcp/) draft specification. It lets websites register structured, type-safe tools that AI agents -- Claude, ChatGPT, Gemini, Copilot -- can discover and invoke directly through `navigator.modelContext`. No DOM scraping, no custom integrations, no glue code.

**No browser ships WebMCP natively yet.** This SDK provides a spec-compliant polyfill that works today and steps aside when native support lands. Framework adapters for React, Vue, Angular, Svelte, and Next.js are each under 3KB. A zero-dependency `<script>` tag covers everything else.

## Table of Contents

- [Why WebMCP?](#why-webmcp)
- [Quick Start](#quick-start)
- [Packages](#packages)
- [Architecture](#architecture)
- [Framework Examples](#framework-examples)
- [CLI](#cli)
- [MCP Server Bridge](#mcp-server-bridge)
- [Testing and Quality](#testing-and-quality)
- [Agent Discovery](#agent-discovery)
- [Spec Alignment](#spec-alignment)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Why WebMCP?

The [W3C WebMCP specification](https://webmachinelearning.github.io/webmcp/) (Draft Community Group Report, March 9, 2026 -- editors: Brandon Walderman/Microsoft, Khushal Sagar/Google, Dominic Farolino/Google) introduces `navigator.modelContext` to the browser platform. Instead of agents blindly scraping HTML and guessing at UI elements, websites declare what they can do:

```ts
navigator.modelContext.registerTool({
  name: 'search_products',
  description: 'Search the product catalog by keyword',
  inputSchema: {
    type: 'object',
    properties: { query: { type: 'string' } },
    required: ['query'],
  },
  execute: async (input) => {
    return fetch(`/api/search?q=${input.query}`).then(r => r.json())
  },
})
```

An AI agent visiting the page discovers `search_products`, knows its schema, calls it with typed arguments, and gets structured data back. Structured, bidirectional communication between websites and AI agents, standardized at the platform level.

This SDK provides:

- A **polyfill** that faithfully implements `navigator.modelContext` so you can ship today
- **Framework adapters** that manage tool lifecycle (mount/unmount) idiomatically
- **Validation, security scanning, and grading** to ensure tool quality
- **Manifest generation** (`/.well-known/webmcp.json`, JSON-LD, `llms.txt`, `agents.json`) for offline agent discovery
- A **Playwright-powered MCP server** that bridges WebMCP tools into the MCP ecosystem (Claude Desktop, Cursor, VS Code)
- **Testing infrastructure**: schema-driven test generation, contract testing, mutation testing, W3C conformance suite, and eval harness

## Quick Start

### React

```bash
npm install @webmcpregistry/react
```

```tsx
import { WebMCPProvider, useWebMCPTool } from '@webmcpregistry/react'

function App() {
  return (
    <WebMCPProvider mode="auto">
      <SearchPage />
    </WebMCPProvider>
  )
}

function SearchPage() {
  useWebMCPTool({
    name: 'search_products',
    description: 'Search the product catalog by keyword',
    inputSchema: {
      type: 'object',
      properties: { query: { type: 'string', description: 'Search term' } },
      required: ['query'],
    },
    safetyLevel: 'read',
    handler: async ({ query }) => {
      const res = await fetch(`/api/search?q=${query}`)
      return res.json()
    },
  })

  return <div>Search Page</div>
}
```

### Vue 3

```bash
npm install @webmcpregistry/vue
```

```ts
import { createApp } from 'vue'
import { webmcpPlugin } from '@webmcpregistry/vue'

createApp(App).use(webmcpPlugin, { mode: 'auto' }).mount('#app')
```

### Script Tag (zero dependencies)

```html
<script src="https://unpkg.com/@webmcpregistry/browser/dist/auto.global.js"
        data-mode="auto"></script>
```

## Packages

| Package | Description | Version |
|:--------|:------------|:-------:|
| [`@webmcpregistry/core`](packages/core) | Polyfill, detector, registrar, validator, security scanner, manifest generation | [![npm](https://img.shields.io/npm/v/@webmcpregistry/core?style=flat-square&color=0a0a0a)](https://www.npmjs.com/package/@webmcpregistry/core) |
| [`@webmcpregistry/react`](packages/react) | React hooks -- `useWebMCPTool`, `WebMCPProvider`, `useWebMCPContext` | [![npm](https://img.shields.io/npm/v/@webmcpregistry/react?style=flat-square&color=0a0a0a)](https://www.npmjs.com/package/@webmcpregistry/react) |
| [`@webmcpregistry/nextjs`](packages/nextjs) | Next.js App Router adapter with `'use client'` | [![npm](https://img.shields.io/npm/v/@webmcpregistry/nextjs?style=flat-square&color=0a0a0a)](https://www.npmjs.com/package/@webmcpregistry/nextjs) |
| [`@webmcpregistry/vue`](packages/vue) | Vue 3 plugin + composables | [![npm](https://img.shields.io/npm/v/@webmcpregistry/vue?style=flat-square&color=0a0a0a)](https://www.npmjs.com/package/@webmcpregistry/vue) |
| [`@webmcpregistry/angular`](packages/angular) | Angular service + `provideWebMCP()` | [![npm](https://img.shields.io/npm/v/@webmcpregistry/angular?style=flat-square&color=0a0a0a)](https://www.npmjs.com/package/@webmcpregistry/angular) |
| [`@webmcpregistry/svelte`](packages/svelte) | Svelte stores + `use:webmcpTool` action | [![npm](https://img.shields.io/npm/v/@webmcpregistry/svelte?style=flat-square&color=0a0a0a)](https://www.npmjs.com/package/@webmcpregistry/svelte) |
| [`@webmcpregistry/browser`](packages/browser) | Zero-dependency `<script>` tag bundle (IIFE) | [![npm](https://img.shields.io/npm/v/@webmcpregistry/browser?style=flat-square&color=0a0a0a)](https://www.npmjs.com/package/@webmcpregistry/browser) |
| [`@webmcpregistry/cli`](packages/cli) | CLI: `test`, `scan`, `init` commands | [![npm](https://img.shields.io/npm/v/@webmcpregistry/cli?style=flat-square&color=0a0a0a)](https://www.npmjs.com/package/@webmcpregistry/cli) |
| [`@webmcpregistry/testing`](packages/testing) | Schema-driven test generation, contract testing, mutation testing | [![npm](https://img.shields.io/npm/v/@webmcpregistry/testing?style=flat-square&color=0a0a0a)](https://www.npmjs.com/package/@webmcpregistry/testing) |
| [`@webmcpregistry/conformance`](packages/conformance) | W3C spec conformance suite (12 scenarios) | [![npm](https://img.shields.io/npm/v/@webmcpregistry/conformance?style=flat-square&color=0a0a0a)](https://www.npmjs.com/package/@webmcpregistry/conformance) |
| [`@webmcpregistry/evals`](packages/evals) | AI agent tool-calling accuracy evaluation | [![npm](https://img.shields.io/npm/v/@webmcpregistry/evals?style=flat-square&color=0a0a0a)](https://www.npmjs.com/package/@webmcpregistry/evals) |
| [`@webmcpregistry/mcp-server`](packages/mcp-server) | Playwright-powered MCP-to-WebMCP bridge | [![npm](https://img.shields.io/npm/v/@webmcpregistry/mcp-server?style=flat-square&color=0a0a0a)](https://www.npmjs.com/package/@webmcpregistry/mcp-server) |

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Your Application                               │
│                                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │  react   │ │   vue    │ │ angular  │ │  svelte  │ │    nextjs    │ │
│  │  ~2KB    │ │  ~1.5KB  │ │  ~1.3KB  │ │  ~1.2KB  │ │ 'use client' │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬───────┘ │
│       │             │            │             │              │         │
│       └─────────────┴────────────┴─────────────┴──────────────┘         │
│                                  │                                      │
│                       ┌──────────▼──────────┐                           │
│                       │                     │    ┌─────────────────┐   │
│                       │  @webmcpregistry/   │    │    browser      │   │
│                       │       core          │◄───│  <script> tag   │   │
│                       │                     │    │   IIFE bundle   │   │
│                       │  - polyfill         │    └─────────────────┘   │
│                       │  - registrar        │                          │
│                       │  - detector         │                          │
│                       │  - validator        │                          │
│                       │  - security         │                          │
│                       │  - manifest         │                          │
│                       └──────────┬──────────┘                          │
│                                  │                                      │
│                       ┌──────────▼──────────┐                          │
│                       │ navigator.          │                          │
│                       │   modelContext      │                          │
│                       │                     │                          │
│                       │  .registerTool()   │  [SPEC]                  │
│                       │  .unregisterTool() │  [SPEC]                  │
│                       │  .getTools()       │  [EXTENSION]             │
│                       └─────────────────────┘                          │
└─────────────────────────────────────────────────────────────────────────┘

  Quality & Testing                           Agent Bridge
  ─────────────────                           ────────────
  ┌───────────┐ ┌─────────────┐ ┌──────┐     ┌─────────────────────────┐
  │  testing   │ │ conformance │ │ evals│     │      mcp-server         │
  │            │ │             │ │      │     │                         │
  │ test gen   │ │  12 W3C     │ │ tool │     │ Playwright  ──► pages   │
  │ contracts  │ │  scenarios  │ │ sel. │     │ browser        ──► MCP  │
  │ mutations  │ │             │ │ acc. │     │                  stdio  │
  └───────────┘ └─────────────┘ └──────┘     └─────────────────────────┘
                                              Claude Desktop / Cursor /
                                              VS Code / any MCP client
```

All framework adapters are thin wrappers over `core`. They handle lifecycle (React effects, Vue `onMounted`/`onUnmounted`, Angular DI, Svelte actions) and delegate everything else. The `core` package contains the polyfill, registration engine, tool detection from DOM attributes, validation, security scanning, and manifest generation.

## Framework Examples

### React

```tsx
import { WebMCPProvider, useWebMCPTool } from '@webmcpregistry/react'

// 1. Wrap your app with the provider
<WebMCPProvider mode="auto">
  <App />
</WebMCPProvider>

// 2. Register tools tied to component lifecycle
function ProductSearch() {
  useWebMCPTool({
    name: 'search_products',
    description: 'Search the product catalog by keyword and optional category',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search term' },
        category: { type: 'string', enum: ['electronics', 'clothing', 'books'] },
      },
      required: ['query'],
    },
    safetyLevel: 'read',
    handler: async ({ query, category }) => {
      const params = new URLSearchParams({ q: String(query) })
      if (category) params.set('cat', String(category))
      return fetch(`/api/search?${params}`).then(r => r.json())
    },
  })

  return <div>Product Search</div>
}
```

The tool is registered when the component mounts and unregistered when it unmounts. React Strict Mode double-mounts are handled gracefully.

### Next.js (App Router)

```tsx
// app/layout.tsx
import { WebMCPProvider } from '@webmcpregistry/nextjs'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WebMCPProvider mode="auto">
          {children}
        </WebMCPProvider>
      </body>
    </html>
  )
}
```

`@webmcpregistry/nextjs` re-exports the React adapter with `'use client'` baked in. Same hooks, zero additional configuration.

### Vue 3

```ts
// main.ts
import { createApp } from 'vue'
import { webmcpPlugin } from '@webmcpregistry/vue'
import App from './App.vue'

createApp(App).use(webmcpPlugin, { mode: 'auto' }).mount('#app')
```

```vue
<!-- SearchPage.vue -->
<script setup>
import { useWebMCPTool } from '@webmcpregistry/vue'

useWebMCPTool({
  name: 'search_products',
  description: 'Search the product catalog by keyword',
  inputSchema: {
    type: 'object',
    properties: { query: { type: 'string' } },
    required: ['query'],
  },
  safetyLevel: 'read',
  handler: async ({ query }) => {
    return fetch(`/api/search?q=${query}`).then(r => r.json())
  },
})
</script>
```

Tools are registered in `onMounted` and unregistered in `onUnmounted`, matching Vue's lifecycle.

### Angular

```ts
// app.config.ts
import { provideWebMCP } from '@webmcpregistry/angular'

export const appConfig = {
  providers: [provideWebMCP({ mode: 'auto' })],
}
```

```ts
// In any component or service
import { getWebMCPService } from '@webmcpregistry/angular'

const webmcp = getWebMCPService()
webmcp.registerTool({
  name: 'search_products',
  description: 'Search the product catalog',
  inputSchema: { type: 'object', properties: { query: { type: 'string' } } },
  safetyLevel: 'read',
  handler: async ({ query }) => fetch(`/api/search?q=${query}`).then(r => r.json()),
})
```

Works with both standalone components and NgModule patterns. The service creates a fresh instance per request in SSR environments to prevent cross-request contamination.

### Svelte

```svelte
<script>
  import { initWebMCP, webmcpTools } from '@webmcpregistry/svelte'
  import { onMount } from 'svelte'

  onMount(() => initWebMCP({ mode: 'auto' }))
</script>

<p>Registered tools: {$webmcpTools.length}</p>
```

Or bind a tool to an element's lifecycle with the `use:webmcpTool` action:

```svelte
<form use:webmcpTool={{
  name: 'search_products',
  description: 'Search the product catalog',
  inputSchema: { type: 'object', properties: { query: { type: 'string' } } },
  safetyLevel: 'read',
}}>
  <input name="query" />
  <button type="submit">Search</button>
</form>
```

### Vanilla JavaScript

**Script tag** -- auto-detects tools from DOM attributes:

```html
<script src="https://unpkg.com/@webmcpregistry/browser/dist/auto.global.js"
        data-mode="auto"></script>
```

**Declarative HTML** -- no JavaScript required:

```html
<form toolname="search_products"
      tooldescription="Search the product catalog by keyword">
  <input name="query" type="text"
         toolparamdescription="Search keywords" required />
  <button type="submit">Search</button>
</form>
```

**Core API** -- framework-agnostic:

```ts
import { registerTool, initialize, installPolyfill } from '@webmcpregistry/core'

// Auto mode: detect tools from DOM + install polyfill
const result = initialize({ mode: 'auto' })

// Or register manually
installPolyfill()
registerTool({
  name: 'search_products',
  description: 'Search the product catalog by keyword',
  inputSchema: {
    type: 'object',
    properties: { query: { type: 'string' } },
    required: ['query'],
  },
  safetyLevel: 'read',
  handler: async ({ query }) => fetch(`/api/search?q=${query}`).then(r => r.json()),
})
```

## CLI

The CLI tests, scans, and scaffolds WebMCP implementations without touching your source code.

```bash
# Full readiness test (launches a real browser via Playwright)
npx @webmcpregistry/cli test https://yoursite.com

# Lightweight static scan (no browser needed)
npx @webmcpregistry/cli scan https://yoursite.com

# Scaffold WebMCP setup for your framework
npx @webmcpregistry/cli init --framework react
npx @webmcpregistry/cli init --framework vue
npx @webmcpregistry/cli init --framework html
```

The `test` command produces a readiness grade (A through F) with a detailed breakdown:

```
+--------------------------------------+
|  WebMCP Readiness: Grade A (94/100)  |
+--------------------------------------+

  Tool count         ############----  16/20
  Descriptions       ################  23/25
  Schema             ################  20/20
  Naming             ########--------  10/10
  Manifest           ----------------   0/10
  Security           ################  15/15
```

Output formats: `terminal` (default), `json`, `badge`.

## MCP Server Bridge

`@webmcpregistry/mcp-server` runs a standards-compliant [Model Context Protocol](https://modelcontextprotocol.io/) server that discovers and executes WebMCP tools from any website using a real Playwright browser. It bridges browser-side WebMCP tools into the desktop AI agent ecosystem.

### Claude Desktop / Cursor / VS Code

Add to your MCP client configuration:

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

The server launches Chromium, navigates to the URL, discovers all tools registered via `navigator.modelContext`, and exposes them over MCP stdio. When the agent calls a tool, the server executes it in the real browser context and returns the result.

**Built-in meta-tools** (always available alongside discovered tools):

| Meta-tool | Purpose |
|:----------|:--------|
| `webmcp_rediscover` | Re-scan all URLs for new or changed tools |
| `webmcp_validate` | Run validation + security checks on all discovered tools |
| `webmcp_report` | Get a detailed discovery report with sources and capabilities |

### Programmatic API

```ts
import { WebMCPGateway } from '@webmcpregistry/mcp-server'

const gateway = new WebMCPGateway({ urls: ['https://mysite.com'] })

// Discover tools
const tools = await gateway.discover()
console.log(`Found ${tools.length} tools`)

// Execute a tool in the real browser
const result = await gateway.callTool('search_products', { query: 'shoes' })
console.log(result)

await gateway.dispose()
```

## Testing and Quality

The SDK includes three testing packages. Everything runs deterministically -- no LLM calls required.

### Schema-Driven Test Generation

Auto-generate test cases from your tool's `inputSchema` covering valid inputs, invalid inputs, boundary values, type coercion, and security vectors:

```ts
import { generateTestCases, runTestSuite } from '@webmcpregistry/testing'

const cases = generateTestCases(myTool)
// Generates: valid inputs, missing required fields, wrong types,
//            empty strings, boundary values, injection attempts

const results = await runTestSuite([myTool])
console.log(`${results.passed}/${results.total} passed`)
```

### Contract Testing

Capture a snapshot of your tool definitions and detect breaking changes between releases:

```ts
import { captureContract, diffContracts } from '@webmcpregistry/testing'

const before = captureContract(tools, 'mysite.com')
// ... deploy changes ...
const after = captureContract(newTools, 'mysite.com')
const diff = diffContracts(before, after)

if (diff.isBreaking) {
  console.error('Breaking changes:', diff.removed, diff.changed.filter(c => c.breaking))
  process.exit(1)
}
```

### Mutation Testing

Verify your test suite catches real problems by introducing schema mutations:

```ts
import { generateAllMutations, calculateMutationScore } from '@webmcpregistry/testing'

const mutations = generateAllMutations(tools)
const score = await calculateMutationScore(mutations, testRunner)
console.log(`Mutation score: ${score}%`) // Higher = better fault detection
```

### W3C Conformance Suite

Run 12 scenarios that verify any `navigator.modelContext` implementation against the W3C draft spec:

```ts
import { runConformance, formatReport } from '@webmcpregistry/conformance'
import { installPolyfill, getModelContext } from '@webmcpregistry/core'

installPolyfill()
const report = await runConformance(getModelContext()!, 'polyfill v0.2.1')
console.log(formatReport(report))
// => 100% (12/12) passed
```

### Agent Evaluation

Measure how "obvious" your tool definitions are to AI agents. The eval harness uses deterministic matching to grade tool selection accuracy -- without calling an LLM:

```ts
import { createEvalSuite, runEvalSuite } from '@webmcpregistry/evals'

const suite = createEvalSuite(tools, [
  { task: 'Find flights to Tokyo under $500', expectedTool: 'search_flights' },
  { task: 'Book the cheapest option', expectedTool: 'book_flight' },
  { task: 'Cancel my reservation', expectedTool: 'cancel_booking' },
])

const report = runEvalSuite(suite)
console.log(`Tool selection accuracy: ${report.selectionAccuracy}%`)
```

## Agent Discovery

Generate machine-readable manifests so AI agents can discover your tools without loading the page:

```ts
import {
  generateManifest,
  generateJsonLd,
  generateLlmsTxt,
  generateAgentsJson,
} from '@webmcpregistry/core'

const siteInfo = { name: 'My Site', url: 'https://mysite.com' }

generateManifest(tools, siteInfo)   // /.well-known/webmcp.json
generateJsonLd(tools, siteInfo)     // JSON-LD structured data
generateLlmsTxt(tools, siteInfo)    // llms.txt for LLM crawlers
generateAgentsJson(tools, siteInfo) // agents.json
```

## Spec Alignment

This SDK tracks the [W3C WebMCP Draft Community Group Report](https://webmachinelearning.github.io/webmcp/) (March 9, 2026). Every type in the codebase is explicitly tagged:

| Tag | Meaning | Examples |
|:----|:--------|:---------|
| `[SPEC]` | Matches the W3C draft exactly | `registerTool`, `unregisterTool`, `execute(input, client)`, `ToolAnnotations.readOnlyHint`, `ModelContextClient` |
| `[EXTENSION]` | SDK additions beyond the spec | `getTools()`, `safetyLevel`, `handler` (simplified `execute`), `destructiveHint`, `confirmationHint`, `idempotentHint`, manifest generation |

When the spec evolves, we update. When browsers ship native `navigator.modelContext`, the polyfill detects it and defers to the native implementation.

See [`packages/core/src/types.ts`](packages/core/src/types.ts) for the fully annotated type definitions.

## Development

```bash
git clone https://github.com/samuelvinay91/webmcpregistry.git
cd webmcpregistry
pnpm install
```

| Command | Description |
|:--------|:------------|
| `pnpm build` | Build all packages (Turborepo) |
| `pnpm test` | Run all tests |
| `pnpm dev` | Watch mode for all packages |
| `pnpm --filter @webmcpregistry/core test` | Run core tests only |
| `pnpm --filter @webmcpregistry/core build` | Build a single package |
| `pnpm --filter @webmcpregistry/docs dev` | Docs site on localhost:3000 |

Requirements: Node.js 20+, pnpm 10+. The monorepo uses [Turborepo](https://turbo.build/) for orchestration, [tsup](https://tsup.egoist.dev/) for builds (ESM + CJS + DTS), and [Vitest](https://vitest.dev/) for testing.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, coding conventions, and pull request guidelines.

## License

[Apache 2.0](LICENSE) -- RAPHATECH OU
