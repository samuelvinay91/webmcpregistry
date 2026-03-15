/**
 * Conformance test runner.
 *
 * Runs all scenarios against a ModelContext implementation and produces
 * a structured report compatible with W3C test result formats.
 */

import type { ModelContextAPI } from '@webmcpregistry/core'
import { ALL_SCENARIOS, type Scenario, type ScenarioResult } from './scenarios.js'

/** Summary of a conformance run. */
export interface ConformanceReport {
  /** Implementation name (e.g., "Chrome 146", "@webmcpregistry/core polyfill"). */
  implementation: string
  /** When the run completed. */
  timestamp: number
  /** Total scenarios executed. */
  total: number
  /** Number passed. */
  passed: number
  /** Number failed. */
  failed: number
  /** Pass rate as percentage. */
  passRate: number
  /** Results per scenario. */
  results: ScenarioResult[]
  /** Results grouped by spec section. */
  bySection: Record<string, { total: number; passed: number; failed: number }>
}

export interface RunnerOptions {
  /** Only run scenarios from these sections. */
  sections?: string[]
  /** Only run scenarios matching these IDs. */
  ids?: string[]
  /** Stop on first failure. */
  failFast?: boolean
  /** Callback per result. */
  onResult?: (result: ScenarioResult) => void
}

/**
 * Run the conformance test suite against a ModelContext implementation.
 */
export async function runConformance(
  mc: ModelContextAPI,
  implementation: string,
  options: RunnerOptions = {}
): Promise<ConformanceReport> {
  let scenarios = ALL_SCENARIOS

  if (options.sections) {
    scenarios = scenarios.filter((s) => options.sections!.includes(s.section))
  }
  if (options.ids) {
    scenarios = scenarios.filter((s) => options.ids!.includes(s.id))
  }

  const results: ScenarioResult[] = []

  for (const scenario of scenarios) {
    const result = await runScenario(mc, scenario)
    results.push(result)
    options.onResult?.(result)

    if (options.failFast && !result.passed) break
  }

  // Build section summary
  const bySection: Record<string, { total: number; passed: number; failed: number }> = {}
  for (const r of results) {
    if (!bySection[r.section]) {
      bySection[r.section] = { total: 0, passed: 0, failed: 0 }
    }
    bySection[r.section]!.total++
    if (r.passed) bySection[r.section]!.passed++
    else bySection[r.section]!.failed++
  }

  const passed = results.filter((r) => r.passed).length

  return {
    implementation,
    timestamp: Date.now(),
    total: results.length,
    passed,
    failed: results.length - passed,
    passRate: results.length > 0 ? Math.round((passed / results.length) * 100) : 0,
    results,
    bySection,
  }
}

async function runScenario(mc: ModelContextAPI, scenario: Scenario): Promise<ScenarioResult> {
  try {
    await scenario.run(mc)
    return {
      id: scenario.id,
      section: scenario.section,
      title: scenario.title,
      description: scenario.description,
      passed: true,
      specRef: scenario.specRef,
    }
  } catch (err) {
    return {
      id: scenario.id,
      section: scenario.section,
      title: scenario.title,
      description: scenario.description,
      passed: false,
      error: err instanceof Error ? err.message : String(err),
      specRef: scenario.specRef,
    }
  }
}

/**
 * Format a conformance report as a human-readable string.
 */
export function formatReport(report: ConformanceReport): string {
  const lines: string[] = []

  lines.push('╔══════════════════════════════════════════════╗')
  lines.push(`║  WebMCP Conformance Report                   ║`)
  lines.push('╚══════════════════════════════════════════════╝')
  lines.push('')
  lines.push(`  Implementation: ${report.implementation}`)
  lines.push(`  Pass rate:      ${report.passRate}% (${report.passed}/${report.total})`)
  lines.push('')

  // By section
  lines.push('  By Section')
  lines.push('  ──────────────────────────────────')
  for (const [section, stats] of Object.entries(report.bySection)) {
    const icon = stats.failed === 0 ? '✓' : '✗'
    lines.push(`  ${icon} §${section}: ${stats.passed}/${stats.total} passed`)
  }
  lines.push('')

  // Individual results
  lines.push('  Results')
  lines.push('  ──────────────────────────────────')
  for (const r of report.results) {
    const icon = r.passed ? '✓' : '✗'
    lines.push(`  ${icon} [${r.id}] ${r.title}`)
    if (!r.passed && r.error) {
      lines.push(`    Error: ${r.error}`)
    }
  }
  lines.push('')

  return lines.join('\n')
}
