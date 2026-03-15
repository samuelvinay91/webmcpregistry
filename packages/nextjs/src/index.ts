/**
 * @webmcpregistry/nextjs
 *
 * Next.js App Router adapter for WebMCP.
 * Re-exports the React provider and hooks with Next.js-specific guidance.
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { WebMCPProvider } from '@webmcpregistry/nextjs'
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <WebMCPProvider mode="auto">
 *           {children}
 *         </WebMCPProvider>
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 *
 * Note: WebMCPProvider is a client component. It uses 'use client' internally
 * since WebMCP tool registration requires browser APIs (navigator.modelContext).
 */

'use client'

// Re-export everything from the React package
export {
  WebMCPProvider,
  useWebMCPContext,
  useWebMCPTools,
  useWebMCPTool,
  useWebMCPToolsBatch,
} from '@webmcpregistry/react'

export type {
  WebMCPProviderProps,
  ToolDefinition,
  ToolInputSchema,
  ToolSafetyLevel,
  ToolHandler,
  WebMCPConfig,
  RegistrationMode,
} from '@webmcpregistry/react'
