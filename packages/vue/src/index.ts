/**
 * @webmcpregistry/vue
 *
 * Vue 3 plugin and composables for WebMCP tool registration.
 *
 * @example
 * ```ts
 * // main.ts
 * import { createApp } from 'vue'
 * import { webmcpPlugin } from '@webmcpregistry/vue'
 *
 * const app = createApp(App)
 * app.use(webmcpPlugin, { mode: 'auto' })
 * app.mount('#app')
 * ```
 */

export { webmcpPlugin } from './plugin.js'
export { useWebMCPTool, useWebMCPTools, useWebMCPContext } from './composables.js'

export type {
  ToolDefinition,
  ToolInputSchema,
  ToolSafetyLevel,
  ToolHandler,
  WebMCPConfig,
  RegistrationMode,
} from '@webmcpregistry/core'
