import Link from 'next/link'

export function Navbar() {
  return (
    <nav className="glass sticky top-0 z-40 border-b border-[var(--border)] px-6 py-3">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="group flex items-center gap-2 text-lg font-bold text-[var(--accent)] no-underline">
          <span className="inline-block h-2 w-2 rounded-full bg-[var(--grade-a)] pulse-glow" />
          WebMCP Registry
        </Link>
        <div className="flex items-center gap-1 text-sm">
          <NavLink href="/docs/why-webmcp">Why WebMCP?</NavLink>
          <NavLink href="/docs">Docs</NavLink>
          <NavLink href="/demo">Live Demo</NavLink>
          <NavLink href="/demo/shop">Before/After</NavLink>
          <NavLink href="/playground">Playground</NavLink>
          <a
            href="https://github.com/samuelvinay91/webmcpregistry"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 rounded-lg border border-[var(--border)] px-3 py-1.5 text-[var(--text2)] no-underline transition-all hover:border-[var(--accent)]/30 hover:text-[var(--text)]"
          >
            GitHub
          </a>
        </div>
      </div>
    </nav>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-1.5 text-[var(--text2)] no-underline transition-all hover:bg-[var(--surface)] hover:text-[var(--text)]"
    >
      {children}
    </Link>
  )
}
