/**
 * Vue 3 composables for WebMCP tool registration.
 */

import { inject, onMounted, onUnmounted } from 'vue'
import {
  registerTool,
  unregisterTool,
  getRegisteredTools,
  type ToolDefinition,
} from '@webmcpregistry/core'
import { WEBMCP_KEY, type WebMCPState } from './plugin.js'

/**
 * Access the WebMCP context (tools, readiness, mode).
 */
export function useWebMCPContext(): WebMCPState {
  const state = inject(WEBMCP_KEY)
  if (!state) {
    throw new Error('useWebMCPContext: WebMCP plugin not installed. Call app.use(webmcpPlugin) first.')
  }
  return state
}

/**
 * Register a single tool for the lifetime of the component.
 *
 * @example
 * ```vue
 * <script setup>
 * import { useWebMCPTool } from '@webmcpregistry/vue'
 *
 * useWebMCPTool({
 *   name: 'search_products',
 *   description: 'Search the product catalog by keyword',
 *   inputSchema: { type: 'object', properties: { query: { type: 'string' } } },
 *   safetyLevel: 'read',
 *   handler: async ({ query }) => fetch(`/api/search?q=${query}`).then(r => r.json()),
 * })
 * </script>
 * ```
 */
export function useWebMCPTool(tool: ToolDefinition): void {
  onMounted(() => {
    try {
      registerTool(tool)
    } catch {
      // Already registered
    }
  })

  onUnmounted(() => {
    try {
      unregisterTool(tool.name)
    } catch {
      // Already unregistered
    }
  })
}

/**
 * Get all currently registered tools.
 */
export function useWebMCPTools(): ToolDefinition[] {
  const state = inject(WEBMCP_KEY)
  if (state) return state.tools
  return getRegisteredTools()
}
