/**
 * Polyfill for navigator.modelContext — the WebMCP browser API.
 *
 * Since no production browser ships this API yet (only Chrome Canary behind a flag),
 * this polyfill provides the same interface so SDK users can develop and test today.
 * When browsers ship native support, the polyfill gracefully steps aside.
 */

import type { ModelContextAPI, ToolDefinition, ToolHandler } from './types.js'

const POLYFILL_MARKER = Symbol.for('webmcpregistry-polyfill')

interface RegisteredTool {
  definition: ToolDefinition
  handler?: ToolHandler
}

function createPolyfill(): ModelContextAPI {
  const tools = new Map<string, RegisteredTool>()

  const polyfill: ModelContextAPI = {
    registerTool(definition: ToolDefinition): void {
      if (typeof definition.name !== 'string' || definition.name.length === 0) {
        throw new Error('WebMCP: Tool name is required')
      }
      if (typeof definition.description !== 'string' || definition.description.length === 0) {
        throw new Error('WebMCP: Tool description is required')
      }
      if (tools.has(definition.name)) {
        throw new Error(`WebMCP: Tool "${definition.name}" is already registered`)
      }
      tools.set(definition.name, {
        definition,
        handler: definition.handler,
      })
    },

    unregisterTool(name: string): void {
      if (!tools.has(name)) {
        throw new Error(`WebMCP: Tool "${name}" is not registered`)
      }
      tools.delete(name)
    },

    getTools(): ToolDefinition[] {
      return Array.from(tools.values()).map((t) => t.definition)
    },
  }

  Object.defineProperty(polyfill, POLYFILL_MARKER, {
    value: true,
    enumerable: false,
    writable: false,
    configurable: false,
  })

  return polyfill
}

/**
 * Install the polyfill on navigator.modelContext if no native implementation exists.
 * Returns true if the polyfill was installed, false if native API was already present.
 */
export function installPolyfill(): boolean {
  if (typeof globalThis.navigator === 'undefined') {
    // Not in a browser environment (Node.js, SSR, etc.)
    return false
  }

  if (globalThis.navigator.modelContext) {
    // Native API already available — don't override
    return false
  }

  Object.defineProperty(globalThis.navigator, 'modelContext', {
    value: createPolyfill(),
    writable: false,
    enumerable: true,
    configurable: true,
  })

  return true
}

/**
 * Check if the native navigator.modelContext API is available (not our polyfill).
 */
export function hasNativeAPI(): boolean {
  if (typeof globalThis.navigator === 'undefined') return false
  // Our polyfill is a plain object; native implementations are typically
  // [object ModelContext] or similar. We tag our polyfill to detect it.
  const mc = globalThis.navigator.modelContext
  if (!mc) return false
  return !isPolyfill(mc)
}

/**
 * Check if the current navigator.modelContext is our polyfill.
 */
export function isPolyfill(mc: ModelContextAPI): boolean {
  // Check for our private Symbol marker set in createPolyfill().
  return POLYFILL_MARKER in mc && (mc as any)[POLYFILL_MARKER] === true
}

/**
 * Get the modelContext API — installing the polyfill if needed.
 */
export function getModelContext(autoPolyfill = true): ModelContextAPI | null {
  if (typeof globalThis.navigator === 'undefined') return null

  if (!globalThis.navigator.modelContext && autoPolyfill) {
    installPolyfill()
  }

  return globalThis.navigator.modelContext ?? null
}
