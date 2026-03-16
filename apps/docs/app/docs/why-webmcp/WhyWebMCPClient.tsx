'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { FadeInSection, GlowCard } from '../../../components/InteractiveEffects'

const COMPARISON_ROWS = [
  {
    dimension: 'Purpose',
    crawling: 'Extract content and simulate user interactions',
    webmcp: 'Call structured, typed tools declared by the site',
  },
  {
    dimension: 'Direction',
    crawling: 'Agent pulls data and guesses UI intent',
    webmcp: 'Site publishes capabilities for agents to invoke',
  },
  {
    dimension: 'Schema',
    crawling: 'AI-inferred \u2014 modern crawlers use LLMs to interpret pages',
    webmcp: 'JSON Schema with typed inputs (spec) + safety annotations (SDK)',
  },
  {
    dimension: 'Safety',
    crawling: 'No structured safety signals from the site',
    webmcp: 'readOnlyHint (spec) + read/write/danger levels (SDK extension)',
  },
  {
    dimension: 'Stability',
    crawling: 'Selector-based scraping breaks on DOM changes; AI crawlers more resilient',
    webmcp: 'Stable contract \u2014 tools are versioned and schema-defined',
  },
  {
    dimension: 'Overhead',
    crawling: 'Seconds of browser rendering + DOM parsing per page',
    webmcp: 'Near-zero overhead \u2014 direct to application logic',
  },
  {
    dimension: 'Control',
    crawling: 'robots.txt and auth exist, but limited control over interpretation',
    webmcp: 'Site declares exactly what tools to expose and how',
  },
  {
    dimension: 'Examples',
    crawling: 'Firecrawl, Exa, Jina, Playwright automation',
    webmcp: 'navigator.modelContext.getTools()',
  },
]

const ARCHITECTURE_LAYERS = [
  {
    label: 'Discovery',
    title: 'Manifest & JSON-LD',
    description:
      'Sites publish a /.well-known/webmcp.json manifest and embed JSON-LD in the page. Agents find available tools before visiting.',
    color: 'var(--accent)',
  },
  {
    label: 'Reading',
    title: 'Web Crawlers',
    description:
      'Crawlers (Firecrawl, Jina, etc.) still index page content for search and context. WebMCP does not replace reading \u2014 it adds calling.',
    color: '#f59e0b',
  },
  {
    label: 'Using',
    title: 'WebMCP Tools',
    description:
      'AI agents call navigator.modelContext.getTools() to discover tools, then invoke them with typed inputs. The site handles execution.',
    color: '#10b981',
  },
  {
    label: 'Testing',
    title: 'Our SDK',
    description:
      'The WebMCP Registry SDK provides polyfill, validation, security scanning, conformance tests, and a CLI \u2014 everything to ship production-ready tools.',
    color: '#8b5cf6',
  },
]

