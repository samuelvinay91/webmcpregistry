/**
 * Eval suite — define and run tool-calling evaluations.
 */

import type { ToolDefinition } from '@webmcpregistry/core'
import { scoreToolSelection, scoreArgumentMatch } from './scoring.js'

/** A single evaluation case. */
export interface EvalCase {
  /** Natural language task description (what the user/agent wants to do). */
  task: string
  /** The expected tool name the agent should select. */
  expectedTool: string
  /** Expected arguments the agent should provide (optional). */
  expectedArgs?: Record<string, unknown>
  /** Tags for filtering/grouping (e.g., 'search', 'mutation', 'edge-case'). */
  tags?: string[]
}

/** A complete eval suite. */
export interface EvalSuite {
  tools: ToolDefinition[]
  cases: EvalCase[]
}

/** Result of a single eval case. */
export interface EvalResult {
  case: EvalCase
  /** The tool that scored highest for this task. */
  selectedTool: string | null
  /** Confidence score (0-1) for the selection. */
  confidence: number
  /** Whether the correct tool was selected. */
  toolCorrect: boolean
  /** Whether the arguments match (if expectedArgs provided). */
  argsCorrect: boolean
  /** Detail scores. */
  scores: {
    nameMatch: number
    descriptionMatch: number
    schemaMatch: number
    safetyMatch: number
  }
}

/** Summary report of an eval run. */
export interface EvalReport {
  total: number
  /** % of cases where correct tool was selected (0-100). */
  selectionAccuracy: number
  /** % of cases where arguments were correct (0-100). */
  argumentAccuracy: number
  /** Average confidence across all selections. */
  avgConfidence: number
  /** Results per case. */
  results: EvalResult[]
  /** Accuracy per tag. */
  byTag: Record<string, { total: number; correct: number; accuracy: number }>
  /** Tools that were never the correct answer (possibly unnecessary). */
  unusedTools: string[]
  /** Tools that were frequently mis-selected (confusing definitions). */
  confusedTools: Array<{ expected: string; selected: string; count: number }>
}

/**
 * Create an eval suite from tools and test cases.
 */
export function createEvalSuite(
  tools: ToolDefinition[],
  cases: EvalCase[]
): EvalSuite {
  return { tools, cases }
}

/**
 * Run the eval suite using deterministic keyword matching.
 * No LLM required — scores tools by how well their name/description/schema
 * match the natural language task.
 */
export function runEvalSuite(suite: EvalSuite): EvalReport {
  const results: EvalResult[] = []
  const confusionMap = new Map<string, number>()

  for (const evalCase of suite.cases) {
    // Score each tool against this task
    const scores = suite.tools.map((tool) => ({
      tool,
      score: scoreToolSelection(evalCase.task, tool),
    }))

    // Select the highest-scoring tool
    scores.sort((a, b) => b.score.total - a.score.total)
    const best = scores[0]
    const selectedTool = best ? best.tool.name : null
    const confidence = best ? best.score.total : 0

    const toolCorrect = selectedTool === evalCase.expectedTool

    // Check args if provided
    let argsCorrect = true
    if (evalCase.expectedArgs && best) {
      argsCorrect = scoreArgumentMatch(evalCase.expectedArgs, best.tool.inputSchema ?? { type: 'object', properties: {} })
    }

    // Track confusion
    if (!toolCorrect && selectedTool) {
      const key = `${evalCase.expectedTool}->${selectedTool}`
      confusionMap.set(key, (confusionMap.get(key) ?? 0) + 1)
    }

    results.push({
      case: evalCase,
      selectedTool,
      confidence,
      toolCorrect,
      argsCorrect,
      scores: best?.score ?? { nameMatch: 0, descriptionMatch: 0, schemaMatch: 0, safetyMatch: 0 },
    })
  }

  // Build report
  const correctSelections = results.filter((r) => r.toolCorrect).length
  const correctArgs = results.filter((r) => r.argsCorrect).length

  // Per-tag accuracy
  const byTag: EvalReport['byTag'] = {}
  for (const r of results) {
    for (const tag of r.case.tags ?? ['untagged']) {
      if (!byTag[tag]) byTag[tag] = { total: 0, correct: 0, accuracy: 0 }
      byTag[tag]!.total++
      if (r.toolCorrect) byTag[tag]!.correct++
    }
  }
  for (const stats of Object.values(byTag)) {
    stats.accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
  }

  // Find unused tools
  const expectedTools = new Set(suite.cases.map((c) => c.expectedTool))
  const unusedTools = suite.tools
    .filter((t) => !expectedTools.has(t.name))
    .map((t) => t.name)

  // Build confusion list
  const confusedTools = Array.from(confusionMap.entries())
    .map(([key, count]) => {
      const [expected, selected] = key.split('->')
      return { expected: expected!, selected: selected!, count }
    })
    .sort((a, b) => b.count - a.count)

  return {
    total: results.length,
    selectionAccuracy: results.length > 0 ? Math.round((correctSelections / results.length) * 100) : 0,
    argumentAccuracy: results.length > 0 ? Math.round((correctArgs / results.length) * 100) : 0,
    avgConfidence: results.length > 0
      ? Math.round((results.reduce((s, r) => s + r.confidence, 0) / results.length) * 100) / 100
      : 0,
    results,
    byTag,
    unusedTools,
    confusedTools,
  }
}
