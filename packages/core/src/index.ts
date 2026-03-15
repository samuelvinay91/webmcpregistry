/**
 * @webmcpregistry/core
 *
 * Framework-agnostic WebMCP SDK core.
 * Provides polyfill, tool detection, registration, validation, and security scanning.
 *
 * @example
 * ```ts
 * import { initialize } from '@webmcpregistry/core'
 *
 * // Auto mode: detect tools from DOM + register with polyfill
 * const result = initialize({ mode: 'auto' })
 * console.log(`Registered ${result.registered.length} tools`)
 *
 * // Manual mode: register specific tools
 * import { registerTool } from '@webmcpregistry/core'
 * registerTool({
 *   name: 'search_products',
 *   description: 'Search the product catalog by keyword',
 *   inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] },
 *   safetyLevel: 'read',
 *   handler: async ({ query }) => fetch(`/api/search?q=${query}`).then(r => r.json()),
 * })
 * ```
 */

// Types
export type {
  ToolDefinition,
  ToolInputSchema,
  ToolPropertySchema,
  ToolSafetyLevel,
  ToolAnnotations,
  ToolHandler,
  WebMCPConfig,
  RegistrationMode,
  ModelContextAPI,
  ValidationIssue,
  ValidationResult,
  ValidationSeverity,
  SecurityFinding,
  SecurityReport,
  SecuritySeverity,
  GradeBreakdown,
  GradeResult,
  Grade,
  DetectionResult,
  ToolExecuteCallback,
  ModelContextClient,
  ToolTestCase,
  ToolTestResult,
  ToolContract,
  ContractDiff,
} from './types.js'

// Polyfill
export {
  installPolyfill,
  hasNativeAPI,
  isPolyfill,
  getModelContext,
} from './polyfill.js'

// Detector
export { detectTools } from './detector.js'
export type { DetectorOptions } from './detector.js'

// Registrar
export {
  initialize,
  registerTool,
  unregisterTool,
  getRegisteredTools,
} from './registrar.js'
export type { RegistrationResult } from './registrar.js'

// Validator
export { validateTools, validateTool } from './validator.js'

// Security
export { runSecurityScan } from './security.js'

// Manifest generation (agent discovery layer)
export {
  generateManifest,
  generateJsonLd,
  generateLlmsTxt,
  generateAgentsJson,
} from './manifest.js'
export type { WebMCPManifest } from './manifest.js'
