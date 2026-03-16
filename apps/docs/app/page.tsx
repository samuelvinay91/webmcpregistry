import Link from 'next/link'

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const FRAMEWORKS = [
  { name: 'React', pkg: '@webmcpregistry/react', color: '#61dafb' },
  { name: 'Next.js', pkg: '@webmcpregistry/nextjs', color: '#ffffff' },
  { name: 'Vue', pkg: '@webmcpregistry/vue', color: '#42b883' },
  { name: 'Angular', pkg: '@webmcpregistry/angular', color: '#dd0031' },
  { name: 'Svelte', pkg: '@webmcpregistry/svelte', color: '#ff3e00' },
  { name: 'HTML', pkg: '@webmcpregistry/browser', color: '#f16529' },
]

const PACKAGES: {
  name: string
  pkg: string
  description: string
  category: 'adapter' | 'testing' | 'infra'
}[] = [
  { name: 'core', pkg: '@webmcpregistry/core', description: 'Polyfill, detector, validator, security', category: 'adapter' },
  { name: 'react', pkg: '@webmcpregistry/react', description: 'React hooks + provider', category: 'adapter' },
  { name: 'nextjs', pkg: '@webmcpregistry/nextjs', description: 'Next.js App Router adapter', category: 'adapter' },
  { name: 'vue', pkg: '@webmcpregistry/vue', description: 'Vue 3 plugin + composables', category: 'adapter' },
  { name: 'angular', pkg: '@webmcpregistry/angular', description: 'Angular service + DI', category: 'adapter' },
  { name: 'svelte', pkg: '@webmcpregistry/svelte', description: 'Svelte stores + actions', category: 'adapter' },
  { name: 'browser', pkg: '@webmcpregistry/browser', description: '10KB script tag bundle', category: 'adapter' },
  { name: 'cli', pkg: '@webmcpregistry/cli', description: 'Test, scan, init commands', category: 'infra' },
  { name: 'testing', pkg: '@webmcpregistry/testing', description: 'Schema-driven + mutation tests', category: 'testing' },
  { name: 'conformance', pkg: '@webmcpregistry/conformance', description: 'W3C spec conformance suite', category: 'testing' },
  { name: 'evals', pkg: '@webmcpregistry/evals', description: 'AI agent accuracy evaluation', category: 'testing' },
  { name: 'mcp-server', pkg: '@webmcpregistry/mcp-server', description: 'MCP-to-WebMCP bridge', category: 'infra' },
]

const CATEGORY_LABELS: Record<string, string> = {
  adapter: 'Framework Adapters',
  testing: 'Testing & Quality',
  infra: 'Infrastructure',
}

