import { describe, it, expect } from 'vitest'
import { validateTools, validateTool } from '../validator.js'
import type { ToolDefinition } from '../types.js'

function makeTool(overrides: Partial<ToolDefinition> = {}): ToolDefinition {
  return {
    name: 'search_products',
    description: 'Search the product catalog by keyword, category, or price range',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search keywords' },
      },
      required: ['query'],
    },
    safetyLevel: 'read',
    ...overrides,
  }
}

describe('validateTools', () => {
  it('returns valid for well-formed tools', () => {
    const result = validateTools([makeTool()])
    expect(result.valid).toBe(true)
    expect(result.score).toBeGreaterThan(80)
  })

  it('returns warning for empty tool list', () => {
    const result = validateTools([])
    expect(result.issues).toHaveLength(1)
    expect(result.issues[0]!.code).toBe('NO_TOOLS')
  })

  it('flags missing name', () => {
    const issues = validateTool(makeTool({ name: '' }))
    expect(issues.some((i) => i.code === 'NAME_MISSING')).toBe(true)
  })

  it('flags non-snake_case names', () => {
    const issues = validateTool(makeTool({ name: 'SearchProducts' }))
    expect(issues.some((i) => i.code === 'NAME_NOT_SNAKE_CASE')).toBe(true)
  })

  it('flags missing description', () => {
    const issues = validateTool(makeTool({ description: '' }))
    expect(issues.some((i) => i.code === 'DESC_MISSING')).toBe(true)
  })

  it('flags short descriptions', () => {
    const issues = validateTool(makeTool({ description: 'Search' }))
    expect(issues.some((i) => i.code === 'DESC_TOO_SHORT')).toBe(true)
  })

  it('flags missing schema', () => {
    const issues = validateTool(makeTool({ inputSchema: undefined as unknown as ToolDefinition['inputSchema'] }))
    expect(issues.some((i) => i.code === 'SCHEMA_MISSING')).toBe(true)
  })

  it('flags required fields not in properties', () => {
    const issues = validateTool(makeTool({
      inputSchema: {
        type: 'object',
        properties: {},
        required: ['nonexistent'],
      },
    }))
    expect(issues.some((i) => i.code === 'SCHEMA_REQUIRED_MISSING')).toBe(true)
  })

  it('flags misclassified danger tools', () => {
    const issues = validateTool(makeTool({ name: 'delete_account', safetyLevel: 'read' }))
    expect(issues.some((i) => i.code === 'SAFETY_SHOULD_BE_DANGER')).toBe(true)
  })

  it('flags misclassified write tools', () => {
    const issues = validateTool(makeTool({ name: 'create_order', safetyLevel: 'read' }))
    expect(issues.some((i) => i.code === 'SAFETY_SHOULD_BE_WRITE')).toBe(true)
  })
})
