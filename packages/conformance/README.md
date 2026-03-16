# @webmcpregistry/conformance

[![npm version](https://img.shields.io/npm/v/@webmcpregistry/conformance.svg)](https://www.npmjs.com/package/@webmcpregistry/conformance)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

W3C WebMCP specification conformance test suite. Verify any `navigator.modelContext` implementation (native browser or polyfill) against the [W3C draft spec](https://webmachinelearning.github.io/webmcp/) with 12 self-contained scenarios.

## Install

```bash
npm install @webmcpregistry/conformance
```

## Quick Start

```ts
import { runConformance, formatReport } from '@webmcpregistry/conformance'
import { installPolyfill, getModelContext } from '@webmcpregistry/core'

installPolyfill()
const mc = getModelContext()!

const report = await runConformance(mc, '@webmcpregistry/core polyfill v0.2.1')
console.log(formatReport(report))
// =>
// Implementation: @webmcpregistry/core polyfill v0.2.1
// Pass rate:      100% (12/12)
```

## Scenarios

All 12 scenarios are mapped to specific sections of the W3C WebMCP draft spec:

### Section 4.1 -- ModelContext interface

| ID | Title | Spec Reference |
|---|---|---|
| `mc-exists` | ModelContext interface exists | `navigator.modelContext` must be defined |
| `mc-same-object` | ModelContext is SameObject | `[SameObject]` -- repeated access returns the same instance |

### Section 4.2 -- registerTool / unregisterTool

| ID | Title | Spec Reference |
|---|---|---|
| `register-basic` | registerTool accepts valid tool | `registerTool(tool)` method |
| `register-duplicate-throws` | Throws on duplicate name | `InvalidStateError` when name exists |
| `register-empty-name-throws` | Throws on empty name | `InvalidStateError` when name is empty |
| `register-empty-desc-throws` | Throws on empty description | `InvalidStateError` when description is empty |
| `register-schema-serialization` | inputSchema serialization | JSON.stringify algorithm for schema |
| `register-annotations-readonly` | readOnlyHint preserved | Annotations are stored and retrievable |
| `unregister-basic` | unregisterTool removes tool | `unregisterTool(name)` method |
| `unregister-nonexistent-throws` | Throws for non-existent tool | `InvalidStateError` when tool not found |

### Section 4.2 -- Tool struct requirements

| ID | Title | Spec Reference |
|---|---|---|
| `tool-struct-name` | Tool name preserved | Name is retrievable after registration |
| `tool-struct-description` | Tool description preserved | Description stored exactly, including special characters |

## Running the Suite

### Full suite

```ts
import { runConformance, formatReport } from '@webmcpregistry/conformance'

const report = await runConformance(mc, 'My Implementation v1.0')
console.log(formatReport(report))
console.log(`Pass rate: ${report.passRate}%`)
```

### Filter by section

```ts
const report = await runConformance(mc, 'My Implementation', {
  sections: ['4.2'],
})
```

### Filter by scenario ID

```ts
const report = await runConformance(mc, 'My Implementation', {
  ids: ['register-basic', 'register-duplicate-throws'],
})
```

### Fail fast

```ts
const report = await runConformance(mc, 'My Implementation', {
  failFast: true,
  onResult: (result) => {
    console.log(`${result.passed ? 'PASS' : 'FAIL'} [${result.id}] ${result.title}`)
  },
})
```

### Access individual scenarios

```ts
import { ALL_SCENARIOS } from '@webmcpregistry/conformance'

console.log(`Total scenarios: ${ALL_SCENARIOS.length}`)
for (const scenario of ALL_SCENARIOS) {
  console.log(`[${scenario.id}] ${scenario.title} (${scenario.section})`)
}
```

## API Reference

### Runner

| Export | Description |
|---|---|
| `runConformance(mc, implementation, options?)` | Run the conformance suite against a `ModelContextAPI` implementation. Returns `ConformanceReport`. |
| `formatReport(report)` | Format a `ConformanceReport` as a human-readable string with pass/fail indicators and section breakdown. |

### Scenarios

| Export | Description |
|---|---|
| `ALL_SCENARIOS` | Array of all 12 `Scenario` objects. Each is self-contained and can run independently. |

### Key Types

| Type | Description |
|---|---|
| `ConformanceReport` | `{ implementation, timestamp, total, passed, failed, passRate, results, bySection }` |
| `ScenarioResult` | `{ id, section, title, description, passed, error?, specRef }` |
| `Scenario` | `{ id, section, title, description, specRef, run(mc) }` |
| `RunnerOptions` | `{ sections?, ids?, failFast?, onResult? }` |

## Use with Vitest

```ts
import { describe, it, expect, beforeAll } from 'vitest'
import { ALL_SCENARIOS } from '@webmcpregistry/conformance'
import { installPolyfill, getModelContext } from '@webmcpregistry/core'

describe('WebMCP Conformance', () => {
  let mc: ReturnType<typeof getModelContext>

  beforeAll(() => {
    installPolyfill()
    mc = getModelContext()!
  })

  for (const scenario of ALL_SCENARIOS) {
    it(`[${scenario.id}] ${scenario.title}`, async () => {
      await scenario.run(mc!)
    })
  }
})
```

## License

Apache 2.0 -- [RAPHATECH OU](https://github.com/samuelvinay91/webmcpregistry)

Part of the [WebMCP Registry SDK](https://github.com/samuelvinay91/webmcpregistry) monorepo.
