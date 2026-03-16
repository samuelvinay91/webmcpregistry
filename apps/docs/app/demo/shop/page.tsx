import { ShopDemo } from './ShopDemo'

export const metadata = {
  title: 'Cosmic Books — WebMCP E-Commerce Demo',
  description:
    'A real bookstore demo showing how WebMCP transforms AI agent interaction. Side-by-side: raw HTML scraping vs structured tool calls.',
}

export default function ShopDemoPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2"
        style={{
          width: '900px',
          height: '500px',
          background:
            'radial-gradient(ellipse at center, rgba(0,212,255,0.07) 0%, rgba(0,212,255,0.02) 40%, transparent 70%)',
        }}
      />
      <div
        className="pointer-events-none absolute top-60 -left-40"
        style={{
          width: '500px',
          height: '500px',
          background:
            'radial-gradient(circle, rgba(255,77,109,0.04) 0%, transparent 60%)',
        }}
      />
      <div
        className="pointer-events-none absolute top-60 -right-40"
        style={{
          width: '500px',
          height: '500px',
          background:
            'radial-gradient(circle, rgba(0,255,157,0.04) 0%, transparent 60%)',
        }}
      />

      <div className="relative mx-auto max-w-[1400px] px-6 py-16">
        {/* Hero header */}
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/5 px-4 py-1.5 text-xs font-medium tracking-wide text-[var(--accent)] uppercase">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
              style={{ boxShadow: '0 0 6px var(--accent)' }}
            />
            Live Interactive Demo
          </div>
          <h1 className="mb-4 text-5xl font-extrabold leading-tight tracking-tight md:text-6xl">
            <span className="text-[var(--text)]">Cosmic</span>{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, var(--accent) 0%, #a78bfa 50%, var(--grade-a) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Books
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-[var(--text2)]">
            Same bookstore. Two realities. On the left, an AI agent sees chaos.
            On the right, it sees clean, typed, callable tools.
          </p>
          <p className="mt-3 text-sm text-[var(--text3)]">
            The tools below are real — registered right now on this page via{' '}
            <code className="rounded bg-[var(--surface)] px-1.5 py-0.5 text-xs text-[var(--accent)]">
              @webmcpregistry/react
            </code>
            . Try them in the panel below, or open DevTools and call{' '}
            <code className="text-[var(--accent)]">navigator.modelContext.getTools()</code>.
          </p>
        </div>

        <ShopDemo />
      </div>
    </div>
  )
}
