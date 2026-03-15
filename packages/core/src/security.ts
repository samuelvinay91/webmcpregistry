/**
 * Security scanner for WebMCP tool definitions.
 *
 * Checks for common security issues:
 * - Prompt injection patterns in tool descriptions
 * - Deceptive tool naming (impersonating system/admin tools)
 * - Unrestricted string inputs (potential data exfiltration)
 * - Unclassified destructive actions
 * - Cross-origin tool registration concerns
 */

import type { ToolDefinition, SecurityFinding, SecurityReport } from './types.js'

/**
 * Run security checks against a set of tool definitions.
 */
export function runSecurityScan(tools: ToolDefinition[]): SecurityReport {
  const findings: SecurityFinding[] = []

  for (const tool of tools) {
    findings.push(...checkDeceptiveNaming(tool))
    findings.push(...checkPromptInjection(tool))
    findings.push(...checkUnrestrictedInputs(tool))
    findings.push(...checkUnclassifiedDanger(tool))
    findings.push(...checkSuspiciousDescriptions(tool))
  }

  const critical = findings.filter((f) => f.severity === 'critical').length
  const high = findings.filter((f) => f.severity === 'high').length
  const medium = findings.filter((f) => f.severity === 'medium').length

  const status =
    critical > 0 || high > 0 ? 'FAIL' : medium > 0 ? 'WARN' : 'PASS'

  // Score: start at 100, deduct per finding
  const deduction =
    critical * 25 + high * 15 + medium * 8 + (findings.length - critical - high - medium) * 3
  const score = Math.max(0, 100 - deduction)

  return { status, findings, score }
}

// ---------------------------------------------------------------------------
// Deceptive naming
// ---------------------------------------------------------------------------

const PRIVILEGED_PREFIXES = [
  'system', 'admin', 'root', 'sudo', 'internal', 'kernel',
  'os', 'shell', 'exec', 'eval', 'browser', 'chrome', 'navigator',
]

function checkDeceptiveNaming(tool: ToolDefinition): SecurityFinding[] {
  const findings: SecurityFinding[] = []
  const nameLower = tool.name.toLowerCase()

  for (const prefix of PRIVILEGED_PREFIXES) {
    if (nameLower.startsWith(`${prefix}_`) || nameLower === prefix) {
      findings.push({
        severity: 'high',
        type: 'deceptive_naming',
        description: `Tool "${tool.name}" uses privileged-sounding prefix "${prefix}". This could mislead AI agents into trusting it with elevated permissions.`,
        toolName: tool.name,
      })
      break
    }
  }

  return findings
}

// ---------------------------------------------------------------------------
// Prompt injection
// ---------------------------------------------------------------------------

const INJECTION_PATTERNS = [
  /ignore\s+(previous|all|above)\s+(instructions?|rules?|prompts?)/i,
  /you\s+are\s+(now|a)\s/i,
  /disregard\s+(your|the|all)\s/i,
  /forget\s+(everything|your|all)\s/i,
  /new\s+instructions?:/i,
  /system\s*prompt/i,
  /\bdo\s+not\s+follow\b/i,
  /\boverride\b.*\b(safety|rules?|instructions?)\b/i,
  /\bjailbreak\b/i,
  /\bbypass\b.*\b(filter|safety|restriction)/i,
]

function checkPromptInjection(tool: ToolDefinition): SecurityFinding[] {
  const findings: SecurityFinding[] = []
  const textsToCheck = [
    tool.description,
    ...Object.values(tool.inputSchema.properties ?? {}).map(
      (p) => p.description ?? ''
    ),
  ]

  for (const text of textsToCheck) {
    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.test(text)) {
        findings.push({
          severity: 'critical',
          type: 'prompt_injection',
          description: `Tool "${tool.name}" contains potential prompt injection pattern in text: "${text.slice(0, 100)}"`,
          toolName: tool.name,
        })
        return findings // One finding per tool is enough
      }
    }
  }

  return findings
}

// ---------------------------------------------------------------------------
// Unrestricted inputs
// ---------------------------------------------------------------------------

const SAFE_INPUT_NAMES = new Set([
  'query', 'search', 'keyword', 'q', 'term', 'filter',
  'id', 'name', 'email', 'message', 'title', 'description',
  'category', 'type', 'status', 'page', 'limit', 'offset',
  'sort', 'order', 'format', 'lang', 'locale',
])

function checkUnrestrictedInputs(tool: ToolDefinition): SecurityFinding[] {
  const findings: SecurityFinding[] = []
  const properties = tool.inputSchema.properties ?? {}
  const propEntries = Object.entries(properties)

  // Count string inputs without constraints
  const unrestrictedStrings = propEntries.filter(([key, prop]) => {
    if (prop.type !== 'string') return false
    if (prop.enum) return false // Constrained by enum
    if (prop.maxLength) return false // Has length limit
    if (prop.pattern) return false // Has pattern constraint
    if (SAFE_INPUT_NAMES.has(key.toLowerCase())) return false // Known-safe name
    return true
  })

  if (unrestrictedStrings.length > 3) {
    findings.push({
      severity: 'medium',
      type: 'unrestricted_input',
      description: `Tool "${tool.name}" has ${unrestrictedStrings.length} unrestricted string inputs (${unrestrictedStrings.map(([k]) => k).join(', ')}). These could be used for data exfiltration by a malicious agent.`,
      toolName: tool.name,
    })
  }

  return findings
}

// ---------------------------------------------------------------------------
// Unclassified danger
// ---------------------------------------------------------------------------

const DANGER_ACTION_KEYWORDS = [
  'delete', 'remove', 'destroy', 'drop', 'purge', 'wipe', 'erase',
  'purchase', 'pay', 'checkout', 'transfer', 'withdraw',
  'revoke', 'terminate', 'ban', 'block',
]

function checkUnclassifiedDanger(tool: ToolDefinition): SecurityFinding[] {
  const findings: SecurityFinding[] = []
  const nameLower = tool.name.toLowerCase()
  const descLower = tool.description.toLowerCase()

  const hasDangerKeyword =
    DANGER_ACTION_KEYWORDS.some((k) => nameLower.includes(k)) ||
    DANGER_ACTION_KEYWORDS.some((k) => descLower.includes(k))

  if (hasDangerKeyword && tool.safetyLevel !== 'danger') {
    findings.push({
      severity: 'medium',
      type: 'unclassified_danger',
      description: `Tool "${tool.name}" appears to perform destructive or financial actions but is classified as "${tool.safetyLevel}" instead of "danger".`,
      toolName: tool.name,
    })
  }

  return findings
}

// ---------------------------------------------------------------------------
// Suspicious descriptions
// ---------------------------------------------------------------------------

function checkSuspiciousDescriptions(tool: ToolDefinition): SecurityFinding[] {
  const findings: SecurityFinding[] = []
  const desc = tool.description

  // Check for URLs in descriptions (potential exfiltration)
  if (/https?:\/\/[^\s]+/i.test(desc)) {
    findings.push({
      severity: 'medium',
      type: 'suspicious_url',
      description: `Tool "${tool.name}" description contains a URL, which could be used for data exfiltration.`,
      toolName: tool.name,
    })
  }

  // Check for encoded content
  if (/[A-Za-z0-9+/]{40,}={0,2}/.test(desc)) {
    findings.push({
      severity: 'high',
      type: 'encoded_content',
      description: `Tool "${tool.name}" description contains what appears to be base64-encoded content.`,
      toolName: tool.name,
    })
  }

  return findings
}
