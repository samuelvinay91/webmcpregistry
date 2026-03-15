/**
 * Tool definition validator.
 *
 * Validates tool definitions against WebMCP best practices:
 * naming conventions, description quality, schema completeness,
 * and safety classification.
 */

import type {
  ToolDefinition,
  ValidationIssue,
  ValidationResult,
  ToolInputSchema,
} from './types.js'

/**
 * Validate an array of tool definitions and return a quality score.
 */
export function validateTools(tools: ToolDefinition[]): ValidationResult {
  const issues: ValidationIssue[] = []

  if (tools.length === 0) {
    issues.push({
      severity: 'warning',
      code: 'NO_TOOLS',
      message: 'No tools found to validate',
    })
    return { valid: true, issues, score: 0 }
  }

  for (const tool of tools) {
    issues.push(...validateToolName(tool))
    issues.push(...validateToolDescription(tool))
    issues.push(...validateToolSchema(tool))
    issues.push(...validateToolSafety(tool))
  }

  const hasErrors = issues.some((i) => i.severity === 'error')
  const score = calculateValidationScore(tools, issues)

  return { valid: !hasErrors, issues, score }
}

/**
 * Validate a single tool definition.
 */
export function validateTool(tool: ToolDefinition): ValidationIssue[] {
  return [
    ...validateToolName(tool),
    ...validateToolDescription(tool),
    ...validateToolSchema(tool),
    ...validateToolSafety(tool),
  ]
}

// ---------------------------------------------------------------------------
// Name validation
// ---------------------------------------------------------------------------

const SNAKE_CASE_PATTERN = /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/
const VERB_NOUN_PATTERN = /^[a-z]+_[a-z]/

function validateToolName(tool: ToolDefinition): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const { name } = tool

  if (!name) {
    issues.push({
      severity: 'error',
      code: 'NAME_MISSING',
      message: 'Tool name is required',
      toolName: name,
      field: 'name',
    })
    return issues
  }

  if (name.length < 3) {
    issues.push({
      severity: 'error',
      code: 'NAME_TOO_SHORT',
      message: `Tool name "${name}" is too short (min 3 chars)`,
      toolName: name,
      field: 'name',
    })
  }

  if (name.length > 64) {
    issues.push({
      severity: 'error',
      code: 'NAME_TOO_LONG',
      message: `Tool name "${name}" is too long (max 64 chars)`,
      toolName: name,
      field: 'name',
    })
  }

  if (!SNAKE_CASE_PATTERN.test(name)) {
    issues.push({
      severity: 'warning',
      code: 'NAME_NOT_SNAKE_CASE',
      message: `Tool name "${name}" should use snake_case format`,
      toolName: name,
      field: 'name',
    })
  }

  if (!VERB_NOUN_PATTERN.test(name)) {
    issues.push({
      severity: 'info',
      code: 'NAME_NOT_VERB_NOUN',
      message: `Tool name "${name}" should follow verb_noun pattern (e.g., search_products)`,
      toolName: name,
      field: 'name',
    })
  }

  return issues
}

// ---------------------------------------------------------------------------
// Description validation
// ---------------------------------------------------------------------------

function validateToolDescription(tool: ToolDefinition): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const { description, name } = tool

  if (!description) {
    issues.push({
      severity: 'error',
      code: 'DESC_MISSING',
      message: `Tool "${name}" is missing a description`,
      toolName: name,
      field: 'description',
    })
    return issues
  }

  if (description.length < 10) {
    issues.push({
      severity: 'warning',
      code: 'DESC_TOO_SHORT',
      message: `Tool "${name}" has a very short description (${description.length} chars). Aim for 20+ chars.`,
      toolName: name,
      field: 'description',
    })
  }

  if (description.length > 500) {
    issues.push({
      severity: 'warning',
      code: 'DESC_TOO_LONG',
      message: `Tool "${name}" description is very long (${description.length} chars). Keep under 200 chars.`,
      toolName: name,
      field: 'description',
    })
  }

  // Check if description just repeats the tool name
  const nameWords = name.replace(/_/g, ' ').toLowerCase()
  if (description.toLowerCase() === nameWords) {
    issues.push({
      severity: 'warning',
      code: 'DESC_REPEATS_NAME',
      message: `Tool "${name}" description just repeats the tool name. Add more context.`,
      toolName: name,
      field: 'description',
    })
  }

  return issues
}

