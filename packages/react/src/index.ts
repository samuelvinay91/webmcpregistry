/**
 * @webmcpregistry/react
 *
 * React hooks and components for WebMCP tool registration.
 *
 * @example
 * ```tsx
 * import { WebMCPProvider, useWebMCPTool } from '@webmcpregistry/react'
 *
 * function App() {
 *   return (
 *     <WebMCPProvider mode="auto">
 *       <SearchPage />
 *     </WebMCPProvider>
 *   )
 * }
 *
 * function SearchPage() {
 *   useWebMCPTool({
 *     name: 'search_products',
 *     description: 'Search the product catalog',
 *     inputSchema: { type: 'object', properties: { query: { type: 'string' } } },
 *     safetyLevel: 'read',
 *     handler: async ({ query }) => fetch(`/api/search?q=${query}`).then(r => r.json()),
 *   })
 *   return <div>Search</div>
 * }
 * ```
 */

export { WebMCPProvider, useWebMCPContext, useWebMCPTools } from './provider.js'
export type { WebMCPProviderProps } from './provider.js'
export { useWebMCPTool } from './hooks.js'
export { useWebMCPTools as useWebMCPToolsBatch } from './hooks.js'

// Re-export core types for convenience
export type {
  ToolDefinition,
  ToolInputSchema,
  ToolSafetyLevel,
  ToolHandler,
  WebMCPConfig,
  RegistrationMode,
} from '@webmcpregistry/core'
