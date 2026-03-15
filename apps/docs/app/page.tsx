import Link from 'next/link'

const FRAMEWORKS = [
  { name: 'React', pkg: '@webmcpregistry/react', color: '#61dafb' },
  { name: 'Next.js', pkg: '@webmcpregistry/nextjs', color: '#ffffff' },
  { name: 'Vue', pkg: '@webmcpregistry/vue', color: '#42b883' },
  { name: 'Angular', pkg: '@webmcpregistry/angular', color: '#dd0031' },
  { name: 'Svelte', pkg: '@webmcpregistry/svelte', color: '#ff3e00' },
  { name: 'HTML', pkg: '<script> tag', color: '#f16529' },
]

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-6">
      {/* Hero */}
      <section className="py-24 text-center">
        <div className="mb-4 inline-block rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-1.5 text-xs text-[var(--accent)]">
          Open Source &middot; Apache 2.0
        </div>
        <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight md:text-6xl">
          Make any website<br />
          <span className="text-[var(--accent)]">callable by AI agents</span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-[var(--text2)]">
          The open-source SDK for the WebMCP browser standard.
          Add structured AI-callable tools to your website in under 5 minutes.
          Works with every framework. Ships with its own polyfill.
        </p>

        {/* Code snippet CTA */}
        <div className="mx-auto mb-8 max-w-lg rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-left font-mono text-sm">
          <span className="text-[var(--text3)]">$</span>{' '}
          <span className="text-[var(--accent)]">npm install</span>{' '}
          <span className="text-[var(--text)]">@webmcpregistry/react</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/docs"
            className="rounded-lg bg-[var(--accent)] px-6 py-3 font-semibold text-[var(--bg)] no-underline hover:opacity-90"
          >
            Get Started
          </Link>
          <Link
            href="/demo"
            className="rounded-lg border border-[var(--border)] px-6 py-3 font-semibold text-[var(--text)] no-underline hover:bg-[var(--surface)]"
          >
            Live Demo
          </Link>
        </div>
      </section>

      {/* Dogfooding banner */}
      <section className="mb-20 rounded-lg border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-6 text-center">
        <p className="text-sm text-[var(--accent)]">
          This site uses its own SDK. Open DevTools and run{' '}
          <code className="rounded bg-[var(--surface)] px-2 py-0.5 text-xs">
            navigator.modelContext.getTools()
          </code>{' '}
          to see 3 live WebMCP tools registered on this page.
        </p>
      </section>

      {/* Framework support */}
      <section className="mb-20">
        <h2 className="mb-8 text-center text-3xl font-bold">
          Every framework. One API.
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {FRAMEWORKS.map((fw) => (
            <div
              key={fw.name}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 text-center"
            >
              <div className="mb-2 text-2xl font-bold" style={{ color: fw.color }}>
                {fw.name}
              </div>
              <code className="text-xs text-[var(--text3)]">{fw.pkg}</code>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mb-20">
        <h2 className="mb-10 text-center text-3xl font-bold">
          How it works
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          <Step
            number="1"
            title="Install the SDK"
            description="One npm package for your framework. Or a single <script> tag for plain HTML."
            code="npm install @webmcpregistry/react"
          />
          <Step
            number="2"
            title="Register tools"
            description="Declaratively or imperatively define what AI agents can do on your site."
            code={`useWebMCPTool({
  name: 'search_products',
  description: 'Search catalog',
  safetyLevel: 'read',
})`}
          />
          <Step
            number="3"
            title="Test & validate"
            description="Run the CLI to check readiness, security, and get a quality grade."
            code="npx @webmcpregistry/cli test https://yoursite.com"
          />
        </div>
      </section>

      {/* What you get */}
      <section className="mb-20">
        <h2 className="mb-10 text-center text-3xl font-bold">
          What the SDK provides
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Feature
            title="Polyfill included"
            description="Works today — no browser support needed yet. When Chrome ships native navigator.modelContext, the polyfill steps aside automatically."
          />
          <Feature
            title="Auto-detection"
            description="Scans your page's forms, buttons, and ARIA labels to auto-generate tool definitions. Zero config needed."
          />
          <Feature
            title="Security scanning"
            description="Detects prompt injection, deceptive naming, unrestricted inputs, and unclassified dangerous operations."
          />
          <Feature
            title="Validation & grading"
            description="Checks naming conventions, description quality, schema completeness, and safety classification. A-F grade."
          />
          <Feature
            title="CLI testing tool"
            description="npx @webmcpregistry/cli test <url> — run a full readiness check from your terminal or CI/CD pipeline."
          />
          <Feature
            title="Tiny bundle"
            description="Core is ~23KB. Framework adapters are 1-4KB. Browser script tag is 10KB self-contained. No bloat."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="mb-20 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-12 text-center">
        <h2 className="mb-4 text-3xl font-bold">Ready to make your site agent-ready?</h2>
        <p className="mb-8 text-[var(--text2)]">
          Start with the documentation, try the live demo, or install the SDK now.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/docs"
            className="rounded-lg bg-[var(--accent)] px-6 py-3 font-semibold text-[var(--bg)] no-underline hover:opacity-90"
          >
            Read the Docs
          </Link>
          <a
            href="https://github.com/webmcpregistry/sdk"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-[var(--border)] px-6 py-3 font-semibold text-[var(--text)] no-underline hover:bg-[var(--surface2)]"
          >
            Star on GitHub
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-8 text-center text-sm text-[var(--text3)]">
        <p>
          Built by <strong className="text-[var(--text2)]">RAPHATECH OÜ</strong> &middot; Open Source
          &middot; Apache 2.0
        </p>
      </footer>
    </div>
  )
}

function Step({
  number,
  title,
  description,
  code,
}: {
  number: string
  title: string
  description: string
  code: string
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-bold text-[var(--bg)]">
        {number}
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="mb-4 text-sm text-[var(--text2)]">{description}</p>
      <pre className="overflow-x-auto rounded bg-[var(--bg2)] p-3 text-xs text-[var(--text3)]">
        {code}
      </pre>
    </div>
  )
}

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
      <h3 className="mb-2 text-lg font-semibold text-[var(--accent)]">{title}</h3>
      <p className="text-sm text-[var(--text2)]">{description}</p>
    </div>
  )
}