export default function WhyWebMCPClient({ liveDemoSlot }: { liveDemoSlot?: ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      {/* Hero */}
      <section className="mb-20 text-center">
        <div className="mb-4 inline-block rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-1.5 text-xs text-[var(--accent)]">
          The Agentic Web
        </div>
        <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight md:text-6xl">
          Why WebMCP?
        </h1>
        <p className="mx-auto max-w-2xl text-xl text-[var(--text2)]">
          From simulating users to calling APIs.
        </p>
      </section>

      {/* The Problem */}
      <FadeInSection delay={0}>
        <section className="mb-20">
          <h2 className="mb-6 text-3xl font-bold">The Problem</h2>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-8">
            <p className="mb-4 text-[var(--text2)]">
              Today, AI agents interact with websites by <strong className="text-[var(--text)]">simulating users</strong>.
              They launch headless browsers, render pages, and use AI to interpret the DOM.
              Modern tools like <strong className="text-[var(--text)]">Firecrawl</strong>,{' '}
              <strong className="text-[var(--text)]">Exa</strong>, and{' '}
              <strong className="text-[var(--text)]">Jina</strong>{' '}
              have improved significantly &mdash; using LLMs for resilient extraction and structured data output.
            </p>
            <p className="mb-4 text-[var(--text2)]">
              But even the best crawlers share fundamental limitations when it comes to
              {' '}<strong className="text-[var(--text)]">performing actions</strong> on websites:
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <ProblemCard
                title="Indirect"
                description="Agents simulate clicks and form fills through the UI. Selector-based automation breaks on DOM changes; AI-based extraction adds latency and cost."
              />
              <ProblemCard
                title="Overhead"
                description="Every interaction requires browser rendering, JavaScript execution, and DOM parsing. This adds 2-10 seconds of overhead per page."
              />
              <ProblemCard
                title="No Declared Intent"
                description="Sites can use robots.txt and auth, but have no structured way to declare what actions agents should take or how."
              />
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* The Solution */}
      <FadeInSection delay={0.1}>
        <section className="mb-20">
          <h2 className="mb-6 text-3xl font-bold">The Solution</h2>
          <div className="rounded-lg border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-8">
            <p className="mb-4 text-lg text-[var(--text)]">
              WebMCP flips the model. Instead of agents scraping websites, <strong>websites declare
              structured tools</strong> that agents call directly.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <SolutionCard
                title="Typed Inputs (W3C Spec)"
                description="Every tool has a JSON Schema defining exactly what parameters it accepts. No guessing."
              />
              <SolutionCard
                title="Structured Responses"
                description="Tools return JavaScript values, not raw HTML. The spec defines execute() callbacks that return structured data."
              />
              <SolutionCard
                title="Safety Annotations"
                description="The W3C spec provides readOnlyHint. Our SDK extends this with read/write/danger classification for richer safety signals."
              />
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* Side-by-side comparison table */}
      <FadeInSection delay={0.2}>
        <section className="mb-20">
          <h2 className="mb-6 text-3xl font-bold">Side-by-Side Comparison</h2>
          <div className="glass overflow-x-auto rounded-lg border border-[var(--border)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                  <th className="px-4 py-3 text-left font-semibold text-[var(--text)]">Dimension</th>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--text3)]">Web Crawling</th>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--accent)]">WebMCP</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr
                    key={row.dimension}
                    className={
                      i < COMPARISON_ROWS.length - 1
                        ? 'border-b border-[var(--border)]'
                        : ''
                    }
                  >
                    <td className="px-4 py-3 font-medium text-[var(--text)]">{row.dimension}</td>
                    <td className="px-4 py-3 text-[var(--text3)]">{row.crawling}</td>
                    <td className="px-4 py-3 text-[var(--text2)]">{row.webmcp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </FadeInSection>

      {/* Concrete Example */}
      <FadeInSection delay={0.1}>
        <section className="mb-20">
          <h2 className="mb-6 text-3xl font-bold">Concrete Example</h2>
          <p className="mb-6 text-[var(--text2)]">
            An AI agent needs to <strong className="text-[var(--text)]">&quot;Book a flight to Tokyo&quot;</strong>.
            Compare the two approaches:
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Crawling approach */}
            <div className="glow-red rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
              <h3 className="mb-4 text-lg font-semibold text-[var(--text3)]">With Web Crawling</h3>
              <ol className="space-y-3 text-sm text-[var(--text2)]">
                <CrawlingStep step={1} text='Launch headless browser, navigate to airline.com' />
                <CrawlingStep step={2} text='Wait for JS to render, parse DOM for search form' />
                <CrawlingStep step={3} text='Guess which input is "destination" by label text or placeholder' />
                <CrawlingStep step={4} text='Fill form, click search, wait for results page to load' />
                <CrawlingStep step={5} text='Parse flight cards from HTML, extract prices with CSS selectors' />
                <CrawlingStep step={6} text='Click "Book" button, hope the flow has not changed since last week' />
              </ol>
              <div className="mt-4 rounded bg-[var(--bg2)] p-3 text-xs text-[var(--text3)]">
                6 fragile steps. Any DOM change breaks it.
              </div>
            </div>

            {/* WebMCP approach */}
            <div className="glow-green rounded-lg border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-6">
              <h3 className="mb-4 text-lg font-semibold text-[var(--accent)]">With WebMCP</h3>
              <ol className="space-y-3 text-sm text-[var(--text2)]">
                <WebMCPStep
                  step={1}
                  text="Discover tools"
                  code='const tools = await navigator.modelContext.getTools()'
                />
                <WebMCPStep
                  step={2}
                  text="Call the tool"
                  code={`await tools.search_flights.execute({
  destination: "Tokyo",
  date: "2026-04-15",
  passengers: 1
})`}
                />
              </ol>
              <div className="mt-4 rounded bg-[var(--accent)]/10 p-3 text-xs text-[var(--accent)]">
                2 clean steps. Typed inputs. Stable contract.
              </div>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* The Architecture */}
      <FadeInSection delay={0.2}>
        <section className="mb-20">
          <h2 className="mb-6 text-3xl font-bold">The Architecture</h2>
          <p className="mb-8 text-[var(--text2)]">
            WebMCP does not replace web crawling. It adds a new layer on top. Here is how
            the pieces fit together:
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {ARCHITECTURE_LAYERS.map((layer) => (
              <GlowCard key={layer.label}>
                <div className="p-6">
                  <div
                    className="mb-2 inline-block rounded-full px-3 py-1 text-xs font-semibold"
                    style={{
                      color: layer.color,
                      backgroundColor: `color-mix(in srgb, ${layer.color} 10%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${layer.color} 30%, transparent)`,
                    }}
                  >
                    {layer.label}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-[var(--text)]">{layer.title}</h3>
                  <p className="text-sm text-[var(--text2)]">{layer.description}</p>
                </div>
              </GlowCard>
            ))}
          </div>
        </section>
      </FadeInSection>

      {/* Live Demo Section */}
      {liveDemoSlot}

      {/* CTA */}
      <FadeInSection delay={0.1}>
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to make your site agent-callable?</h2>
          <p className="mb-8 text-[var(--text2)]">
            Get started in under 5 minutes. Works with React, Next.js, Vue, Angular, Svelte, or plain HTML.
          </p>
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
      </FadeInSection>
    </div>
  )
}

function ProblemCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="hover-lift rounded-lg border border-[var(--border)] bg-[var(--bg2)] p-4">
      <h4 className="mb-1 font-semibold text-[var(--text)]">{title}</h4>
      <p className="text-xs text-[var(--text3)]">{description}</p>
    </div>
  )
}

function SolutionCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="hover-lift rounded-lg border border-[var(--accent)]/20 bg-[var(--surface)] p-4">
      <h4 className="mb-1 font-semibold text-[var(--accent)]">{title}</h4>
      <p className="text-xs text-[var(--text2)]">{description}</p>
    </div>
  )
}

function CrawlingStep({ step, text }: { step: number; text: string }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--bg2)] text-xs font-semibold text-[var(--text3)]">
        {step}
      </span>
      <span>{text}</span>
    </li>
  )
}

function WebMCPStep({ step, text, code }: { step: number; text: string; code: string }) {
  return (
    <li>
      <div className="mb-2 flex gap-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-semibold text-[var(--bg)]">
          {step}
        </span>
        <span className="font-medium text-[var(--text)]">{text}</span>
      </div>
      <pre className="ml-9 overflow-x-auto rounded bg-[var(--bg2)] p-3 text-xs text-[var(--text3)]">
        {code}
      </pre>
    </li>
  )
}
