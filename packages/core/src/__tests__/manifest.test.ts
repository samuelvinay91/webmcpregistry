import { describe, it, expect } from 'vitest'
import { generateManifest, generateJsonLd, generateLlmsTxt, generateAgentsJson } from '../manifest.js'
import type { ToolDefinition } from '../types.js'

function makeTool(overrides: Partial<ToolDefinition> = {}): ToolDefinition {
  return {
    name: 'search_products',
    description: 'Search the product catalog by keyword, category, or price range',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search keywords' },
      },
      required: ['query'],
    },
    safetyLevel: 'read',
    ...overrides,
  }
}

const SITE = { name: 'Test Store', url: 'https://example.com', description: 'An example store' }

// ---------------------------------------------------------------------------
// generateManifest
// ---------------------------------------------------------------------------

describe('generateManifest', () => {
  it('produces a manifest with correct top-level structure', () => {
    const manifest = generateManifest([makeTool()], SITE)
    expect(manifest.version).toBe('1.0')
    expect(manifest.site).toEqual(SITE)
    expect(manifest.toolCount).toBe(1)
    expect(manifest.tools).toHaveLength(1)
    expect(manifest.sdk).toBeDefined()
    expect(manifest.sdk!.name).toBe('@webmcpregistry/core')
  })

  it('includes a valid ISO generatedAt timestamp', () => {
    const manifest = generateManifest([makeTool()], SITE)
    expect(() => new Date(manifest.generatedAt)).not.toThrow()
    expect(new Date(manifest.generatedAt).toISOString()).toBe(manifest.generatedAt)
  })

  it('maps tool fields correctly', () => {
    const tool = makeTool({ annotations: { readOnlyHint: true } })
    const manifest = generateManifest([tool], SITE)
    const entry = manifest.tools[0]!
    expect(entry.name).toBe('search_products')
    expect(entry.description).toBe(tool.description)
    expect(entry.inputSchema).toEqual(tool.inputSchema)
    expect(entry.safetyLevel).toBe('read')
    expect(entry.annotations).toEqual({ readOnlyHint: true })
  })

  it('sets pageUrl on every tool when provided in options', () => {
    const manifest = generateManifest([makeTool()], SITE, { pageUrl: 'https://example.com/shop' })
    expect(manifest.tools[0]!.pageUrl).toBe('https://example.com/shop')
  })

  it('returns an empty tools array and toolCount 0 for no tools', () => {
    const manifest = generateManifest([], SITE)
    expect(manifest.tools).toEqual([])
    expect(manifest.toolCount).toBe(0)
  })

  it('handles multiple tools with different safety levels', () => {
    const tools = [
      makeTool({ name: 'search_items', safetyLevel: 'read' }),
      makeTool({ name: 'create_order', safetyLevel: 'write' }),
      makeTool({ name: 'delete_account', safetyLevel: 'danger' }),
    ]
    const manifest = generateManifest(tools, SITE)
    expect(manifest.toolCount).toBe(3)
    expect(manifest.tools.map((t) => t.safetyLevel)).toEqual(['read', 'write', 'danger'])
  })
})

// ---------------------------------------------------------------------------
// generateJsonLd
// ---------------------------------------------------------------------------

