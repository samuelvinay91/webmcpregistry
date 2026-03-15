/**
 * Tool registration engine.
 *
 * Orchestrates tool detection, polyfill installation, and registration
 * with navigator.modelContext. This is the main entry point that
 * framework adapters call.
 */

import type { ToolDefinition, WebMCPConfig, RegistrationMode } from './types.js'
import { getModelContext, installPolyfill, hasNativeAPI } from './polyfill.js'
import { detectTools } from './detector.js'
import { validateTools } from './validator.js'

export interface RegistrationResult {
  registered: ToolDefinition[]
  skipped: ToolDefinition[]
  mode: RegistrationMode
  polyfilled: boolean
  nativeAPI: boolean
}

/**
 * Initialize WebMCP on the current page with the given configuration.
 * This is the primary API — framework adapters wrap this.
 */
export function initialize(config: WebMCPConfig = {}): RegistrationResult {
  const mode = config.mode ?? 'auto'
  const shouldPolyfill = config.polyfill !== false
  const shouldAutoDetect = config.autoDetect !== false && mode === 'auto'

  // Step 1: Ensure navigator.modelContext is available
  const polyfilled = shouldPolyfill ? installPolyfill() : false
  const native = hasNativeAPI()
  const mc = getModelContext(shouldPolyfill)

  if (!mc) {
    const err = new Error('WebMCP: Could not initialize — no browser environment or polyfill disabled')
    config.onError?.(err)
    return { registered: [], skipped: [], mode, polyfilled: false, nativeAPI: false }
  }

  // Step 2: Collect tools
  const tools: ToolDefinition[] = []

  // Add explicitly provided tools
  if (config.tools) {
    tools.push(...config.tools)
  }

  // Auto-detect tools from DOM
  if (shouldAutoDetect) {
    const detected = detectTools()
    tools.push(...detected)
  }

  // Deduplicate
  const seen = new Set<string>()
  const uniqueTools = tools.filter((t) => {
    if (seen.has(t.name)) return false
    seen.add(t.name)
    return true
  })

  // Step 3: Validate
  const validation = validateTools(uniqueTools)
  if (validation.issues.length > 0 && mode === 'suggest') {
    for (const issue of validation.issues) {
      const prefix = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️'
      console.warn(`[WebMCP] ${prefix} ${issue.message}`)
    }
  }

  // Step 4: Register
  const registered: ToolDefinition[] = []
  const skipped: ToolDefinition[] = []

  if (mode === 'manual') {
    // In manual mode, don't register — just return what was detected
    return { registered: [], skipped: uniqueTools, mode, polyfilled, nativeAPI: native }
  }

  for (const tool of uniqueTools) {
    try {
      mc.registerTool(tool)
      registered.push(tool)
    } catch (err) {
      skipped.push(tool)
      if (mode === 'suggest') {
        console.warn(`[WebMCP] Could not register tool "${tool.name}":`, err)
      }
    }
  }

  // Step 5: Notify
  if (registered.length > 0) {
    config.onRegister?.(registered)
  }

  if (mode === 'suggest') {
    console.info(
      `[WebMCP] Registered ${registered.length} tool(s).`,
      registered.map((t) => t.name)
    )
    if (skipped.length > 0) {
      console.warn(
        `[WebMCP] Skipped ${skipped.length} tool(s).`,
        skipped.map((t) => t.name)
      )
    }
  }

  return { registered, skipped, mode, polyfilled, nativeAPI: native }
}

/**
 * Register a single tool with navigator.modelContext.
 * Installs polyfill if needed.
 */
export function registerTool(tool: ToolDefinition, autoPolyfill = true): void {
  const mc = getModelContext(autoPolyfill)
  if (!mc) {
    throw new Error('WebMCP: navigator.modelContext not available')
  }
  mc.registerTool(tool)
}

/**
 * Unregister a tool by name.
 */
export function unregisterTool(name: string): void {
  const mc = getModelContext(false)
  if (!mc) {
    throw new Error('WebMCP: navigator.modelContext not available')
  }
  mc.unregisterTool(name)
}

/**
 * Get all currently registered tools.
 */
export function getRegisteredTools(): ToolDefinition[] {
  const mc = getModelContext(false)
  if (!mc) return []
  return mc.getTools()
}
