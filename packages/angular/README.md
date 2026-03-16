# @webmcpregistry/angular

[![npm version](https://img.shields.io/npm/v/@webmcpregistry/angular)](https://www.npmjs.com/package/@webmcpregistry/angular)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Angular service and provider for WebMCP tool registration. Expose AI-agent-callable tools from Angular applications using a lightweight, decorator-free service compatible with both standalone and NgModule patterns.

## Install

```bash
npm install @webmcpregistry/angular
# or
pnpm add @webmcpregistry/angular
```

**Peer dependency:** `@angular/core` ^17.0.0 || ^18.0.0 || ^19.0.0

## Quick Start

### 1. Register the provider

```typescript
// app.config.ts (standalone)
import { provideWebMCP } from '@webmcpregistry/angular'

export const appConfig = {
  providers: [provideWebMCP({ mode: 'auto' })],
}
```

Or with NgModule:

```typescript
// app.module.ts
import { provideWebMCP } from '@webmcpregistry/angular'

@NgModule({
  providers: [provideWebMCP({ mode: 'auto' })],
})
export class AppModule {}
```

### 2. Register tools in components

```typescript
import { Component, Inject, OnInit, OnDestroy } from '@angular/core'
import { WebMCPService } from '@webmcpregistry/angular'

@Component({
  selector: 'app-search',
  template: '<div>Search Page</div>',
})
export class SearchComponent implements OnInit, OnDestroy {
  constructor(@Inject('WEBMCP_SERVICE') private webmcp: WebMCPService) {}

  ngOnInit() {
    this.webmcp.registerTool({
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
  }

  ngOnDestroy() {
    this.webmcp.unregisterTool('search_products')
  }
}
```

### Alternative: Use without DI

```typescript
import { getWebMCPService } from '@webmcpregistry/angular'

const service = getWebMCPService()
service.initialize({ mode: 'auto' })
service.registerTool({ name: 'my_tool', description: '...', handler: async (input) => input })
```

## API Reference

### `provideWebMCP(config?)`

Create an Angular-compatible provider that initializes the WebMCP SDK. Returns a `{ provide, useValue }` object for Angular's DI system.

```typescript
provideWebMCP({ mode: 'auto' })
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

**Returns:** `{ provide: 'WEBMCP_SERVICE', useValue: WebMCPService }`

Initialization is deferred via `queueMicrotask` to ensure it runs after the DOM is ready.

### `WebMCPService`

Stateful service that wraps the core SDK. No Angular decorators -- works in any context.

#### Properties (read-only getters)

| Property | Type | Description |
|----------|------|-------------|
| `tools` | `ToolDefinition[]` | All currently registered tools |
| `ready` | `boolean` | Whether initialization is complete |
| `mode` | `RegistrationMode` | The active SDK mode |
| `nativeAPI` | `boolean` | Whether the native browser API is available |
| `polyfilled` | `boolean` | Whether the polyfill was installed |

#### Methods

##### `initialize(config?)`

Manually initialize the SDK. Called automatically by `provideWebMCP`, but can also be called directly.

```typescript
const result = service.initialize({ mode: 'auto' })
```

##### `registerTool(tool)`

Register a new tool. Updates the internal `tools` array.

```typescript
service.registerTool({
  name: 'add_to_cart',
  description: 'Add a product to the cart',
  inputSchema: { type: 'object', properties: { productId: { type: 'string' } } },
  safetyLevel: 'write',
  handler: async ({ productId }) => { /* ... */ },
})
```

##### `unregisterTool(name)`

Remove a registered tool by name. Updates the internal `tools` array.

```typescript
service.unregisterTool('add_to_cart')
```

### `getWebMCPService()`

Get or lazily create a `WebMCPService` singleton. Useful for direct usage without Angular DI.

```typescript
import { getWebMCPService } from '@webmcpregistry/angular'

const service = getWebMCPService()
```

**Returns:** `WebMCPService`

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
