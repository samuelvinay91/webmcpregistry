/**
 * WebMCP type definitions — aligned with the W3C Web Model Context Protocol draft spec.
 *
 * Spec: https://webmachinelearning.github.io/webmcp/
 * Status: Draft Community Group Report (March 9, 2026)
 * Editors: Brandon Walderman (Microsoft), Khushal Sagar (Google), Dominic Farolino (Google)
 *
 * Types marked [SPEC] match the W3C draft exactly.
 * Types marked [EXTENSION] are our additions beyond the spec.
 */

// ---------------------------------------------------------------------------
// [SPEC] Core tool definition types — from W3C ModelContextTool dictionary
// ---------------------------------------------------------------------------

/**
 * JSON Schema for tool input parameters.
 * The spec references JSON Schema draft/2020-12 as normative.
 */
export interface ToolInputSchema {
  type: 'object'
  properties?: Record<string, ToolPropertySchema>
  required?: string[]
}

export interface ToolPropertySchema {
  type: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object'
  description?: string
  enum?: (string | number | boolean)[]
  default?: unknown
  items?: ToolPropertySchema
  minLength?: number
  maxLength?: number
  minimum?: number
  maximum?: number
  pattern?: string
}

/**
 * [SPEC] ToolAnnotations dictionary — metadata about tool behavior.
 *
 * From the W3C spec, only `readOnlyHint` is defined.
 * Additional hints are our extensions based on MCP's ToolAnnotation.
 */
export interface ToolAnnotations {
  /** [SPEC] When true, tool only reads data and has no side effects. */
  readOnlyHint?: boolean
  /** [EXTENSION] Tool may modify or destroy data. */
  destructiveHint?: boolean
  /** [EXTENSION] Tool should require explicit user confirmation. */
  confirmationHint?: boolean
  /** [EXTENSION] Calling multiple times with same input gives same result. */
  idempotentHint?: boolean
  /** [EXTENSION] Tool may take a long time to complete. */
  longRunningHint?: boolean
}

/**
 * [SPEC] ModelContextClient — passed to tool execute callbacks.
 * Enables tools to request user interaction during execution.
 */
export interface ModelContextClient {
  requestUserInteraction(callback: () => Promise<unknown>): Promise<unknown>
}

/**
 * [SPEC] ToolExecuteCallback — the function invoked when an agent calls a tool.
 * Receives input parameters and a ModelContextClient for user interaction.
 */
export type ToolExecuteCallback = (
  input: Record<string, unknown>,
  client: ModelContextClient
) => unknown | Promise<unknown>

/**
 * [SPEC] Simplified handler that doesn't use ModelContextClient.
 * For convenience when tools don't need user interaction.
 */
export type ToolHandler = (
  input: Record<string, unknown>
) => unknown | Promise<unknown>

/** [EXTENSION] Safety classification for a tool's side effects. */
export type ToolSafetyLevel = 'read' | 'write' | 'danger'

/**
 * A WebMCP tool definition — what gets registered via navigator.modelContext.registerTool().
 *
 * [SPEC] fields: name, description, inputSchema, execute, annotations
 * [EXTENSION] fields: safetyLevel, handler (alias for execute without client param)
 */
export interface ToolDefinition {
  /** [SPEC] Unique tool name (required, non-empty). */
  name: string
  /** [SPEC] Natural language description of what the tool does (required, non-empty). */
  description: string
  /** [SPEC] JSON Schema describing input parameters (optional per spec). */
  inputSchema?: ToolInputSchema
  /** [SPEC] Callback invoked when agent calls the tool. Receives (input, client). */
  execute?: ToolExecuteCallback
  /** [SPEC] Behavioral annotations for AI agents. */
  annotations?: ToolAnnotations
  /** [EXTENSION] Simplified handler (alias for execute without ModelContextClient). */
  handler?: ToolHandler
  /** [EXTENSION] Safety classification: read, write, or danger. Defaults to 'read'. */
  safetyLevel?: ToolSafetyLevel
}

// ---------------------------------------------------------------------------
// [EXTENSION] Registration options — SDK configuration
// ---------------------------------------------------------------------------

/** Mode controlling how the SDK registers tools. */
export type RegistrationMode = 'auto' | 'suggest' | 'manual'

