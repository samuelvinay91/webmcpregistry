/**
 * React hooks for registering individual WebMCP tools.
 */

import { useEffect, useRef } from 'react'
import {
  registerTool,
  unregisterTool,
  type ToolDefinition,
} from '@webmcpregistry/core'

/**
 * Register a single WebMCP tool for the lifetime of the component.
 * The tool is unregistered when the component unmounts.
 *
 * @example
 * ```tsx
 * function SearchPage() {
 *   useWebMCPTool({
 *     name: 'search_products',
 *     description: 'Search the product catalog by keyword',
 *     inputSchema: {
 *       type: 'object',
 *       properties: { query: { type: 'string', description: 'Search term' } },
 *       required: ['query'],
 *     },
 *     safetyLevel: 'read',
 *     handler: async ({ query }) => {
 *       const res = await fetch(`/api/search?q=${query}`)
 *       return res.json()
 *     },
 *   })
 *
 *   return <div>Search Page</div>
 * }
 * ```
 */
export function useWebMCPTool(tool: ToolDefinition): void {
  const registered = useRef(false)
  const toolName = tool.name

  useEffect(() => {
    if (registered.current) return
    registered.current = true

    try {
      registerTool(tool)
    } catch {
      // Tool may already be registered (e.g., from provider auto-detect)
    }

    return () => {
      try {
        unregisterTool(toolName)
      } catch {
        // Tool may already be unregistered
      }
      registered.current = false
    }
  }, [toolName]) // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * Register multiple WebMCP tools for the lifetime of the component.
 *
 * @example
 * ```tsx
 * function EcommercePage() {
 *   useWebMCPTools([
 *     { name: 'search_products', description: '...', inputSchema: {...}, safetyLevel: 'read' },
 *     { name: 'add_to_cart', description: '...', inputSchema: {...}, safetyLevel: 'write' },
 *   ])
 * }
 * ```
 */
export function useWebMCPTools(tools: ToolDefinition[]): void {
  const registered = useRef<string[]>([])

  useEffect(() => {
    const names: string[] = []

    for (const tool of tools) {
      try {
        registerTool(tool)
        names.push(tool.name)
      } catch {
        // Skip already-registered tools
      }
    }

    registered.current = names

    return () => {
      for (const name of registered.current) {
        try {
          unregisterTool(name)
        } catch {
          // Already unregistered
        }
      }
      registered.current = []
    }
  }, [tools.map((t) => t.name).join(',')]) // eslint-disable-line react-hooks/exhaustive-deps
}
