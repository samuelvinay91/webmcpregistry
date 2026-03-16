# @webmcpregistry/react

[![npm version](https://img.shields.io/npm/v/@webmcpregistry/react)](https://www.npmjs.com/package/@webmcpregistry/react)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

React hooks and components for WebMCP tool registration. Expose AI-agent-callable tools from any React component with automatic lifecycle management.

## Install

```bash
npm install @webmcpregistry/react
# or
pnpm add @webmcpregistry/react
```

**Peer dependencies:** `react` ^18.0.0 || ^19.0.0, `react-dom` ^18.0.0 || ^19.0.0

## Quick Start

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

## API Reference

### `<WebMCPProvider>`

Context provider that initializes the WebMCP SDK and makes state available to child hooks.

```tsx
<WebMCPProvider mode="auto" polyfill={true} autoDetect={true}>
  {children}
</WebMCPProvider>
```

**Props** (`WebMCPProviderProps` extends `WebMCPConfig`):

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `'auto' \| 'suggest' \| 'manual'` | `'auto'` | SDK operating mode |
| `polyfill` | `boolean` | `true` | Install polyfill if `navigator.modelContext` is unavailable |
| `autoDetect` | `boolean` | — | Auto-detect tools from DOM structure |
| `tools` | `ToolDefinition[]` | — | Pre-defined tools to register |
| `siteKey` | `string` | — | Site key for analytics |
| `onRegister` | `(tools: ToolDefinition[]) => void` | — | Callback when tools are registered |
| `onError` | `(error: Error) => void` | — | Error callback |
| `children` | `ReactNode` | — | Child components |

### `useWebMCPTool(tool)`

Register a single tool for the lifetime of the component. The tool is automatically unregistered on unmount.

```tsx
useWebMCPTool({
  name: 'add_to_cart',
  description: 'Add a product to the shopping cart',
  inputSchema: {
    type: 'object',
    properties: {
      productId: { type: 'string' },
      quantity: { type: 'integer', minimum: 1 },
    },
    required: ['productId'],
  },
  safetyLevel: 'write',
  handler: async ({ productId, quantity }) => { /* ... */ },
})
```

**Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `tool` | `ToolDefinition` | Full tool definition including name, description, schema, and handler |

### `useWebMCPTools(tools)` (exported as `useWebMCPToolsBatch`)

Register multiple tools at once, all tied to the component lifecycle.

```tsx
import { useWebMCPToolsBatch } from '@webmcpregistry/react'

useWebMCPToolsBatch([
  { name: 'search_products', description: '...', inputSchema: { /* ... */ }, safetyLevel: 'read', handler: searchFn },
  { name: 'add_to_cart', description: '...', inputSchema: { /* ... */ }, safetyLevel: 'write', handler: cartFn },
])
```

**Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `tools` | `ToolDefinition[]` | Array of tool definitions |

### `useWebMCPContext()`

Access the full WebMCP context from within a `<WebMCPProvider>`.

```tsx
const { tools, ready, mode, nativeAPI, polyfilled } = useWebMCPContext()
```

**Returns** `WebMCPContextValue`:

| Field | Type | Description |
|-------|------|-------------|
| `tools` | `ToolDefinition[]` | All currently registered tools |
| `ready` | `boolean` | Whether initialization is complete |
| `mode` | `RegistrationMode` | The active SDK mode |
| `nativeAPI` | `boolean` | Whether the native browser API is available |
| `polyfilled` | `boolean` | Whether the polyfill was installed |

### `useWebMCPTools()`

Get all currently registered tools. Works both inside and outside a provider -- falls back to reading directly from `navigator.modelContext`.

```tsx
const tools = useWebMCPTools()
```

**Returns:** `ToolDefinition[]`

## Re-exported Types

The following types are re-exported from `@webmcpregistry/core` for convenience:

- `ToolDefinition` -- full tool definition object
- `ToolInputSchema` -- JSON Schema for tool input parameters
- `ToolSafetyLevel` -- `'read' | 'write' | 'danger'`
- `ToolHandler` -- `(input: Record<string, unknown>) => unknown | Promise<unknown>`
- `WebMCPConfig` -- SDK configuration options
- `RegistrationMode` -- `'auto' | 'suggest' | 'manual'`

## Links

- [Main repository](https://github.com/samuelvinay91/webmcpregistry)
- [Core package](https://github.com/samuelvinay91/webmcpregistry/tree/main/packages/core)
- [W3C WebMCP Spec](https://webmachinelearning.github.io/webmcp/)

## License

Apache-2.0 -- RAPHATECH OU
