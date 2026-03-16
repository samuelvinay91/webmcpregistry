'use client'

import { useState, useCallback, useRef } from 'react'
import Link from 'next/link'

/* ------------------------------------------------------------------ */
/*  Simulated scan result types                                        */
/* ------------------------------------------------------------------ */

type Grade = 'A' | 'B' | 'C' | 'D' | 'F'

interface ScanResult {
  grade: Grade
  toolsFound: number
  toolNames: string[]
  polyfillDetected: boolean
  securityIssues: number
  message: string
  cta: string | null
}

/* ------------------------------------------------------------------ */
/*  Hardcoded simulation logic                                         */
/* ------------------------------------------------------------------ */

function simulateScan(url: string): ScanResult {
  const lower = url.toLowerCase()

  // Sites using the SDK (localhost dev, or our own registry)
  if (lower.includes('localhost') || lower.includes('webmcpregistry')) {
    return {
      grade: 'A',
      toolsFound: 3,
      toolNames: ['search_docs', 'navigate_page', 'get_api_reference'],
      polyfillDetected: true,
      securityIssues: 0,
      message:
        'WebMCP detected! This site registers 3 tools via the SDK polyfill. All tools have valid schemas and safety classifications.',
      cta: null,
    }
  }

  // Well-known commerce sites - not yet WebMCP-ready
  if (
    lower.includes('amazon') ||
    lower.includes('shopify') ||
    lower.includes('ebay')
  ) {
    return {
      grade: 'F',
      toolsFound: 0,
      toolNames: [],
      polyfillDetected: false,
      securityIssues: 0,
      message:
        'No WebMCP tools detected. No navigator.modelContext API found. This site could expose product search, cart management, and order tracking as AI-callable tools.',
      cta: 'Add the SDK to get started',
    }
  }

  // Partially ready sites
  if (
    lower.includes('github') ||
    lower.includes('vercel') ||
    lower.includes('nextjs')
  ) {
    return {
      grade: 'C',
      toolsFound: 1,
      toolNames: ['search'],
      polyfillDetected: false,
      securityIssues: 2,
      message:
        'Partial WebMCP signals detected. Found 1 declarative tool via HTML attributes, but no polyfill or safety classification. Missing input schemas.',
      cta: 'Upgrade to Grade A with the SDK',
    }
  }

  // Default: any other URL
  return {
    grade: 'F',
    toolsFound: 0,
    toolNames: [],
    polyfillDetected: false,
    securityIssues: 0,
    message:
      'No navigator.modelContext detected. This site is not yet WebMCP-ready. AI agents cannot discover or call any tools on this page.',
    cta: 'Make it ready with our SDK',
  }
}

/* ------------------------------------------------------------------ */
/*  Grade badge color mapping                                          */
/* ------------------------------------------------------------------ */

