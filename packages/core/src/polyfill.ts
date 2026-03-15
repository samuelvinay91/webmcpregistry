/**
 * Polyfill for navigator.modelContext — the WebMCP browser API.
 *
 * Since no production browser ships this API yet (only Chrome Canary behind a flag),
 * this polyfill provides the same interface so SDK users can develop and test today.
 * When browsers ship native support, the polyfill gracefully steps aside.
 */

import type { ModelContextAPI, ToolDefinition, ToolHandler } from './types.js'

interface RegisteredTool {
  definition: ToolDefinition
  handler?: ToolHandler
}

function createPolyfill(): ModelContextAPI {
  const tools = new Map<string, RegisteredTool>()

  return {
    registerTool(definition: ToolDefinition): void {
      if (!definition.name) {
        throw new Error('WebMCP: Tool name is required')
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
  // Native implementations will have prototype chain from browser internals.
  // Our polyfill is a plain object with Object.prototype.
  return Object.getPrototypeOf(mc) === Object.prototype
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
