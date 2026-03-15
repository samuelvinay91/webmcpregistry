import { describe, it, expect, beforeEach, vi } from 'vitest'
import { initialize, registerTool, unregisterTool, getRegisteredTools } from '../registrar.js'
import { installPolyfill } from '../polyfill.js'
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

function resetModelContext(): void {
  if (globalThis.navigator?.modelContext) {
    Object.defineProperty(globalThis.navigator, 'modelContext', {
      value: undefined,
      writable: true,
      configurable: true,
    })
  }
}

// ---------------------------------------------------------------------------
// initialize()
// ---------------------------------------------------------------------------

describe('initialize', () => {
  beforeEach(() => {
    resetModelContext()
  })

  it('registers provided tools in auto mode', () => {
    const tool = makeTool()
    const result = initialize({ mode: 'auto', tools: [tool], autoDetect: false })
    expect(result.mode).toBe('auto')
    expect(result.registered).toHaveLength(1)
    expect(result.registered[0]!.name).toBe('search_products')
    expect(result.skipped).toHaveLength(0)
    expect(result.polyfilled).toBe(true)
  })

  it('defaults to auto mode when mode is not specified', () => {
    const result = initialize({ tools: [makeTool()], autoDetect: false })
    expect(result.mode).toBe('auto')
    expect(result.registered).toHaveLength(1)
  })

  it('does not register tools in manual mode', () => {
    const tool = makeTool()
    const result = initialize({ mode: 'manual', tools: [tool], autoDetect: false })
    expect(result.mode).toBe('manual')
    expect(result.registered).toHaveLength(0)
    expect(result.skipped).toHaveLength(1)
    expect(result.skipped[0]!.name).toBe('search_products')
  })

  it('registers tools and logs in suggest mode', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

    const tool = makeTool()
    const result = initialize({ mode: 'suggest', tools: [tool], autoDetect: false })
    expect(result.mode).toBe('suggest')
    expect(result.registered).toHaveLength(1)

    // suggest mode logs info about registration
    expect(infoSpy).toHaveBeenCalled()

    warnSpy.mockRestore()
    infoSpy.mockRestore()
  })

  it('installs polyfill and sets polyfilled true', () => {
    const result = initialize({ tools: [makeTool()], autoDetect: false })
    expect(result.polyfilled).toBe(true)
    expect(result.nativeAPI).toBe(false)
  })

  it('calls onRegister callback when tools are registered', () => {
    const onRegister = vi.fn()
    initialize({ tools: [makeTool()], autoDetect: false, onRegister })
    expect(onRegister).toHaveBeenCalledTimes(1)
    expect(onRegister).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ name: 'search_products' })])
    )
  })

  it('does not call onRegister when no tools are registered', () => {
    const onRegister = vi.fn()
    initialize({ mode: 'manual', tools: [makeTool()], autoDetect: false, onRegister })
    expect(onRegister).not.toHaveBeenCalled()
  })

  it('calls onError when polyfill is disabled and no native API', () => {
    const onError = vi.fn()
    const result = initialize({ polyfill: false, tools: [makeTool()], autoDetect: false, onError })
    expect(result.registered).toHaveLength(0)
    expect(result.polyfilled).toBe(false)
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledWith(expect.any(Error))
  })

  it('deduplicates tools by name', () => {
    const tool1 = makeTool({ name: 'dup_tool' })
    const tool2 = makeTool({ name: 'dup_tool', description: 'Duplicate tool' })
    const result = initialize({ tools: [tool1, tool2], autoDetect: false })
    expect(result.registered).toHaveLength(1)
  })

  it('handles empty tools array', () => {
    const result = initialize({ tools: [], autoDetect: false })
    expect(result.registered).toHaveLength(0)
    expect(result.skipped).toHaveLength(0)
  })

  it('registers multiple tools with different safety levels', () => {
    const tools = [
      makeTool({ name: 'read_tool', safetyLevel: 'read' }),
      makeTool({ name: 'write_tool', safetyLevel: 'write' }),
      makeTool({ name: 'danger_tool', safetyLevel: 'danger' }),
    ]
    const result = initialize({ tools, autoDetect: false })
    expect(result.registered).toHaveLength(3)
  })
})

// ---------------------------------------------------------------------------
// registerTool / unregisterTool / getRegisteredTools
// ---------------------------------------------------------------------------

describe('registerTool', () => {
  beforeEach(() => {
    resetModelContext()
  })

  it('registers a tool with auto-polyfill', () => {
    registerTool(makeTool())
    const tools = getRegisteredTools()
    expect(tools).toHaveLength(1)
    expect(tools[0]!.name).toBe('search_products')
  })

  it('throws when polyfill is disabled and no native API', () => {
    expect(() => registerTool(makeTool(), false)).toThrow('navigator.modelContext not available')
  })

  it('throws on duplicate tool registration', () => {
    registerTool(makeTool())
    expect(() => registerTool(makeTool())).toThrow('already registered')
  })
})

describe('unregisterTool', () => {
  beforeEach(() => {
    resetModelContext()
    installPolyfill()
  })

  it('removes a previously registered tool', () => {
    registerTool(makeTool())
    expect(getRegisteredTools()).toHaveLength(1)
    unregisterTool('search_products')
    expect(getRegisteredTools()).toHaveLength(0)
  })

  it('throws when unregistering a non-existent tool', () => {
    expect(() => unregisterTool('ghost')).toThrow('not registered')
  })

  it('throws when modelContext is not available', () => {
    resetModelContext()
    expect(() => unregisterTool('any')).toThrow('navigator.modelContext not available')
  })
})

describe('getRegisteredTools', () => {
  beforeEach(() => {
    resetModelContext()
  })

  it('returns empty array when no modelContext exists', () => {
    const tools = getRegisteredTools()
    expect(tools).toEqual([])
  })

  it('returns all registered tools', () => {
    installPolyfill()
    registerTool(makeTool({ name: 'tool_a' }), false)
    registerTool(makeTool({ name: 'tool_b' }), false)
    const tools = getRegisteredTools()
    expect(tools).toHaveLength(2)
    expect(tools.map((t) => t.name)).toEqual(['tool_a', 'tool_b'])
  })
})