describe('generateJsonLd', () => {
  it('produces a Schema.org WebApplication structure', () => {
    const ld = generateJsonLd([makeTool()], SITE) as Record<string, unknown>
    expect(ld['@context']).toBe('https://schema.org')
    expect(ld['@type']).toBe('WebApplication')
    expect(ld['name']).toBe(SITE.name)
    expect(ld['url']).toBe(SITE.url)
    expect(ld['description']).toBe(SITE.description)
    expect(ld['applicationCategory']).toBe('AI Agent Compatible')
  })

  it('maps read tools to SearchAction type', () => {
    const ld = generateJsonLd([makeTool({ safetyLevel: 'read' })], SITE) as Record<string, unknown>
    const actions = ld['potentialAction'] as Array<Record<string, unknown>>
    expect(actions[0]!['@type']).toBe('SearchAction')
  })

  it('maps write tools to generic Action type', () => {
    const ld = generateJsonLd([makeTool({ name: 'create_order', safetyLevel: 'write' })], SITE) as Record<string, unknown>
    const actions = ld['potentialAction'] as Array<Record<string, unknown>>
    expect(actions[0]!['@type']).toBe('Action')
  })

  it('maps danger tools to generic Action type', () => {
    const ld = generateJsonLd([makeTool({ name: 'delete_account', safetyLevel: 'danger' })], SITE) as Record<string, unknown>
    const actions = ld['potentialAction'] as Array<Record<string, unknown>>
    expect(actions[0]!['@type']).toBe('Action')
  })

  it('builds correct EntryPoint target with tool name', () => {
    const ld = generateJsonLd([makeTool()], SITE) as Record<string, unknown>
    const actions = ld['potentialAction'] as Array<Record<string, unknown>>
    const target = actions[0]!['target'] as Record<string, unknown>
    expect(target['@type']).toBe('EntryPoint')
    expect(target['urlTemplate']).toBe('https://example.com#webmcp:search_products')
    expect(target['actionPlatform']).toBe('https://webmachinelearning.github.io/webmcp/')
  })

  it('includes query-input for tools with required fields', () => {
    const ld = generateJsonLd([makeTool()], SITE) as Record<string, unknown>
    const actions = ld['potentialAction'] as Array<Record<string, unknown>>
    expect(actions[0]!['query-input']).toBe('required name=query')
  })

  it('omits query-input when no required fields', () => {
    const tool = makeTool({ inputSchema: { type: 'object', properties: { q: { type: 'string' } } } })
    const ld = generateJsonLd([tool], SITE) as Record<string, unknown>
    const actions = ld['potentialAction'] as Array<Record<string, unknown>>
    expect(actions[0]!['query-input']).toBeUndefined()
  })

  it('returns empty potentialAction for no tools', () => {
    const ld = generateJsonLd([], SITE) as Record<string, unknown>
    expect(ld['potentialAction']).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// generateLlmsTxt
// ---------------------------------------------------------------------------

describe('generateLlmsTxt', () => {
  it('starts with a markdown heading of the site name', () => {
    const txt = generateLlmsTxt([makeTool()], SITE)
    expect(txt.startsWith('# Test Store\n')).toBe(true)
  })

  it('includes the site description as a blockquote', () => {
    const txt = generateLlmsTxt([makeTool()], SITE)
    expect(txt).toContain('> An example store')
  })

  it('omits description blockquote when description is absent', () => {
    const txt = generateLlmsTxt([makeTool()], { name: 'Test', url: 'https://test.com' })
    expect(txt).not.toContain('> ')
  })

  it('includes manifest URL', () => {
    const txt = generateLlmsTxt([makeTool()], SITE)
    expect(txt).toContain('https://example.com/.well-known/webmcp.json')
  })

  it('lists the tool count', () => {
    const txt = generateLlmsTxt([makeTool()], SITE)
    expect(txt).toContain('Tools: 1')
  })

  it('includes tool section with name as heading', () => {
    const txt = generateLlmsTxt([makeTool()], SITE)
    expect(txt).toContain('### search_products')
  })

  it('includes required inputs for a tool', () => {
    const txt = generateLlmsTxt([makeTool()], SITE)
    expect(txt).toContain('Required inputs: query')
  })

  it('omits required inputs line when none are required', () => {
    const tool = makeTool({ inputSchema: { type: 'object', properties: {} } })
    const txt = generateLlmsTxt([tool], SITE)
    expect(txt).not.toContain('Required inputs:')
  })

  it('produces valid output for empty tools array', () => {
    const txt = generateLlmsTxt([], SITE)
    expect(txt).toContain('# Test Store')
    expect(txt).toContain('Tools: 0')
    expect(txt).not.toContain('###')
  })

  it('uses correct emoji per safety level', () => {
    const tools = [
      makeTool({ name: 'read_tool', safetyLevel: 'read' }),
      makeTool({ name: 'write_tool', safetyLevel: 'write' }),
      makeTool({ name: 'danger_tool', safetyLevel: 'danger' }),
    ]
    const txt = generateLlmsTxt(tools, SITE)
    // Read tools should not have write/danger emoji
    expect(txt).toMatch(/### read_tool.*🔍/)
    expect(txt).toMatch(/### write_tool.*✏️/)
    expect(txt).toMatch(/### danger_tool.*⚠️/)
  })
})

// ---------------------------------------------------------------------------
// generateAgentsJson
// ---------------------------------------------------------------------------

describe('generateAgentsJson', () => {
  it('produces correct top-level structure', () => {
    const json = generateAgentsJson([makeTool()], SITE) as Record<string, unknown>
    expect(json['schema_version']).toBe('1.0')
    expect(json['site']).toEqual({ name: SITE.name, url: SITE.url })
  })

  it('includes webmcp protocol info', () => {
    const json = generateAgentsJson([makeTool()], SITE) as Record<string, unknown>
    const protocols = json['protocols'] as Record<string, Record<string, unknown>>
    expect(protocols['webmcp']!['supported']).toBe(true)
    expect(protocols['webmcp']!['polyfill']).toBe(true)
    expect(protocols['webmcp']!['manifest_url']).toBe('https://example.com/.well-known/webmcp.json')
  })

  it('maps tools with correct fields', () => {
    const json = generateAgentsJson([makeTool()], SITE) as Record<string, unknown>
    const tools = json['tools'] as Array<Record<string, unknown>>
    expect(tools).toHaveLength(1)
    expect(tools[0]!['name']).toBe('search_products')
    expect(tools[0]!['safety']).toBe('read')
    expect(tools[0]!['inputs']).toEqual(['query'])
    expect(tools[0]!['required_inputs']).toEqual(['query'])
    expect(tools[0]!['read_only']).toBe(true)
  })

  it('respects readOnlyHint annotation over safetyLevel', () => {
    const tool = makeTool({ safetyLevel: 'write', annotations: { readOnlyHint: true } })
    const json = generateAgentsJson([tool], SITE) as Record<string, unknown>
    const tools = json['tools'] as Array<Record<string, unknown>>
    expect(tools[0]!['read_only']).toBe(true)
  })

  it('sets read_only false for write tools without annotation', () => {
    const tool = makeTool({ name: 'create_item', safetyLevel: 'write' })
    const json = generateAgentsJson([tool], SITE) as Record<string, unknown>
    const tools = json['tools'] as Array<Record<string, unknown>>
    expect(tools[0]!['read_only']).toBe(false)
  })

  it('returns empty tools array for no tools', () => {
    const json = generateAgentsJson([], SITE) as Record<string, unknown>
    const tools = json['tools'] as Array<Record<string, unknown>>
    expect(tools).toEqual([])
  })

  it('detects search capability', () => {
    const json = generateAgentsJson([makeTool({ name: 'search_products' })], SITE) as Record<string, unknown>
    const caps = json['capabilities'] as Record<string, boolean>
    expect(caps['search']).toBe(true)
    expect(caps['create']).toBe(false)
    expect(caps['update']).toBe(false)
    expect(caps['delete']).toBe(false)
  })

  it('detects create capability', () => {
    const json = generateAgentsJson([makeTool({ name: 'create_order', safetyLevel: 'write' })], SITE) as Record<string, unknown>
    const caps = json['capabilities'] as Record<string, boolean>
    expect(caps['create']).toBe(true)
  })

  it('detects update capability', () => {
    const json = generateAgentsJson([makeTool({ name: 'update_profile', safetyLevel: 'write' })], SITE) as Record<string, unknown>
    const caps = json['capabilities'] as Record<string, boolean>
    expect(caps['update']).toBe(true)
  })

  it('detects delete capability', () => {
    const json = generateAgentsJson([makeTool({ name: 'delete_account', safetyLevel: 'danger' })], SITE) as Record<string, unknown>
    const caps = json['capabilities'] as Record<string, boolean>
    expect(caps['delete']).toBe(true)
  })

  it('detects find as search capability', () => {
    const json = generateAgentsJson([makeTool({ name: 'find_user' })], SITE) as Record<string, unknown>
    const caps = json['capabilities'] as Record<string, boolean>
    expect(caps['search']).toBe(true)
  })

  it('detects add as create capability', () => {
    const json = generateAgentsJson([makeTool({ name: 'add_item', safetyLevel: 'write' })], SITE) as Record<string, unknown>
    const caps = json['capabilities'] as Record<string, boolean>
    expect(caps['create']).toBe(true)
  })

  it('detects edit as update capability', () => {
    const json = generateAgentsJson([makeTool({ name: 'edit_post', safetyLevel: 'write' })], SITE) as Record<string, unknown>
    const caps = json['capabilities'] as Record<string, boolean>
    expect(caps['update']).toBe(true)
  })

  it('detects remove as delete capability', () => {
    const json = generateAgentsJson([makeTool({ name: 'remove_item', safetyLevel: 'danger' })], SITE) as Record<string, unknown>
    const caps = json['capabilities'] as Record<string, boolean>
    expect(caps['delete']).toBe(true)
  })

  it('reports all capabilities false for empty tools', () => {
    const json = generateAgentsJson([], SITE) as Record<string, unknown>
    const caps = json['capabilities'] as Record<string, boolean>
    expect(caps['search']).toBe(false)
    expect(caps['create']).toBe(false)
    expect(caps['update']).toBe(false)
    expect(caps['delete']).toBe(false)
  })

  it('handles tools with no properties in inputSchema', () => {
    const tool = makeTool({ inputSchema: { type: 'object' } })
    const json = generateAgentsJson([tool], SITE) as Record<string, unknown>
    const tools = json['tools'] as Array<Record<string, unknown>>
    expect(tools[0]!['inputs']).toEqual([])
  })

  it('handles tools with no required fields in inputSchema', () => {
    const tool = makeTool({
      inputSchema: { type: 'object', properties: { q: { type: 'string' } } },
    })
    const json = generateAgentsJson([tool], SITE) as Record<string, unknown>
    const tools = json['tools'] as Array<Record<string, unknown>>
    expect(tools[0]!['required_inputs']).toEqual([])
  })
})
