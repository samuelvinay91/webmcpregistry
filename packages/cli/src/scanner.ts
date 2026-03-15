/**
 * Static page scanner for the CLI.
 * Fetches HTML and extracts WebMCP signals without a full browser.
 */

import type { ToolDefinition, ToolInputSchema } from '@webmcpregistry/core'

export interface DetectionInfo {
  hasWebMCP: boolean
  hasNativeAPI: boolean
  hasPolyfill: boolean
  hasDeclarative: boolean
  toolNames: string[]
}

/**
 * Fetch a page's HTML content.
 */
export async function fetchPage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'WebMCPRegistry-CLI/0.1.0 (+https://webmcpregistry.com)',
        Accept: 'text/html',
      },
      signal: AbortSignal.timeout(15000),
      redirect: 'follow',
    })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

/**
 * Check if the site has a .well-known/webmcp manifest.
 */
export async function checkManifest(url: string): Promise<boolean> {
  try {
    const origin = new URL(url).origin
    const res = await fetch(`${origin}/.well-known/webmcp`, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
    })
    return res.ok
  } catch {
    return false
  }
}

/**
 * Extract WebMCP tool definitions from raw HTML.
 */
export function extractToolsFromHTML(
  html: string,
  url: string
): { tools: ToolDefinition[]; detection: DetectionInfo } {
  const lower = html.toLowerCase()
  const tools: ToolDefinition[] = []
  const toolNames: string[] = []

  // Detect API presence signals
  const hasRegisterTool = lower.includes('registertool')
  const hasModelContext = lower.includes('navigator.modelcontext') || lower.includes('modelcontext')
  const hasPolyfillRef = lower.includes('@mcp-b/global') || lower.includes('webmcp-polyfill')
  const hasDeclarativeAttrs = lower.includes('toolname=')

  // Extract declarative tools from HTML attributes
  const declarativeRegex = /toolname=["']([^"']+)["']/gi
  let match
  while ((match = declarativeRegex.exec(html)) !== null) {
    const name = match[1]!
    toolNames.push(name)

    // Try to find associated tooldescription
    const nearbyHTML = html.slice(Math.max(0, match.index - 500), match.index + 500)
    const descMatch = nearbyHTML.match(/tooldescription=["']([^"']+)["']/i)

    tools.push({
      name,
      description: descMatch?.[1] ?? `Tool: ${name}`,
      inputSchema: extractSchemaFromNearbyHTML(nearbyHTML),
      safetyLevel: 'read',
    })
  }

  // Extract from registerTool calls
  const registerRegex = /registerTool\s*\(\s*\{[^}]*name:\s*["']([^"']+)["']/gi
  while ((match = registerRegex.exec(html)) !== null) {
    const name = match[1]!
    if (!toolNames.includes(name)) {
      toolNames.push(name)
      tools.push({
        name,
        description: `Registered tool: ${name}`,
        inputSchema: { type: 'object', properties: {} },
        safetyLevel: 'read',
      })
    }
  }

  const detection: DetectionInfo = {
    hasWebMCP: hasModelContext || hasRegisterTool || hasDeclarativeAttrs,
    hasNativeAPI: hasModelContext && !hasPolyfillRef,
    hasPolyfill: hasPolyfillRef,
    hasDeclarative: hasDeclarativeAttrs,
    toolNames,
  }

  return { tools, detection }
}

function extractSchemaFromNearbyHTML(html: string): ToolInputSchema {
  const properties: Record<string, { type: 'string'; description?: string }> = {}
  const required: string[] = []

  // Find input elements near the toolname
  const inputRegex = /name=["']([^"']+)["']/gi
  let match
  while ((match = inputRegex.exec(html)) !== null) {
    const name = match[1]!
    if (['submit', 'action', 'method'].includes(name)) continue

    const descRegex = new RegExp(`toolparamdescription=["']([^"']+)["']`, 'i')
    const descMatch = html.match(descRegex)

    properties[name] = {
      type: 'string',
      description: descMatch?.[1],
    }

    if (html.includes(`required`) && html.includes(name)) {
      required.push(name)
    }
  }

  return {
    type: 'object',
    properties,
    required: required.length > 0 ? required : undefined,
  }
}
