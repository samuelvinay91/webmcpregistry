# @webmcpregistry/nextjs

[![npm version](https://img.shields.io/npm/v/@webmcpregistry/nextjs)](https://www.npmjs.com/package/@webmcpregistry/nextjs)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Next.js App Router adapter for WebMCP. Thin wrapper over `@webmcpregistry/react` that includes the `'use client'` directive so WebMCP components work seamlessly in Server Component trees.

## Install

```bash
npm install @webmcpregistry/nextjs
# or
pnpm add @webmcpregistry/nextjs
```

**Peer dependencies:** `next` ^14.0.0 || ^15.0.0, `react` ^18.0.0 || ^19.0.0

## Quick Start

### 1. Add the provider to your root layout

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

No `'use client'` needed in your layout -- the directive is already baked into this package.

### 2. Register tools in page components

```tsx
// app/search/page.tsx
'use client'

import { useWebMCPTool } from '@webmcpregistry/nextjs'

export default function SearchPage() {
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

Note: Components that call hooks (`useWebMCPTool`, `useWebMCPContext`, etc.) still need `'use client'` since they use React hooks internally.

## Why a Separate Package?

Next.js App Router uses React Server Components by default. The WebMCP SDK requires browser APIs (`navigator.modelContext`), so all WebMCP components must be client components. This package:

1. Adds `'use client'` at the module level so you can import `WebMCPProvider` directly into Server Components (like `layout.tsx`) without marking the entire file as a client boundary.
2. Re-exports the full `@webmcpregistry/react` API so you only need one import.

## API Reference

This package re-exports everything from `@webmcpregistry/react`. All APIs are identical:

### Components

| Export | Description |
|--------|-------------|
| `WebMCPProvider` | Context provider that initializes WebMCP. Accepts all `WebMCPConfig` props plus `children`. |

### Hooks

| Export | Description |
|--------|-------------|
| `useWebMCPTool(tool)` | Register a single tool tied to the component lifecycle |
| `useWebMCPToolsBatch(tools)` | Register multiple tools at once |
| `useWebMCPTools()` | Get all registered tools |
| `useWebMCPContext()` | Access full context: `{ tools, ready, mode, nativeAPI, polyfilled }` |

### Types

| Export | Description |
|--------|-------------|
| `WebMCPProviderProps` | Props for the provider component |
| `ToolDefinition` | Full tool definition object |
| `ToolInputSchema` | JSON Schema for tool input |
| `ToolSafetyLevel` | `'read' \| 'write' \| 'danger'` |
| `ToolHandler` | Simplified handler function type |
| `WebMCPConfig` | SDK configuration options |
| `RegistrationMode` | `'auto' \| 'suggest' \| 'manual'` |

## Links

- [Main repository](https://github.com/samuelvinay91/webmcpregistry)
- [React package](https://github.com/samuelvinay91/webmcpregistry/tree/main/packages/react)
- [Core package](https://github.com/samuelvinay91/webmcpregistry/tree/main/packages/core)
- [W3C WebMCP Spec](https://webmachinelearning.github.io/webmcp/)

## License

Apache-2.0 -- RAPHATECH OU
