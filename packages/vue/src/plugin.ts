/**
 * Vue 3 plugin for WebMCP initialization.
 */

import type { App, InjectionKey } from 'vue'
import { reactive } from 'vue'
import {
  initialize,
  type WebMCPConfig,
  type ToolDefinition,
  type RegistrationMode,
} from '@webmcpregistry/core'

export interface WebMCPState {
  tools: ToolDefinition[]
  ready: boolean
  mode: RegistrationMode
  nativeAPI: boolean
  polyfilled: boolean
}

export const WEBMCP_KEY: InjectionKey<WebMCPState> = Symbol('webmcp')

export const webmcpPlugin = {
  install(app: App, config: WebMCPConfig = {}) {
    const state = reactive<WebMCPState>({
      tools: [],
      ready: false,
      mode: config.mode ?? 'auto',
      nativeAPI: false,
      polyfilled: false,
    })

    // Initialize on next tick (after DOM mount)
    if (typeof window !== 'undefined') {
      queueMicrotask(() => {
        const result = initialize(config)
        state.tools = result.registered
        state.ready = true
        state.mode = result.mode
        state.nativeAPI = result.nativeAPI
        state.polyfilled = result.polyfilled
      })
    }

    app.provide(WEBMCP_KEY, state)
  },
}
