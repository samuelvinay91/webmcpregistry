/**
 * @webmcpregistry/testing
 *
 * Schema-driven test generation, contract testing, and mutation testing for WebMCP tools.
 *
 * @example
 * ```ts
 * import { generateTestCases, runTestSuite, captureContract, diffContracts } from '@webmcpregistry/testing'
 *
 * // Auto-generate test cases from tool schemas
 * const cases = generateTestCases(myTool)
 * console.log(`Generated ${cases.length} test cases`)
 *
 * // Run all tests against tool handlers
 * const results = await runTestSuite([myTool])
 * console.log(`${results.passed}/${results.total} passed`)
 *
 * // Capture a contract snapshot
 * const contract = captureContract(tools, 'mysite.com')
 * // ... later, after changes:
 * const newContract = captureContract(newTools, 'mysite.com')
 * const diff = diffContracts(contract, newContract)
 * if (diff.isBreaking) console.error('Breaking change detected!')
 * ```
 */

// Test generation
export { generateTestCases, generateTestSuite } from './generator.js'

// Test runner
export { runTestSuite } from './runner.js'
export type { RunnerOptions, TestRunSummary } from './runner.js'

// Contract testing
export { captureContract, diffContracts, verifyAnnotations } from './contracts.js'

// Mutation testing
export {
  generateMutations,
  generateAllMutations,
  calculateMutationScore,
} from './mutations.js'
export type { Mutation } from './mutations.js'

// Re-export testing types from core
export type {
  ToolTestCase,
  ToolTestResult,
  ToolContract,
  ContractDiff,
} from '@webmcpregistry/core'
