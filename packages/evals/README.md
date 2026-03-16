# @webmcpregistry/evals

[![npm version](https://img.shields.io/npm/v/@webmcpregistry/evals.svg)](https://www.npmjs.com/package/@webmcpregistry/evals)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Evaluate AI agent tool-calling accuracy against WebMCP tool definitions. Measures whether your tool names, descriptions, and schemas are clear enough for an AI agent to select and invoke correctly -- without requiring an LLM.

## Install

```bash
npm install @webmcpregistry/evals
```

## Quick Start

```ts
import { createEvalSuite, runEvalSuite } from '@webmcpregistry/evals'

const suite = createEvalSuite(myTools, [
  { task: 'Find flights to Tokyo under $500', expectedTool: 'search_flights' },
  { task: 'Book the cheapest option', expectedTool: 'book_flight' },
  { task: 'Cancel my reservation', expectedTool: 'cancel_booking' },
])

const report = runEvalSuite(suite)
console.log(`Tool selection accuracy: ${report.selectionAccuracy}%`)
console.log(`Argument accuracy: ${report.argumentAccuracy}%`)
console.log(`Average confidence: ${report.avgConfidence}`)
```

## How It Works

The eval engine uses deterministic keyword matching to score each tool against each natural-language task. No LLM is needed -- it grades how "obvious" your tool definitions are to an agent by analyzing four dimensions:

| Dimension | Weight | What it measures |
|---|---|---|
| Name match | 30% | Task keywords appearing in the tool name (`search_flights` matches "find flights") |
| Description match | 40% | Task keywords appearing in the tool description |
| Schema match | 20% | Task keywords matching property names and descriptions in `inputSchema` |
| Safety match | 10% | Task intent aligning with `safetyLevel` ("delete" tasks should match `danger` tools) |

The scoring uses fuzzy matching with stemming (e.g., "flights" matches "flight", "searching" matches "search") and filters stop words.

## Defining Eval Cases

```ts
import type { EvalCase } from '@webmcpregistry/evals'

const cases: EvalCase[] = [
  {
    task: 'Search for running shoes size 10',
    expectedTool: 'search_products',
    expectedArgs: { query: 'running shoes', size: '10' },  // optional
    tags: ['search', 'products'],                           // optional, for grouping
  },
  {
    task: 'Delete my account and all data',
    expectedTool: 'delete_account',
    tags: ['danger', 'account'],
  },
]
```

## Reading the Report

```ts
const report = runEvalSuite(suite)

// Overall accuracy
console.log(`Selection: ${report.selectionAccuracy}%`)
console.log(`Arguments: ${report.argumentAccuracy}%`)
console.log(`Confidence: ${report.avgConfidence}`)

// Per-tag breakdown
for (const [tag, stats] of Object.entries(report.byTag)) {
  console.log(`  ${tag}: ${stats.accuracy}% (${stats.correct}/${stats.total})`)
}

// Tools that were never the correct answer (possibly unnecessary)
if (report.unusedTools.length > 0) {
  console.log(`Unused tools: ${report.unusedTools.join(', ')}`)
}

// Commonly confused tool pairs (improve their definitions)
for (const c of report.confusedTools) {
  console.log(`  Expected "${c.expected}" but selected "${c.selected}" (${c.count}x)`)
}

// Individual results
for (const r of report.results) {
  const icon = r.toolCorrect ? 'PASS' : 'FAIL'
  console.log(`[${icon}] "${r.case.task}" -> ${r.selectedTool} (confidence: ${r.confidence})`)
}
```

## Scoring Functions

Use the scoring functions directly for custom evaluation pipelines.

```ts
import { scoreToolSelection, scoreArgumentMatch } from '@webmcpregistry/evals'

// Score a tool against a task (returns 0-1 total with breakdown)
const score = scoreToolSelection('Find cheap flights to Tokyo', myTool)
console.log(`Total: ${score.total}`)
console.log(`Name: ${score.nameMatch}, Desc: ${score.descriptionMatch}`)
console.log(`Schema: ${score.schemaMatch}, Safety: ${score.safetyMatch}`)

// Check if expected arguments are compatible with a tool's schema
const argsOk = scoreArgumentMatch(
  { query: 'tokyo', max_price: 500 },
  myTool.inputSchema,
)
```

## API Reference

### Suite

| Export | Description |
|---|---|
| `createEvalSuite(tools, cases)` | Create an eval suite from tool definitions and test cases. |
| `runEvalSuite(suite)` | Run the suite using deterministic keyword matching. Returns `EvalReport`. |

### Scoring

| Export | Description |
|---|---|
| `scoreToolSelection(task, tool)` | Score how well a tool matches a task description. Returns `SelectionScore` with `total` (0-1) and per-dimension breakdown. |
| `scoreArgumentMatch(expectedArgs, schema)` | Check if all expected argument keys exist in the schema. Returns `boolean`. |

### Key Types

| Type | Description |
|---|---|
| `EvalCase` | `{ task, expectedTool, expectedArgs?, tags? }` |
| `EvalSuite` | `{ tools, cases }` |
| `EvalResult` | `{ case, selectedTool, confidence, toolCorrect, argsCorrect, scores }` |
| `EvalReport` | `{ total, selectionAccuracy, argumentAccuracy, avgConfidence, results, byTag, unusedTools, confusedTools }` |

## License

Apache 2.0 -- [RAPHATECH OU](https://github.com/samuelvinay91/webmcpregistry)

Part of the [WebMCP Registry SDK](https://github.com/samuelvinay91/webmcpregistry) monorepo.
