/**
 * Svelte action for registering a WebMCP tool tied to an element's lifecycle.
 *
 * @example
 * ```svelte
 * <form use:webmcpTool={{
 *   name: 'search_products',
 *   description: 'Search the product catalog',
 *   inputSchema: { type: 'object', properties: { query: { type: 'string' } } },
 *   safetyLevel: 'read',
 * }}>
 *   <input name="query" />
 *   <button type="submit">Search</button>
 * </form>
 * ```
 */

import {
  registerTool,
  unregisterTool,
  type ToolDefinition,
} from '@webmcpregistry/core'
import { refreshTools } from './store.js'

export function webmcpTool(_node: HTMLElement, tool: ToolDefinition) {
  try {
    registerTool(tool)
    refreshTools()
  } catch {
    // Already registered
  }

  return {
    destroy() {
      try {
        unregisterTool(tool.name)
        refreshTools()
      } catch {
        // Already unregistered
      }
    },
  }
}
