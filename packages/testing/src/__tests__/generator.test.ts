import { describe, it, expect } from 'vitest'
import { generateTestCases } from '../generator.js'
import type { ToolDefinition } from '@webmcpregistry/core'

function makeSearchTool(): ToolDefinition {
  return {
    name: 'search_products',
    description: 'Search the product catalog by keyword, category, or price range',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search keywords' },
        max_price: { type: 'number', description: 'Maximum price filter', minimum: 0, maximum: 10000 },
        category: {
          type: 'string',
          description: 'Product category',
          enum: ['electronics', 'clothing', 'books'],
        },
      },
      required: ['query'],
    },
    safetyLevel: 'read',
  }
}

function makeEmptyTool(): ToolDefinition {
  return {
    name: 'noop_tool',
    description: 'A tool with no properties at all',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    safetyLevel: 'read',
  }
}

describe('generateTestCases', () => {
  it('generates cases for a well-defined tool', () => {
    const cases = generateTestCases(makeSearchTool())
    expect(cases.length).toBeGreaterThan(0)
  })

  it('generates valid cases', () => {
    const cases = generateTestCases(makeSearchTool())
    const valid = cases.filter((c) => c.category === 'valid')
    expect(valid.length).toBeGreaterThan(0)
    // Should include a "required fields only" case and enum value cases
    expect(valid.some((c) => c.description.includes('all required fields'))).toBe(true)
  })

  it('generates valid enum cases for each enum value', () => {
    const cases = generateTestCases(makeSearchTool())
    const enumCases = cases.filter((c) => c.category === 'valid' && c.description.includes('enum'))
    // The category field has 3 enum values: electronics, clothing, books
    expect(enumCases.length).toBe(3)
    expect(enumCases.every((c) => c.shouldSucceed)).toBe(true)
  })

  it('generates invalid cases', () => {
    const cases = generateTestCases(makeSearchTool())
    const invalid = cases.filter((c) => c.category === 'invalid')
    expect(invalid.length).toBeGreaterThan(0)
    // Should include missing required field "query"
    expect(invalid.some((c) => c.description.includes('missing required field'))).toBe(true)
    // Should include empty input case
    expect(invalid.some((c) => c.description.includes('empty input'))).toBe(true)
    // Should include invalid enum value
    expect(invalid.some((c) => c.description.includes('Invalid enum'))).toBe(true)
  })

  it('generates boundary cases for numeric properties', () => {
    const cases = generateTestCases(makeSearchTool())
    const boundary = cases.filter((c) => c.category === 'boundary')
    expect(boundary.length).toBeGreaterThan(0)
    // max_price has minimum=0 and maximum=10000
    expect(boundary.some((c) => c.description.includes('max_price') && c.description.includes('minimum'))).toBe(true)
    expect(boundary.some((c) => c.description.includes('max_price') && c.description.includes('maximum'))).toBe(true)
  })

  it('generates boundary cases for string properties (empty string)', () => {
    const cases = generateTestCases(makeSearchTool())
    const boundary = cases.filter((c) => c.category === 'boundary')
    expect(boundary.some((c) => c.description.includes('query') && c.description.includes('empty string'))).toBe(true)
  })

  it('generates type coercion cases', () => {
    const cases = generateTestCases(makeSearchTool())
    const coercion = cases.filter((c) => c.category === 'type-coercion')
    expect(coercion.length).toBeGreaterThan(0)
    // All type coercion cases should have shouldSucceed=false
    expect(coercion.every((c) => c.shouldSucceed === false)).toBe(true)
  })

  it('generates security cases including SQL injection and XSS', () => {
    const cases = generateTestCases(makeSearchTool())
    const security = cases.filter((c) => c.category === 'security')
    expect(security.length).toBeGreaterThan(0)
    expect(security.some((c) => c.description.includes('SQL injection'))).toBe(true)
    expect(security.some((c) => c.description.includes('XSS'))).toBe(true)
    expect(security.some((c) => c.description.includes('Command injection'))).toBe(true)
    expect(security.some((c) => c.description.includes('Path traversal'))).toBe(true)
    expect(security.some((c) => c.description.includes('Prompt injection'))).toBe(true)
  })

  it('security cases target string properties only', () => {
    const cases = generateTestCases(makeSearchTool())
    const security = cases.filter((c) => c.category === 'security')
    // query and category are string types — security payloads should target them
    // max_price is number — should not have security cases
    expect(security.some((c) => c.description.includes('in query'))).toBe(true)
    expect(security.some((c) => c.description.includes('in category'))).toBe(true)
    expect(security.every((c) => !c.description.includes('in max_price'))).toBe(true)
  })

  it('generates cases for a tool with no properties', () => {
    const cases = generateTestCases(makeEmptyTool())
    expect(cases.length).toBeGreaterThan(0)
    // Should at least have a "valid: all required fields" case with empty input
    const valid = cases.filter((c) => c.category === 'valid')
    expect(valid.length).toBeGreaterThan(0)
    expect(valid[0]!.input).toEqual({})
  })

  it('tool with no properties generates no security or type-coercion cases', () => {
    const cases = generateTestCases(makeEmptyTool())
    const security = cases.filter((c) => c.category === 'security')
    const coercion = cases.filter((c) => c.category === 'type-coercion')
    expect(security).toHaveLength(0)
    expect(coercion).toHaveLength(0)
  })

  it('generates a reasonable total number of cases', () => {
    const cases = generateTestCases(makeSearchTool())
    // With 3 properties (1 string required, 1 number, 1 enum with 3 values),
    // we expect a non-trivial but bounded number of cases
    expect(cases.length).toBeGreaterThan(10)
    expect(cases.length).toBeLessThan(200)
  })

  it('all cases have the correct toolName', () => {
    const tool = makeSearchTool()
    const cases = generateTestCases(tool)
    expect(cases.every((c) => c.toolName === tool.name)).toBe(true)
  })

  it('all cases have a non-empty description', () => {
    const cases = generateTestCases(makeSearchTool())
    expect(cases.every((c) => c.description.length > 0)).toBe(true)
  })

  it('all cases have a valid category', () => {
    const cases = generateTestCases(makeSearchTool())
    const validCategories = new Set(['valid', 'invalid', 'boundary', 'security', 'type-coercion'])
    expect(cases.every((c) => validCategories.has(c.category))).toBe(true)
  })
})
