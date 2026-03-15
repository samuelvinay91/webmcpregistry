/**
 * Test runner — executes generated test cases against tool handlers.
 *
 * The "Tool Exerciser": given tools with handlers, auto-runs all generated
 * test cases and reports pass/fail with timing.
 */

import type {
  ToolDefinition,
  ToolTestCase,
  ToolTestResult,
  ModelContextClient,
} from '@webmcpregistry/core'
import { generateTestCases } from './generator.js'

/** Options for the test runner. */
export interface RunnerOptions {
  /** Timeout per test case in ms (default: 5000). */
  timeout?: number
  /** Test categories to include (default: all). */
  categories?: ToolTestCase['category'][]
  /** Whether to stop on first failure (default: false). */
  failFast?: boolean
  /** Callback for each test result. */
  onResult?: (result: ToolTestResult) => void
}

/** Summary of a test run. */
export interface TestRunSummary {
  total: number
  passed: number
  failed: number
  skipped: number
  durationMs: number
  results: ToolTestResult[]
  byCategory: Record<string, { total: number; passed: number; failed: number }>
}

/**
 * Run all auto-generated test cases for a set of tools.
 */
export async function runTestSuite(
  tools: ToolDefinition[],
  options: RunnerOptions = {}
): Promise<TestRunSummary> {
  const timeout = options.timeout ?? 5000
  const categories = options.categories
  const startTime = Date.now()

  const allCases = tools.flatMap(generateTestCases)
  const filteredCases = categories
    ? allCases.filter((c) => categories.includes(c.category))
    : allCases

  const results: ToolTestResult[] = []
  const toolMap = new Map(tools.map((t) => [t.name, t]))

  for (const testCase of filteredCases) {
    const tool = toolMap.get(testCase.toolName)
    if (!tool) {
      results.push({
        testCase,
        passed: false,
        error: `Tool "${testCase.toolName}" not found`,
        durationMs: 0,
      })
      continue
    }

    const handler = tool.execute ?? tool.handler
    if (!handler) {
      results.push({
        testCase,
        passed: false,
        error: `Tool "${testCase.toolName}" has no execute/handler`,
        durationMs: 0,
      })
      continue
    }

    const result = await runSingleTest(testCase, handler, timeout)
    results.push(result)
    options.onResult?.(result)

    if (options.failFast && !result.passed) break
  }

  // Build summary
  const byCategory: Record<string, { total: number; passed: number; failed: number }> = {}
  for (const r of results) {
    const cat = r.testCase.category
    if (!byCategory[cat]) byCategory[cat] = { total: 0, passed: 0, failed: 0 }
    byCategory[cat]!.total++
    if (r.passed) byCategory[cat]!.passed++
    else byCategory[cat]!.failed++
  }

  return {
    total: results.length,
    passed: results.filter((r) => r.passed).length,
    failed: results.filter((r) => !r.passed).length,
    skipped: filteredCases.length - results.length,
    durationMs: Date.now() - startTime,
    results,
    byCategory,
  }
}

/**
 * Run a single test case against a handler.
 */
async function runSingleTest(
  testCase: ToolTestCase,
  handler: ToolDefinition['execute'] | ToolDefinition['handler'],
  timeout: number
): Promise<ToolTestResult> {
  const start = Date.now()

  // Create a mock ModelContextClient for spec-compliant execute callbacks
  const mockClient: ModelContextClient = {
    async requestUserInteraction(callback) {
      // In testing, auto-approve user interaction requests
      return callback()
    },
  }

  try {
    const result = await Promise.race([
      // Try with 2 args (execute callback) first, fall back to 1 arg (handler)
      (async () => {
        try {
          return await (handler as ToolDefinition['execute'])!(testCase.input, mockClient)
        } catch {
          return await (handler as ToolDefinition['handler'])!(testCase.input)
        }
      })(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after ${timeout}ms`)), timeout)
      ),
    ])

    const durationMs = Date.now() - start

    if (testCase.shouldSucceed) {
      // Expected success — test passes if no error thrown
      return { testCase, passed: true, response: result, durationMs }
    } else {
      // Expected failure — test fails if handler succeeded
      return {
        testCase,
        passed: false,
        error: 'Handler succeeded but should have rejected invalid input',
        response: result,
        durationMs,
      }
    }
  } catch (err) {
    const durationMs = Date.now() - start
    const errorMsg = err instanceof Error ? err.message : String(err)

    if (!testCase.shouldSucceed) {
      // Expected failure — test passes because handler correctly rejected input
      return { testCase, passed: true, error: errorMsg, durationMs }
    } else {
      // Expected success — test fails because handler threw unexpectedly
      return { testCase, passed: false, error: errorMsg, durationMs }
    }
  }
}
