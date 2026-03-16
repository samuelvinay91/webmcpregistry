'use client'

import { useState } from 'react'

const CODE_SNIPPET = `// Open your browser DevTools console on this page and run:
const tools = await navigator.modelContext.getTools()
console.log(tools)

// You'll see the live tools registered by this docs site.
// This site dogfoods the WebMCP Registry SDK —
// the same SDK you'd install in your own app.`

export function LiveDemoSection() {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(
      'navigator.modelContext.getTools().then(t => console.log(t))'
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="mb-20">
      <h2 className="mb-6 text-3xl font-bold">Try It Right Now</h2>
      <div className="rounded-lg border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-8">
        <p className="mb-4 text-[var(--text2)]">
          This very site uses the WebMCP Registry SDK. There are live tools registered on this
          page right now. Open DevTools and see for yourself:
        </p>
        <div className="relative">
          <pre className="overflow-x-auto rounded-lg bg-[var(--surface)] p-4 text-sm text-[var(--text3)]">
            {CODE_SNIPPET}
          </pre>
          <button
            onClick={handleCopy}
            className="absolute right-3 top-3 rounded border border-[var(--border)] bg-[var(--bg2)] px-3 py-1 text-xs text-[var(--text2)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <p className="mt-4 text-sm text-[var(--text3)]">
          The{' '}
          <code className="rounded bg-[var(--surface)] px-1.5 py-0.5 text-xs text-[var(--accent)]">
            navigator.modelContext
          </code>{' '}
          API is provided by our polyfill today. When browsers ship native support,
          the polyfill steps aside automatically.
        </p>
      </div>
    </section>
  )
}
