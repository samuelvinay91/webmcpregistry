/**
 * DOM-based tool auto-detector.
 *
 * Scans the current page's DOM structure to discover elements that can be
 * represented as WebMCP tools: forms, buttons, links, ARIA-labeled regions,
 * and elements with existing WebMCP declarative attributes.
 */

import type { ToolDefinition, ToolInputSchema, ToolPropertySchema, ToolSafetyLevel } from './types.js'

/** Options for the DOM detector. */
export interface DetectorOptions {
  /** Root element to scan (defaults to document.body). */
  root?: Element
  /** Maximum number of tools to generate. */
  maxTools?: number
  /** Include forms as tools. */
  forms?: boolean
  /** Include buttons/links as tools. */
  actions?: boolean
  /** Include elements with existing WebMCP declarative attributes. */
  declarative?: boolean
}

const DEFAULT_OPTIONS: Required<DetectorOptions> = {
  root: typeof document !== 'undefined' ? document.body : (null as unknown as Element),
  maxTools: 20,
  forms: true,
  actions: true,
  declarative: true,
}

/**
 * Scan the DOM and return auto-detected tool definitions.
 */
export function detectTools(options?: DetectorOptions): ToolDefinition[] {
  if (typeof document === 'undefined') return []

  const opts = { ...DEFAULT_OPTIONS, ...options }
  const root = opts.root ?? document.body
  if (!root) return []

  const tools: ToolDefinition[] = []

  // 1. Detect existing WebMCP declarative attributes (highest priority)
  if (opts.declarative) {
    tools.push(...detectDeclarativeTools(root))
  }

  // 2. Detect forms
  if (opts.forms) {
    tools.push(...detectFormTools(root))
  }

  // 3. Detect action buttons/links
  if (opts.actions) {
    tools.push(...detectActionTools(root))
  }

  // Deduplicate by name, keep first occurrence
  const seen = new Set<string>()
  const unique = tools.filter((t) => {
    if (seen.has(t.name)) return false
    seen.add(t.name)
    return true
  })

  return unique.slice(0, opts.maxTools)
}

// ---------------------------------------------------------------------------
// Declarative WebMCP detection
// ---------------------------------------------------------------------------

function detectDeclarativeTools(root: Element): ToolDefinition[] {
  const tools: ToolDefinition[] = []
  const elements = root.querySelectorAll('[toolname]')

  for (const el of elements) {
    const name = el.getAttribute('toolname')
    if (!name) continue

    const description =
      el.getAttribute('tooldescription') ??
      `Tool: ${name}`

    const inputSchema = buildSchemaFromDeclarativeElement(el)
    const safetyLevel = inferSafetyFromElement(el)

    tools.push({
      name,
      description,
      inputSchema,
      safetyLevel,
    })
  }

  return tools
}

function buildSchemaFromDeclarativeElement(el: Element): ToolInputSchema {
  const properties: Record<string, { type: 'string'; description?: string }> = {}
  const required: string[] = []

  // Look for child inputs with toolparamdescription
  const inputs = el.querySelectorAll('input, textarea, select')
  for (const input of inputs) {
    const inputEl = input as HTMLInputElement
    const paramName =
      inputEl.name ||
      inputEl.id ||
      inputEl.getAttribute('aria-label')?.toLowerCase().replace(/\s+/g, '_')

    if (!paramName) continue

    properties[paramName] = {
      type: 'string',
      description:
        inputEl.getAttribute('toolparamdescription') ??
        inputEl.getAttribute('aria-label') ??
        inputEl.getAttribute('placeholder') ??
        undefined,
    }

    if (inputEl.required) {
      required.push(paramName)
    }
  }

  return { type: 'object', properties, required: required.length > 0 ? required : undefined }
}

// ---------------------------------------------------------------------------
// Form detection
// ---------------------------------------------------------------------------

function detectFormTools(root: Element): ToolDefinition[] {
  const tools: ToolDefinition[] = []
  const forms = root.querySelectorAll('form')

  for (const form of forms) {
    // Skip forms that already have toolname (handled by declarative detector)
    if (form.hasAttribute('toolname')) continue

    const name = inferToolNameFromForm(form)
    if (!name) continue

    const description = inferDescriptionFromForm(form)
    const inputSchema = buildSchemaFromForm(form)
    const safetyLevel = inferSafetyFromForm(form)

    tools.push({ name, description, inputSchema, safetyLevel })
  }

  return tools
}

