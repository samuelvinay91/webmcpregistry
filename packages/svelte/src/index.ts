/**
 * @webmcpregistry/svelte
 *
 * Svelte actions and stores for WebMCP tool registration.
 *
 * @example
 * ```svelte
 * <script>
 *   import { initWebMCP, webmcpTools } from '@webmcpregistry/svelte'
 *   import { onMount } from 'svelte'
 *
 *   onMount(() => {
 *     initWebMCP({ mode: 'auto' })
 *   })
 * </script>
 *
 * <p>Registered tools: {$webmcpTools.length}</p>
 * ```
 */

export { initWebMCP, webmcpTools, webmcpReady } from './store.js'
export { webmcpTool } from './action.js'

export type {
  ToolDefinition,
  ToolInputSchema,
  ToolSafetyLevel,
  ToolHandler,
  WebMCPConfig,
  RegistrationMode,
} from '@webmcpregistry/core'
