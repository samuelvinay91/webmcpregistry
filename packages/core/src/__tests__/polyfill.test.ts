import { describe, it, expect, beforeEach } from 'vitest'
import { installPolyfill, getModelContext, hasNativeAPI, isPolyfill } from '../polyfill.js'

describe('polyfill', () => {
  beforeEach(() => {
    // Reset navigator.modelContext between tests
    if (globalThis.navigator?.modelContext) {
      Object.defineProperty(globalThis.navigator, 'modelContext', {
        value: undefined,
        writable: true,
        configurable: true,
      })
    }
  })

  it('installs polyfill when no native API exists', () => {
    const installed = installPolyfill()
    expect(installed).toBe(true)
    expect(globalThis.navigator.modelContext).toBeDefined()
  })

  it('does not install if native API exists', () => {
    // Simulate native API (non-plain-object prototype)
    const nativeApi = Object.create({ nativeMarker: true })
    nativeApi.registerTool = () => {}
    nativeApi.unregisterTool = () => {}
    nativeApi.getTools = () => []

    Object.defineProperty(globalThis.navigator, 'modelContext', {
      value: nativeApi,
      writable: true,
      configurable: true,
    })

    const installed = installPolyfill()
    expect(installed).toBe(false)
  })

  it('getModelContext installs polyfill by default', () => {
    const mc = getModelContext()
    expect(mc).not.toBeNull()
    expect(mc!.registerTool).toBeInstanceOf(Function)
    expect(mc!.unregisterTool).toBeInstanceOf(Function)
    expect(mc!.getTools).toBeInstanceOf(Function)
  })

  it('getModelContext returns null without polyfill when disabled', () => {
    const mc = getModelContext(false)
    expect(mc).toBeNull()
  })

  it('isPolyfill detects our polyfill', () => {
    installPolyfill()
    const mc = globalThis.navigator.modelContext!
    expect(isPolyfill(mc)).toBe(true)
  })

  it('hasNativeAPI returns false for polyfill', () => {
    installPolyfill()
    expect(hasNativeAPI()).toBe(false)
  })
})

describe('polyfill tool registration', () => {
  beforeEach(() => {
    if (globalThis.navigator?.modelContext) {
      Object.defineProperty(globalThis.navigator, 'modelContext', {
        value: undefined,
        writable: true,
        configurable: true,
      })
    }
    installPolyfill()
  })

  it('registers and retrieves a tool', () => {
    const mc = globalThis.navigator.modelContext!
    mc.registerTool({
      name: 'test_tool',
      description: 'A test tool',
      inputSchema: { type: 'object', properties: {} },
      safetyLevel: 'read',
    })

    const tools = mc.getTools()
    expect(tools).toHaveLength(1)
    expect(tools[0]!.name).toBe('test_tool')
  })

  it('throws on duplicate registration', () => {
    const mc = globalThis.navigator.modelContext!
    const tool = {
      name: 'dup_tool',
      description: 'A tool',
      inputSchema: { type: 'object' as const, properties: {} },
      safetyLevel: 'read' as const,
    }

    mc.registerTool(tool)
    expect(() => mc.registerTool(tool)).toThrow('already registered')
  })

  it('unregisters a tool', () => {
    const mc = globalThis.navigator.modelContext!
    mc.registerTool({
      name: 'removable',
      description: 'Will be removed',
      inputSchema: { type: 'object', properties: {} },
      safetyLevel: 'read',
    })

    expect(mc.getTools()).toHaveLength(1)
    mc.unregisterTool('removable')
    expect(mc.getTools()).toHaveLength(0)
  })

  it('throws on unregistering non-existent tool', () => {
    const mc = globalThis.navigator.modelContext!
    expect(() => mc.unregisterTool('ghost')).toThrow('not registered')
  })
})
