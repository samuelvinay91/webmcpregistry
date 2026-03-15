# CLAUDE.md — WebMCP Registry SDK

## Project Overview
Open-source SDK that makes any website WebMCP-ready. Monorepo with 13 packages covering framework adapters, testing, conformance, evals, and a dogfooded docs site.

**Company:** RAPHATECH OÜ
**License:** Apache 2.0

## Tech Stack
- **Monorepo:** Turborepo + pnpm workspaces
- **Language:** TypeScript (strict mode, `verbatimModuleSyntax`)
- **Build:** tsup (ESM + CJS + DTS)
- **Testing:** Vitest + jsdom
- **Docs site:** Next.js 15 + Tailwind CSS v4
- **Node:** 20+

## Commands
```bash
pnpm build          # Build all packages (Turborepo)
pnpm test           # Run all tests
pnpm dev            # Dev mode (all packages)
pnpm --filter @webmcpregistry/core test    # Run core tests only
pnpm --filter @webmcpregistry/docs dev     # Dev server for docs site (port 3000)
pnpm --filter @webmcpregistry/core build   # Build single package
```

## Architecture
```
packages/
  core/         — Polyfill, detector, registrar, validator, security, manifest generation
  react/        — React hooks (useWebMCPTool, WebMCPProvider)
  nextjs/       — Next.js App Router adapter (re-exports react with 'use client')
  vue/          — Vue 3 plugin + composables
  angular/      — Angular service + provideWebMCP()
  svelte/       — Svelte stores + actions
  browser/      — <script> tag IIFE bundle (10KB, self-contained)
  cli/          — CLI: test, scan, init commands
  testing/      — Schema-driven test generation, contract testing, mutation testing
  conformance/  — W3C spec conformance test suite (12 scenarios)
  evals/        — AI agent tool-calling accuracy evaluation
  mcp-server/   — MCP-to-WebMCP discovery bridge
apps/
  docs/         — Next.js docs site (dogfoods the SDK, 5 pages)
```

## Key Design Decisions
- **Types are spec-aligned:** Fields marked `[SPEC]` match W3C draft exactly; `[EXTENSION]` are our additions. See `packages/core/src/types.ts`.
- **Polyfill-first:** No browser ships `navigator.modelContext` yet. Our polyfill is the default.
- **`getTools()` is our extension:** The W3C spec only defines `registerTool()` and `unregisterTool()`. We add `getTools()` for discovery.
- **`execute` vs `handler`:** Spec requires `execute(input, client)` with `ModelContextClient`. We also support a simpler `handler(input)` alias.
- **Declarative HTML attributes** (`toolname`, `tooldescription`) are entirely TODO in the spec. Our detector supports them anyway.
- **All framework adapters are thin wrappers** (~1-3KB) over core. Don't duplicate logic.
- **Docs site dogfoods the SDK** — registers 3 live tools visitors can inspect in DevTools.

## W3C Spec Reference
- Spec: https://webmachinelearning.github.io/webmcp/
- Status: Draft Community Group Report (March 9, 2026)
- Editors: Brandon Walderman (Microsoft), Khushal Sagar (Google), Dominic Farolino (Google)
- **Not a W3C Standard.** Only in Chrome Canary behind a flag.

## Code Conventions
- No `any` types — use `unknown` with type narrowing
- All exports use `type` keyword for type-only exports
- File extensions in imports: `.js` (for ESM compatibility with tsup)
- Test files in `src/__tests__/` directories
- Package exports must have `types` condition FIRST in `exports` field
