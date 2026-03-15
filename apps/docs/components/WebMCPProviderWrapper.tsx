'use client'

/**
 * Dogfooding: WebMCPRegistry.com uses its own SDK.
 *
 * This provider registers tools that AI agents can call on our documentation site:
 * - search_docs: Search our documentation
 * - get_sdk_info: Get SDK package information
 * - check_webmcp_readiness: Check if a framework is supported
 *
 * This serves as a live demo — visitors can inspect registered tools in DevTools.
 */

import { WebMCPProvider, useWebMCPTool } from '@webmcpregistry/react'
import type { ReactNode } from 'react'

function SiteTools() {
  // Register site-wide tools that demonstrate the SDK
  useWebMCPTool({
    name: 'search_docs',
    description: 'Search the WebMCP Registry documentation for guides, API references, and examples',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search keywords (e.g., "react hooks", "security", "polyfill")',
        },
      },
      required: ['query'],
    },
    safetyLevel: 'read',
    handler: async (input) => {
      const query = input['query'] as string
      // In production, this would search a docs index
      return {
        results: [
          { title: 'Getting Started', url: '/docs/getting-started', relevance: 0.9 },
          { title: `Results for: ${query}`, url: `/docs/search?q=${encodeURIComponent(query)}`, relevance: 0.8 },
        ],
      }
    },
  })

  useWebMCPTool({
    name: 'get_sdk_packages',
    description: 'Get information about available WebMCP Registry SDK packages for different frameworks',
    inputSchema: {
      type: 'object',
      properties: {
        framework: {
          type: 'string',
          description: 'Framework name',
          enum: ['react', 'nextjs', 'vue', 'angular', 'svelte', 'html'],
        },
      },
    },
    safetyLevel: 'read',
    handler: async (input) => {
      const packages: Record<string, { name: string; install: string }> = {
        react: { name: '@webmcpregistry/react', install: 'npm install @webmcpregistry/react' },
        nextjs: { name: '@webmcpregistry/nextjs', install: 'npm install @webmcpregistry/nextjs' },
        vue: { name: '@webmcpregistry/vue', install: 'npm install @webmcpregistry/vue' },
        angular: { name: '@webmcpregistry/angular', install: 'npm install @webmcpregistry/angular' },
        svelte: { name: '@webmcpregistry/svelte', install: 'npm install @webmcpregistry/svelte' },
        html: { name: '@webmcpregistry/browser', install: '<script src="https://cdn.webmcpregistry.com/v1/auto.js"></script>' },
      }
      const framework = (input['framework'] as string) ?? 'react'
      return packages[framework] ?? packages['react']
    },
  })

  useWebMCPTool({
    name: 'validate_tool_definition',
    description: 'Validate a WebMCP tool definition for naming, schema, and security issues',
    inputSchema: {
      type: 'object',
      properties: {
        tool_name: { type: 'string', description: 'The tool name to validate' },
        tool_description: { type: 'string', description: 'The tool description to validate' },
        safety_level: { type: 'string', description: 'Safety level: read, write, or danger' },
      },
      required: ['tool_name'],
    },
    safetyLevel: 'read',
    handler: async (input) => {
      const { validateTool } = await import('@webmcpregistry/core')
      const issues = validateTool({
        name: input['tool_name'] as string,
        description: (input['tool_description'] as string) ?? '',
        inputSchema: { type: 'object', properties: {} },
        safetyLevel: (input['safety_level'] as 'read' | 'write' | 'danger') ?? 'read',
      })
      return { valid: issues.every((i) => i.severity !== 'error'), issues }
    },
  })

  return null
}

export function WebMCPProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <WebMCPProvider mode="suggest" polyfill autoDetect={false}>
      <SiteTools />
      {children}
    </WebMCPProvider>
  )
}
