/**
 * @webmcpregistry/angular
 *
 * Angular module and service for WebMCP tool registration.
 *
 * @example
 * ```typescript
 * // app.config.ts
 * import { provideWebMCP } from '@webmcpregistry/angular'
 *
 * export const appConfig = {
 *   providers: [provideWebMCP({ mode: 'auto' })],
 * }
 * ```
 *
 * Note: Angular adapter uses a lightweight service-based approach
 * compatible with both NgModule and standalone component patterns.
 * No @angular/core dependency at runtime — just type-compatible interfaces.
 */

import {
  initialize,
  registerTool,
  unregisterTool,
  getRegisteredTools,
  type WebMCPConfig,
  type ToolDefinition,
  type RegistrationMode,
} from '@webmcpregistry/core'

// ---------------------------------------------------------------------------
// Service (framework-agnostic, no Angular decorators needed)
// ---------------------------------------------------------------------------

export class WebMCPService {
  private _tools: ToolDefinition[] = []
  private _ready = false
  private _mode: RegistrationMode = 'auto'
  private _nativeAPI = false
  private _polyfilled = false

  get tools() { return this._tools }
  get ready() { return this._ready }
  get mode() { return this._mode }
  get nativeAPI() { return this._nativeAPI }
  get polyfilled() { return this._polyfilled }

  initialize(config: WebMCPConfig = {}) {
    const result = initialize(config)
    this._tools = result.registered
    this._ready = true
    this._mode = result.mode
    this._nativeAPI = result.nativeAPI
    this._polyfilled = result.polyfilled
    return result
  }

  registerTool(tool: ToolDefinition) {
    registerTool(tool)
    this._tools = getRegisteredTools()
  }

  unregisterTool(name: string) {
    unregisterTool(name)
    this._tools = getRegisteredTools()
  }
}

// ---------------------------------------------------------------------------
// Provider function (works with Angular's provider pattern)
// ---------------------------------------------------------------------------

let _lazyService: WebMCPService | null = null

/**
 * Provide WebMCP service to the Angular application.
 * Returns a provider-compatible factory.
 *
 * Creates a fresh instance each time to prevent cross-request
 * contamination in SSR environments.
 *
 * @example
 * ```typescript
 * // In standalone app config
 * export const appConfig = {
 *   providers: [provideWebMCP({ mode: 'auto' })],
 * }
 *
 * // In NgModule
 * @NgModule({ providers: [provideWebMCP({ mode: 'auto' })] })
 * ```
 */
export function provideWebMCP(config: WebMCPConfig = {}) {
  const service = new WebMCPService()
  _lazyService = service

  // Initialize when the provider is created
  if (typeof window !== 'undefined') {
    queueMicrotask(() => service.initialize(config))
  }

  return {
    provide: 'WEBMCP_SERVICE',
    useValue: service,
  }
}

/**
 * Get the WebMCP service instance.
 * Lazily creates an instance if one has not been provided yet.
 * Can be used directly without Angular DI.
 */
export function getWebMCPService(): WebMCPService {
  if (!_lazyService) {
    _lazyService = new WebMCPService()
  }
  return _lazyService
}

// Re-export core types
export type {
  ToolDefinition,
  ToolInputSchema,
  ToolSafetyLevel,
  ToolHandler,
  WebMCPConfig,
  RegistrationMode,
} from '@webmcpregistry/core'
