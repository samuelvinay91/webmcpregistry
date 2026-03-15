/**
 * WebMCP manifest generation — /.well-known/webmcp.json
 *
 * Generates machine-readable manifests for AI agent discovery:
 *
 * 1. /.well-known/webmcp.json — Tool manifest (like robots.txt for AI tools)
 * 2. JSON-LD structured data — Schema.org-compatible tool descriptions
 * 3. llms.txt — Human/AI readable site description
 * 4. agents.json — Machine-readable agent capability manifest
 *
 * These files let AI crawlers and agent orchestrators discover a site's
 * tools WITHOUT loading the page — enabling pre-flight tool discovery.
 */

import type { ToolDefinition } from './types.js'

// ---------------------------------------------------------------------------
// /.well-known/webmcp.json
// ---------------------------------------------------------------------------

/** The WebMCP manifest format. */
export interface WebMCPManifest {
  /** Manifest version. */
  version: '1.0'
  /** Site metadata. */
  site: {
    name: string
    url: string
    description?: string
    contact?: string
  }
  /** When this manifest was generated. */
  generatedAt: string
  /** Total number of tools. */
  toolCount: number
  /** Tool definitions (without execute callbacks). */
  tools: Array<{
    name: string
    description: string
    inputSchema: ToolDefinition['inputSchema']
    safetyLevel: ToolDefinition['safetyLevel']
    annotations?: ToolDefinition['annotations']
    /** URL of the page where this tool is registered. */
    pageUrl?: string
  }>
  /** SDK info. */
  sdk?: {
    name: string
    version: string
  }
}

/**
 * Generate a /.well-known/webmcp.json manifest from tool definitions.
 */
export function generateManifest(
  tools: ToolDefinition[],
  site: { name: string; url: string; description?: string; contact?: string },
  options?: { pageUrl?: string }
): WebMCPManifest {
  return {
    version: '1.0',
    site,
    generatedAt: new Date().toISOString(),
    toolCount: tools.length,
    tools: tools.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
      safetyLevel: t.safetyLevel,
      annotations: t.annotations,
      pageUrl: options?.pageUrl,
    })),
    sdk: {
      name: '@webmcpregistry/core',
      version: '0.1.0',
    },
  }
}

// ---------------------------------------------------------------------------
// JSON-LD structured data
// ---------------------------------------------------------------------------

/**
 * Generate JSON-LD structured data for WebMCP tools.
 * Uses Schema.org SoftwareApplication + Action patterns.
 *
 * Embed this in a <script type="application/ld+json"> tag for AI crawlers.
 */
export function generateJsonLd(
  tools: ToolDefinition[],
  site: { name: string; url: string; description?: string }
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: site.name,
    url: site.url,
    description: site.description,
    applicationCategory: 'AI Agent Compatible',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    potentialAction: tools.map((tool) => ({
      '@type': tool.safetyLevel === 'read' ? 'SearchAction' : 'Action',
      name: tool.name,
      description: tool.description,
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${site.url}#webmcp:${tool.name}`,
        actionPlatform: 'https://webmachinelearning.github.io/webmcp/',
      },
      ...(tool.inputSchema.required?.length
        ? {
            'query-input': tool.inputSchema.required
              .map((r) => `required name=${r}`)
              .join(' '),
          }
        : {}),
    })),
  }
}

// ---------------------------------------------------------------------------
// llms.txt
// ---------------------------------------------------------------------------

/**
 * Generate an llms.txt file describing the site's AI capabilities.
 *
 * llms.txt is a proposed standard for sites to describe themselves to AI systems.
 * @see https://llmstxt.org/
 */
export function generateLlmsTxt(
  tools: ToolDefinition[],
  site: { name: string; url: string; description?: string }
): string {
  const lines: string[] = []

  lines.push(`# ${site.name}`)
  lines.push('')
  if (site.description) {
    lines.push(`> ${site.description}`)
    lines.push('')
  }

  lines.push('## AI Agent Capabilities')
  lines.push('')
  lines.push(`This site supports [WebMCP](https://webmachinelearning.github.io/webmcp/) — the W3C browser standard for AI-callable tools.`)
  lines.push('')
  lines.push(`- Manifest: ${site.url}/.well-known/webmcp.json`)
  lines.push(`- Tools: ${tools.length}`)
  lines.push(`- SDK: @webmcpregistry/core`)
  lines.push('')

  lines.push('## Available Tools')
  lines.push('')
  for (const tool of tools) {
    const safety = tool.safetyLevel === 'danger' ? ' ⚠️' : tool.safetyLevel === 'write' ? ' ✏️' : ' 🔍'
    lines.push(`### ${tool.name}${safety}`)
    lines.push('')
    lines.push(tool.description)
    lines.push('')
    if (tool.inputSchema.required?.length) {
      lines.push(`Required inputs: ${tool.inputSchema.required.join(', ')}`)
      lines.push('')
    }
  }

  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// agents.json
// ---------------------------------------------------------------------------

/**
 * Generate an agents.json file — machine-readable agent interaction manifest.
 *
 * This is our proposed format for agent orchestrators to discover
 * what a site can do without loading the page.
 */
export function generateAgentsJson(
  tools: ToolDefinition[],
  site: { name: string; url: string }
): object {
  return {
    schema_version: '1.0',
    site: {
      name: site.name,
      url: site.url,
    },
    protocols: {
      webmcp: {
        supported: true,
        version: 'draft-2026-03-09',
        polyfill: true,
        manifest_url: `${site.url}/.well-known/webmcp.json`,
      },
    },
    tools: tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      safety: tool.safetyLevel,
      inputs: Object.keys(tool.inputSchema.properties ?? {}),
      required_inputs: tool.inputSchema.required ?? [],
      read_only: tool.annotations?.readOnlyHint ?? tool.safetyLevel === 'read',
    })),
    capabilities: {
      search: tools.some((t) => t.name.includes('search') || t.name.includes('find')),
      create: tools.some((t) => t.name.includes('create') || t.name.includes('add')),
      update: tools.some((t) => t.name.includes('update') || t.name.includes('edit')),
      delete: tools.some((t) => t.name.includes('delete') || t.name.includes('remove')),
    },
  }
}
