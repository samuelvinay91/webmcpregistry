# @webmcpregistry/vue

## 0.2.1

### Patch Changes

- Production-grade fixes from comprehensive audit.

  **Critical fixes:**
  - Polyfill: Symbol-based native detection (replaces fragile prototype check)
  - Polyfill: validates empty descriptions per W3C spec
  - Types: `safetyLevel` and `inputSchema` now optional (spec-aligned)
  - Detector: XSS fix via CSS.escape() in label selector
  - MCP server: removed --with-deps from postinstall

  **Framework fixes:**
  - React hooks: fixed Strict Mode race condition
  - Angular: removed SSR-unsafe module singleton
  - Vue: DOM readiness check before auto-detection

  **Testing:**
  - 170 tests across 4 packages (up from 28)
  - Conformance: 12/12 W3C spec scenarios pass

- Updated dependencies []:
  - @webmcpregistry/core@0.2.1

## 0.2.0

### Minor Changes

- Initial release of the WebMCP Registry SDK.

  **SDK Packages:**
  - `@webmcpregistry/core` — Polyfill for `navigator.modelContext`, DOM-based tool auto-detection, validation, security scanning, and manifest generation (`.well-known/webmcp.json`, JSON-LD, `llms.txt`, `agents.json`). Types aligned with W3C draft spec.
  - `@webmcpregistry/react` — React hooks (`useWebMCPTool`, `WebMCPProvider`) for registering tools tied to component lifecycle.
  - `@webmcpregistry/nextjs` — Next.js App Router adapter with `'use client'` directive.
  - `@webmcpregistry/vue` — Vue 3 plugin and composables (`useWebMCPTool`, `useWebMCPContext`).
  - `@webmcpregistry/angular` — Angular service and `provideWebMCP()` provider.
  - `@webmcpregistry/svelte` — Svelte stores, actions (`use:webmcpTool`), and `initWebMCP()`.
  - `@webmcpregistry/browser` — Zero-dependency `<script>` tag (10KB IIFE) with `data-mode` configuration.
  - `@webmcpregistry/cli` — CLI commands: `test` (full readiness check), `scan` (lightweight), `init` (scaffold setup).

  **Quality & Testing:**
  - `@webmcpregistry/testing` — Schema-driven test case generation, Pact-inspired contract testing, Stryker-inspired mutation testing.
  - `@webmcpregistry/conformance` — 12-scenario W3C spec conformance test suite.
  - `@webmcpregistry/evals` — Deterministic AI agent tool-calling accuracy evaluation.

  **Infrastructure:**
  - `@webmcpregistry/mcp-server` — MCP-to-WebMCP bridge for tool discovery from non-browser AI agents.

### Patch Changes

- Updated dependencies []:
  - @webmcpregistry/core@0.2.0
