import { describe, it, expect, beforeEach } from 'vitest'
import { detectTools } from '../detector.js'

function resetModelContext(): void {
  if (globalThis.navigator?.modelContext) {
    Object.defineProperty(globalThis.navigator, 'modelContext', {
      value: undefined,
      writable: true,
      configurable: true,
    })
  }
}

function clearBody(): void {
  document.body.innerHTML = ''
}

// ---------------------------------------------------------------------------
// detectTools — basic behavior
// ---------------------------------------------------------------------------

describe('detectTools', () => {
  beforeEach(() => {
    resetModelContext()
    clearBody()
  })

  it('returns empty array when body has no detectable elements', () => {
    const tools = detectTools()
    expect(tools).toEqual([])
  })

  it('returns empty array with an empty root element', () => {
    const root = document.createElement('div')
    const tools = detectTools({ root })
    expect(tools).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// Declarative attribute detection
// ---------------------------------------------------------------------------

describe('detectTools — declarative attributes', () => {
  beforeEach(() => {
    resetModelContext()
    clearBody()
  })

  it('detects an element with toolname attribute', () => {
    const div = document.createElement('div')
    div.setAttribute('toolname', 'my_tool')
    div.setAttribute('tooldescription', 'Does something useful')
    document.body.appendChild(div)

    const tools = detectTools()
    expect(tools).toHaveLength(1)
    expect(tools[0]!.name).toBe('my_tool')
    expect(tools[0]!.description).toBe('Does something useful')
  })

  it('uses a default description when tooldescription is absent', () => {
    const div = document.createElement('div')
    div.setAttribute('toolname', 'bare_tool')
    document.body.appendChild(div)

    const tools = detectTools()
    expect(tools).toHaveLength(1)
    expect(tools[0]!.description).toBe('Tool: bare_tool')
  })

  it('detects multiple declarative tools', () => {
    for (const name of ['tool_a', 'tool_b', 'tool_c']) {
      const el = document.createElement('div')
      el.setAttribute('toolname', name)
      el.setAttribute('tooldescription', `Description for ${name}`)
      document.body.appendChild(el)
    }

    const tools = detectTools()
    expect(tools).toHaveLength(3)
    expect(tools.map((t) => t.name)).toEqual(['tool_a', 'tool_b', 'tool_c'])
  })

  it('builds input schema from child inputs', () => {
    const div = document.createElement('div')
    div.setAttribute('toolname', 'form_tool')
    div.setAttribute('tooldescription', 'A tool with inputs')

    const input = document.createElement('input')
    input.name = 'query'
    input.setAttribute('toolparamdescription', 'Search query')
    div.appendChild(input)

    document.body.appendChild(div)

    const tools = detectTools()
    expect(tools).toHaveLength(1)
    const schema = tools[0]!.inputSchema!
    expect(schema.properties).toBeDefined()
    expect(schema.properties!['query']).toBeDefined()
    expect(schema.properties!['query']!.description).toBe('Search query')
  })

  it('marks required inputs from the required attribute', () => {
    const div = document.createElement('div')
    div.setAttribute('toolname', 'required_tool')
    div.setAttribute('tooldescription', 'Tool with required field')

    const input = document.createElement('input')
    input.name = 'email'
    input.required = true
    div.appendChild(input)

    document.body.appendChild(div)

    const tools = detectTools()
    expect(tools[0]!.inputSchema!.required).toContain('email')
  })

  it('does not include required array when no inputs are required', () => {
    const div = document.createElement('div')
    div.setAttribute('toolname', 'optional_tool')
    div.setAttribute('tooldescription', 'Tool with optional field')

    const input = document.createElement('input')
    input.name = 'note'
    div.appendChild(input)

    document.body.appendChild(div)

    const tools = detectTools()
    expect(tools[0]!.inputSchema!.required).toBeUndefined()
  })

  it('infers input name from aria-label when name and id are absent', () => {
    const div = document.createElement('div')
    div.setAttribute('toolname', 'aria_tool')
    div.setAttribute('tooldescription', 'Aria labeled')

    const input = document.createElement('input')
    input.setAttribute('aria-label', 'Search Query')
    div.appendChild(input)

    document.body.appendChild(div)

    const tools = detectTools()
    const props = tools[0]!.inputSchema!.properties!
    // aria-label "Search Query" -> "search_query"
    expect(props['search_query']).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// Form detection
// ---------------------------------------------------------------------------

describe('detectTools — form detection', () => {
  beforeEach(() => {
    resetModelContext()
    clearBody()
  })

  it('detects a form with an id as a tool', () => {
    const form = document.createElement('form')
    form.id = 'search-form'
    form.method = 'get'
    document.body.appendChild(form)

    const tools = detectTools()
    expect(tools.length).toBeGreaterThanOrEqual(1)
    // "search-form" -> toSnakeCase removes '-' (non-alnum/space/_) -> "searchform"
    const formTool = tools.find((t) => t.name === 'searchform')
    expect(formTool).toBeDefined()
  })

  it('skips forms that have a toolname attribute', () => {
    const form = document.createElement('form')
    form.id = 'my-form'
    form.setAttribute('toolname', 'custom_tool')
    form.setAttribute('tooldescription', 'Custom tool from form')
    document.body.appendChild(form)

    const tools = detectTools()
    // Should be detected by declarative, not by form detector
    expect(tools.filter((t) => t.name === 'custom_tool')).toHaveLength(1)
    // The form detector should not create a second tool from the same form
    expect(tools.filter((t) => t.name === 'my_form' || t.name === 'myform')).toHaveLength(0)
  })

  it('infers read safety from GET forms', () => {
    const form = document.createElement('form')
    form.id = 'lookup'
    form.method = 'get'
    document.body.appendChild(form)

    const tools = detectTools()
    const formTool = tools.find((t) => t.name === 'lookup')
    expect(formTool).toBeDefined()
    expect(formTool!.safetyLevel).toBe('read')
  })

  it('builds schema from form inputs', () => {
    const form = document.createElement('form')
    form.id = 'register'
    form.method = 'post'

    const nameInput = document.createElement('input')
    nameInput.name = 'username'
    nameInput.required = true
    form.appendChild(nameInput)

    const emailInput = document.createElement('input')
    emailInput.name = 'email'
    form.appendChild(emailInput)

    document.body.appendChild(form)

    const tools = detectTools()
    const formTool = tools.find((t) => t.name === 'register')
    expect(formTool).toBeDefined()
    expect(formTool!.inputSchema!.properties!['username']).toBeDefined()
    expect(formTool!.inputSchema!.properties!['email']).toBeDefined()
    expect(formTool!.inputSchema!.required).toContain('username')
  })

  it('skips hidden and submit inputs when building schema', () => {
    const form = document.createElement('form')
    form.id = 'order'

    const hidden = document.createElement('input')
    hidden.type = 'hidden'
    hidden.name = 'csrf'
    form.appendChild(hidden)

    const submit = document.createElement('input')
    submit.type = 'submit'
    submit.name = 'go'
    form.appendChild(submit)

    const visible = document.createElement('input')
    visible.name = 'item'
    visible.type = 'text'
    form.appendChild(visible)

    document.body.appendChild(form)

    const tools = detectTools()
    const formTool = tools.find((t) => t.name === 'order')
    expect(formTool).toBeDefined()
    expect(formTool!.inputSchema!.properties!['csrf']).toBeUndefined()
    expect(formTool!.inputSchema!.properties!['go']).toBeUndefined()
    expect(formTool!.inputSchema!.properties!['item']).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// Action (button/link) detection
// ---------------------------------------------------------------------------

describe('detectTools — action detection', () => {
  beforeEach(() => {
    resetModelContext()
    clearBody()
  })

  it('detects a standalone button as a tool', () => {
    const btn = document.createElement('button')
    btn.textContent = 'Add to Cart'
    document.body.appendChild(btn)

    const tools = detectTools()
    const btnTool = tools.find((t) => t.name === 'add_to_cart')
    expect(btnTool).toBeDefined()
    expect(btnTool!.safetyLevel).toBe('write') // 'add' keyword -> write
  })

  it('ignores buttons inside forms', () => {
    const form = document.createElement('form')
    form.id = 'myform'

    const btn = document.createElement('button')
    btn.textContent = 'Submit Order'
    form.appendChild(btn)

    document.body.appendChild(form)

    const tools = detectTools()
    // The button inside the form should be detected by form detection, not action detection
    // so there should be no standalone 'submit_order' action tool
    const actionTool = tools.find((t) => t.name === 'submit_order')
    expect(actionTool).toBeUndefined()
  })

  it('skips buttons with very short text', () => {
    const btn = document.createElement('button')
    btn.textContent = 'X'
    document.body.appendChild(btn)

    const tools = detectTools()
    expect(tools).toHaveLength(0)
  })

  it('detects danger safety from delete keyword', () => {
    const btn = document.createElement('button')
    btn.textContent = 'Delete Account'
    document.body.appendChild(btn)

    const tools = detectTools()
    const btnTool = tools.find((t) => t.name === 'delete_account')
    expect(btnTool).toBeDefined()
    expect(btnTool!.safetyLevel).toBe('danger')
  })

  it('detects a role=button element', () => {
    const span = document.createElement('span')
    span.setAttribute('role', 'button')
    span.textContent = 'Save Draft'
    document.body.appendChild(span)

    const tools = detectTools()
    const btnTool = tools.find((t) => t.name === 'save_draft')
    expect(btnTool).toBeDefined()
    expect(btnTool!.safetyLevel).toBe('write') // 'save' keyword -> write
  })

  it('uses aria-label as description when available', () => {
    const btn = document.createElement('button')
    btn.textContent = 'Upload File'
    btn.setAttribute('aria-label', 'Upload a file to your account')
    document.body.appendChild(btn)

    const tools = detectTools()
    const btnTool = tools.find((t) => t.name === 'upload_file')
    expect(btnTool).toBeDefined()
    expect(btnTool!.description).toBe('Upload a file to your account')
  })
})

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

describe('detectTools — options', () => {
  beforeEach(() => {
    resetModelContext()
    clearBody()
  })

  it('respects maxTools limit', () => {
    for (let i = 0; i < 5; i++) {
      const div = document.createElement('div')
      div.setAttribute('toolname', `tool_${i}`)
      div.setAttribute('tooldescription', `Tool number ${i}`)
      document.body.appendChild(div)
    }

    const tools = detectTools({ maxTools: 3 })
    expect(tools).toHaveLength(3)
  })

  it('skips declarative detection when declarative is false', () => {
    const div = document.createElement('div')
    div.setAttribute('toolname', 'hidden_tool')
    div.setAttribute('tooldescription', 'Should not appear')
    document.body.appendChild(div)

    const tools = detectTools({ declarative: false })
    expect(tools.find((t) => t.name === 'hidden_tool')).toBeUndefined()
  })

  it('skips form detection when forms is false', () => {
    const form = document.createElement('form')
    form.id = 'search'
    form.method = 'get'
    document.body.appendChild(form)

    const tools = detectTools({ forms: false })
    expect(tools.find((t) => t.name === 'search')).toBeUndefined()
  })

  it('skips action detection when actions is false', () => {
    const btn = document.createElement('button')
    btn.textContent = 'Click Me Now'
    document.body.appendChild(btn)

    const tools = detectTools({ actions: false })
    expect(tools.find((t) => t.name === 'click_me_now')).toBeUndefined()
  })

  it('deduplicates tools by name keeping first occurrence', () => {
    // Create two declarative tools with the same name
    for (let i = 0; i < 2; i++) {
      const div = document.createElement('div')
      div.setAttribute('toolname', 'dup_tool')
      div.setAttribute('tooldescription', `Description ${i}`)
      document.body.appendChild(div)
    }

    const tools = detectTools()
    expect(tools.filter((t) => t.name === 'dup_tool')).toHaveLength(1)
    expect(tools[0]!.description).toBe('Description 0')
  })

  it('scans a custom root element', () => {
    const root = document.createElement('div')
    const inner = document.createElement('div')
    inner.setAttribute('toolname', 'inner_tool')
    inner.setAttribute('tooldescription', 'Inside custom root')
    root.appendChild(inner)

    // This tool is outside the custom root — should not appear
    const outside = document.createElement('div')
    outside.setAttribute('toolname', 'outer_tool')
    outside.setAttribute('tooldescription', 'Outside custom root')
    document.body.appendChild(outside)

    const tools = detectTools({ root })
    expect(tools.find((t) => t.name === 'inner_tool')).toBeDefined()
    expect(tools.find((t) => t.name === 'outer_tool')).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// toSnakeCase behavior (tested indirectly via tool names)
// ---------------------------------------------------------------------------

describe('detectTools — snake_case conversion', () => {
  beforeEach(() => {
    resetModelContext()
    clearBody()
  })

  it('converts button text with spaces to snake_case', () => {
    const btn = document.createElement('button')
    btn.textContent = 'Send Email Now'
    document.body.appendChild(btn)

    const tools = detectTools()
    const btnTool = tools.find((t) => t.name === 'send_email_now')
    expect(btnTool).toBeDefined()
  })

  it('strips special characters during conversion', () => {
    const btn = document.createElement('button')
    btn.textContent = 'Save & Continue!'
    document.body.appendChild(btn)

    const tools = detectTools()
    const btnTool = tools.find((t) => t.name === 'save_continue')
    expect(btnTool).toBeDefined()
  })

  it('converts uppercase to lowercase', () => {
    const btn = document.createElement('button')
    btn.textContent = 'CREATE ORDER'
    document.body.appendChild(btn)

    const tools = detectTools()
    const btnTool = tools.find((t) => t.name === 'create_order')
    expect(btnTool).toBeDefined()
  })
})
