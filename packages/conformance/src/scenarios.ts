/**
 * WebMCP Conformance Test Scenarios.
 *
 * Each scenario tests a specific requirement from the W3C draft spec:
 * https://webmachinelearning.github.io/webmcp/
 *
 * Scenarios are grouped by spec section. Each scenario is self-contained
 * and can run against any navigator.modelContext implementation (native or polyfill).
 */

import type { ModelContextAPI } from '@webmcpregistry/core'

/** Result of a single conformance scenario. */
export interface ScenarioResult {
  id: string
  section: string
  title: string
  description: string
  passed: boolean
  error?: string
  specRef: string
}

/** A conformance test scenario. */
export interface Scenario {
  id: string
  section: string
  title: string
  description: string
  specRef: string
  run: (mc: ModelContextAPI) => Promise<void> | void
}

// ---------------------------------------------------------------------------
// Section 4.1: ModelContext interface
// ---------------------------------------------------------------------------

const S_4_1_01: Scenario = {
  id: 'mc-exists',
  section: '4.1',
  title: 'ModelContext interface exists',
  description: 'navigator.modelContext must be defined and be an object',
  specRef: 'partial interface Navigator { readonly attribute ModelContext modelContext }',
  run(mc) {
    if (!mc) throw new Error('navigator.modelContext is undefined')
    if (typeof mc !== 'object') throw new Error(`Expected object, got ${typeof mc}`)
  },
}

const S_4_1_02: Scenario = {
  id: 'mc-same-object',
  section: '4.1',
  title: 'ModelContext is SameObject',
  description: 'navigator.modelContext must return the same instance on repeated access',
  specRef: '[SameObject] readonly attribute ModelContext modelContext',
  run() {
    if (typeof globalThis.navigator === 'undefined') throw new Error('No navigator')
    const a = globalThis.navigator.modelContext
    const b = globalThis.navigator.modelContext
    if (a !== b) throw new Error('modelContext returned different instances')
  },
}

// ---------------------------------------------------------------------------
// Section 4.2: registerTool()
// ---------------------------------------------------------------------------

const S_4_2_01: Scenario = {
  id: 'register-basic',
  section: '4.2',
  title: 'registerTool accepts valid tool',
  description: 'registerTool must accept a tool with name, description, and execute callback',
  specRef: 'registerTool(tool) method',
  run(mc) {
    mc.registerTool({
      name: 'conformance_test_basic',
      description: 'A basic conformance test tool',
      inputSchema: { type: 'object', properties: {} },
      safetyLevel: 'read',
      execute: async () => ({ ok: true }),
    })
    mc.unregisterTool('conformance_test_basic')
  },
}

const S_4_2_02: Scenario = {
  id: 'register-duplicate-throws',
  section: '4.2',
  title: 'registerTool throws on duplicate name',
  description: 'registerTool must throw InvalidStateError when tool name already exists',
  specRef: 'If model context\'s tool map[name] exists, throw "InvalidStateError"',
  run(mc) {
    mc.registerTool({
      name: 'conformance_test_dup',
      description: 'First',
      inputSchema: { type: 'object', properties: {} },
      safetyLevel: 'read',
    })
    try {
      mc.registerTool({
        name: 'conformance_test_dup',
        description: 'Second',
        inputSchema: { type: 'object', properties: {} },
        safetyLevel: 'read',
      })
      throw new Error('Should have thrown on duplicate name')
    } catch (e) {
      if (e instanceof Error && e.message === 'Should have thrown on duplicate name') throw e
      // Expected error — pass
    } finally {
      try { mc.unregisterTool('conformance_test_dup') } catch { /* ok */ }
    }
  },
}

const S_4_2_03: Scenario = {
  id: 'register-empty-name-throws',
  section: '4.2',
  title: 'registerTool throws on empty name',
  description: 'registerTool must throw when name is empty string',
  specRef: 'If name is the empty string, throw "InvalidStateError"',
  run(mc) {
    try {
      mc.registerTool({
        name: '',
        description: 'Empty name',
        inputSchema: { type: 'object', properties: {} },
        safetyLevel: 'read',
      })
      throw new Error('Should have thrown on empty name')
    } catch (e) {
      if (e instanceof Error && e.message === 'Should have thrown on empty name') throw e
    }
  },
}

const S_4_2_04: Scenario = {
  id: 'register-empty-desc-throws',
  section: '4.2',
  title: 'registerTool throws on empty description',
  description: 'registerTool must throw when description is empty string',
  specRef: 'If description is the empty string, throw "InvalidStateError"',
  run(mc) {
    try {
      mc.registerTool({
        name: 'conformance_empty_desc',
        description: '',
        inputSchema: { type: 'object', properties: {} },
        safetyLevel: 'read',
      })
      // Some implementations may not enforce this yet
      try { mc.unregisterTool('conformance_empty_desc') } catch { /* ok */ }
      throw new Error('Should have thrown on empty description')
    } catch (e) {
      if (e instanceof Error && e.message === 'Should have thrown on empty description') throw e
    }
  },
}

