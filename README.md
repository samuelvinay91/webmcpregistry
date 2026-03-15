# WebMCP Registry SDK

**The open-source SDK that makes any website callable by AI agents.**

[![CI](https://github.com/samuelvinay91/webmcpregistry/actions/workflows/ci.yml/badge.svg)](https://github.com/samuelvinay91/webmcpregistry/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

---

Implement the [WebMCP](https://webmachinelearning.github.io/webmcp/) browser standard in under 5 minutes. Register structured, AI-callable tools on your website with type-safe adapters for every major framework — plus a built-in polyfill, CLI testing tool, conformance test suite, and agent discovery layer.

> **WebMCP** is a W3C Draft Community Group standard that adds `navigator.modelContext` to browsers, letting websites expose structured tools that AI agents can discover and call directly — no DOM scraping needed.

## Why This SDK?

- **No browser ships WebMCP yet** — our polyfill lets you build today, and steps aside when native support lands
- **Every framework** — React, Next.js, Vue, Angular, Svelte, or a zero-dependency `<script>` tag
- **Spec-aligned** — types marked `[SPEC]` vs `[EXTENSION]` so you know exactly what's standard
- **Testing built in** — schema-driven test generation, contract testing, mutation testing, conformance suite
- **Agent discovery** — generate `/.well-known/webmcp.json`, JSON-LD, `llms.txt`, and `agents.json`

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
      properties: {
        query: { type: 'string', description: 'Search term' },
      },
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

### Next.js

```bash
npm install @webmcpregistry/nextjs
```

```tsx
// app/layout.tsx
import { WebMCPProvider } from '@webmcpregistry/nextjs'

export default function RootLayout({ children }) {
  return (
    <html><body>
      <WebMCPProvider mode="auto">{children}</WebMCPProvider>
    </body></html>
  )
}
```

### Vue 3

```bash
npm install @webmcpregistry/vue
```

```ts
import { createApp } from 'vue'
import { webmcpPlugin } from '@webmcpregistry/vue'

const app = createApp(App)
app.use(webmcpPlugin, { mode: 'auto' })
app.mount('#app')
```

### Angular

```bash
npm install @webmcpregistry/angular
```

```ts
import { provideWebMCP } from '@webmcpregistry/angular'

export const appConfig = {
  providers: [provideWebMCP({ mode: 'auto' })],
}
```

### Svelte

```bash
npm install @webmcpregistry/svelte
```

```svelte
<script>
  import { initWebMCP, webmcpTools } from '@webmcpregistry/svelte'
  import { onMount } from 'svelte'
  onMount(() => initWebMCP({ mode: 'auto' }))
</script>

<p>Registered tools: {$webmcpTools.length}</p>
```

### HTML (no framework)

```html
<script src="https://unpkg.com/@webmcpregistry/browser/dist/auto.global.js" data-mode="auto"></script>
```

Or use declarative HTML attributes:

```html
<form toolname="search_products" tooldescription="Search the product catalog">
  <input name="query" type="text" toolparamdescription="Search keywords" required />
  <button type="submit">Search</button>
</form>
```

## CLI — Test Your Implementation

```bash
# Full readiness test
npx @webmcpregistry/cli test https://yoursite.com

# Quick static scan (no browser)
npx @webmcpregistry/cli scan https://yoursite.com

# Scaffold setup for your framework
npx @webmcpregistry/cli init --framework react
```

The CLI produces a readiness grade (A-F) with breakdown:

```
╔══════════════════════════════════════╗
║  WebMCP Readiness: ● Grade A (94/100)  ║
╚══════════════════════════════════════╝

  Tool count:      ████████████████░░░░ 16/20
  Descriptions:    ████████████████████ 23/25
  Schema:          ████████████████████ 20/20
  Naming:          ██████████░░░░░░░░░░ 10/10
  Manifest:        ░░░░░░░░░░░░░░░░░░░░  0/10
  Security:        ████████████████████ 15/15
```

## Packages

| Package | Size | Description |
|---------|------|-------------|
| [`@webmcpregistry/core`](packages/core) | 23KB | Polyfill, detector, validator, security, manifest generation |
| [`@webmcpregistry/react`](packages/react) | 2.4KB | React hooks — `useWebMCPTool`, `WebMCPProvider` |
| [`@webmcpregistry/nextjs`](packages/nextjs) | 307B | Next.js App Router adapter |
| [`@webmcpregistry/vue`](packages/vue) | 1.5KB | Vue 3 plugin + composables |
| [`@webmcpregistry/angular`](packages/angular) | 1.3KB | Angular service + `provideWebMCP()` |
| [`@webmcpregistry/svelte`](packages/svelte) | 1.2KB | Svelte stores + actions |
| [`@webmcpregistry/browser`](packages/browser) | 10KB | Zero-dependency `<script>` tag (IIFE) |
| [`@webmcpregistry/cli`](packages/cli) | 19KB | CLI: `test`, `scan`, `init` commands |
| [`@webmcpregistry/testing`](packages/testing) | — | Schema-driven test gen, contract testing, mutation testing |
| [`@webmcpregistry/conformance`](packages/conformance) | — | W3C spec conformance test suite (12 scenarios) |
| [`@webmcpregistry/evals`](packages/evals) | — | AI agent tool-calling accuracy evaluation |
| [`@webmcpregistry/mcp-server`](packages/mcp-server) | — | MCP-to-WebMCP tool discovery bridge |

## Agent Discovery

Generate machine-readable manifests so AI agents can find your tools without loading the page:

```ts
import { generateManifest, generateJsonLd, generateLlmsTxt } from '@webmcpregistry/core'

// /.well-known/webmcp.json — tool manifest
const manifest = generateManifest(tools, { name: 'My Site', url: 'https://mysite.com' })

// JSON-LD — structured data for AI crawlers
const jsonLd = generateJsonLd(tools, { name: 'My Site', url: 'https://mysite.com' })

// llms.txt — human/AI readable capabilities
const llmsTxt = generateLlmsTxt(tools, { name: 'My Site', url: 'https://mysite.com' })
```

## Testing

### Schema-Driven Test Generation

Auto-generate test cases from your tool's `inputSchema`:

```ts
import { generateTestCases, runTestSuite } from '@webmcpregistry/testing'

// Generate valid, invalid, boundary, type-coercion, and security test cases
const cases = generateTestCases(myTool)
console.log(`Generated ${cases.length} test cases`)

// Run them against your tool's handler
const results = await runTestSuite([myTool])
console.log(`${results.passed}/${results.total} passed`)
```

### Contract Testing

Detect breaking changes between releases:

```ts
import { captureContract, diffContracts } from '@webmcpregistry/testing'

const before = captureContract(oldTools, 'mysite.com')
const after = captureContract(newTools, 'mysite.com')
const diff = diffContracts(before, after)

if (diff.isBreaking) {
  console.error('Breaking changes:', diff.removed, diff.changed.filter(c => c.breaking))
}
```

### Conformance Testing

Verify any `navigator.modelContext` implementation against the W3C spec:

```ts
import { runConformance, formatReport } from '@webmcpregistry/conformance'
import { installPolyfill, getModelContext } from '@webmcpregistry/core'

installPolyfill()
const report = await runConformance(getModelContext()!, 'polyfill v0.1.0')
console.log(formatReport(report))
// => 100% (12/12) passed
```

### Evals — Agent Accuracy

Measure how well AI agents can select the right tool:

```ts
import { createEvalSuite, runEvalSuite } from '@webmcpregistry/evals'

const suite = createEvalSuite(tools, [
  { task: 'Find flights to Tokyo under $500', expectedTool: 'search_flights' },
  { task: 'Cancel my reservation', expectedTool: 'cancel_booking' },
])

const report = runEvalSuite(suite)
console.log(`Tool selection accuracy: ${report.selectionAccuracy}%`)
```

## How It Works

```
                    Your Website
                    ┌─────────────────────────┐
                    │                         │
  ┌──────────┐     │  @webmcpregistry/react   │     ┌──────────────┐
  │ AI Agent │────►│  (or vue/angular/svelte) │────►│ Your tool    │
  │          │     │           │              │     │ handlers     │
  │ Claude   │     │  @webmcpregistry/core    │     │              │
  │ ChatGPT  │◄────│  ┌─ polyfill ──────────┐ │◄────│ Return data  │
  │ Gemini   │     │  │ navigator.           │ │     └──────────────┘
  └──────────┘     │  │ modelContext         │ │
                    │  │ .registerTool()     │ │
                    │  └─────────────────────┘ │
                    └─────────────────────────┘
```

1. **Install** the SDK for your framework
2. **Register tools** — declaratively or imperatively
3. **AI agents discover** your tools via `navigator.modelContext`
4. **Agents call tools** with typed inputs, get structured responses
5. **Test & validate** with the CLI, conformance suite, or evals

## Spec Alignment

This SDK tracks the [W3C WebMCP Draft](https://webmachinelearning.github.io/webmcp/) (March 9, 2026). All types are documented:

- **`[SPEC]`** — matches the W3C draft exactly (`registerTool`, `unregisterTool`, `execute`, `ToolAnnotations.readOnlyHint`)
- **`[EXTENSION]`** — our additions (`getTools()`, `safetyLevel`, `handler`, `destructiveHint`, manifest generation)

When the spec evolves, we update. When browsers ship native support, our polyfill steps aside.

## Development

```bash
git clone https://github.com/samuelvinay91/webmcpregistry.git
cd webmcpregistry
pnpm install
pnpm build          # Build all 13 packages
pnpm test           # Run tests (28 passing)
pnpm --filter @webmcpregistry/docs dev  # Docs site on localhost:3000
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full development guide.

## License

[Apache 2.0](LICENSE) — RAPHATECH OÜ
