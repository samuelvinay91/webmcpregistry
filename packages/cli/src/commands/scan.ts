/**
 * `webmcp scan <url>` — Lightweight static scan (no browser).
 */

import { validateTools, runSecurityScan } from '@webmcpregistry/core'
import { createReport, type ReportData } from '../reporter.js'
import { calculateGrade } from '../grader.js'
import { extractToolsFromHTML, fetchPage, checkManifest } from '../scanner.js'

interface ScanOptions {
  output: string
}

export async function scanCommand(url: string, options: ScanOptions) {
  console.log(`\n  WebMCP Quick Scan: ${url}\n`)

  const html = await fetchPage(url)
  if (!html) {
    console.error('  Error: Could not fetch the URL')
    process.exit(1)
  }

  const { tools, detection } = extractToolsFromHTML(html, url)
  const hasManifest = await checkManifest(url)
  const validation = validateTools(tools)
  const security = runSecurityScan(tools)
  const grade = calculateGrade(tools, {
    hasManifest,
    hasWebMCP: detection.hasWebMCP,
    securityScore: security.score,
  })

  const report: ReportData = {
    url,
    domain: new URL(url).hostname,
    tools,
    detection,
    hasManifest,
    validation,
    security,
    grade,
    elapsed: 0,
  }

  console.log(createReport(report, options.output))
}
