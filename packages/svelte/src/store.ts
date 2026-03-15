/**
 * Svelte stores for WebMCP state.
 */

import {
  initialize,
  getRegisteredTools,
  type WebMCPConfig,
  type ToolDefinition,
} from '@webmcpregistry/core'

// Simple writable store implementation (no Svelte dependency needed)
type Subscriber<T> = (value: T) => void

function createStore<T>(initial: T) {
  let value = initial
  const subscribers = new Set<Subscriber<T>>()

  return {
    subscribe(fn: Subscriber<T>) {
      subscribers.add(fn)
      fn(value)
      return () => { subscribers.delete(fn) }
    },
    set(newValue: T) {
      value = newValue
      for (const fn of subscribers) fn(value)
    },
    get() { return value },
  }
}

/** Reactive store of currently registered tools. */
export const webmcpTools = createStore<ToolDefinition[]>([])

/** Whether WebMCP has been initialized. */
export const webmcpReady = createStore(false)

/**
 * Initialize WebMCP. Call this in your root component's onMount.
 */
export function initWebMCP(config: WebMCPConfig = {}) {
  const result = initialize(config)
  webmcpTools.set(result.registered)
  webmcpReady.set(true)
  return result
}

/**
 * Refresh the tools store from navigator.modelContext.
 */
export function refreshTools() {
  webmcpTools.set(getRegisteredTools())
}
