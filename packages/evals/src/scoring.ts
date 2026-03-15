/**
 * Deterministic scoring functions for tool selection evaluation.
 *
 * Scores how well a tool's definition matches a natural-language task
 * WITHOUT using an LLM. Uses keyword matching, TF-IDF-like relevance,
 * and schema analysis.
 */

import type { ToolDefinition, ToolInputSchema } from '@webmcpregistry/core'

export interface SelectionScore {
  nameMatch: number
  descriptionMatch: number
  schemaMatch: number
  safetyMatch: number
  total: number
}

/**
 * Score how well a tool matches a natural-language task description.
 * Returns a score from 0 to 1.
 */
export function scoreToolSelection(task: string, tool: ToolDefinition): SelectionScore {
  const taskWords = tokenize(task)

  // 1. Name match (0-0.3): do task keywords appear in the tool name?
  const nameWords = tool.name.split('_')
  const nameOverlap = nameWords.filter((w) => taskWords.some((tw) => fuzzyMatch(tw, w))).length
  const nameMatch = nameWords.length > 0 ? Math.min(1, nameOverlap / nameWords.length) * 0.3 : 0

  // 2. Description match (0-0.4): do task keywords appear in the description?
  const descWords = tokenize(tool.description)
  const descOverlap = taskWords.filter((tw) => descWords.some((dw) => fuzzyMatch(tw, dw))).length
  const descMatch = taskWords.length > 0 ? Math.min(1, descOverlap / taskWords.length) * 0.4 : 0

  // 3. Schema match (0-0.2): do task keywords match property names/descriptions?
  const schemaText = extractSchemaText(tool.inputSchema ?? { type: 'object', properties: {} })
  const schemaWords = tokenize(schemaText)
  const schemaOverlap = taskWords.filter((tw) => schemaWords.some((sw) => fuzzyMatch(tw, sw))).length
  const schemaMatch = taskWords.length > 0 ? Math.min(1, schemaOverlap / taskWords.length) * 0.2 : 0

  // 4. Safety match (0-0.1): does the task imply the right safety level?
  const safetyMatch = scoreSafetyAlignment(task, tool.safetyLevel ?? 'read') * 0.1

  const total = nameMatch + descMatch + schemaMatch + safetyMatch

  return { nameMatch, descriptionMatch: descMatch, schemaMatch, safetyMatch, total }
}

/**
 * Score whether expected arguments are compatible with a tool's inputSchema.
 * Returns true if all expected arg keys exist in the schema.
 */
export function scoreArgumentMatch(
  expectedArgs: Record<string, unknown>,
  schema: ToolInputSchema
): boolean {
  const properties = schema.properties ?? {}
  const propNames = new Set(Object.keys(properties))

  for (const key of Object.keys(expectedArgs)) {
    if (!propNames.has(key)) return false
  }

  return true
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for',
  'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during',
  'before', 'after', 'above', 'below', 'between', 'under', 'over',
  'and', 'but', 'or', 'nor', 'not', 'so', 'yet', 'both', 'either',
  'neither', 'each', 'every', 'all', 'any', 'few', 'more', 'most',
  'other', 'some', 'such', 'no', 'only', 'same', 'than', 'too', 'very',
  'just', 'also', 'now', 'here', 'there', 'then', 'i', 'me', 'my',
  'we', 'our', 'you', 'your', 'he', 'she', 'it', 'they', 'them',
  'this', 'that', 'these', 'those', 'what', 'which', 'who', 'whom',
  'how', 'when', 'where', 'why', 'want', 'need', 'like', 'please',
])

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w))
}

function fuzzyMatch(a: string, b: string): boolean {
  if (a === b) return true
  if (a.length < 3 || b.length < 3) return a === b

  // Stem match: "flights" matches "flight", "searching" matches "search"
  const shorter = a.length < b.length ? a : b
  const longer = a.length >= b.length ? a : b
  if (longer.startsWith(shorter) && longer.length - shorter.length <= 3) return true

  return false
}

function extractSchemaText(schema: ToolInputSchema): string {
  const parts: string[] = []
  for (const [name, prop] of Object.entries(schema.properties ?? {})) {
    parts.push(name)
    if (prop.description) parts.push(prop.description)
    if (prop.enum) parts.push(...prop.enum.map(String))
  }
  return parts.join(' ')
}

function scoreSafetyAlignment(task: string, safetyLevel: string): number {
  const lower = task.toLowerCase()
  const dangerWords = ['delete', 'remove', 'cancel', 'pay', 'purchase', 'checkout', 'destroy']
  const writeWords = ['create', 'add', 'update', 'edit', 'book', 'submit', 'send', 'save']
  const readWords = ['find', 'search', 'get', 'show', 'list', 'check', 'view', 'look']

  const hasDanger = dangerWords.some((w) => lower.includes(w))
  const hasWrite = writeWords.some((w) => lower.includes(w))
  const hasRead = readWords.some((w) => lower.includes(w))

  if (hasDanger && safetyLevel === 'danger') return 1
  if (hasWrite && !hasDanger && safetyLevel === 'write') return 1
  if (hasRead && !hasWrite && !hasDanger && safetyLevel === 'read') return 1

  // Partial credit for adjacent levels
  if (hasDanger && safetyLevel === 'write') return 0.5
  if (hasWrite && safetyLevel === 'read') return 0.3

  return 0.2 // Default — some alignment
}
