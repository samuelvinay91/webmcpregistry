import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Documentation — Get started with WebMCP in 5 minutes',
  description:
    'Quick-start guides for React, Next.js, Vue, Angular, Svelte, and plain HTML. Install the SDK, register tools, and make your website callable by AI agents.',
  openGraph: {
    title: 'Documentation — WebMCP Registry SDK',
    description:
      'Learn how to make your website WebMCP-ready. Quick-start guides for every major framework plus CLI testing tools.',
    url: 'https://webmcpregistry.com/docs',
  },
}

const INSTALL_SNIPPETS = [
  {
    framework: 'React',
    install: 'npm install @webmcpregistry/react',
    code: `import { WebMCPProvider, useWebMCPTool } from '@webmcpregistry/react'

function App() {
  return (
    <WebMCPProvider mode="auto">
      <YourApp />
    </WebMCPProvider>
  )
}

function SearchPage() {
  useWebMCPTool({
    name: 'search_products',
    description: 'Search the product catalog by keyword',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search term' },
      },
      required: ['query'],
    },
    safetyLevel: 'read',
    handler: async ({ query }) => {
      const res = await fetch(\`/api/search?q=\${query}\`)
      return res.json()
    },
  })

  return <div>Search Page</div>
}`,
  },
  {
    framework: 'Next.js',
    install: 'npm install @webmcpregistry/nextjs',
    code: `// app/layout.tsx
import { WebMCPProvider } from '@webmcpregistry/nextjs'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <WebMCPProvider mode="auto">
          {children}
        </WebMCPProvider>
      </body>
    </html>
  )
}`,
  },
  {
    framework: 'Vue 3',
    install: 'npm install @webmcpregistry/vue',
    code: `// main.ts
import { createApp } from 'vue'
import { webmcpPlugin } from '@webmcpregistry/vue'

const app = createApp(App)
app.use(webmcpPlugin, { mode: 'auto' })
app.mount('#app')`,
  },
  {
    framework: 'HTML (no framework)',
    install: '<!-- add to your page -->',
    code: `<script src="https://cdn.webmcpregistry.com/v1/auto.js"
  data-mode="auto">
</script>

<!-- Or use declarative attributes -->
<form toolname="search_products"
      tooldescription="Search the product catalog">
  <input name="query" type="text"
         toolparamdescription="Search keywords" />
  <button type="submit">Search</button>
</form>`,
  },
]

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-4 text-4xl font-bold">Getting Started</h1>
      <p className="mb-8 text-lg text-[var(--text2)]">
        Make your website WebMCP-ready in under 5 minutes. Pick your framework below.
      </p>

      {/* Quick start for each framework */}
      <div className="space-y-12">
        {INSTALL_SNIPPETS.map((snippet) => (
          <section key={snippet.framework}>
            <h2 className="mb-4 text-2xl font-semibold">{snippet.framework}</h2>
            <div className="mb-4 rounded-lg bg-[var(--surface)] p-3 font-mono text-sm">
              <span className="text-[var(--text3)]">$</span>{' '}
              <span className="text-[var(--accent)]">{snippet.install}</span>
            </div>
            <pre className="overflow-x-auto rounded-lg bg-[var(--surface)] p-4 text-sm text-[var(--text3)]">
              {snippet.code}
            </pre>
          </section>
        ))}
      </div>

      {/* CLI section */}
      <section className="mt-16">
        <h2 className="mb-4 text-2xl font-semibold">Test your implementation</h2>
        <p className="mb-4 text-[var(--text2)]">
          Use the CLI tool to validate your WebMCP implementation:
        </p>
        <pre className="overflow-x-auto rounded-lg bg-[var(--surface)] p-4 text-sm text-[var(--text3)]">
{`# Full readiness test
npx @webmcpregistry/cli test https://yoursite.com

# Quick static scan (no browser needed)
npx @webmcpregistry/cli scan https://yoursite.com

# Scaffold setup for your framework
npx @webmcpregistry/cli init --framework react`}
        </pre>
      </section>

      {/* Concepts section */}
      <section className="mt-16">
        <h2 className="mb-4 text-2xl font-semibold">Key concepts</h2>
        <div className="space-y-6">
          <Concept
            title="What is WebMCP?"
            description="WebMCP (Web Model Context Protocol) is a W3C Community Group proposal that adds a navigator.modelContext API to browsers. It lets websites register structured tools that AI agents can discover and call — like an API for the agentic web."
          />
          <Concept
            title="Why do I need a polyfill?"
            description="No production browser ships navigator.modelContext yet (only Chrome Canary behind a flag). Our SDK includes a polyfill so you can develop and ship today. When browsers add native support, the polyfill automatically steps aside."
          />
          <Concept
            title="Safety levels"
            description="Every tool must declare a safety level: 'read' (queries, no side effects), 'write' (creates or modifies data), or 'danger' (deletes data, financial transactions). AI agents use this to decide whether to ask for user confirmation."
          />
          <Concept
            title="Auto-detection"
            description="In 'auto' mode, the SDK scans your page's DOM — forms, buttons, ARIA labels, select elements — and generates tool definitions automatically. You can review and customize these in 'suggest' mode."
          />
        </div>
      </section>
    </div>
  )
}

function Concept({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
      <h3 className="mb-2 font-semibold text-[var(--accent)]">{title}</h3>
      <p className="text-sm text-[var(--text2)]">{description}</p>
    </div>
  )
}
