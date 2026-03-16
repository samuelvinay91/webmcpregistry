# @webmcpregistry/core

[![npm version](https://img.shields.io/npm/v/@webmcpregistry/core.svg)](https://www.npmjs.com/package/@webmcpregistry/core)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Framework-agnostic WebMCP SDK core -- polyfill, tool detection, registration, validation, security scanning, and manifest generation for the [W3C Web Model Context Protocol](https://webmachinelearning.github.io/webmcp/).

## Install

```bash
npm install @webmcpregistry/core
```

## Quick Start

```ts
import { initialize } from '@webmcpregistry/core'

// Auto mode: install polyfill, detect tools from DOM, register them
const result = initialize({ mode: 'auto' })
console.log(`Registered ${result.registered.length} tools`)
```

### Register a tool manually

```ts
import { registerTool } from '@webmcpregistry/core'

registerTool({
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
```

### Validate tool definitions

```ts
import { validateTools } from '@webmcpregistry/core'

const result = validateTools(myTools)
console.log(`Score: ${result.score}/100`)
for (const issue of result.issues) {
  console.log(`[${issue.severity}] ${issue.message}`)
}
```

### Run a security audit

```ts
import { runSecurityScan } from '@webmcpregistry/core'

const report = runSecurityScan(myTools)
console.log(`Security: ${report.status} (${report.score}/100)`)
for (const finding of report.findings) {
  console.log(`[${finding.severity}] ${finding.description}`)
}
```

### Generate discovery manifests

```ts
import {
  generateManifest,
  generateJsonLd,
  generateLlmsTxt,
  generateAgentsJson,
} from '@webmcpregistry/core'

const site = { name: 'My Store', url: 'https://mystore.com' }

// /.well-known/webmcp.json — tool manifest for AI crawlers
const manifest = generateManifest(myTools, site)

// JSON-LD structured data for <script type="application/ld+json">
const jsonLd = generateJsonLd(myTools, site)

// llms.txt — human/AI readable site description
const llmsTxt = generateLlmsTxt(myTools, site)

// agents.json — machine-readable agent capability manifest
const agentsJson = generateAgentsJson(myTools, site)
```

## API Reference

### Polyfill

| Export | Description |
|---|---|
| `installPolyfill()` | Install the `navigator.modelContext` polyfill. Returns `true` if installed, `false` if native API already present. |
| `hasNativeAPI()` | Check if the native browser API is available (not the polyfill). |
| `isPolyfill(mc)` | Check if a `ModelContextAPI` instance is the polyfill. |
| `getModelContext(autoPolyfill?)` | Get the `modelContext` API, optionally installing the polyfill if missing. |

### Registration

| Export | Description |
|---|---|
| `initialize(config?)` | Main entry point. Installs polyfill, detects tools from DOM, validates, and registers. Returns `RegistrationResult`. |
| `registerTool(tool, autoPolyfill?)` | Register a single tool with `navigator.modelContext`. |
| `unregisterTool(name)` | Remove a registered tool by name. |
| `getRegisteredTools()` | Get all currently registered tools. |

### Detection

| Export | Description |
|---|---|
| `detectTools(options?)` | Scan the DOM for tool candidates: declarative attributes (`toolname`), forms, buttons, and ARIA-labeled elements. |

### Validation

| Export | Description |
|---|---|
| `validateTools(tools)` | Validate an array of tool definitions. Returns `ValidationResult` with issues and a 0-100 score. Checks naming conventions, description quality, schema completeness, and safety classification. |
| `validateTool(tool)` | Validate a single tool definition. Returns an array of `ValidationIssue`. |

### Security

| Export | Description |
|---|---|
| `runSecurityScan(tools)` | Run security checks on tool definitions. Returns `SecurityReport` with status (`PASS`/`WARN`/`FAIL`), findings, and a 0-100 score. Detects prompt injection, deceptive naming, unrestricted inputs, unclassified destructive actions, and suspicious URLs. |

### Manifest Generation

| Export | Description |
|---|---|
| `generateManifest(tools, site, options?)` | Generate a `/.well-known/webmcp.json` manifest. |
| `generateJsonLd(tools, site)` | Generate Schema.org JSON-LD structured data for AI crawlers. |
| `generateLlmsTxt(tools, site)` | Generate an `llms.txt` file describing AI capabilities. |
| `generateAgentsJson(tools, site)` | Generate an `agents.json` machine-readable agent interaction manifest. |

### Key Types

| Type | Description |
|---|---|
| `ToolDefinition` | A WebMCP tool: `name`, `description`, `inputSchema`, `execute`/`handler`, `safetyLevel`, `annotations`. |
| `ToolSafetyLevel` | `'read'` \| `'write'` \| `'danger'` |
| `ToolAnnotations` | Behavioral hints: `readOnlyHint`, `destructiveHint`, `confirmationHint`, `idempotentHint`, `longRunningHint`. |
| `WebMCPConfig` | Configuration for `initialize()`: `mode`, `tools`, `polyfill`, `autoDetect`, `onRegister`, `onError`. |
| `RegistrationMode` | `'auto'` \| `'suggest'` \| `'manual'` |
| `ValidationResult` | `{ valid, issues, score }` |
| `SecurityReport` | `{ status, findings, score }` |
| `WebMCPManifest` | The `/.well-known/webmcp.json` manifest shape. |
| `ModelContextAPI` | The `navigator.modelContext` interface: `registerTool()`, `unregisterTool()`, `getTools()`. |

## W3C Spec Alignment

Fields marked `[SPEC]` in the source match the [W3C WebMCP draft](https://webmachinelearning.github.io/webmcp/) exactly. Fields marked `[EXTENSION]` are SDK additions:

- **`getTools()`** -- not in the spec (only `registerTool`/`unregisterTool`). Added for tool discovery.
- **`handler`** -- simplified alias for `execute` without `ModelContextClient`.
- **`safetyLevel`** -- `read`/`write`/`danger` classification.
- **Declarative HTML attributes** (`toolname`, `tooldescription`) -- TODO in the spec, supported by our detector.

## License

Apache 2.0 -- [RAPHATECH OU](https://github.com/samuelvinay91/webmcpregistry)

Part of the [WebMCP Registry SDK](https://github.com/samuelvinay91/webmcpregistry) monorepo.
