/**
 * Report formatting for CLI output.
 */

import type {
  ToolDefinition,
  ValidationResult,
  SecurityReport,
  GradeResult,
} from '@webmcpregistry/core'
import type { DetectionInfo } from './scanner.js'

export interface ReportData {
  url: string
  domain: string
  tools: ToolDefinition[]
  detection: DetectionInfo
  hasManifest: boolean
  validation: ValidationResult
  security: SecurityReport
  grade: GradeResult
  elapsed: number
}

/**
 * Create a formatted report string.
 */
export function createReport(data: ReportData, format: string): string {
  if (format === 'json') {
    return JSON.stringify(data, null, 2)
  }

  return createTerminalReport(data)
}

function createTerminalReport(data: ReportData): string {
  const { grade, tools, detection, hasManifest, security, validation } = data
  const lines: string[] = []

  // Grade header
  const gradeColor = getGradeIndicator(grade.grade)
  lines.push(`  ╔══════════════════════════════════════╗`)
  lines.push(`  ║  WebMCP Readiness: ${gradeColor} Grade ${grade.grade}  (${grade.score}/100)  ║`)
  lines.push(`  ╚══════════════════════════════════════╝`)
  lines.push('')

  // Detection summary
  lines.push('  Detection')
  lines.push('  ─────────────────────────────────────')
  lines.push(`  WebMCP API:      ${detection.hasWebMCP ? '✓ Detected' : '✗ Not detected'}`)
  lines.push(`  Native API:      ${detection.hasNativeAPI ? '✓ Yes' : '✗ No (polyfill or none)'}`)
  lines.push(`  Polyfill:        ${detection.hasPolyfill ? '✓ Found' : '○ Not found'}`)
  lines.push(`  Declarative:     ${detection.hasDeclarative ? '✓ Found' : '○ Not found'}`)
  lines.push(`  Manifest:        ${hasManifest ? '✓ Present' : '✗ Missing'}`)
  lines.push(`  Tools found:     ${tools.length}`)
  lines.push('')

  // Grade breakdown
  lines.push('  Score Breakdown')
  lines.push('  ─────────────────────────────────────')
  lines.push(`  Tool count:      ${bar(grade.breakdown.toolCount, 20)} ${grade.breakdown.toolCount}/20`)
  lines.push(`  Descriptions:    ${bar(grade.breakdown.descriptionQuality, 25)} ${grade.breakdown.descriptionQuality}/25`)
  lines.push(`  Schema:          ${bar(grade.breakdown.schemaCompleteness, 20)} ${grade.breakdown.schemaCompleteness}/20`)
  lines.push(`  Naming:          ${bar(grade.breakdown.namingConventions, 10)} ${grade.breakdown.namingConventions}/10`)
  lines.push(`  Manifest:        ${bar(grade.breakdown.manifestPresent, 10)} ${grade.breakdown.manifestPresent}/10`)
  lines.push(`  Security:        ${bar(grade.breakdown.security, 15)} ${grade.breakdown.security}/15`)
  lines.push('')

  // Tools
  if (tools.length > 0) {
    lines.push('  Tools')
    lines.push('  ─────────────────────────────────────')
    for (const tool of tools) {
      const safetyTag = tool.safetyLevel === 'danger' ? '[DANGER]' : tool.safetyLevel === 'write' ? '[WRITE]' : '[READ]'
      lines.push(`  ${safetyTag} ${tool.name}`)
      lines.push(`    ${tool.description}`)
    }
    lines.push('')
  }

  // Security
  const secStatus = security.status === 'PASS' ? '✓ PASS' : security.status === 'WARN' ? '⚠ WARN' : '✗ FAIL'
  lines.push(`  Security: ${secStatus}`)
  lines.push('  ─────────────────────────────────────')
  if (security.findings.length === 0) {
    lines.push('  No security issues found.')
  } else {
    for (const finding of security.findings) {
      const icon = finding.severity === 'critical' ? '!!!' : finding.severity === 'high' ? '!!' : finding.severity === 'medium' ? '!' : '.'
      lines.push(`  [${icon}] ${finding.description}`)
    }
  }
  lines.push('')

  // Validation issues
  if (validation.issues.length > 0) {
    lines.push('  Validation Issues')
    lines.push('  ─────────────────────────────────────')
    for (const issue of validation.issues) {
      const icon = issue.severity === 'error' ? 'ERR' : issue.severity === 'warning' ? 'WRN' : 'INF'
      lines.push(`  [${icon}] ${issue.message}`)
    }
    lines.push('')
  }

  // Deductions
  if (grade.breakdown.deductions.length > 0) {
    lines.push('  Deductions')
    lines.push('  ─────────────────────────────────────')
    for (const d of grade.breakdown.deductions) {
      lines.push(`  ${d.points}pts: ${d.reason}`)
    }
    lines.push('')
  }

  if (data.elapsed > 0) {
    lines.push(`  Completed in ${(data.elapsed / 1000).toFixed(1)}s`)
  }
  lines.push('')

  return lines.join('\n')
}

function bar(value: number, max: number): string {
  const width = 20
  const filled = Math.round((value / max) * width)
  const empty = width - filled
  return '█'.repeat(filled) + '░'.repeat(empty)
}

function getGradeIndicator(grade: string): string {
  switch (grade) {
    case 'A': return '●'
    case 'B': return '●'
    case 'C': return '●'
    case 'D': return '●'
    default: return '●'
  }
}
