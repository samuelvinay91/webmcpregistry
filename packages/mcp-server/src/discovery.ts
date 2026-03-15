/**
 * Tool discovery — finds WebMCP tools on a page using multiple strategies.
 *
 * Strategy 1: Live browser — evaluate navigator.modelContext.getTools() (most accurate)
 * Strategy 2: HTML extraction — parse declarative toolname attributes + registerTool calls
 * Strategy 3: DOM inference — detect forms, buttons, and interactive elements
 */

import type { Page } from 'playwright'
import type { ToolDefinition, ToolInputSchema } from '@webmcpregistry/core'

export interface DiscoveredTool {
  definition: ToolDefinition
  sourceUrl: string
  discoveryMethod: 'live-api' | 'declarative' | 'imperative' | 'inferred'
  /** Whether this tool can be executed (has a live handler in the browser). */
  executable: boolean
}

/**
 * Discover all WebMCP tools on a page using all available strategies.
 */
export async function discoverTools(page: Page): Promise<DiscoveredTool[]> {
  const url = page.url()
  const tools: DiscoveredTool[] = []

  // Strategy 1: Live browser API (most accurate — gets tools with execute callbacks)
  const liveTools = await discoverFromLiveAPI(page)
  tools.push(...liveTools.map((t) => ({
    definition: t,
    sourceUrl: url,
    discoveryMethod: 'live-api' as const,
    executable: true,
  })))

  // If live API found tools, that's authoritative — don't duplicate with HTML extraction
  if (tools.length > 0) return tools

  // Strategy 2+3: Fall back to HTML extraction
  const html = await page.content()
  const htmlTools = extractFromHTML(html, url)
  tools.push(...htmlTools)

  return tools
}

/**
 * Strategy 1: Discover tools via navigator.modelContext.getTools()
 */
async function discoverFromLiveAPI(page: Page): Promise<ToolDefinition[]> {
  try {
    const rawTools = await page.evaluate(async () => {
      const mc = (navigator as any).modelContext
      if (!mc || typeof mc.getTools !== 'function') return []

      const tools = mc.getTools()
      // Serialize tool definitions (execute callbacks can't be serialized)
      return tools.map((t: any) => ({
        name: t.name ?? '',
        description: t.description ?? '',
        inputSchema: t.inputSchema ?? { type: 'object', properties: {} },
        safetyLevel: t.safetyLevel ?? 'read',
        annotations: t.annotations ?? {},
      }))
    })

    return rawTools as ToolDefinition[]
  } catch {
    return []
  }
}

/**
 * Strategy 2+3: Extract tools from HTML (declarative attributes + registerTool calls + forms)
 */
function extractFromHTML(html: string, url: string): DiscoveredTool[] {
  const tools: DiscoveredTool[] = []
  const seenNames = new Set<string>()

  // Declarative: toolname attributes
  const declarativeRegex = /toolname=["']([^"']+)["']/gi
  let match
  while ((match = declarativeRegex.exec(html)) !== null) {
    const name = match[1]!
    if (seenNames.has(name)) continue
    seenNames.add(name)

    const nearby = html.slice(Math.max(0, match.index - 500), match.index + 500)
    const descMatch = nearby.match(/tooldescription=["']([^"']+)["']/i)

    tools.push({
      definition: {
        name,
        description: descMatch?.[1] ?? `Tool: ${name}`,
        inputSchema: extractSchemaFromContext(nearby),
        safetyLevel: inferSafety(name, nearby),
      },
      sourceUrl: url,
      discoveryMethod: 'declarative',
      executable: false,
    })
  }

  // Imperative: registerTool calls in scripts
  const imperativeRegex = /registerTool\s*\(\s*\{[^}]*name:\s*["']([^"']+)["']/gi
  while ((match = imperativeRegex.exec(html)) !== null) {
    const name = match[1]!
    if (seenNames.has(name)) continue
    seenNames.add(name)

    const nearby = html.slice(match.index, match.index + 500)
    const descMatch = nearby.match(/description:\s*["']([^"']+)["']/i)

    tools.push({
      definition: {
        name,
        description: descMatch?.[1] ?? `Registered tool: ${name}`,
        inputSchema: { type: 'object', properties: {} },
        safetyLevel: inferSafety(name, nearby),
      },
      sourceUrl: url,
      discoveryMethod: 'imperative',
      executable: false,
    })
  }

  return tools
}

function extractSchemaFromContext(html: string): ToolInputSchema {
  const properties: Record<string, { type: 'string'; description?: string }> = {}
  const required: string[] = []
  const inputRegex = /name=["']([^"']+)["']/gi
  let match
  while ((match = inputRegex.exec(html)) !== null) {
    const name = match[1]!
    if (['submit', 'action', 'method'].includes(name)) continue
    const descMatch = html.match(new RegExp(`toolparamdescription=["']([^"']+)["']`, 'i'))
    properties[name] = { type: 'string', description: descMatch?.[1] }
    if (html.includes('required')) required.push(name)
  }
  return { type: 'object', properties, required: required.length > 0 ? required : undefined }
}

function inferSafety(name: string, context: string): 'read' | 'write' | 'danger' {
  const text = `${name} ${context}`.toLowerCase()
  if (['delete', 'remove', 'destroy', 'purchase', 'pay', 'checkout'].some((k) => text.includes(k))) return 'danger'
  if (['add', 'create', 'update', 'edit', 'save', 'submit', 'post'].some((k) => text.includes(k))) return 'write'
  return 'read'
}
