import type { Metadata } from 'next'
import Link from 'next/link'
import HomeClient from './HomeClient'

export const metadata: Metadata = {
  title: 'WebMCP Registry — Make any website callable by AI agents',
  description:
    'Open-source SDK for the WebMCP browser standard. Register typed tools via navigator.modelContext so AI agents call your site directly. React, Vue, Angular, Svelte adapters.',
  openGraph: {
    title: 'WebMCP Registry — Make any website callable by AI agents',
    description:
      'The open-source SDK for the WebMCP browser standard. Register typed tools on your website so AI agents can discover and call them.',
    url: 'https://webmcpregistry.com',
  },
}

/* ------------------------------------------------------------------ */
/*  Page (Server Component — fast initial paint for hero)              */
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
            className="glow-accent rounded-lg bg-[var(--accent)] px-7 py-3.5 text-sm font-semibold text-[var(--bg)] no-underline shadow-lg shadow-[var(--accent)]/20 transition-all hover:shadow-xl hover:shadow-[var(--accent)]/30 hover:brightness-110"
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
            <div className="glow-red border-b border-[var(--border)] bg-[#0a0c14] md:border-b-0 md:border-r">
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
            <div className="glow-green bg-[#050810]">
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
      {/*  Interactive sections (Client Component)                      */}
      {/* ============================================================ */}
      <HomeClient />

      {/* ============================================================ */}
      {/*  Footer (Server Component)                                    */}
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
