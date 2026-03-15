import { describe, it, expect } from 'vitest'
import { captureContract, diffContracts } from '../contracts.js'
import type { ToolDefinition, ToolContract } from '@webmcpregistry/core'

function makeTool(overrides: Partial<ToolDefinition> = {}): ToolDefinition {
  return {
    name: 'search_products',
    description: 'Search the product catalog by keyword',
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

function makeContract(tools: ToolDefinition[], source = 'test-source'): ToolContract {
  return captureContract(tools, source)
}

describe('captureContract', () => {
  it('creates a valid contract snapshot', () => {
    const tools = [makeTool()]
    const contract = captureContract(tools, 'mysite.com')

    expect(contract.source).toBe('mysite.com')
    expect(contract.capturedAt).toBeGreaterThan(0)
    expect(contract.version).toBe('1.0')
    expect(contract.tools).toHaveLength(1)
    expect(contract.tools[0]!.name).toBe('search_products')
  })

  it('preserves tool definition fields', () => {
    const tool = makeTool({
      annotations: { readOnlyHint: true },
    })
    const contract = captureContract([tool], 'test')

    expect(contract.tools[0]!.description).toBe(tool.description)
    expect(contract.tools[0]!.inputSchema).toEqual(tool.inputSchema)
    expect(contract.tools[0]!.safetyLevel).toBe('read')
    expect(contract.tools[0]!.annotations?.readOnlyHint).toBe(true)
  })

  it('captures multiple tools', () => {
    const tools = [
      makeTool({ name: 'tool_a' }),
      makeTool({ name: 'tool_b' }),
      makeTool({ name: 'tool_c' }),
    ]
    const contract = captureContract(tools, 'test')
    expect(contract.tools).toHaveLength(3)
  })

  it('strips handlers from snapshot (not serializable)', () => {
    const tool = makeTool({
      handler: async () => ({ ok: true }),
      execute: async () => ({ ok: true }),
    })
    const contract = captureContract([tool], 'test')
    // handler and execute should not be in the snapshot
    expect((contract.tools[0] as Record<string, unknown>).handler).toBeUndefined()
    expect((contract.tools[0] as Record<string, unknown>).execute).toBeUndefined()
  })
})

describe('diffContracts', () => {
  it('detects no changes for identical contracts', () => {
    const tools = [makeTool()]
    const before = makeContract(tools)
    const after = makeContract(tools)

    const diff = diffContracts(before, after)
    expect(diff.added).toHaveLength(0)
    expect(diff.removed).toHaveLength(0)
    expect(diff.changed).toHaveLength(0)
    expect(diff.isBreaking).toBe(false)
  })

  it('detects added tools (non-breaking)', () => {
    const before = makeContract([makeTool({ name: 'tool_a' })])
    const after = makeContract([
      makeTool({ name: 'tool_a' }),
      makeTool({ name: 'tool_b' }),
    ])

    const diff = diffContracts(before, after)
    expect(diff.added).toHaveLength(1)
    expect(diff.added[0]!.name).toBe('tool_b')
    expect(diff.removed).toHaveLength(0)
    expect(diff.isBreaking).toBe(false)
  })

  it('detects removed tools (breaking)', () => {
    const before = makeContract([
      makeTool({ name: 'tool_a' }),
      makeTool({ name: 'tool_b' }),
    ])
    const after = makeContract([makeTool({ name: 'tool_a' })])

    const diff = diffContracts(before, after)
    expect(diff.removed).toHaveLength(1)
    expect(diff.removed[0]!.name).toBe('tool_b')
    expect(diff.isBreaking).toBe(true)
  })

  it('detects changed property types (breaking)', () => {
    const before = makeContract([
      makeTool({
        name: 'search',
        inputSchema: {
          type: 'object',
          properties: { query: { type: 'string' } },
          required: ['query'],
        },
      }),
    ])
    const after = makeContract([
      makeTool({
        name: 'search',
        inputSchema: {
          type: 'object',
          properties: { query: { type: 'number' } },
          required: ['query'],
        },
      }),
    ])

    const diff = diffContracts(before, after)
    expect(diff.changed.length).toBeGreaterThan(0)
    const typeChange = diff.changed.find((c) => c.field.includes('type'))
    expect(typeChange).toBeDefined()
    expect(typeChange!.before).toBe('string')
    expect(typeChange!.after).toBe('number')
    expect(typeChange!.breaking).toBe(true)
    expect(diff.isBreaking).toBe(true)
  })

  it('detects changed safety level (breaking)', () => {
    const before = makeContract([makeTool({ name: 'do_thing', safetyLevel: 'read' })])
    const after = makeContract([makeTool({ name: 'do_thing', safetyLevel: 'write' })])

    const diff = diffContracts(before, after)
    const safetyChange = diff.changed.find((c) => c.field === 'safetyLevel')
    expect(safetyChange).toBeDefined()
    expect(safetyChange!.before).toBe('read')
    expect(safetyChange!.after).toBe('write')
    expect(safetyChange!.breaking).toBe(true)
    expect(diff.isBreaking).toBe(true)
  })

  it('detects removed required property (breaking)', () => {
    const before = makeContract([
      makeTool({
        name: 'search',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string' },
            filter: { type: 'string' },
          },
          required: ['query', 'filter'],
        },
      }),
    ])
    const after = makeContract([
      makeTool({
        name: 'search',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string' },
          },
          required: ['query'],
        },
      }),
    ])

    const diff = diffContracts(before, after)
    const removedProp = diff.changed.find((c) => c.field.includes('filter'))
    expect(removedProp).toBeDefined()
    // filter was required, so removing it is breaking
    expect(removedProp!.breaking).toBe(true)
    expect(diff.isBreaking).toBe(true)
  })

  it('detects added optional property (non-breaking)', () => {
    const before = makeContract([
      makeTool({
        name: 'search',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string' },
          },
          required: ['query'],
        },
      }),
    ])
    const after = makeContract([
      makeTool({
        name: 'search',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string' },
            limit: { type: 'number' },
          },
          required: ['query'],
        },
      }),
    ])

    const diff = diffContracts(before, after)
    // Adding an optional property is non-breaking
    // The new property "limit" is not in required, so it should not be breaking
    expect(diff.isBreaking).toBe(false)
  })

  it('detects added required property (breaking)', () => {
    const before = makeContract([
      makeTool({
        name: 'search',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string' },
          },
          required: ['query'],
        },
      }),
    ])
    const after = makeContract([
      makeTool({
        name: 'search',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string' },
            filter: { type: 'string' },
          },
          required: ['query', 'filter'],
        },
      }),
    ])

    const diff = diffContracts(before, after)
    const addedProp = diff.changed.find((c) => c.field.includes('filter'))
    expect(addedProp).toBeDefined()
    expect(addedProp!.breaking).toBe(true)
    expect(diff.isBreaking).toBe(true)
  })

  it('detects changed description (non-breaking)', () => {
    const before = makeContract([makeTool({ name: 'search', description: 'Old description' })])
    const after = makeContract([makeTool({ name: 'search', description: 'New description' })])

    const diff = diffContracts(before, after)
    const descChange = diff.changed.find((c) => c.field === 'description')
    expect(descChange).toBeDefined()
    expect(descChange!.breaking).toBe(false)
    expect(diff.isBreaking).toBe(false)
  })
})
