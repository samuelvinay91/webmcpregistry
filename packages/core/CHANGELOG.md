# @webmcpregistry/core

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
