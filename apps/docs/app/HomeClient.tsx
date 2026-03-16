'use client'

import Link from 'next/link'
import {
  GlowCard,
  FadeInSection,
  AnimatedNumber,
} from '../components/InteractiveEffects'

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
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function ProblemCard({ title, description }: { title: string; description: string }) {
  return (
    <GlowCard glowColor="rgba(255, 77, 109, 0.12)">
      <div className="px-4 py-3.5">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xs text-[var(--grade-f)]">&#x2718;</span>
          <h4 className="text-sm font-semibold text-[var(--text)]">{title}</h4>
        </div>
        <p className="text-xs leading-relaxed text-[var(--text3)]">{description}</p>
      </div>
    </GlowCard>
  )
}

function SolutionCard({ title, description }: { title: string; description: string }) {
  return (
    <GlowCard glowColor="rgba(0, 255, 157, 0.12)">
      <div className="px-4 py-3.5">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xs text-[var(--grade-a)]">&#x2714;</span>
          <h4 className="text-sm font-semibold text-[var(--text)]">{title}</h4>
        </div>
        <p className="text-xs leading-relaxed text-[var(--text2)]">{description}</p>
      </div>
    </GlowCard>
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
    <pre className="overflow-x-auto rounded-lg bg-[var(--bg)] p-4 text-xs leading-relaxed text-[var(--text3)] ring-1 ring-[var(--border)] sm:text-sm">
      <code>{children}</code>
    </pre>
  )
}

/* ------------------------------------------------------------------ */
/*  HomeClient — interactive below-the-fold sections                   */
/* ------------------------------------------------------------------ */

export default function HomeClient() {
  return (
    <>
      {/* ============================================================ */}
      {/*  SECTION 2 — Problem / Solution cards                        */}
      {/* ============================================================ */}
      <FadeInSection delay={0}>
        <section className="pb-20">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
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
      </FadeInSection>

      {/* ============================================================ */}
      {/*  SECTION 3 — Live Tool Inspector reference                    */}
      {/* ============================================================ */}
      <FadeInSection delay={0.1}>
        <section className="pb-20">
          <div className="gradient-border overflow-hidden rounded-xl bg-gradient-to-br from-[var(--accent)]/5 to-transparent">
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
      </FadeInSection>

      {/* ============================================================ */}
      {/*  SECTION 4 — 5-Minute Proof (3 steps)                        */}
      {/* ============================================================ */}
      <FadeInSection delay={0.1}>
        <section className="pb-20">
          <div className="mb-4 text-center">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
              5-Minute Setup
            </h2>
            <p className="text-2xl font-bold md:text-4xl">Three steps. That&apos;s it.</p>
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
      </FadeInSection>

      {/* ============================================================ */}
      {/*  SECTION 5 — Framework Grid                                   */}
      {/* ============================================================ */}
      <FadeInSection delay={0.1}>
        <section className="pb-20">
          <h2 className="mb-2 text-center text-2xl font-bold md:text-3xl">Every framework. One API.</h2>
          <p className="mx-auto mb-10 max-w-md text-center text-sm text-[var(--text2)]">
            Thin adapters over core. Same tools, same API surface, any stack.
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {FRAMEWORKS.map((fw) => (
              <div
                key={fw.name}
                className="hover-lift group rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-center transition-colors hover:border-[var(--text3)]"
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
      </FadeInSection>

      {/* ============================================================ */}
      {/*  SECTION 6 — Package Grid                                     */}
      {/* ============================================================ */}
      <FadeInSection delay={0.1}>
        <section className="pb-20">
          <h2 className="mb-2 text-center text-2xl font-bold md:text-3xl">What you get</h2>
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
      </FadeInSection>

      {/* ============================================================ */}
      {/*  SECTION 7 — Social Proof / Credibility                       */}
      {/* ============================================================ */}
      <FadeInSection delay={0.1}>
        <section className="pb-20">
          <div className="glass rounded-xl">
            <div className="grid grid-cols-1 divide-y divide-[var(--border)] md:grid-cols-3 md:divide-x md:divide-y-0">
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
                  <AnimatedNumber value={12} /> packages. <AnimatedNumber value={170} suffix="+" /> tests. Sigstore provenance on every publish.
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
                  Vitest + jsdom. Conformance suite with <AnimatedNumber value={12} /> W3C scenarios.
                  Mutation testing. AI eval harness.
                </p>
              </div>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* ============================================================ */}
      {/*  SECTION 8 — Final CTA                                        */}
      {/* ============================================================ */}
      <FadeInSection delay={0.1}>
        <section className="pb-20">
          <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center md:px-12">
            {/* Background accent glow */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 via-transparent to-[#7c3aed]/5" />
            <div className="relative">
              <h2 className="mb-4 text-2xl font-bold md:text-4xl">
                Ready to make your site agent-ready?
              </h2>
              <p className="mx-auto mb-8 max-w-md text-sm text-[var(--text2)]">
                Start with the documentation or jump straight into the code.
                Works with React, Next.js, Vue, Angular, Svelte, or plain HTML.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/docs"
                  className="glow-accent rounded-lg bg-[var(--accent)] px-7 py-3.5 text-sm font-semibold text-[var(--bg)] no-underline shadow-lg shadow-[var(--accent)]/20 transition-all hover:shadow-xl hover:shadow-[var(--accent)]/30 hover:brightness-110"
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
      </FadeInSection>
    </>
  )
}
