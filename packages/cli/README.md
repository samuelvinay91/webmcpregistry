# @webmcpregistry/cli

[![npm version](https://img.shields.io/npm/v/@webmcpregistry/cli.svg)](https://www.npmjs.com/package/@webmcpregistry/cli)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

CLI tool to test and validate WebMCP readiness of any website. Scans for tool definitions, runs validation and security checks, and assigns a readiness grade.

## Install

```bash
npm install -g @webmcpregistry/cli
# or run directly with npx
npx @webmcpregistry/cli --help
```

## Commands

### `scan` -- Lightweight static scan

Quick scan that fetches the HTML and checks for WebMCP signals without launching a browser.

```bash
npx @webmcpregistry/cli scan https://yoursite.com
npx @webmcpregistry/cli scan https://yoursite.com -o json
```

What it checks:
- Declarative `toolname` attributes in the HTML
- `registerTool()` calls in inline scripts
- `/.well-known/webmcp.json` manifest presence
- Tool definition validation (naming, descriptions, schemas, safety)
- Security scan (prompt injection, deceptive naming, unrestricted inputs)

### `test` -- Full readiness test

Comprehensive 5-step test with validation, security scanning, and grade assignment.

```bash
npx @webmcpregistry/cli test https://yoursite.com
npx @webmcpregistry/cli test https://yoursite.com -o json
npx @webmcpregistry/cli test https://yoursite.com --no-security
npx @webmcpregistry/cli test https://yoursite.com --no-color
```

Steps:
1. Fetch the page
2. Detect WebMCP tools (declarative attributes, `registerTool` calls, forms)
3. Check `/.well-known/webmcp.json` manifest
4. Validate tool definitions
5. Run security checks

Output includes a letter grade (A-F) based on tool count, description quality, schema completeness, naming conventions, manifest presence, and security score.

| Option | Description |
|---|---|
| `-o, --output <format>` | Output format: `terminal` (default), `json`, `badge` |
| `--no-security` | Skip security checks |
| `--no-color` | Disable color output |

### `init` -- Scaffold WebMCP setup

Generate framework-specific boilerplate to add WebMCP to your project.

```bash
npx @webmcpregistry/cli init
npx @webmcpregistry/cli init --framework react
npx @webmcpregistry/cli init --framework nextjs
npx @webmcpregistry/cli init --framework vue
npx @webmcpregistry/cli init --framework angular
npx @webmcpregistry/cli init --framework svelte
npx @webmcpregistry/cli init --framework html
```

| Framework | Package |
|---|---|
| `html` (default) | `<script>` tag with `@webmcpregistry/browser` |
| `react` | `@webmcpregistry/react` |
| `nextjs` | `@webmcpregistry/nextjs` |
| `vue` | `@webmcpregistry/vue` |
| `angular` | `@webmcpregistry/angular` |
| `svelte` | `@webmcpregistry/svelte` |

## Examples

```bash
# Quick scan of an e-commerce site
$ npx @webmcpregistry/cli scan https://shop.example.com

  WebMCP Quick Scan: https://shop.example.com

  Tools found: 3
  Validation:  92/100 (PASS)
  Security:    100/100 (PASS)
  Grade:       A

# Get JSON output for CI pipelines
$ npx @webmcpregistry/cli test https://mysite.com -o json

# Scaffold React setup
$ npx @webmcpregistry/cli init --framework react
```

## License

Apache 2.0 -- [RAPHATECH OU](https://github.com/samuelvinay91/webmcpregistry)

Part of the [WebMCP Registry SDK](https://github.com/samuelvinay91/webmcpregistry) monorepo.