function inferToolNameFromForm(form: HTMLFormElement): string | null {
  // Try form id, name, action path, or aria-label
  const candidates = [
    form.id,
    form.name,
    form.getAttribute('aria-label'),
  ].filter(Boolean)

  // Try action URL path
  if (form.action) {
    try {
      const path = new URL(form.action, window.location.origin).pathname
      const segment = path.split('/').filter(Boolean).pop()
      if (segment) candidates.push(segment)
    } catch {
      // Invalid URL, skip
    }
  }

  // Try submit button text
  const submitBtn = form.querySelector('[type="submit"], button:not([type])')
  if (submitBtn?.textContent) {
    candidates.push(submitBtn.textContent.trim())
  }

  const raw = candidates[0]
  if (!raw) return null

  return toSnakeCase(raw)
}

function inferDescriptionFromForm(form: HTMLFormElement): string {
  // Try aria-label, title, or nearby heading
  const label = form.getAttribute('aria-label') ?? form.title
  if (label) return label

  // Look for a heading before or inside the form
  const heading =
    form.querySelector('h1, h2, h3, h4, h5, h6, legend') ??
    form.previousElementSibling
  if (heading?.textContent) {
    return heading.textContent.trim()
  }

  return `Submit the ${form.name || form.id || 'form'}`
}

function buildSchemaFromForm(form: HTMLFormElement): ToolInputSchema {
  const properties: Record<string, ToolPropertySchema> = {}
  const required: string[] = []

  const inputs = form.querySelectorAll('input, textarea, select')
  for (const input of inputs) {
    const inputEl = input as HTMLInputElement
    // Skip hidden, submit, button types
    if (['hidden', 'submit', 'button', 'reset', 'image'].includes(inputEl.type)) continue

    const paramName =
      inputEl.name ||
      inputEl.id ||
      inputEl.getAttribute('aria-label')?.toLowerCase().replace(/\s+/g, '_')
    if (!paramName) continue

    const prop: ToolPropertySchema = {
      type: htmlInputTypeToJsonType(inputEl.type),
      description:
        inputEl.getAttribute('aria-label') ??
        inputEl.getAttribute('placeholder') ??
        labelForInput(form, inputEl) ??
        undefined,
    }

    // For select elements, capture options as enum
    if (input.tagName === 'SELECT') {
      const options = Array.from((input as HTMLSelectElement).options)
        .map((o) => o.value)
        .filter((v) => v !== '')
      if (options.length > 0 && options.length <= 20) {
        prop.enum = options
      }
    }

    properties[paramName] = prop

    if (inputEl.required) {
      required.push(paramName)
    }
  }

  return { type: 'object', properties, required: required.length > 0 ? required : undefined }
}

function inferSafetyFromForm(form: HTMLFormElement): ToolSafetyLevel {
  const method = (form.method ?? 'get').toLowerCase()
  if (method === 'get') return 'read'
  return inferSafetyFromElement(form)
}

// ---------------------------------------------------------------------------
// Action (button/link) detection
// ---------------------------------------------------------------------------

function detectActionTools(root: Element): ToolDefinition[] {
  const tools: ToolDefinition[] = []

  // Find standalone buttons and significant links (not inside forms)
  const buttons = root.querySelectorAll(
    'button:not(form button), a[role="button"], [role="button"]'
  )

  for (const btn of buttons) {
    const text = btn.textContent?.trim()
    if (!text || text.length < 2 || text.length > 50) continue

    const name = toSnakeCase(text)
    if (!name || name.length < 3) continue

    tools.push({
      name,
      description: btn.getAttribute('aria-label') ?? `Perform action: ${text}`,
      inputSchema: { type: 'object', properties: {} },
      safetyLevel: inferSafetyFromElement(btn),
    })
  }

  return tools
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function inferSafetyFromElement(el: Element): ToolSafetyLevel {
  const text = (el.textContent ?? '').toLowerCase()
  const ariaLabel = (el.getAttribute('aria-label') ?? '').toLowerCase()
  const combined = `${text} ${ariaLabel}`

  const dangerKeywords = ['delete', 'remove', 'destroy', 'purchase', 'pay', 'checkout', 'transfer', 'cancel subscription']
  const writeKeywords = ['add', 'create', 'update', 'edit', 'save', 'submit', 'post', 'send', 'upload', 'subscribe']

  if (dangerKeywords.some((k) => combined.includes(k))) return 'danger'
  if (writeKeywords.some((k) => combined.includes(k))) return 'write'
  return 'read'
}

function htmlInputTypeToJsonType(htmlType: string): ToolPropertySchema['type'] {
  switch (htmlType) {
    case 'number':
    case 'range':
      return 'number'
    case 'checkbox':
      return 'boolean'
    default:
      return 'string'
  }
}

function labelForInput(form: HTMLFormElement, input: HTMLInputElement): string | null {
  const id = input.id
  if (!id) return null
  const label = form.querySelector(`label[for="${id}"]`)
  return label?.textContent?.trim() ?? null
}

function toSnakeCase(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s_]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
}
