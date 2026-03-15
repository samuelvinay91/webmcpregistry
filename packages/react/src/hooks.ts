/**
 * React hooks for registering individual WebMCP tools.
 */

import { useEffect, useMemo } from 'react'
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
  const toolName = tool.name

  useEffect(() => {
    try {
      registerTool(tool)
    } catch {
      // Tool may already be registered (e.g., from provider auto-detect or Strict Mode double-mount)
    }

    return () => {
      try {
        unregisterTool(toolName)
      } catch {
        // Tool may already be unregistered
      }
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
  const toolNamesKey = useMemo(
    () => JSON.stringify(tools.map((t) => t.name)),
    [tools.map((t) => t.name).join(',')] // eslint-disable-line react-hooks/exhaustive-deps
  )

  useEffect(() => {
    const names: string[] = []

    for (const tool of tools) {
      try {
        registerTool(tool)
        names.push(tool.name)
      } catch {
        // Tool may already be registered (e.g., from provider auto-detect or Strict Mode double-mount)
      }
    }

    return () => {
      for (const name of names) {
        try {
          unregisterTool(name)
        } catch {
          // Tool may already be unregistered
        }
      }
    }
  }, [toolNamesKey]) // eslint-disable-line react-hooks/exhaustive-deps
}
