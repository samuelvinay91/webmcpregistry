/**
 * Mutation testing for WebMCP tools.
 *
 * Inspired by Stryker: introduce mutations to tool definitions and verify
 * that consumers (agents, tests) detect the changes. A high mutation score
 * means your tools are well-tested and well-defined.
 *
 * Mutation categories:
 * 1. Schema mutations: change types, remove required fields, drop enums
 * 2. Safety mutations: change safetyLevel classification
 * 3. Annotation mutations: flip behavioral hints
 * 4. Description mutations: alter tool descriptions
 */

import type { ToolDefinition, ToolInputSchema, ToolPropertySchema } from '@webmcpregistry/core'

/** A mutation applied to a tool definition. */
export interface Mutation {
  /** The mutated tool definition. */
  tool: ToolDefinition
  /** What was changed. */
  description: string
  /** Category of mutation. */
  category: 'schema' | 'safety' | 'annotation' | 'description' | 'name'
  /** Whether this mutation represents a breaking change. */
  breaking: boolean
}

/**
 * Generate all possible mutations for a tool definition.
 */
export function generateMutations(tool: ToolDefinition): Mutation[] {
  return [
    ...generateSchemaMutations(tool),
    ...generateSafetyMutations(tool),
    ...generateAnnotationMutations(tool),
    ...generateDescriptionMutations(tool),
  ]
}

/**
 * Generate mutations for multiple tools.
 */
export function generateAllMutations(tools: ToolDefinition[]): Mutation[] {
  return tools.flatMap(generateMutations)
}

// ---------------------------------------------------------------------------
// Schema mutations
// ---------------------------------------------------------------------------

function generateSchemaMutations(tool: ToolDefinition): Mutation[] {
  const mutations: Mutation[] = []
  const schema = tool.inputSchema ?? { type: 'object' as const, properties: {} }
  const props = schema.properties ?? {}
  const required = schema.required ?? []

  // Mutation: remove each required field from required array
  for (const req of required) {
    mutations.push({
      tool: {
        ...tool,
        inputSchema: {
          ...schema,
          required: required.filter((r) => r !== req),
        },
      },
      description: `Remove "${req}" from required fields`,
      category: 'schema',
      breaking: true,
    })
  }

  // Mutation: change each property's type
  for (const [name, prop] of Object.entries(props)) {
    const otherType = prop.type === 'string' ? 'number' : 'string'
    mutations.push({
      tool: {
        ...tool,
        inputSchema: {
          ...schema,
          properties: {
            ...props,
            [name]: { ...prop, type: otherType } as ToolPropertySchema,
          },
        },
      },
      description: `Change "${name}" type from "${prop.type}" to "${otherType}"`,
      category: 'schema',
      breaking: true,
    })
  }

  // Mutation: remove all properties
  if (Object.keys(props).length > 0) {
    mutations.push({
      tool: {
        ...tool,
        inputSchema: { type: 'object' as const, properties: {}, required: [] },
      },
      description: 'Remove all input properties',
      category: 'schema',
      breaking: true,
    })
  }

  // Mutation: remove enum constraints
  for (const [name, prop] of Object.entries(props)) {
    if (prop.enum) {
      mutations.push({
        tool: {
          ...tool,
          inputSchema: {
            ...schema,
            properties: {
              ...props,
              [name]: { ...prop, enum: undefined },
            },
          },
        },
        description: `Remove enum constraint from "${name}"`,
        category: 'schema',
        breaking: false, // Widening is non-breaking
      })
    }
  }

  // Mutation: add a new required field
  mutations.push({
    tool: {
      ...tool,
      inputSchema: {
        ...schema,
        properties: {
          ...props,
          _mutated_required_field: { type: 'string' as const, description: 'Mutation: new required field' },
        },
        required: [...required, '_mutated_required_field'],
      },
    },
    description: 'Add new required field "_mutated_required_field"',
    category: 'schema',
    breaking: true,
  })

  return mutations
}

// ---------------------------------------------------------------------------
// Safety mutations
// ---------------------------------------------------------------------------

function generateSafetyMutations(tool: ToolDefinition): Mutation[] {
  const levels = ['read', 'write', 'danger'] as const
  const currentLevel = tool.safetyLevel ?? 'read'
  return levels
    .filter((l) => l !== currentLevel)
    .map((level) => ({
      tool: { ...tool, safetyLevel: level },
      description: `Change safetyLevel from "${currentLevel}" to "${level}"`,
      category: 'safety' as const,
      breaking: true,
    }))
}

// ---------------------------------------------------------------------------
// Annotation mutations
// ---------------------------------------------------------------------------

function generateAnnotationMutations(tool: ToolDefinition): Mutation[] {
  const mutations: Mutation[] = []
  const annotations = tool.annotations ?? {}

  // Flip readOnlyHint
  mutations.push({
    tool: {
      ...tool,
      annotations: { ...annotations, readOnlyHint: !annotations.readOnlyHint },
    },
    description: `Flip readOnlyHint from ${annotations.readOnlyHint ?? false} to ${!annotations.readOnlyHint}`,
    category: 'annotation',
    breaking: false,
  })

  // Flip idempotentHint
  if (annotations.idempotentHint !== undefined) {
    mutations.push({
      tool: {
        ...tool,
        annotations: { ...annotations, idempotentHint: !annotations.idempotentHint },
      },
      description: `Flip idempotentHint from ${annotations.idempotentHint} to ${!annotations.idempotentHint}`,
      category: 'annotation',
      breaking: false,
    })
  }

  // Flip destructiveHint
  if (annotations.destructiveHint !== undefined) {
    mutations.push({
      tool: {
        ...tool,
        annotations: { ...annotations, destructiveHint: !annotations.destructiveHint },
      },
      description: `Flip destructiveHint from ${annotations.destructiveHint} to ${!annotations.destructiveHint}`,
      category: 'annotation',
      breaking: false,
    })
  }

  return mutations
}

// ---------------------------------------------------------------------------
// Description mutations
// ---------------------------------------------------------------------------

function generateDescriptionMutations(tool: ToolDefinition): Mutation[] {
  return [
    {
      tool: { ...tool, description: '' },
      description: 'Set description to empty string',
      category: 'description',
      breaking: true,
    },
    {
      tool: { ...tool, description: tool.name.replace(/_/g, ' ') },
      description: 'Set description to just the tool name',
      category: 'description',
      breaking: false,
    },
    {
      tool: { ...tool, description: 'A'.repeat(1000) },
      description: 'Set description to extremely long string',
      category: 'description',
      breaking: false,
    },
  ]
}

/**
 * Calculate mutation score: % of mutations detected by a test suite.
 *
 * @param totalMutations Total number of mutations generated
 * @param killedMutations Number of mutations that caused test failures (detected)
 * @returns Score from 0-100
 */
export function calculateMutationScore(totalMutations: number, killedMutations: number): number {
  if (totalMutations === 0) return 100
  return Math.round((killedMutations / totalMutations) * 100)
}
