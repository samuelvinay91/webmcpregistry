/**
 * Grade calculation for WebMCP readiness.
 */

import type { ToolDefinition, GradeResult, Grade, GradeBreakdown } from '@webmcpregistry/core'

interface GradeInput {
  hasManifest: boolean
  hasWebMCP: boolean
  securityScore: number
}

/**
 * Calculate overall WebMCP readiness grade.
 */
export function calculateGrade(
  tools: ToolDefinition[],
  input: GradeInput
): GradeResult {
  const deductions: Array<{ reason: string; points: number }> = []

  // Tool count: 2pts per tool, max 20
  const toolCount = Math.min(tools.length * 2, 20)

  // Description quality: average score * 2.5, max 25
  let descriptionQuality = 0
  if (tools.length > 0) {
    let totalDescScore = 0
    for (const tool of tools) {
      let score = 0
      if (tool.description) {
        score += 3 // Has description
        if (tool.description.length >= 20) score += 3 // Decent length
        if (tool.description.length >= 50) score += 2 // Good length
        if (/^[A-Z]/.test(tool.description)) score += 1 // Starts with capital
        if (tool.description.endsWith('.') || tool.description.length < 80) score += 1 // Proper ending
      }
      totalDescScore += score
    }
    descriptionQuality = Math.round((totalDescScore / tools.length) * 2.5)
  }

  // Schema completeness: max 20
  let schemaCompleteness = 0
  if (tools.length > 0) {
    let totalSchemaScore = 0
    for (const tool of tools) {
      let score = 0
      const schema = tool.inputSchema ?? { type: 'object', properties: {} }
      if (tool.inputSchema) {
        score += 3 // Has schema
        const props = Object.keys(schema.properties ?? {})
        if (props.length > 0) score += 3 // Has properties
        if (schema.required && schema.required.length > 0) score += 2 // Has required
        // Check if properties have descriptions
        const withDesc = Object.values(schema.properties ?? {}).filter(
          (p) => p.description
        ).length
        if (withDesc === props.length && props.length > 0) score += 2 // All props described
      }
      totalSchemaScore += score
    }
    schemaCompleteness = Math.round((totalSchemaScore / tools.length) * 2)
  }

  // Naming conventions: max 10
  let namingConventions = 0
  if (tools.length > 0) {
    let totalNamingScore = 0
    for (const tool of tools) {
      let score = 0
      if (/^[a-z][a-z0-9]*(_[a-z0-9]+)*$/.test(tool.name)) score += 5 // snake_case
      if (/^[a-z]+_[a-z]/.test(tool.name)) score += 3 // verb_noun
      if (tool.name.length >= 5 && tool.name.length <= 40) score += 2 // Good length
      totalNamingScore += score
    }
    namingConventions = Math.round(totalNamingScore / tools.length)
  }

  // Manifest: 10 points
  const manifestPresent = input.hasManifest ? 10 : 0
  if (!input.hasManifest) {
    deductions.push({ reason: 'Missing .well-known/webmcp manifest', points: -10 })
  }

  // Security: max 15
  const security = Math.round((input.securityScore / 100) * 15)

  // WebMCP detection bonus
  if (!input.hasWebMCP && tools.length === 0) {
    deductions.push({ reason: 'No WebMCP implementation detected', points: -20 })
  }

  const total = Math.max(
    0,
    Math.min(100, toolCount + descriptionQuality + schemaCompleteness + namingConventions + manifestPresent + security)
  )

  const grade: Grade =
    total >= 90 ? 'A' : total >= 75 ? 'B' : total >= 60 ? 'C' : total >= 40 ? 'D' : 'F'

  const breakdown: GradeBreakdown = {
    toolCount,
    descriptionQuality,
    schemaCompleteness,
    namingConventions,
    manifestPresent,
    security,
    total,
    deductions,
  }

  return { grade, score: total, breakdown }
}
