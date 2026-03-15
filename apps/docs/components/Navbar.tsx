import Link from 'next/link'

export function Navbar() {
  return (
    <nav className="border-b border-[var(--border)] px-6 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="text-lg font-bold text-[var(--accent)] no-underline">
          WebMCP Registry
        </Link>
        <div className="flex gap-6 text-sm text-[var(--text2)]">
          <Link href="/docs" className="hover:text-[var(--text)] no-underline">
            Docs
          </Link>
          <Link href="/demo" className="hover:text-[var(--text)] no-underline">
            Live Demo
          </Link>
          <Link href="/playground" className="hover:text-[var(--text)] no-underline">
            Playground
          </Link>
          <a
            href="https://github.com/webmcpregistry/sdk"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--text)] no-underline"
          >
            GitHub
          </a>
        </div>
      </div>
    </nav>
  )
}
