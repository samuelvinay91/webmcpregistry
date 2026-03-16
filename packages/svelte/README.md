# @webmcpregistry/svelte

[![npm version](https://img.shields.io/npm/v/@webmcpregistry/svelte)](https://www.npmjs.com/package/@webmcpregistry/svelte)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Svelte stores and actions for WebMCP tool registration. Expose AI-agent-callable tools with reactive stores and element-level lifecycle via Svelte actions.

## Install

```bash
npm install @webmcpregistry/svelte
# or
pnpm add @webmcpregistry/svelte
```

**Peer dependency:** `svelte` ^4.0.0 || ^5.0.0

## Quick Start

### 1. Initialize in your root component

```svelte
<!-- App.svelte -->
<script>
  import { initWebMCP, webmcpTools } from '@webmcpregistry/svelte'
  import { onMount } from 'svelte'

  onMount(() => {
    initWebMCP({ mode: 'auto' })
  })
</script>

<p>Registered tools: {$webmcpTools.length}</p>
```

### 2. Register tools with the action

```svelte
<!-- SearchForm.svelte -->
<script>
  import { webmcpTool } from '@webmcpregistry/svelte'
</script>

<form use:webmcpTool={{
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
}}>
  <input name="query" />
  <button type="submit">Search</button>
</form>
```

The tool registers when the element mounts and unregisters when it is destroyed.

## API Reference

### `initWebMCP(config?)`

Initialize the WebMCP SDK. Call this once in your root component's `onMount`.

```ts
import { initWebMCP } from '@webmcpregistry/svelte'

const result = initWebMCP({ mode: 'auto' })
```

**Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `config` | `WebMCPConfig` | `{}` | SDK configuration |

**Config options:**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `mode` | `'auto' \| 'suggest' \| 'manual'` | `'auto'` | SDK operating mode |
| `polyfill` | `boolean` | — | Install polyfill if `navigator.modelContext` is missing |
| `autoDetect` | `boolean` | — | Auto-detect tools from DOM |
| `tools` | `ToolDefinition[]` | — | Pre-defined tools to register |
| `siteKey` | `string` | — | Site key for analytics |
| `onRegister` | `(tools: ToolDefinition[]) => void` | — | Callback when tools are registered |
| `onError` | `(error: Error) => void` | — | Error callback |

**Returns:** The initialization result from the core SDK.

### `webmcpTools`

Readable store containing all currently registered tools.

```svelte
<script>
  import { webmcpTools } from '@webmcpregistry/svelte'
</script>

{#each $webmcpTools as tool}
  <p>{tool.name}: {tool.description}</p>
{/each}
```

**Type:** `Readable<ToolDefinition[]>`

### `webmcpReady`

Readable store indicating whether the SDK has been initialized.

```svelte
<script>
  import { webmcpReady } from '@webmcpregistry/svelte'
</script>

{#if $webmcpReady}
  <p>WebMCP is ready</p>
{/if}
```

**Type:** `Readable<boolean>`

### `webmcpTool` (Svelte action)

Svelte action that registers a tool when the element mounts and unregisters it when the element is destroyed. Also updates the `webmcpTools` store automatically.

```svelte
<div use:webmcpTool={{
  name: 'get_details',
  description: 'Get product details',
  inputSchema: { type: 'object', properties: { id: { type: 'string' } } },
  safetyLevel: 'read',
  handler: async ({ id }) => { /* ... */ },
}}>
  ...
</div>
```

**Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `tool` | `ToolDefinition` | Full tool definition |

**Lifecycle:** Calls `registerTool` on mount, `unregisterTool` on `destroy`.

### `refreshTools()`

Manually refresh the `webmcpTools` store from `navigator.modelContext`. Useful if tools are registered outside of Svelte.

```ts
import { refreshTools } from '@webmcpregistry/svelte'

refreshTools()
```

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