const CATEGORY_COLORS: Record<string, string> = {
  adapter: 'var(--accent)',
  testing: 'var(--grade-c)',
  infra: 'var(--grade-a)',
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-6">
      {/* ============================================================ */}
      {/*  SECTION 1 — Hero                                            */}
      {/* ============================================================ */}
      <section className="pb-20 pt-16 md:pt-24">
        {/* Badge */}
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-1.5 text-xs">
            <span className="text-[var(--text3)]">W3C Community Group Draft</span>
            <span className="text-[var(--border)]">/</span>
            <span className="text-[var(--text3)]">Chrome 146+</span>
            <span className="text-[var(--border)]">/</span>
            <span className="text-[var(--accent)]">Apache 2.0</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="mb-6 text-center text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl">
          Make any website{' '}
          <span className="bg-gradient-to-r from-[var(--accent)] to-[#7c3aed] bg-clip-text text-transparent">
            callable by AI agents
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="mx-auto mb-12 max-w-2xl text-center text-base leading-relaxed text-[var(--text2)] md:text-lg">
          The open-source SDK for the WebMCP browser standard. Register typed tools
          on your website. AI agents discover and call them directly.{' '}
          <span className="text-[var(--text)]">No scraping.</span>
        </p>

        {/* CTA buttons */}
        <div className="mb-16 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/docs"
            className="rounded-lg bg-[var(--accent)] px-7 py-3.5 text-sm font-semibold text-[var(--bg)] no-underline shadow-lg shadow-[var(--accent)]/20 transition-all hover:shadow-xl hover:shadow-[var(--accent)]/30 hover:brightness-110"
          >
            Get Started
          </Link>
          <Link
            href="/playground"
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-7 py-3.5 text-sm font-semibold text-[var(--text)] no-underline transition-colors hover:border-[var(--text3)] hover:bg-[var(--surface2)]"
          >
            Try the Playground
          </Link>
        </div>

        {/* ---------------------------------------------------------- */}
        {/*  HERO VISUAL — Split-screen code comparison                 */}
        {/* ---------------------------------------------------------- */}
        <div className="mx-auto max-w-5xl">
          <div className="grid overflow-hidden rounded-xl border border-[var(--border)] md:grid-cols-2">
            {/* LEFT — Without WebMCP (dim, painful) */}
            <div className="border-b border-[var(--border)] bg-[#0a0c14] md:border-b-0 md:border-r">
              {/* Tab bar */}
              <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--grade-f)]/60" />
                  <span className="text-xs font-medium text-[var(--grade-f)]">Without WebMCP</span>
                </div>
                <span className="text-[10px] text-[var(--text3)]">scraper.ts</span>
              </div>
              {/* Code — intentionally verbose and fragile-looking */}
              <div className="p-4">
                <pre className="text-[11px] leading-[1.7] md:text-xs">
                  <code>
                    <Line dim><Kw dim>import</Kw> {'{'} chromium {'}'} <Kw dim>from</Kw> <Str dim>{`'playwright'`}</Str>;</Line>
                    <Line dim />
                    <Line dim><Kw dim>const</Kw> browser = <Kw dim>await</Kw> chromium.<Fn dim>launch</Fn>();</Line>
                    <Line dim><Kw dim>const</Kw> page = <Kw dim>await</Kw> browser.<Fn dim>newPage</Fn>();</Line>
                    <Line dim><Kw dim>await</Kw> page.<Fn dim>goto</Fn>(<Str dim>{`'https://shop.com'`}</Str>);</Line>
                    <Line dim />
                    <Line dim><Cmt>{'// Wait for JS to render... hope it loads'}</Cmt></Line>
                    <Line dim><Kw dim>await</Kw> page.<Fn dim>waitForSelector</Fn>(<Str dim>{`'.search-input'`}</Str>);</Line>
                    <Line dim><Kw dim>await</Kw> page.<Fn dim>fill</Fn>(<Str dim>{`'.search-input'`}</Str>, <Str dim>{`'shoes'`}</Str>);</Line>
                    <Line dim><Kw dim>await</Kw> page.<Fn dim>click</Fn>(<Str dim>{`'button.search-btn'`}</Str>);</Line>
                    <Line dim />
                    <Line dim><Cmt>{'// Parse DOM... guess the structure'}</Cmt></Line>
                    <Line dim><Kw dim>const</Kw> items = <Kw dim>await</Kw> page.<Fn dim>$$eval</Fn>(</Line>
                    <Line dim>  <Str dim>{`'.product-card'`}</Str>,</Line>
                    <Line dim>  cards =&gt; cards.<Fn dim>map</Fn>(c =&gt; {'({'}</Line>
                    <Line dim>    name: c.<Fn dim>querySelector</Fn>(<Str dim>{`'h3'`}</Str>)?.textContent,</Line>
                    <Line dim>    price: c.<Fn dim>querySelector</Fn>(<Str dim>{`'.price'`}</Str>)?.textContent,</Line>
                    <Line dim>  {'})'})</Line>
                    <Line dim>);</Line>
                  </code>
                </pre>
                {/* Verdict */}
                <div className="mt-4 flex items-center gap-2 rounded-md border border-[var(--grade-f)]/20 bg-[var(--grade-f)]/5 px-3 py-2">
                  <span className="text-sm text-[var(--grade-f)]">&#x2718;</span>
                  <span className="text-[11px] text-[var(--grade-f)]">
                    Fragile. Breaks on DOM changes. 16 lines of guesswork.
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT — With WebMCP (bright, clean) */}
            <div className="bg-[#050810]">
              {/* Tab bar */}
              <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--grade-a)]" />
                  <span className="text-xs font-medium text-[var(--grade-a)]">With WebMCP</span>
                </div>
                <span className="text-[10px] text-[var(--text3)]">agent.ts</span>
              </div>
              {/* Code — clean, bright, typed */}
              <div className="p-4">
                <pre className="text-[11px] leading-[1.7] md:text-xs">
                  <code>
                    <Line><Cmt>{'// Discover tools the site publishes'}</Cmt></Line>
                    <Line><Kw>const</Kw> tools = <Kw>await</Kw> navigator.modelContext</Line>
                    <Line>  .<Fn>getTools</Fn>();</Line>
                    <Line />
                    <Line><Cmt>{'// Call with typed inputs — returns JSON'}</Cmt></Line>
                    <Line><Kw>const</Kw> results = <Kw>await</Kw> tools</Line>
                    <Line>  .<Fn>search_products</Fn>.<Fn>execute</Fn>({'{'}</Line>
                    <Line>    query: <Str>{`'shoes'`}</Str>,</Line>
                    <Line>    maxResults: <Num>10</Num>,</Line>
                    <Line>  {'}'});</Line>
                    <Line />
                    <Line><Cmt>{'// Structured response — no parsing needed'}</Cmt></Line>
                    <Line>console.<Fn>log</Fn>(results.products);</Line>
                    <Line><Cmt>{'// => [{ name: "Air Max", price: 129, ... }]'}</Cmt></Line>
                  </code>
                </pre>
                {/* Verdict */}
                <div className="mt-4 flex items-center gap-2 rounded-md border border-[var(--grade-a)]/20 bg-[var(--grade-a)]/5 px-3 py-2">
                  <span className="text-sm text-[var(--grade-a)]">&#x2714;</span>
                  <span className="text-[11px] text-[var(--grade-a)]">
                    Typed. Stable. Direct to application logic.
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Edge glow effect */}
          <div className="mx-auto -mt-px h-px w-3/4 bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent" />
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 2 — Problem / Solution cards                        */}
      {/* ============================================================ */}
      <section className="pb-20">
        <div className="grid gap-8 md:grid-cols-2">
          {/* The Problem */}
          <div>
            <h2 className="mb-1 text-xs font-semibold uppercase tracking-widest text-[var(--grade-f)]">
              The Problem
            </h2>
            <p className="mb-5 text-2xl font-bold">How agents work today</p>
            <div className="space-y-3">
              <ProblemCard
                title="Indirect"
                description="Agents simulate clicks and form fills through the UI. Selector-based automation breaks on every DOM change."
              />
              <ProblemCard
                title="Overhead"
                description="Every interaction requires browser rendering, JS execution, and DOM parsing. 2-10 seconds of overhead per page."
              />
              <ProblemCard
                title="No Declared Intent"
                description="Sites have no structured way to declare what actions agents should take, what inputs they accept, or what is safe."
              />
            </div>
          </div>

          {/* The Solution */}
          <div>
            <h2 className="mb-1 text-xs font-semibold uppercase tracking-widest text-[var(--grade-a)]">
              The Solution
            </h2>
            <p className="mb-5 text-2xl font-bold">How WebMCP changes it</p>
            <div className="space-y-3">
              <SolutionCard
                title="Typed Inputs (W3C Spec)"
                description="Every tool has a JSON Schema defining exactly what parameters it accepts. No guessing, no DOM parsing."
              />
              <SolutionCard
                title="Structured Responses"
                description="Tools return JavaScript values, not raw HTML. The spec defines execute() callbacks that return structured data."
              />
              <SolutionCard
                title="Safety Annotations"
                description="W3C spec provides readOnlyHint. Our SDK extends this with read/write/danger classification for richer safety signals."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 3 — Live Tool Inspector reference                    */}
      {/* ============================================================ */}
      <section className="pb-20">
        <div className="overflow-hidden rounded-xl border border-[var(--accent)]/20 bg-gradient-to-br from-[var(--accent)]/5 to-transparent">
          <div className="px-6 py-8 text-center md:px-12">
            <div className="mb-4 flex justify-center">
              <div className="flex items-center gap-2 rounded-full bg-[var(--accent)]/10 px-3 py-1">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--grade-a)]" />
                <span className="text-xs font-medium text-[var(--accent)]">Dogfooding: Active</span>
              </div>
            </div>
            <h2 className="mb-3 text-2xl font-bold md:text-3xl">
              This site uses its own SDK
            </h2>
            <p className="mx-auto mb-6 max-w-lg text-sm text-[var(--text2)]">
              Right now, 3 WebMCP tools are live on this page:{' '}
              <code className="rounded bg-[var(--surface)] px-1.5 py-0.5 text-xs text-[var(--accent)]">search_docs</code>,{' '}
              <code className="rounded bg-[var(--surface)] px-1.5 py-0.5 text-xs text-[var(--accent)]">get_sdk_packages</code>, and{' '}
              <code className="rounded bg-[var(--surface)] px-1.5 py-0.5 text-xs text-[var(--accent)]">validate_tool_definition</code>.
            </p>

            {/* Mini demo: DevTools prompt */}
            <div className="mx-auto max-w-lg rounded-lg border border-[var(--border)] bg-[var(--bg2)] p-4 text-left font-mono text-xs">
              <div className="mb-2 flex items-center gap-2 text-[var(--text3)]">
                <span className="rounded bg-[var(--surface)] px-1.5 py-0.5 text-[10px]">Console</span>
                <span className="h-px flex-1 bg-[var(--border)]" />
              </div>
              <div className="mb-1">
                <span className="text-[var(--text3)]">&gt; </span>
                <span className="text-[var(--accent)]">await navigator.modelContext.getTools()</span>
              </div>
              <div className="text-[var(--text3)]">
                <span className="text-[var(--grade-c)]">[</span>
                {' '}{'{ name: '}<span className="text-[var(--grade-a)]">{`"search_docs"`}</span>{', safetyLevel: '}<span className="text-[var(--grade-a)]">{`"read"`}</span>{' }, ... '}
                <span className="text-[var(--grade-c)]">]</span>
              </div>
            </div>

            <p className="mt-5 text-xs text-[var(--text3)]">
              Click the floating inspector in the bottom-right corner to call them live.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 4 — 5-Minute Proof (3 steps)                        */}
      {/* ============================================================ */}
      <section className="pb-20">
        <div className="mb-4 text-center">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
            5-Minute Setup
          </h2>
          <p className="text-3xl font-bold md:text-4xl">Three steps. That&apos;s it.</p>
        </div>
        <p className="mx-auto mb-12 max-w-lg text-center text-sm text-[var(--text2)]">
          Add AI-callable tools to any React app. Works the same way for Vue, Angular, Svelte, and plain HTML.
        </p>

        <div className="mx-auto max-w-3xl space-y-6">
          {/* Step 1 */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            <div className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-3">
              <StepNumber n={1} />
              <span className="text-sm font-semibold">Install</span>
            </div>
            <div className="p-5">
              <CodeBlock>
                {`$ npm install @webmcpregistry/react`}
              </CodeBlock>
            </div>
          </div>

          {/* Step 2 */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            <div className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-3">
              <StepNumber n={2} />
              <span className="text-sm font-semibold">Wrap your app</span>
            </div>
            <div className="p-5">
              <CodeBlock>{`import { WebMCPProvider } from '@webmcpregistry/react';

export default function App({ children }) {
  return (
    <WebMCPProvider mode="suggest" polyfill>
      {children}
    </WebMCPProvider>
  );
}`}</CodeBlock>
            </div>
          </div>

          {/* Step 3 */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            <div className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-3">
              <StepNumber n={3} />
              <span className="text-sm font-semibold">Register a tool</span>
            </div>
            <div className="p-5">
              <CodeBlock>{`import { useWebMCPTool } from '@webmcpregistry/react';

function SearchProducts() {
  useWebMCPTool({
    name: 'search_products',
    description: 'Search the product catalog',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search term' },
      },
      required: ['query'],
    },
    safetyLevel: 'read',
    handler: async ({ query }) => {
      const res = await fetch(\`/api/search?q=\${query}\`);
      return res.json();
    },
  });
  return null;
}`}</CodeBlock>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-sm font-medium text-[var(--text2)]">
          That&apos;s it. AI agents can now discover and call your tools via{' '}
          <code className="rounded bg-[var(--surface)] px-1.5 py-0.5 text-xs text-[var(--accent)]">
            navigator.modelContext.getTools()
          </code>
        </p>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 5 — Framework Grid                                   */}
      {/* ============================================================ */}
      <section className="pb-20">
        <h2 className="mb-2 text-center text-3xl font-bold">Every framework. One API.</h2>
        <p className="mx-auto mb-10 max-w-md text-center text-sm text-[var(--text2)]">
          Thin adapters over core. Same tools, same API surface, any stack.
        </p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {FRAMEWORKS.map((fw) => (
            <div
              key={fw.name}
              className="group rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-center transition-colors hover:border-[var(--text3)]"
            >
              <div
                className="mb-1.5 text-xl font-bold transition-colors"
                style={{ color: fw.color }}
              >
                {fw.name}
              </div>
              <code className="text-[10px] text-[var(--text3)]">{fw.pkg}</code>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 6 — Package Grid                                     */}
      {/* ============================================================ */}
      <section className="pb-20">
        <h2 className="mb-2 text-center text-3xl font-bold">What you get</h2>
        <p className="mx-auto mb-10 max-w-md text-center text-sm text-[var(--text2)]">
          12 packages covering framework adapters, testing, conformance, evals, and infrastructure.
        </p>

        {/* Category groups */}
        {(['adapter', 'testing', 'infra'] as const).map((cat) => (
          <div key={cat} className="mb-8">
            <div className="mb-3 flex items-center gap-2">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[cat] }}
              />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: CATEGORY_COLORS[cat] }}>
                {CATEGORY_LABELS[cat]}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {PACKAGES.filter((p) => p.category === cat).map((pkg) => (
                <div
                  key={pkg.name}
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 transition-colors hover:border-[var(--text3)]"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <code className="text-sm font-semibold text-[var(--text)]">{pkg.name}</code>
                    <span className="rounded bg-[var(--bg2)] px-1.5 py-0.5 text-[9px] font-mono text-[var(--text3)]">
                      0.2.1
                    </span>
                  </div>
                  <p className="text-[11px] leading-snug text-[var(--text3)]">{pkg.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ============================================================ */}
      {/*  SECTION 7 — Social Proof / Credibility                       */}
      {/* ============================================================ */}
      <section className="pb-20">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="grid divide-y divide-[var(--border)] md:grid-cols-3 md:divide-x md:divide-y-0">
            {/* Built on standards */}
            <div className="px-6 py-8 text-center">
              <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
                Built on Standards
              </div>
              <p className="mb-2 text-sm font-medium text-[var(--text)]">
                W3C Community Group Draft
              </p>
              <p className="text-xs text-[var(--text3)]">
                Draft spec by engineers at Google and Microsoft.
                Published by the Web Machine Learning CG.
              </p>
            </div>

            {/* Open Source */}
            <div className="px-6 py-8 text-center">
              <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--grade-a)]">
                Open Source
              </div>
              <p className="mb-2 text-sm font-medium text-[var(--text)]">
                Apache 2.0 License
              </p>
              <p className="text-xs text-[var(--text3)]">
                12 packages. 170+ tests. Sigstore provenance on every publish.
                Fully auditable.
              </p>
            </div>

            {/* Production Ready */}
            <div className="px-6 py-8 text-center">
              <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--grade-c)]">
                Production Ready
              </div>
              <p className="mb-2 text-sm font-medium text-[var(--text)]">
                Tested + CI Verified
              </p>
              <p className="text-xs text-[var(--text3)]">
                Vitest + jsdom. Conformance suite with 12 W3C scenarios.
                Mutation testing. AI eval harness.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 8 — Final CTA                                        */}
      {/* ============================================================ */}
      <section className="pb-20">
        <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center md:px-12">
          {/* Background accent glow */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 via-transparent to-[#7c3aed]/5" />
          <div className="relative">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Ready to make your site agent-ready?
            </h2>
            <p className="mx-auto mb-8 max-w-md text-sm text-[var(--text2)]">
              Start with the documentation or jump straight into the code.
              Works with React, Next.js, Vue, Angular, Svelte, or plain HTML.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/docs"
                className="rounded-lg bg-[var(--accent)] px-7 py-3.5 text-sm font-semibold text-[var(--bg)] no-underline shadow-lg shadow-[var(--accent)]/20 transition-all hover:shadow-xl hover:shadow-[var(--accent)]/30 hover:brightness-110"
              >
                Read the Docs
              </Link>
              <a
                href="https://github.com/samuelvinay91/webmcpregistry"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-[var(--border)] bg-[var(--surface2)] px-7 py-3.5 text-sm font-semibold text-[var(--text)] no-underline transition-colors hover:border-[var(--text3)]"
              >
                Star on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  Footer                                                       */}
      {/* ============================================================ */}
      <footer className="border-t border-[var(--border)] py-8">
        <div className="flex flex-col items-center justify-between gap-4 text-xs text-[var(--text3)] md:flex-row">
          <p>
            Built by{' '}
            <strong className="text-[var(--text2)]">RAPHATECH OU</strong>
            {' '}&middot; Open Source &middot; Apache 2.0
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/samuelvinay91/webmcpregistry"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text3)] no-underline transition-colors hover:text-[var(--text2)]"
            >
              GitHub
            </a>
            <Link href="/docs" className="text-[var(--text3)] no-underline transition-colors hover:text-[var(--text2)]">
              Docs
            </Link>
            <Link href="/demo" className="text-[var(--text3)] no-underline transition-colors hover:text-[var(--text2)]">
              Demo
            </Link>
            <a
              href="https://webmachinelearning.github.io/webmcp/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text3)] no-underline transition-colors hover:text-[var(--text2)]"
            >
              W3C Spec
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function ProblemCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-[var(--grade-f)]/10 bg-[var(--grade-f)]/5 px-4 py-3.5">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-xs text-[var(--grade-f)]">&#x2718;</span>
        <h4 className="text-sm font-semibold text-[var(--text)]">{title}</h4>
      </div>
      <p className="text-xs leading-relaxed text-[var(--text3)]">{description}</p>
    </div>
  )
}

function SolutionCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-[var(--grade-a)]/10 bg-[var(--grade-a)]/5 px-4 py-3.5">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-xs text-[var(--grade-a)]">&#x2714;</span>
        <h4 className="text-sm font-semibold text-[var(--text)]">{title}</h4>
      </div>
      <p className="text-xs leading-relaxed text-[var(--text2)]">{description}</p>
    </div>
  )
}

function StepNumber({ n }: { n: number }) {
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-[var(--bg)]">
      {n}
    </span>
  )
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg bg-[var(--bg)] p-4 text-xs leading-relaxed text-[var(--text3)] ring-1 ring-[var(--border)]">
      <code>{children}</code>
    </pre>
  )
}

/* ------------------------------------------------------------------ */
/*  Syntax highlighting helpers for the hero code blocks               */
/* ------------------------------------------------------------------ */

function Line({ children, dim }: { children?: React.ReactNode; dim?: boolean }) {
  return (
    <div className={dim ? 'opacity-50' : ''}>
      {children || '\u00A0'}
    </div>
  )
}

function Kw({ children, dim }: { children: React.ReactNode; dim?: boolean }) {
  return (
    <span className={dim ? 'text-[#6e7681]' : 'text-[#c678dd]'}>
      {children}
    </span>
  )
}

function Fn({ children, dim }: { children: React.ReactNode; dim?: boolean }) {
  return (
    <span className={dim ? 'text-[#4d6480]' : 'text-[#61afef]'}>
      {children}
    </span>
  )
}

function Str({ children, dim }: { children: React.ReactNode; dim?: boolean }) {
  return (
    <span className={dim ? 'text-[#3d5a3d]' : 'text-[#98c379]'}>
      {children}
    </span>
  )
}

function Num({ children }: { children: React.ReactNode }) {
  return <span className="text-[#d19a66]">{children}</span>
}

function Cmt({ children }: { children: React.ReactNode }) {
  return <span className="text-[#5c6370] italic">{children}</span>
}
