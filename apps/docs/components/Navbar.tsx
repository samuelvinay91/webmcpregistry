'use client'

import { useState } from 'react'
import Link from 'next/link'

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="glass sticky top-0 z-40 border-b border-[var(--border)] px-6 py-3">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="group flex items-center gap-2 text-lg font-bold text-[var(--accent)] no-underline">
          <span className="inline-block h-2 w-2 rounded-full bg-[var(--grade-a)] pulse-glow" />
          WebMCP Registry
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-1 text-sm md:flex">
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

        {/* Hamburger button (mobile only) */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="flex flex-col items-center justify-center gap-1.5 md:hidden"
          aria-label="Toggle menu"
        >
          <span className={`block h-0.5 w-6 rounded bg-[var(--text)] transition-all ${mobileOpen ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`block h-0.5 w-6 rounded bg-[var(--text)] transition-all ${mobileOpen ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 w-6 rounded bg-[var(--text)] transition-all ${mobileOpen ? '-translate-y-2 -rotate-45' : ''}`} />
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <div className="mt-3 flex flex-col gap-1 border-t border-[var(--border)] pt-3 md:hidden">
          <MobileNavLink href="/docs/why-webmcp" onClick={() => setMobileOpen(false)}>Why WebMCP?</MobileNavLink>
          <MobileNavLink href="/docs" onClick={() => setMobileOpen(false)}>Docs</MobileNavLink>
          <MobileNavLink href="/demo" onClick={() => setMobileOpen(false)}>Live Demo</MobileNavLink>
          <MobileNavLink href="/demo/shop" onClick={() => setMobileOpen(false)}>Before/After</MobileNavLink>
          <MobileNavLink href="/playground" onClick={() => setMobileOpen(false)}>Playground</MobileNavLink>
          <a
            href="https://github.com/samuelvinay91/webmcpregistry"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg px-3 py-2 text-sm text-[var(--text2)] no-underline transition-all hover:bg-[var(--surface)] hover:text-[var(--text)]"
          >
            GitHub
          </a>
        </div>
      )}
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

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-lg px-3 py-2 text-sm text-[var(--text2)] no-underline transition-all hover:bg-[var(--surface)] hover:text-[var(--text)]"
    >
      {children}
    </Link>
  )
}
