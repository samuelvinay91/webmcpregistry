import { PlaygroundClient } from './PlaygroundClient'

export const metadata = {
  title: 'Playground — WebMCP Registry',
  description: 'Interactive WebMCP tool definition editor with live validation, security scanning, and mock agent execution.',
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
