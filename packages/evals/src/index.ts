/**
 * @webmcpregistry/evals
 *
 * Evaluate AI agent tool-calling accuracy against WebMCP tool definitions.
 *
 * Given a set of tool definitions and natural-language task descriptions,
 * measures whether an AI agent:
 * 1. Selects the correct tool (tool selection accuracy)
 * 2. Provides valid arguments matching the inputSchema (argument accuracy)
 * 3. Respects safety levels (safety compliance)
 *
 * Works without an LLM — uses deterministic matching to grade
 * how "obvious" your tool definitions are to an agent.
 *
 * @example
 * ```ts
 * import { createEvalSuite, runEvalSuite } from '@webmcpregistry/evals'
 *
 * const suite = createEvalSuite(myTools, [
 *   { task: 'Find flights to Tokyo under $500', expectedTool: 'search_flights' },
 *   { task: 'Book the cheapest option', expectedTool: 'book_flight' },
 *   { task: 'Cancel my reservation', expectedTool: 'cancel_booking' },
 * ])
 *
 * const report = runEvalSuite(suite)
 * console.log(`Tool selection accuracy: ${report.selectionAccuracy}%`)
 * ```
 */

export { createEvalSuite, runEvalSuite } from './suite.js'
export type { EvalCase, EvalSuite, EvalResult, EvalReport } from './suite.js'
export { scoreToolSelection, scoreArgumentMatch } from './scoring.js'
