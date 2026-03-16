# @webmcpregistry/browser

[![npm version](https://img.shields.io/npm/v/@webmcpregistry/browser)](https://www.npmjs.com/package/@webmcpregistry/browser)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Drop-in `<script>` tag that makes any website WebMCP-ready -- zero framework required. Auto-detects tools from the DOM, installs the polyfill, and exposes everything to AI agents.

## Install

### CDN (recommended)

```html
<script src="https://cdn.webmcpregistry.com/v1/auto.js" data-mode="auto"></script>
```

### npm

```bash
npm install @webmcpregistry/browser
# or
pnpm add @webmcpregistry/browser
```

Then import the auto-executing module:

```js
import '@webmcpregistry/browser'
```

## Quick Start

Add one script tag to your HTML. The SDK will auto-detect tools from declarative HTML attributes and register them via `navigator.modelContext`.

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Site</title>
</head>
<body>

  <form toolname="search_products"
        tooldescription="Search the product catalog by keyword">
    <input name="query" type="text" />
    <button type="submit">Search</button>
  </form>

  <script
    src="https://cdn.webmcpregistry.com/v1/auto.js"
    data-mode="auto">
  </script>

</body>
</html>
```

### With a site key

```html
<script
  src="https://cdn.webmcpregistry.com/v1/auto.js"
  data-mode="suggest"
  data-site-key="sk_live_xxxx">
</script>
```

## How It Works

1. The script reads configuration from `data-*` attributes on its own `<script>` tag.
2. It calls `initialize()` from `@webmcpregistry/core` with the resolved config.
3. The polyfill is installed if `navigator.modelContext` is not natively available.
4. In `auto` mode, it scans the DOM for elements with `toolname`/`tooldescription` attributes and registers them as tools.
5. A `__WEBMCP_REGISTRY__` global is exposed for debugging.

## Configuration

All configuration is done via `data-*` attributes on the script tag:

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `data-mode` | `'auto' \| 'suggest' \| 'manual'` | `'auto'` | SDK operating mode. `auto` enables DOM auto-detection. |
| `data-site-key` | `string` | — | Site key for analytics/dashboard |

### Modes

- **`auto`** -- Installs polyfill, scans DOM for declarative tools, registers them, and logs results to console.
- **`suggest`** -- Installs polyfill and registers tools but does not auto-detect from DOM.
- **`manual`** -- Installs polyfill only. You register tools programmatically via `navigator.modelContext.registerTool()`.

## Debugging

The script exposes a `__WEBMCP_REGISTRY__` global on `window` for inspection:

```js
console.log(window.__WEBMCP_REGISTRY__)
// {
//   version: '0.2.0',
//   mode: 'auto',
//   siteKey: undefined,
//   tools: [...],
//   polyfilled: true,
//   nativeAPI: false,
// }
```

In non-manual modes, registered tools are also logged to the console:

```
[WebMCP Registry] Registered 3 tool(s): ['search_products', 'add_to_cart', 'get_details']
```

## Callbacks

In `auto` and `suggest` modes, the script logs registration results and errors to the console automatically. For custom handling, use one of the framework adapters or the core SDK directly.

## Bundle Size

The browser bundle is a self-contained IIFE (~10KB) that includes the core SDK. No external dependencies at runtime.

## Links

- [Main repository](https://github.com/samuelvinay91/webmcpregistry)
- [Core package](https://github.com/samuelvinay91/webmcpregistry/tree/main/packages/core)
- [W3C WebMCP Spec](https://webmachinelearning.github.io/webmcp/)

## License

Apache-2.0 -- RAPHATECH OU
