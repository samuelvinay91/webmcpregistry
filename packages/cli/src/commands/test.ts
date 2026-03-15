/**
 * `webmcp test <url>` — Full browser-based WebMCP readiness test.
 *
 * Uses fetch to retrieve the page, then runs validation and security checks.
 * In future, will use Playwright for full JS-executed testing.
 */

import { validateTools, runSecurityScan, type ToolDefinition } from '@webmcpregistry/core'
import { createReport, type ReportData } from '../reporter.js'
import { calculateGrade } from '../grader.js'
import { extractToolsFromHTML, fetchPage, checkManifest } from '../scanner.js'

interface TestOptions {
  output: string
  security: boolean
  color: boolean
}

export async function testCommand(url: string, options: TestOptions) {
  const startTime = Date.now()

  console.log(`\n  WebMCP Readiness Test`)
  console.log(`  ${url}\n`)

  // Step 1: Fetch the page
  console.log('  [1/5] Fetching page...')
  const html = await fetchPage(url)
  if (!html) {
    console.error('  Error: Could not fetch the URL')
    process.exit(1)
  }

  // Step 2: Detect WebMCP signals
  console.log('  [2/5] Detecting WebMCP tools...')
  const { tools, detection } = extractToolsFromHTML(html, url)

  // Step 3: Check manifest
  console.log('  [3/5] Checking .well-known/webmcp...')
  const hasManifest = await checkManifest(url)

  // Step 4: Validate
  console.log('  [4/5] Validating tool definitions...')
  const validation = validateTools(tools)

  // Step 5: Security scan
  let security = { status: 'PASS' as const, findings: [] as never[], score: 100 }
  if (options.security !== false) {
    console.log('  [5/5] Running security checks...')
    security = runSecurityScan(tools)
  } else {
    console.log('  [5/5] Security checks skipped')
  }

  // Calculate grade
  const grade = calculateGrade(tools, {
    hasManifest,
    hasWebMCP: detection.hasWebMCP,
    securityScore: security.score,
  })

  const elapsed = Date.now() - startTime
  const report: ReportData = {
    url,
    domain: new URL(url).hostname,
    tools,
    detection,
    hasManifest,
    validation,
    security,
    grade,
    elapsed,
  }

  console.log('')
  console.log(createReport(report, options.output))
}
