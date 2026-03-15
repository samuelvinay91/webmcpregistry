/**
 * @webmcpregistry/browser — zero-framework script tag entry point.
 *
 * Usage:
 * ```html
 * <script src="https://cdn.webmcpregistry.com/v1/auto.js" data-mode="auto"></script>
 * ```
 *
 * Or with a site key:
 * ```html
 * <script
 *   src="https://cdn.webmcpregistry.com/v1/auto.js"
 *   data-site-key="sk_live_xxxx"
 *   data-mode="suggest">
 * </script>
 * ```
 */

import { initialize, type RegistrationMode } from '@webmcpregistry/core'

function boot() {
  // Read configuration from the script tag's data attributes
  const scriptTag = document.currentScript as HTMLScriptElement | null
  const mode = (scriptTag?.dataset['mode'] ?? 'auto') as RegistrationMode
  const siteKey = scriptTag?.dataset['siteKey'] ?? undefined

  const result = initialize({
    mode,
    siteKey,
    polyfill: true,
    autoDetect: mode === 'auto',
    onRegister(tools) {
      if (mode !== 'manual') {
        console.info(
          `[WebMCP Registry] Registered ${tools.length} tool(s):`,
          tools.map((t) => t.name)
        )
      }
    },
    onError(error) {
      console.error('[WebMCP Registry] Error:', error.message)
    },
  })

  // Expose on window for debugging
  ;(globalThis as Record<string, unknown>)['__WEBMCP_REGISTRY__'] = {
    version: '0.2.0',
    mode,
    siteKey,
    tools: result.registered,
    polyfilled: result.polyfilled,
    nativeAPI: result.nativeAPI,
  }
}

// Auto-execute when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot)
} else {
  boot()
}