const GRADE_COLORS: Record<Grade, string> = {
  A: 'var(--grade-a)',
  B: 'var(--grade-b)',
  C: 'var(--grade-c)',
  D: 'var(--grade-d)',
  F: 'var(--grade-f)',
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function URLScanner() {
  const [url, setUrl] = useState('')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [showResult, setShowResult] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleScan = useCallback(() => {
    const trimmed = url.trim()
    if (!trimmed) {
      inputRef.current?.focus()
      return
    }

    // Normalize: add protocol if missing
    let normalizedUrl = trimmed
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = `https://${normalizedUrl}`
    }

    setScanning(true)
    setShowResult(false)
    setResult(null)

    // Simulate network delay for realism
    const delay = 1200 + Math.random() * 800
    setTimeout(() => {
      const scanResult = simulateScan(normalizedUrl)
      setResult(scanResult)
      setScanning(false)
      // Trigger CSS transition by showing result after a tick
      requestAnimationFrame(() => {
        setShowResult(true)
      })
    }, delay)
  }, [url])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleScan()
      }
    },
    [handleScan]
  )

  return (
    <section className="mx-auto w-full max-w-2xl">
      {/* Search bar */}
      <div
        className="flex items-stretch overflow-hidden rounded-xl border-2 transition-colors duration-200"
        style={{
          borderColor: scanning ? 'var(--accent)' : 'var(--border)',
          backgroundColor: 'var(--surface)',
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="https://your-website.com"
          disabled={scanning}
          className="flex-1 border-none bg-transparent px-6 py-4 text-lg outline-none placeholder:text-[var(--text3)] disabled:opacity-60"
          style={{ color: 'var(--text)' }}
          aria-label="Website URL to scan"
        />
        <button
          onClick={handleScan}
          disabled={scanning}
          className="cursor-pointer whitespace-nowrap border-none px-6 py-4 text-base font-semibold transition-opacity duration-150 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--bg)',
          }}
        >
          {scanning ? 'Scanning...' : 'Check Readiness'}
        </button>
      </div>

      {/* Loading state */}
      {scanning && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor: 'var(--accent)',
                  animation: `scanner-pulse 1.2s ease-in-out ${i * 0.15}s infinite`,
                }}
              />
            ))}
          </div>
          <p className="text-sm" style={{ color: 'var(--text2)' }}>
            Checking for navigator.modelContext, polyfill, and declarative tools...
          </p>
        </div>
      )}

      {/* Result card */}
      {result && (
        <div
          className="mt-6 overflow-hidden rounded-xl border transition-all duration-500 ease-out"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--surface)',
            opacity: showResult ? 1 : 0,
            transform: showResult ? 'translateY(0)' : 'translateY(12px)',
          }}
        >
          {/* Header row: grade + stats */}
          <div className="flex items-start gap-6 p-6">
            {/* Grade badge */}
            <div
              className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl text-4xl font-bold"
              style={{
                color: GRADE_COLORS[result.grade],
                border: `2px solid ${GRADE_COLORS[result.grade]}`,
                backgroundColor: `color-mix(in srgb, ${GRADE_COLORS[result.grade]} 8%, transparent)`,
              }}
            >
              {result.grade}
            </div>

            {/* Stats */}
            <div className="flex-1">
              <div className="mb-3 grid grid-cols-3 gap-4">
                <StatItem
                  label="Tools found"
                  value={String(result.toolsFound)}
                  color={
                    result.toolsFound > 0
                      ? 'var(--grade-a)'
                      : 'var(--text3)'
                  }
                />
                <StatItem
                  label="Polyfill"
                  value={result.polyfillDetected ? 'Detected' : 'Not found'}
                  color={
                    result.polyfillDetected
                      ? 'var(--grade-a)'
                      : 'var(--text3)'
                  }
                />
                <StatItem
                  label="Security"
                  value={
                    result.securityIssues === 0
                      ? '0 issues'
                      : `${result.securityIssues} issue${result.securityIssues > 1 ? 's' : ''}`
                  }
                  color={
                    result.securityIssues === 0
                      ? 'var(--grade-a)'
                      : 'var(--grade-d)'
                  }
                />
              </div>

              {/* Tool names, if any */}
              {result.toolNames.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {result.toolNames.map((name) => (
                    <span
                      key={name}
                      className="rounded-md px-2 py-0.5 font-mono text-xs"
                      style={{
                        backgroundColor: 'var(--bg2)',
                        color: 'var(--accent)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Message */}
          <div
            className="border-t px-6 py-4"
            style={{ borderColor: 'var(--border)' }}
          >
            <p className="text-sm" style={{ color: 'var(--text2)' }}>
              {result.message}
            </p>
          </div>

          {/* CTA */}
          {result.cta && (
            <div
              className="border-t px-6 py-4"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--bg2)',
              }}
            >
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 text-sm font-semibold no-underline transition-opacity hover:opacity-80"
                style={{ color: 'var(--accent)' }}
              >
                Get your site to Grade A
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* CLI note */}
      <div className="mt-6 text-center">
        <p className="text-xs" style={{ color: 'var(--text3)' }}>
          For full scanning, use the CLI:{' '}
          <code
            className="rounded px-1.5 py-0.5"
            style={{
              backgroundColor: 'var(--surface)',
              color: 'var(--text2)',
            }}
          >
            npx @webmcpregistry/cli test &lt;url&gt;
          </code>
        </p>
        <p className="mt-1.5 text-xs" style={{ color: 'var(--text3)' }}>
          Browser-based preview. For production scanning, use the CLI.
        </p>
      </div>

      {/* Keyframe animation for the pulsing dots */}
      <style>{`
        @keyframes scanner-pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  StatItem helper                                                    */
/* ------------------------------------------------------------------ */

function StatItem({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color: string
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--text3)' }}>
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold" style={{ color }}>
        {value}
      </div>
    </div>
  )
}
