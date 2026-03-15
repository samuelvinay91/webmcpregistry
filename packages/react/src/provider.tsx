/**
 * WebMCPProvider — React context provider that initializes WebMCP SDK.
 *
 * Wrap your app (or a subtree) with this provider to auto-register tools.
 */

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  initialize,
  getRegisteredTools,
  type WebMCPConfig,
  type ToolDefinition,
  type RegistrationMode,
} from '@webmcpregistry/core'

interface WebMCPContextValue {
  /** All currently registered tools. */
  tools: ToolDefinition[]
  /** Whether initialization is complete. */
  ready: boolean
  /** The mode the SDK is operating in. */
  mode: RegistrationMode
  /** Whether the native browser API is available (vs polyfill). */
  nativeAPI: boolean
  /** Whether the polyfill was installed. */
  polyfilled: boolean
}

const WebMCPContext = createContext<WebMCPContextValue>({
  tools: [],
  ready: false,
  mode: 'auto',
  nativeAPI: false,
  polyfilled: false,
})

export interface WebMCPProviderProps extends WebMCPConfig {
  children: ReactNode
}

/**
 * Provider component that initializes WebMCP and makes context available to child hooks.
 *
 * @example
 * ```tsx
 * <WebMCPProvider mode="auto">
 *   <App />
 * </WebMCPProvider>
 * ```
 */
export function WebMCPProvider({ children, ...config }: WebMCPProviderProps) {
  const [state, setState] = useState<WebMCPContextValue>({
    tools: [],
    ready: false,
    mode: config.mode ?? 'auto',
    nativeAPI: false,
    polyfilled: false,
  })
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const result = initialize(config)

    setState({
      tools: result.registered,
      ready: true,
      mode: result.mode,
      nativeAPI: result.nativeAPI,
      polyfilled: result.polyfilled,
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <WebMCPContext.Provider value={state}>
      {children}
    </WebMCPContext.Provider>
  )
}

/**
 * Access the WebMCP context (tools, readiness, mode).
 */
export function useWebMCPContext(): WebMCPContextValue {
  return useContext(WebMCPContext)
}

/**
 * Get all currently registered WebMCP tools.
 */
export function useWebMCPTools(): ToolDefinition[] {
  const ctx = useContext(WebMCPContext)

  // If not inside a provider, try to read directly from the API
  if (!ctx.ready) {
    return getRegisteredTools()
  }

  return ctx.tools
}
