import { describe, it, expect, beforeEach } from 'vitest'
import { installPolyfill, getModelContext } from '@webmcpregistry/core'
import { runConformance } from '../runner.js'

describe('conformance suite against polyfill', () => {
  beforeEach(() => {
    // Reset navigator.modelContext between tests
    if (globalThis.navigator?.modelContext) {
      Object.defineProperty(globalThis.navigator, 'modelContext', {
        value: undefined,
        writable: true,
        configurable: true,
      })
    }
    installPolyfill()
  })

  it('runs the conformance suite and produces a report', async () => {
    const mc = getModelContext()!
    expect(mc).toBeDefined()

    const report = await runConformance(mc, '@webmcpregistry/core polyfill')

    expect(report.implementation).toBe('@webmcpregistry/core polyfill')
    expect(report.total).toBeGreaterThan(0)
    expect(report.results).toHaveLength(report.total)
    expect(report.passed + report.failed).toBe(report.total)
    expect(report.passRate).toBeGreaterThanOrEqual(0)
    expect(report.passRate).toBeLessThanOrEqual(100)
  })

  it('has a high pass rate for the polyfill', async () => {
    const mc = getModelContext()!
    const report = await runConformance(mc, '@webmcpregistry/core polyfill')

    // The polyfill should pass most tests. The empty-description test
    // might fail if the polyfill enforces it, or pass if it does.
    // We expect at least 80% pass rate.
    expect(report.passRate).toBeGreaterThanOrEqual(80)
  })

  it('produces per-section breakdown', async () => {
    const mc = getModelContext()!
    const report = await runConformance(mc, '@webmcpregistry/core polyfill')

    expect(report.bySection).toBeDefined()
    expect(Object.keys(report.bySection).length).toBeGreaterThan(0)

    for (const section of Object.values(report.bySection)) {
      expect(section.total).toBeGreaterThan(0)
      expect(section.passed + section.failed).toBe(section.total)
    }
  })

  it('each result has required fields', async () => {
    const mc = getModelContext()!
    const report = await runConformance(mc, '@webmcpregistry/core polyfill')

    for (const result of report.results) {
      expect(result.id).toBeTruthy()
      expect(result.section).toBeTruthy()
      expect(result.title).toBeTruthy()
      expect(result.description).toBeTruthy()
      expect(typeof result.passed).toBe('boolean')
      expect(result.specRef).toBeTruthy()
    }
  })

  it('supports filtering by section', async () => {
    const mc = getModelContext()!
    const report = await runConformance(mc, 'polyfill', { sections: ['4.1'] })

    expect(report.total).toBeGreaterThan(0)
    for (const result of report.results) {
      expect(result.section).toBe('4.1')
    }
  })

  it('supports filtering by scenario ID', async () => {
    const mc = getModelContext()!
    const report = await runConformance(mc, 'polyfill', { ids: ['mc-exists'] })

    expect(report.total).toBe(1)
    expect(report.results[0]!.id).toBe('mc-exists')
    expect(report.results[0]!.passed).toBe(true)
  })

  it('supports failFast option', async () => {
    const mc = getModelContext()!
    // Run with a scenario that will likely pass, just verify failFast doesn't error
    const report = await runConformance(mc, 'polyfill', { failFast: true })

    expect(report.total).toBeGreaterThan(0)
  })

  it('supports onResult callback', async () => {
    const mc = getModelContext()!
    const callbackResults: unknown[] = []
    const report = await runConformance(mc, 'polyfill', {
      onResult: (result) => callbackResults.push(result),
    })

    expect(callbackResults.length).toBe(report.total)
  })
})
