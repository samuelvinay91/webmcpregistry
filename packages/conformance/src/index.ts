/**
 * @webmcpregistry/conformance
 *
 * WebMCP W3C specification conformance test suite.
 *
 * Tests any navigator.modelContext implementation (native or polyfill)
 * against the W3C draft spec requirements.
 *
 * @example
 * ```ts
 * import { runConformance, formatReport } from '@webmcpregistry/conformance'
 * import { installPolyfill, getModelContext } from '@webmcpregistry/core'
 *
 * installPolyfill()
 * const mc = getModelContext()!
 * const report = await runConformance(mc, '@webmcpregistry/core polyfill v0.1.0')
 * console.log(formatReport(report))
 * // => 100% (12/12) passed
 * ```
 */

export { ALL_SCENARIOS } from './scenarios.js'
export type { Scenario, ScenarioResult } from './scenarios.js'

export { runConformance, formatReport } from './runner.js'
export type { ConformanceReport, RunnerOptions } from './runner.js'
