# @webmcpregistry/testing

[![npm version](https://img.shields.io/npm/v/@webmcpregistry/testing.svg)](https://www.npmjs.com/package/@webmcpregistry/testing)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Schema-driven test generation, contract testing, and mutation testing for WebMCP tools. Zero-config "tool exerciser" that auto-generates test cases from your tool definitions.

## Install

```bash
npm install @webmcpregistry/testing
```

## Quick Start

```ts
import { generateTestCases, runTestSuite } from '@webmcpregistry/testing'

// Auto-generate test cases from a tool's inputSchema
const cases = generateTestCases(myTool)
console.log(`Generated ${cases.length} test cases`)

// Run all tests against tool handlers
const summary = await runTestSuite([myTool])
console.log(`${summary.passed}/${summary.total} passed`)
```

## Test Case Generation

`generateTestCases` analyzes a tool's `inputSchema` and produces five categories of test cases:

| Category | What it tests |
|---|---|
| `valid` | All required fields, all fields, each enum value |
| `invalid` | Missing required fields, invalid enum values, empty input |
| `boundary` | `minLength`/`maxLength` at limits, `minimum`/`maximum` at limits, empty strings |
| `type-coercion` | Wrong types for each property (string where number expected, null, undefined, arrays, etc.) |
| `security` | SQL injection, XSS, command injection, path traversal, prompt injection, unicode overflow, extremely long strings |

```ts
import { generateTestCases, generateTestSuite } from '@webmcpregistry/testing'

// Single tool
const cases = generateTestCases(searchTool)

// Multiple tools at once
const allCases = generateTestSuite([searchTool, bookTool, cancelTool])
```

## Test Runner

Run generated test cases against tool handlers with configurable options.

```ts
import { runTestSuite } from '@webmcpregistry/testing'

const summary = await runTestSuite([myTool], {
  timeout: 3000,                          // Per-test timeout (default: 5000ms)
  categories: ['valid', 'security'],      // Filter by category
  failFast: true,                         // Stop on first failure
  onResult: (result) => {                 // Per-test callback
    const icon = result.passed ? 'PASS' : 'FAIL'
    console.log(`[${icon}] ${result.testCase.description}`)
  },
})

console.log(`Total: ${summary.total}`)
console.log(`Passed: ${summary.passed}`)
console.log(`Failed: ${summary.failed}`)
console.log(`Duration: ${summary.durationMs}ms`)

// Breakdown by category
for (const [category, stats] of Object.entries(summary.byCategory)) {
  console.log(`  ${category}: ${stats.passed}/${stats.total}`)
}
```

## Contract Testing

Capture tool definitions as snapshots and detect breaking changes between releases. Inspired by [Pact](https://pact.io/).

```ts
import { captureContract, diffContracts } from '@webmcpregistry/testing'

// Capture a baseline contract
const baseline = captureContract(currentTools, 'mysite.com')

// ... after changes ...
const updated = captureContract(newTools, 'mysite.com')

// Diff to find breaking changes
const diff = diffContracts(baseline, updated)

if (diff.isBreaking) {
  console.error('Breaking changes detected!')
  for (const change of diff.changed.filter(c => c.breaking)) {
    console.error(`  ${change.toolName}.${change.field}: ${change.before} -> ${change.after}`)
  }
}

console.log(`Added: ${diff.added.length} tools`)
console.log(`Removed: ${diff.removed.length} tools`)
console.log(`Changed: ${diff.changed.length} fields`)
```

Breaking changes detected by `diffContracts`:
- Removing a tool
- Changing `safetyLevel`
- Removing a required input property
- Adding a new required input property
- Changing a property's type

### Annotation Verification

Verify that tools behave as their annotations promise.

```ts
import { verifyAnnotations } from '@webmcpregistry/testing'

const results = await verifyAnnotations(myTools)
for (const r of results) {
  const icon = r.passed ? 'PASS' : 'FAIL'
  console.log(`[${icon}] ${r.toolName} @${r.annotation}: ${r.details}`)
}
```

Checks performed:
- **`idempotentHint`** -- calls the tool twice with the same input and verifies identical results.
- **`readOnlyHint`** -- verifies consistency with `safetyLevel`.

## Mutation Testing

Generate mutations of tool definitions and measure how well your test suite detects them. Inspired by [Stryker](https://stryker-mutator.io/).

```ts
import {
  generateMutations,
  generateAllMutations,
  calculateMutationScore,
} from '@webmcpregistry/testing'

// Generate mutations for a single tool
const mutations = generateMutations(myTool)

// Generate mutations for all tools
const allMutations = generateAllMutations(myTools)

// Calculate score after running your tests against each mutation
const score = calculateMutationScore(
  allMutations.length,  // total mutations
  detectedCount,        // mutations that caused test failures
)
console.log(`Mutation score: ${score}%`)
```

Mutation categories:

| Category | Examples |
|---|---|
| `schema` | Remove required fields, change property types, remove all properties, remove enum constraints, add new required fields |
| `safety` | Change `safetyLevel` between `read`/`write`/`danger` |
| `annotation` | Flip `readOnlyHint`, `idempotentHint`, `destructiveHint` |
| `description` | Empty description, name-only description, extremely long description |

## API Reference

### Test Generation

| Export | Description |
|---|---|
| `generateTestCases(tool)` | Generate all test cases for a single tool from its `inputSchema`. |
| `generateTestSuite(tools)` | Generate test cases for multiple tools. |

### Test Runner

| Export | Description |
|---|---|
| `runTestSuite(tools, options?)` | Run auto-generated test cases against tool handlers. Returns `TestRunSummary`. |

### Contract Testing

| Export | Description |
|---|---|
| `captureContract(tools, source)` | Capture a snapshot of tool definitions as a `ToolContract`. |
| `diffContracts(before, after)` | Diff two contracts to find breaking and non-breaking changes. Returns `ContractDiff`. |
| `verifyAnnotations(tools)` | Verify that tools behave as their annotations promise. |

### Mutation Testing

| Export | Description |
|---|---|
| `generateMutations(tool)` | Generate all possible mutations for a single tool definition. |
| `generateAllMutations(tools)` | Generate mutations for multiple tools. |
| `calculateMutationScore(total, killed)` | Calculate mutation score as a 0-100 percentage. |

### Key Types

| Type | Description |
|---|---|
| `ToolTestCase` | Generated test case: `toolName`, `description`, `category`, `input`, `shouldSucceed`. |
| `ToolTestResult` | Test result: `testCase`, `passed`, `error`, `response`, `durationMs`. |
| `TestRunSummary` | Run summary: `total`, `passed`, `failed`, `skipped`, `durationMs`, `byCategory`. |
| `ToolContract` | Contract snapshot: `source`, `capturedAt`, `tools`, `version`. |
| `ContractDiff` | Contract diff: `added`, `removed`, `changed`, `isBreaking`. |
| `Mutation` | A mutation: `tool` (mutated definition), `description`, `category`, `breaking`. |
| `RunnerOptions` | Runner config: `timeout`, `categories`, `failFast`, `onResult`. |

## License

Apache 2.0 -- [RAPHATECH OU](https://github.com/samuelvinay91/webmcpregistry)

Part of the [WebMCP Registry SDK](https://github.com/samuelvinay91/webmcpregistry) monorepo.