/** Configuration for the WebMCP SDK. */
export interface WebMCPConfig {
  /** SDK operating mode. */
  mode?: RegistrationMode
  /** Site key for analytics/dashboard (Phase 3). */
  siteKey?: string
  /** Custom tools to register (used in manual/suggest modes). */
  tools?: ToolDefinition[]
  /** Whether to install the polyfill if navigator.modelContext is not available. */
  polyfill?: boolean
  /** Whether to auto-detect tools from DOM structure. */
  autoDetect?: boolean
  /** Callback fired when tools are registered. */
  onRegister?: (tools: ToolDefinition[]) => void
  /** Callback fired on errors. */
  onError?: (error: Error) => void
}

// ---------------------------------------------------------------------------
// [EXTENSION] Validation types — tool quality checking
// ---------------------------------------------------------------------------

export type ValidationSeverity = 'error' | 'warning' | 'info'

export interface ValidationIssue {
  severity: ValidationSeverity
  code: string
  message: string
  toolName?: string
  field?: string
}

export interface ValidationResult {
  valid: boolean
  issues: ValidationIssue[]
  score: number
}

// ---------------------------------------------------------------------------
// [EXTENSION] Security types — tool security scanning
// ---------------------------------------------------------------------------

export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical'

export interface SecurityFinding {
  severity: SecuritySeverity
  type: string
  description: string
  toolName?: string
}

export interface SecurityReport {
  status: 'PASS' | 'WARN' | 'FAIL'
  findings: SecurityFinding[]
  score: number
}

// ---------------------------------------------------------------------------
// [EXTENSION] Grading types — WebMCP readiness grading
// ---------------------------------------------------------------------------

export interface GradeBreakdown {
  toolCount: number
  descriptionQuality: number
  schemaCompleteness: number
  namingConventions: number
  manifestPresent: number
  security: number
  total: number
  deductions: Array<{ reason: string; points: number }>
}

export type Grade = 'A' | 'B' | 'C' | 'D' | 'F'

export interface GradeResult {
  grade: Grade
  score: number
  breakdown: GradeBreakdown
}

// ---------------------------------------------------------------------------
// [EXTENSION] Detection types — WebMCP signal detection
// ---------------------------------------------------------------------------

export interface DetectionResult {
  hasWebMCP: boolean
  hasNativeAPI: boolean
  hasPolyfill: boolean
  hasManifest: boolean
  toolCount: number
  tools: ToolDefinition[]
}

// ---------------------------------------------------------------------------
// [EXTENSION] Testing types — schema-driven test generation
// ---------------------------------------------------------------------------

/** Generated test case for a tool. */
export interface ToolTestCase {
  /** The tool being tested. */
  toolName: string
  /** Human-readable test description. */
  description: string
  /** Type of test: valid input, invalid input, boundary, security. */
  category: 'valid' | 'invalid' | 'boundary' | 'security' | 'type-coercion'
  /** Input to pass to the tool's execute/handler. */
  input: Record<string, unknown>
  /** Whether this input should be accepted (true) or rejected (false). */
  shouldSucceed: boolean
}

/** Result of running a test case against a tool. */
export interface ToolTestResult {
  testCase: ToolTestCase
  passed: boolean
  error?: string
  response?: unknown
  durationMs: number
}

/** Contract snapshot for regression testing. */
export interface ToolContract {
  /** Domain or identifier for this contract. */
  source: string
  /** When this contract was captured. */
  capturedAt: number
  /** Tool definitions at time of capture. */
  tools: ToolDefinition[]
  /** Schema version for forward compatibility. */
  version: string
}

/** Diff between two contract snapshots. */
export interface ContractDiff {
  added: ToolDefinition[]
  removed: ToolDefinition[]
  changed: Array<{
    toolName: string
    field: string
    before: unknown
    after: unknown
    breaking: boolean
  }>
  isBreaking: boolean
}

// ---------------------------------------------------------------------------
// [SPEC] navigator.modelContext API shape
// ---------------------------------------------------------------------------

/**
 * [SPEC] ModelContext interface — the browser API.
 *
 * Per the spec, only registerTool() and unregisterTool() are defined.
 * getTools() is our extension for tool discovery (not in spec).
 */
export interface ModelContextAPI {
  /** [SPEC] Register a tool with the model context. */
  registerTool(definition: ToolDefinition): void
  /** [SPEC] Remove a registered tool by name. */
  unregisterTool(name: string): void
  /** [EXTENSION] List all registered tools. Not in W3C spec. */
  getTools(): ToolDefinition[]
}

/** Extends the Navigator interface with the modelContext property. */
declare global {
  interface Navigator {
    modelContext?: ModelContextAPI
  }
}
