# @webmcpregistry/vue

[![npm version](https://img.shields.io/npm/v/@webmcpregistry/vue)](https://www.npmjs.com/package/@webmcpregistry/vue)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Vue 3 plugin and composables for WebMCP tool registration. Expose AI-agent-callable tools from any Vue component with reactive state and automatic lifecycle management.

## Install

```bash
npm install @webmcpregistry/vue
# or
pnpm add @webmcpregistry/vue
```

**Peer dependency:** `vue` ^3.3.0

## Quick Start

### 1. Install the plugin

```ts
// main.ts
import { createApp } from 'vue'
import { webmcpPlugin } from '@webmcpregistry/vue'
import App from './App.vue'

const app = createApp(App)
app.use(webmcpPlugin, { mode: 'auto' })
app.mount('#app')
```

### 2. Register tools in components

```vue
<script setup>
import { useWebMCPTool } from '@webmcpregistry/vue'

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
</script>

<template>
  <div>Search Page</div>
</template>
```

## API Reference

### `webmcpPlugin`

Vue 3 plugin that initializes the WebMCP SDK and provides reactive state via `inject`/`provide`.

```ts
app.use(webmcpPlugin, {
  mode: 'auto',       // 'auto' | 'suggest' | 'manual'
  polyfill: true,     // Install polyfill if navigator.modelContext is missing
  autoDetect: true,   // Auto-detect tools from DOM
  tools: [],          // Pre-defined tools
  siteKey: 'sk_...',  // Site key for analytics
  onRegister: (tools) => { /* ... */ },
  onError: (error) => { /* ... */ },
})
```

The plugin initializes after the DOM is ready (deferred via `DOMContentLoaded` or `setTimeout`) so that auto-detection can find mounted elements.

### `useWebMCPTool(tool)`

Register a single tool for the lifetime of the component. Registers on `onMounted`, unregisters on `onUnmounted`.

```vue
<script setup>
import { useWebMCPTool } from '@webmcpregistry/vue'

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
</script>
```

**Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `tool` | `ToolDefinition` | Full tool definition including name, description, schema, and handler |

### `useWebMCPTools()`

Get all currently registered tools. Returns tools from the plugin's reactive state if available, otherwise reads directly from `navigator.modelContext`.

```vue
<script setup>
import { useWebMCPTools } from '@webmcpregistry/vue'

const tools = useWebMCPTools()
</script>

<template>
  <p>{{ tools.length }} tool(s) registered</p>
</template>
```

**Returns:** `ToolDefinition[]`

### `useWebMCPContext()`

Access the full reactive WebMCP state. Throws if called outside the plugin scope.

```vue
<script setup>
import { useWebMCPContext } from '@webmcpregistry/vue'

const ctx = useWebMCPContext()
// ctx.tools, ctx.ready, ctx.mode, ctx.nativeAPI, ctx.polyfilled
</script>
```

**Returns** `WebMCPState` (reactive):

| Field | Type | Description |
|-------|------|-------------|
| `tools` | `ToolDefinition[]` | All currently registered tools |
| `ready` | `boolean` | Whether initialization is complete |
| `mode` | `RegistrationMode` | The active SDK mode |
| `nativeAPI` | `boolean` | Whether the native browser API is available |
| `polyfilled` | `boolean` | Whether the polyfill was installed |

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
