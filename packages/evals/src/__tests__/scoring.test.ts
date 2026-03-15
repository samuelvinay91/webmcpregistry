import { describe, it, expect } from 'vitest'
import { scoreToolSelection, scoreArgumentMatch } from '../scoring.js'
import type { ToolDefinition } from '@webmcpregistry/core'

function makeTool(overrides: Partial<ToolDefinition> = {}): ToolDefinition {
  return {
    name: 'search_flights',
    description: 'Search for available flights by destination, date, and price range',
    inputSchema: {
      type: 'object',
      properties: {
        destination: { type: 'string', description: 'Airport code or city name' },
        date: { type: 'string', description: 'Travel date in YYYY-MM-DD format' },
        max_price: { type: 'number', description: 'Maximum ticket price in USD' },
      },
      required: ['destination'],
    },
    safetyLevel: 'read',
    ...overrides,
  }
}

describe('scoreToolSelection', () => {
  it('returns a higher score for a matching task and tool', () => {
    const tool = makeTool()
    const matchingScore = scoreToolSelection('Find flights to Tokyo', tool)
    const nonMatchingScore = scoreToolSelection('Delete my account immediately', tool)

    expect(matchingScore.total).toBeGreaterThan(nonMatchingScore.total)
  })

  it('returns a score between 0 and 1', () => {
    const tool = makeTool()
    const score = scoreToolSelection('Search for flights to Paris', tool)

    expect(score.total).toBeGreaterThanOrEqual(0)
    expect(score.total).toBeLessThanOrEqual(1)
  })

  it('scores name match when task keywords appear in tool name', () => {
    const tool = makeTool()
    const score = scoreToolSelection('Search for flights', tool)

    // "search" and "flights" both appear in "search_flights"
    expect(score.nameMatch).toBeGreaterThan(0)
  })

  it('scores description match when task keywords appear in description', () => {
    const tool = makeTool()
    const score = scoreToolSelection('Find available flights by destination and price', tool)

    expect(score.descriptionMatch).toBeGreaterThan(0)
  })

  it('scores schema match when task keywords match property names', () => {
    const tool = makeTool()
    const score = scoreToolSelection('I need to set the destination and date', tool)

    expect(score.schemaMatch).toBeGreaterThan(0)
  })

  it('scores safety alignment for read tasks', () => {
    const readTool = makeTool({ safetyLevel: 'read' })
    const score = scoreToolSelection('Search for flights', readTool)

    expect(score.safetyMatch).toBeGreaterThan(0)
  })

  it('scores safety alignment for danger tasks', () => {
    const dangerTool = makeTool({
      name: 'delete_account',
      description: 'Permanently delete a user account',
      safetyLevel: 'danger',
    })
    const score = scoreToolSelection('Delete my account', dangerTool)

    expect(score.safetyMatch).toBeGreaterThan(0)
  })

  it('gives higher score to more relevant tool among candidates', () => {
    const searchTool = makeTool()
    const bookTool = makeTool({
      name: 'book_flight',
      description: 'Book a flight reservation with payment',
      safetyLevel: 'write',
    })

    const searchScore = scoreToolSelection('Find flights to Tokyo under $500', searchTool)
    const bookScore = scoreToolSelection('Find flights to Tokyo under $500', bookTool)

    expect(searchScore.total).toBeGreaterThan(bookScore.total)
  })

  it('handles empty task gracefully', () => {
    const tool = makeTool()
    const score = scoreToolSelection('', tool)
    expect(score.total).toBeGreaterThanOrEqual(0)
    expect(score.total).toBeLessThanOrEqual(1)
  })

  it('total equals sum of components', () => {
    const tool = makeTool()
    const score = scoreToolSelection('Search flights to Tokyo destination', tool)

    const sum = score.nameMatch + score.descriptionMatch + score.schemaMatch + score.safetyMatch
    expect(Math.abs(score.total - sum)).toBeLessThan(0.001)
  })
})

describe('scoreArgumentMatch', () => {
  it('returns true when args match schema properties', () => {
    const schema = makeTool().inputSchema!
    const result = scoreArgumentMatch({ destination: 'Tokyo', date: '2026-05-01' }, schema)
    expect(result).toBe(true)
  })

  it('returns true for a subset of schema properties', () => {
    const schema = makeTool().inputSchema!
    const result = scoreArgumentMatch({ destination: 'Tokyo' }, schema)
    expect(result).toBe(true)
  })

  it('returns true for empty args (all properties optional in check)', () => {
    const schema = makeTool().inputSchema!
    const result = scoreArgumentMatch({}, schema)
    expect(result).toBe(true)
  })

  it('returns false when args contain keys not in schema', () => {
    const schema = makeTool().inputSchema!
    const result = scoreArgumentMatch({ destination: 'Tokyo', nonexistent_field: 'foo' }, schema)
    expect(result).toBe(false)
  })

  it('returns false for completely unknown args', () => {
    const schema = makeTool().inputSchema!
    const result = scoreArgumentMatch({ foo: 'bar', baz: 42 }, schema)
    expect(result).toBe(false)
  })

  it('returns true for schema with no properties (empty args)', () => {
    const result = scoreArgumentMatch({}, { type: 'object', properties: {} })
    expect(result).toBe(true)
  })

  it('returns false for schema with no properties but args provided', () => {
    const result = scoreArgumentMatch({ key: 'value' }, { type: 'object', properties: {} })
    expect(result).toBe(false)
  })
})