// ---------------------------------------------------------------------------
// Schema validation
// ---------------------------------------------------------------------------

function validateToolSchema(tool: ToolDefinition): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const { inputSchema, name } = tool

  if (!inputSchema) {
    issues.push({
      severity: 'error',
      code: 'SCHEMA_MISSING',
      message: `Tool "${name}" is missing an inputSchema`,
      toolName: name,
      field: 'inputSchema',
    })
    return issues
  }

  if (inputSchema.type !== 'object') {
    issues.push({
      severity: 'error',
      code: 'SCHEMA_NOT_OBJECT',
      message: `Tool "${name}" inputSchema.type must be "object"`,
      toolName: name,
      field: 'inputSchema',
    })
  }

  const properties = inputSchema.properties ?? {}
  const propertyNames = Object.keys(properties)

  // Check that required fields exist in properties
  if (inputSchema.required) {
    for (const req of inputSchema.required) {
      if (!properties[req]) {
        issues.push({
          severity: 'error',
          code: 'SCHEMA_REQUIRED_MISSING',
          message: `Tool "${name}" requires field "${req}" but it's not in properties`,
          toolName: name,
          field: `inputSchema.required`,
        })
      }
    }
  }

  // Check that properties have descriptions
  for (const [propName, prop] of Object.entries(properties)) {
    if (!prop.description) {
      issues.push({
        severity: 'info',
        code: 'SCHEMA_PROP_NO_DESC',
        message: `Tool "${name}" property "${propName}" has no description`,
        toolName: name,
        field: `inputSchema.properties.${propName}`,
      })
    }
  }

  // Warn if no properties at all (might be valid for zero-arg tools)
  if (propertyNames.length === 0) {
    issues.push({
      severity: 'info',
      code: 'SCHEMA_NO_PROPS',
      message: `Tool "${name}" has no input properties. Is this a zero-argument tool?`,
      toolName: name,
      field: 'inputSchema',
    })
  }

  return issues
}

// ---------------------------------------------------------------------------
// Safety validation
// ---------------------------------------------------------------------------

const DANGER_KEYWORDS = ['delete', 'remove', 'destroy', 'purchase', 'pay', 'checkout', 'transfer', 'drop', 'cancel']
const WRITE_KEYWORDS = ['add', 'create', 'update', 'edit', 'save', 'submit', 'post', 'send', 'upload', 'set', 'modify']
const READ_KEYWORDS = ['get', 'search', 'list', 'find', 'query', 'fetch', 'read', 'view', 'show', 'check']

function validateToolSafety(tool: ToolDefinition): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const { name, safetyLevel } = tool

  if (!safetyLevel) {
    issues.push({
      severity: 'warning',
      code: 'SAFETY_MISSING',
      message: `Tool "${name}" has no safety level. Defaulting to "read".`,
      toolName: name,
      field: 'safetyLevel',
    })
    return issues
  }

  const nameLower = name.toLowerCase()

  // Check for misclassified danger tools
  if (DANGER_KEYWORDS.some((k) => nameLower.includes(k)) && safetyLevel !== 'danger') {
    issues.push({
      severity: 'warning',
      code: 'SAFETY_SHOULD_BE_DANGER',
      message: `Tool "${name}" appears destructive but is classified as "${safetyLevel}". Consider "danger".`,
      toolName: name,
      field: 'safetyLevel',
    })
  }

  // Check for misclassified write tools
  if (
    WRITE_KEYWORDS.some((k) => nameLower.startsWith(k)) &&
    safetyLevel === 'read' &&
    !DANGER_KEYWORDS.some((k) => nameLower.includes(k))
  ) {
    issues.push({
      severity: 'info',
      code: 'SAFETY_SHOULD_BE_WRITE',
      message: `Tool "${name}" appears to modify data but is classified as "read". Consider "write".`,
      toolName: name,
      field: 'safetyLevel',
    })
  }

  return issues
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

function calculateValidationScore(tools: ToolDefinition[], issues: ValidationIssue[]): number {
  if (tools.length === 0) return 0

  const maxScore = 100
  let score = maxScore

  for (const issue of issues) {
    switch (issue.severity) {
      case 'error':
        score -= 15
        break
      case 'warning':
        score -= 5
        break
      case 'info':
        score -= 1
        break
    }
  }

  return Math.max(0, Math.min(100, score))
}