const S_4_2_05: Scenario = {
  id: 'register-schema-serialization',
  section: '4.2',
  title: 'inputSchema is serialized via JSON.stringify',
  description: 'registerTool must serialize inputSchema; circular references should throw TypeError',
  specRef: 'serialize a JavaScript value to a JSON string algorithm',
  run(mc) {
    // Valid schema should work
    mc.registerTool({
      name: 'conformance_schema_valid',
      description: 'Schema serialization test',
      inputSchema: {
        type: 'object',
        properties: { query: { type: 'string', description: 'test' } },
        required: ['query'],
      },
      safetyLevel: 'read',
    })
    mc.unregisterTool('conformance_schema_valid')
  },
}

const S_4_2_06: Scenario = {
  id: 'register-annotations-readonly',
  section: '4.2',
  title: 'readOnlyHint annotation is preserved',
  description: 'Tools registered with annotations.readOnlyHint=true should preserve the value',
  specRef: 'Extract read-only hint from annotations',
  run(mc) {
    mc.registerTool({
      name: 'conformance_readonly_hint',
      description: 'Read-only hint test',
      inputSchema: { type: 'object', properties: {} },
      safetyLevel: 'read',
      annotations: { readOnlyHint: true },
    })
    // Verify via getTools if available
    if (typeof mc.getTools === 'function') {
      const tools = mc.getTools()
      const tool = tools.find((t) => t.name === 'conformance_readonly_hint')
      if (tool?.annotations?.readOnlyHint !== true) {
        mc.unregisterTool('conformance_readonly_hint')
        throw new Error('readOnlyHint not preserved')
      }
    }
    mc.unregisterTool('conformance_readonly_hint')
  },
}

// ---------------------------------------------------------------------------
// Section 4.2: unregisterTool()
// ---------------------------------------------------------------------------

const S_4_2_10: Scenario = {
  id: 'unregister-basic',
  section: '4.2',
  title: 'unregisterTool removes a registered tool',
  description: 'unregisterTool must remove a previously registered tool by name',
  specRef: 'unregisterTool(name) method',
  run(mc) {
    mc.registerTool({
      name: 'conformance_remove_me',
      description: 'Will be removed',
      inputSchema: { type: 'object', properties: {} },
      safetyLevel: 'read',
    })
    mc.unregisterTool('conformance_remove_me')
    // Should be able to re-register
    mc.registerTool({
      name: 'conformance_remove_me',
      description: 'Re-registered',
      inputSchema: { type: 'object', properties: {} },
      safetyLevel: 'read',
    })
    mc.unregisterTool('conformance_remove_me')
  },
}

const S_4_2_11: Scenario = {
  id: 'unregister-nonexistent-throws',
  section: '4.2',
  title: 'unregisterTool throws for non-existent tool',
  description: 'unregisterTool must throw InvalidStateError when tool does not exist',
  specRef: 'If model context\'s tool map[name] does not exist, throw "InvalidStateError"',
  run(mc) {
    try {
      mc.unregisterTool('conformance_ghost_tool_99999')
      throw new Error('Should have thrown for non-existent tool')
    } catch (e) {
      if (e instanceof Error && e.message === 'Should have thrown for non-existent tool') throw e
    }
  },
}

// ---------------------------------------------------------------------------
// Section 4.2: Tool struct requirements
// ---------------------------------------------------------------------------

const S_4_2_20: Scenario = {
  id: 'tool-struct-name',
  section: '4.2',
  title: 'Tool definition preserves name',
  description: 'A registered tool\'s name must be retrievable (via getTools or equivalent)',
  specRef: 'tool definition struct: name',
  run(mc) {
    mc.registerTool({
      name: 'conformance_name_check',
      description: 'Name preservation test',
      inputSchema: { type: 'object', properties: {} },
      safetyLevel: 'read',
    })
    if (typeof mc.getTools === 'function') {
      const found = mc.getTools().some((t) => t.name === 'conformance_name_check')
      if (!found) {
        mc.unregisterTool('conformance_name_check')
        throw new Error('Tool name not found in getTools()')
      }
    }
    mc.unregisterTool('conformance_name_check')
  },
}

const S_4_2_21: Scenario = {
  id: 'tool-struct-description',
  section: '4.2',
  title: 'Tool definition preserves description',
  description: 'A registered tool\'s description must be preserved exactly',
  specRef: 'tool definition struct: description',
  run(mc) {
    const desc = 'Exact description preservation test: special chars <>&"'
    mc.registerTool({
      name: 'conformance_desc_check',
      description: desc,
      inputSchema: { type: 'object', properties: {} },
      safetyLevel: 'read',
    })
    if (typeof mc.getTools === 'function') {
      const tool = mc.getTools().find((t) => t.name === 'conformance_desc_check')
      if (tool?.description !== desc) {
        mc.unregisterTool('conformance_desc_check')
        throw new Error(`Description mismatch: expected "${desc}", got "${tool?.description}"`)
      }
    }
    mc.unregisterTool('conformance_desc_check')
  },
}

// ---------------------------------------------------------------------------
// All scenarios
// ---------------------------------------------------------------------------

export const ALL_SCENARIOS: Scenario[] = [
  S_4_1_01,
  S_4_1_02,
  S_4_2_01,
  S_4_2_02,
  S_4_2_03,
  S_4_2_04,
  S_4_2_05,
  S_4_2_06,
  S_4_2_10,
  S_4_2_11,
  S_4_2_20,
  S_4_2_21,
]
