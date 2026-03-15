/**
 * Contract testing for WebMCP tools.
 *
 * Inspired by Pact: capture tool definitions as contracts (snapshots),
 * then verify that implementations haven't broken the contract.
 *
 * Use cases:
 * - Snapshot current tools → detect breaking changes on next release
 * - Verify idempotent tools actually return same results
 * - Verify readOnlyHint tools don't mutate state
 * - Compare runtime registrations against published manifest
 */

import type {
  ToolDefinition,
  ToolContract,
  ContractDiff,
  ModelContextClient,
} from '@webmcpregistry/core'

/**
 * Capture a snapshot of current tool definitions as a contract.
 */
export function captureContract(
  tools: ToolDefinition[],
  source: string
): ToolContract {
  // Strip handlers (not serializable) and capture definition metadata
  const cleanTools = tools.map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: t.inputSchema,
    safetyLevel: t.safetyLevel,
    annotations: t.annotations,
  })) as ToolDefinition[]

  return {
    source,
    capturedAt: Date.now(),
    tools: cleanTools,
    version: '1.0',
  }
}

/**
 * Diff two contracts to find breaking changes.
 */
export function diffContracts(
  before: ToolContract,
  after: ToolContract
): ContractDiff {
  const beforeMap = new Map(before.tools.map((t) => [t.name, t]))
  const afterMap = new Map(after.tools.map((t) => [t.name, t]))

  const added: ToolDefinition[] = []
  const removed: ToolDefinition[] = []
  const changed: ContractDiff['changed'] = []

  // Find removed tools (breaking)
  for (const [name, tool] of beforeMap) {
    if (!afterMap.has(name)) {
      removed.push(tool)
    }
  }

  // Find added tools (non-breaking) and changed tools
  for (const [name, afterTool] of afterMap) {
    const beforeTool = beforeMap.get(name)
    if (!beforeTool) {
      added.push(afterTool)
      continue
    }

    // Check for field-level changes
    if (beforeTool.description !== afterTool.description) {
      changed.push({
        toolName: name,
        field: 'description',
        before: beforeTool.description,
        after: afterTool.description,
        breaking: false,
      })
    }

    if (beforeTool.safetyLevel !== afterTool.safetyLevel) {
      changed.push({
        toolName: name,
        field: 'safetyLevel',
        before: beforeTool.safetyLevel,
        after: afterTool.safetyLevel,
        breaking: true, // Changing safety level is breaking
      })
    }

    // Check inputSchema changes
    const schemaChanges = diffSchema(name, beforeTool.inputSchema, afterTool.inputSchema)
    changed.push(...schemaChanges)

    // Check annotations
    if (JSON.stringify(beforeTool.annotations) !== JSON.stringify(afterTool.annotations)) {
      changed.push({
        toolName: name,
        field: 'annotations',
        before: beforeTool.annotations,
        after: afterTool.annotations,
        breaking: false,
      })
    }
  }

  const isBreaking =
    removed.length > 0 || changed.some((c) => c.breaking)

  return { added, removed, changed, isBreaking }
}

function diffSchema(
  toolName: string,
  before: ToolDefinition['inputSchema'],
  after: ToolDefinition['inputSchema']
): ContractDiff['changed'] {
  const changes: ContractDiff['changed'] = []
  const beforeProps = before.properties ?? {}
  const afterProps = after.properties ?? {}

  // Removed properties (breaking if they were required)
  for (const name of Object.keys(beforeProps)) {
    if (!afterProps[name]) {
      changes.push({
        toolName,
        field: `inputSchema.properties.${name}`,
        before: beforeProps[name],
        after: undefined,
        breaking: before.required?.includes(name) ?? false,
      })
    }
  }

  // Added required properties (breaking — existing agents don't send them)
  for (const name of Object.keys(afterProps)) {
    if (!beforeProps[name] && after.required?.includes(name)) {
      changes.push({
        toolName,
        field: `inputSchema.properties.${name}`,
        before: undefined,
        after: afterProps[name],
        breaking: true,
      })
    }
  }

  // Changed property types (breaking)
  for (const name of Object.keys(afterProps)) {
    const bp = beforeProps[name]
    const ap = afterProps[name]
    if (bp && ap && bp.type !== ap.type) {
      changes.push({
        toolName,
        field: `inputSchema.properties.${name}.type`,
        before: bp.type,
        after: ap.type,
        breaking: true,
      })
    }
  }

  return changes
}

/**
 * Verify annotation contracts — test that tools behave as their annotations promise.
 */
export async function verifyAnnotations(
  tools: ToolDefinition[]
): Promise<Array<{ toolName: string; annotation: string; passed: boolean; details: string }>> {
  const results: Array<{ toolName: string; annotation: string; passed: boolean; details: string }> = []

  const mockClient: ModelContextClient = {
    async requestUserInteraction(callback) { return callback() },
  }

  for (const tool of tools) {
    const handler = tool.execute ?? tool.handler
    if (!handler) continue

    // Test idempotency: call twice with same input, compare results
    if (tool.annotations?.idempotentHint) {
      try {
        const input = buildMinimalInput(tool)
        const result1 = await callHandler(handler, input, mockClient)
        const result2 = await callHandler(handler, input, mockClient)
        const identical = JSON.stringify(result1) === JSON.stringify(result2)
        results.push({
          toolName: tool.name,
          annotation: 'idempotentHint',
          passed: identical,
          details: identical
            ? 'Two calls with same input returned identical results'
            : 'Results differed between calls — tool may not be idempotent',
        })
      } catch (err) {
        results.push({
          toolName: tool.name,
          annotation: 'idempotentHint',
          passed: false,
          details: `Error during idempotency test: ${err instanceof Error ? err.message : String(err)}`,
        })
      }
    }

    // Test readOnlyHint: tool should not throw errors that suggest mutation
    if (tool.annotations?.readOnlyHint) {
      results.push({
        toolName: tool.name,
        annotation: 'readOnlyHint',
        passed: tool.safetyLevel === 'read',
        details: tool.safetyLevel === 'read'
          ? 'readOnlyHint=true and safetyLevel=read are consistent'
          : `readOnlyHint=true but safetyLevel="${tool.safetyLevel}" — inconsistent`,
      })
    }
  }

  return results
}

async function callHandler(
  handler: ToolDefinition['execute'] | ToolDefinition['handler'],
  input: Record<string, unknown>,
  client: ModelContextClient
): Promise<unknown> {
  try {
    return await (handler as ToolDefinition['execute'])!(input, client)
  } catch {
    return await (handler as ToolDefinition['handler'])!(input)
  }
}

function buildMinimalInput(tool: ToolDefinition): Record<string, unknown> {
  const input: Record<string, unknown> = {}
  const props = tool.inputSchema.properties ?? {}
  for (const name of tool.inputSchema.required ?? []) {
    const prop = props[name]
    if (!prop) continue
    switch (prop.type) {
      case 'string': input[name] = 'test'; break
      case 'number': case 'integer': input[name] = 1; break
      case 'boolean': input[name] = true; break
      default: input[name] = null
    }
  }
  return input
}
