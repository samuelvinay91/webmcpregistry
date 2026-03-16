import { PlaygroundClient } from './PlaygroundClient'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Playground — Interactive WebMCP tool editor and validator',
  description:
    'Write WebMCP tool definitions, validate schemas in real-time, run security scans, and simulate AI agent execution. Interactive editor with instant feedback.',
  openGraph: {
    title: 'Playground — WebMCP Registry SDK',
    description:
      'Interactive WebMCP tool definition editor with live validation, security scanning, and mock agent execution.',
    url: 'https://webmcpregistry.com/playground',
  },
}

export default function PlaygroundPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-2 text-4xl font-bold">Playground</h1>
      <p className="mb-8 text-[var(--text2)]">
        Write tool definitions, validate them in real-time, and simulate agent interactions.
      </p>
      <PlaygroundClient />
    </div>
  )
}
