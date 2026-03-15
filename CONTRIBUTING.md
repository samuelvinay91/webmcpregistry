# Contributing to WebMCP Registry SDK

Thank you for your interest in contributing! This project is the open-source SDK for the WebMCP browser standard.

## Getting Started

```bash
# Clone the repo
git clone https://github.com/samuelvinay91/webmcpregistry.git
cd webmcpregistry

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Start docs site dev server
pnpm --filter @webmcpregistry/docs dev
```

## Project Structure

This is a Turborepo monorepo with 13 packages. See [CLAUDE.md](./CLAUDE.md) for the full architecture.

- `packages/core/` — The foundation. All other packages depend on this.
- `packages/react/`, `vue/`, `angular/`, `svelte/`, `nextjs/`, `browser/` — Framework adapters (thin wrappers over core).
- `packages/cli/` — CLI testing tool.
- `packages/testing/`, `conformance/`, `evals/` — Quality and testing packages.
- `packages/mcp-server/` — MCP protocol bridge.
- `apps/docs/` — Next.js documentation site.

## Development Workflow

1. Create a branch: `git checkout -b feat/my-feature`
2. Make changes
3. Run `pnpm build && pnpm test` to verify
4. Add a changeset: `pnpm changeset` (select affected packages and describe changes)
5. Open a PR against `main`

## Adding a Changeset

We use [Changesets](https://github.com/changesets/changesets) for versioning. Before opening a PR:

```bash
pnpm changeset
```

Follow the prompts to select affected packages and write a summary. This generates a file in `.changeset/` that gets consumed on release.

## Code Conventions

- **TypeScript strict mode** — no `any` types, use `unknown` with narrowing
- **Spec alignment** — mark types as `[SPEC]` or `[EXTENSION]` in comments
- **File extensions** — use `.js` in imports (ESM compatibility)
- **Tests** — place in `src/__tests__/` directories, use Vitest
- **Formatting** — Prettier runs automatically. Use `pnpm format` to check.

## Reporting Issues

- **Bug report** — Use the Bug Report issue template
- **Feature request** — Use the Feature Request template
- **Security vulnerability** — See [SECURITY.md](./SECURITY.md)

## License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.
