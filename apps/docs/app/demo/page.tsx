import { DemoClient } from './DemoClient'

export const metadata = {
  title: 'Live Demo — WebMCP Registry',
  description: 'See WebMCP tools registered on this page in real-time. This site dogfoods its own SDK.',
}

export default function DemoPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-4 text-4xl font-bold">Live Demo</h1>
      <p className="mb-8 text-[var(--text2)]">
        This page demonstrates the WebMCP Registry SDK in action.
        The tools below are registered using our own{' '}
        <code className="rounded bg-[var(--surface)] px-1.5 py-0.5 text-xs text-[var(--accent)]">
          @webmcpregistry/react
        </code>{' '}
        package — the same one you&apos;d use in your app.
      </p>

      <DemoClient />
    </div>
  )
}
