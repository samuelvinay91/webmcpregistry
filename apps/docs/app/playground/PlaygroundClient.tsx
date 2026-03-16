'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  validateTools,
  runSecurityScan,
  generateManifest,
  generateJsonLd,
  generateLlmsTxt,
  type ToolDefinition,
  type ValidationResult,
  type SecurityReport,
} from '@webmcpregistry/core'

const DEFAULT_TOOL: ToolDefinition = {
  name: 'search_products',
  description: 'Search the product catalog by keyword, category, or price range',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Search keywords' },
      category: { type: 'string', description: 'Product category filter', enum: ['electronics', 'clothing', 'books'] },
      max_price: { type: 'number', description: 'Maximum price in USD' },
    },
    required: ['query'],
  },
  safetyLevel: 'read',
  annotations: { readOnlyHint: true },
}

type Tab = 'editor' | 'validation' | 'security' | 'manifest' | 'jsonld' | 'llmstxt'

export function PlaygroundClient() {
  const [json, setJson] = useState(JSON.stringify(DEFAULT_TOOL, null, 2))
  const [parseError, setParseError] = useState<string | null>(null)
  const [tool, setTool] = useState<ToolDefinition>(DEFAULT_TOOL)
  const [tab, setTab] = useState<Tab>('editor')
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [security, setSecurity] = useState<SecurityReport | null>(null)

  // Run validation and security on initial load
  useEffect(() => {
    setValidation(validateTools([DEFAULT_TOOL]))
    setSecurity(runSecurityScan([DEFAULT_TOOL]))
  }, [])

  const handleJsonChange = useCallback((value: string) => {
    setJson(value)
    try {
      const parsed = JSON.parse(value) as ToolDefinition
      setTool(parsed)
      setParseError(null)
      // Auto-validate
      setValidation(validateTools([parsed]))
      setSecurity(runSecurityScan([parsed]))
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Invalid JSON')
    }
  }, [])

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'editor', label: 'Editor' },
    { id: 'validation', label: 'Validation' },
    { id: 'security', label: 'Security' },
    { id: 'manifest', label: 'Manifest' },
    { id: 'jsonld', label: 'JSON-LD' },
    { id: 'llmstxt', label: 'llms.txt' },
  ]

  return (
    <div>
      {/* Tab bar */}
      <div className="mb-6 flex gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1">
        {tabs.map((t) => (
          <button
            type="button"
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? 'bg-[var(--accent)] text-[var(--bg)]'
                : 'text-[var(--text2)] hover:text-[var(--text)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Editor tab */}
      {tab === 'editor' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text2)]">
              Tool Definition (JSON)
            </label>
            <textarea
              id="tool-json-editor"
              aria-label="Tool definition JSON editor"
              value={json}
              onChange={(e) => handleJsonChange(e.target.value)}
              className="h-[500px] w-full rounded-lg border border-[var(--border)] bg-[var(--bg2)] p-4 font-mono text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
              spellCheck={false}
            />
            {parseError && (
              <p className="mt-2 text-sm text-[var(--grade-f)]">{parseError}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text2)]">
              Preview (how agents see your tool)
            </label>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
              {!parseError && (
                <>
                  <div className="mb-4">
                    <div className="flex items-center gap-3">
                      <code className="text-lg font-bold text-[var(--accent)]">{tool.name}</code>
                      <span className={`rounded px-2 py-0.5 text-xs font-mono uppercase ${
                        tool.safetyLevel === 'danger' ? 'bg-[var(--grade-f)]/20 text-[var(--grade-f)]'
                          : tool.safetyLevel === 'write' ? 'bg-[var(--grade-c)]/20 text-[var(--grade-c)]'
                            : 'bg-[var(--grade-a)]/20 text-[var(--grade-a)]'
                      }`}>
                        {tool.safetyLevel}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-[var(--text2)]">{tool.description}</p>
                  </div>

                  <h4 className="mb-2 text-xs font-medium uppercase text-[var(--text3)]">Input Schema</h4>
                  {Object.entries(tool.inputSchema?.properties ?? {}).map(([name, prop]) => {
                    const p = prop as { type?: string; description?: string }
                    return (
                      <div key={name} className="mb-2 flex items-center gap-2 text-sm">
                        <code className="text-[var(--accent)]">{name}</code>
                        <span className="text-[var(--text3)]">({p.type ?? 'unknown'})</span>
                        {tool.inputSchema?.required?.includes(name) && (
                          <span className="text-xs text-[var(--grade-f)]">required</span>
                        )}
                        {p.description && (
                          <span className="text-[var(--text3)]">— {p.description}</span>
                        )}
                      </div>
                    )
                  })}

                  {tool.annotations && (
                    <div className="mt-4">
                      <h4 className="mb-2 text-xs font-medium uppercase text-[var(--text3)]">Annotations</h4>
                      {Object.entries(tool.annotations).map(([key, val]) => (
                        <div key={key} className="text-sm">
                          <code className="text-[var(--text3)]">{key}</code>: {String(val)}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick validation status */}
                  {validation && (
                    <div className={`mt-4 rounded p-3 text-sm ${
                      validation.valid ? 'bg-[var(--grade-a)]/10 text-[var(--grade-a)]' : 'bg-[var(--grade-f)]/10 text-[var(--grade-f)]'
                    }`}>
                      {validation.valid ? '✓ Valid' : '✗ Issues found'} · Score: {validation.score}/100
                      · {validation.issues.length} issue(s)
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Validation tab */}
      {tab === 'validation' && (
        <div className="glass rounded-lg border border-[var(--border)] p-6">
          {validation ? (
            <>
              <div className="mb-4 flex items-center gap-3">
                <h3 className="text-xl font-semibold">
                  Validation: {validation.valid ? '✓ Pass' : '✗ Fail'}
                </h3>
                <span className={`rounded-full px-3 py-1 text-sm font-bold ${
                  validation.score >= 80 ? 'bg-[var(--grade-a)]/20 text-[var(--grade-a)]'
                    : validation.score >= 50 ? 'bg-[var(--grade-c)]/20 text-[var(--grade-c)]'
                      : 'bg-[var(--grade-f)]/20 text-[var(--grade-f)]'
                }`}>
                  {validation.score}/100
                </span>
              </div>
              {validation.issues.length === 0 ? (
                <p className="text-[var(--grade-a)]">No issues found. Your tool definition looks great.</p>
              ) : (
                <div className="space-y-2">
                  {validation.issues.map((issue, i) => (
                    <div key={i} className={`hover-lift rounded-lg p-3 text-sm ${
                      issue.severity === 'error' ? 'bg-[var(--grade-f)]/10 text-[var(--grade-f)]'
                        : issue.severity === 'warning' ? 'bg-[var(--grade-c)]/10 text-[var(--grade-c)]'
                          : 'bg-[var(--accent)]/10 text-[var(--accent)]'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-[var(--bg2)] px-1.5 py-0.5 font-mono text-xs">{issue.severity}</span>
                        <strong>[{issue.code}]</strong>
                      </div>
                      <p className="mt-1">{issue.message}</p>
                      {issue.field && (
                        <p className="mt-1 text-xs opacity-60">Field: {issue.field}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-[var(--text3)]">Edit the tool JSON in the Editor tab to see validation results.</p>
          )}
        </div>
      )}

      {/* Security tab */}
      {tab === 'security' && (
        <div className="glass rounded-lg border border-[var(--border)] p-6">
          {security ? (
            <>
              <div className="mb-4 flex items-center gap-3">
                <h3 className="text-xl font-semibold">
                  Security: {security.status}
                </h3>
                <span className={`rounded-full px-3 py-1 text-sm font-bold ${
                  security.score >= 80 ? 'bg-[var(--grade-a)]/20 text-[var(--grade-a)]'
                    : security.score >= 50 ? 'bg-[var(--grade-c)]/20 text-[var(--grade-c)]'
                      : 'bg-[var(--grade-f)]/20 text-[var(--grade-f)]'
                }`}>
                  {security.score}/100
                </span>
              </div>
              {security.findings.length === 0 ? (
                <p className="text-[var(--grade-a)]">No security issues found. Your tool is safe.</p>
              ) : (
                <div className="space-y-2">
                  {security.findings.map((f, i) => (
                    <div key={i} className={`hover-lift rounded-lg p-3 text-sm ${
                      f.severity === 'critical' || f.severity === 'high'
                        ? 'bg-[var(--grade-f)]/10 text-[var(--grade-f)]'
                        : 'bg-[var(--grade-c)]/10 text-[var(--grade-c)]'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-[var(--bg2)] px-1.5 py-0.5 font-mono text-xs uppercase">{f.severity}</span>
                        <strong>{f.type}</strong>
                      </div>
                      <p className="mt-1">{f.description}</p>
                      {f.toolName && (
                        <p className="mt-1 text-xs opacity-60">Tool: {f.toolName}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-[var(--text3)]">Edit the tool JSON in the Editor tab to see security results.</p>
          )}
        </div>
      )}

      {/* Manifest tab */}
      {tab === 'manifest' && !parseError && (
        <div className="glass rounded-lg border border-[var(--border)] p-6">
          <h3 className="mb-4 text-xl font-semibold">/.well-known/webmcp.json</h3>
          <p className="mb-4 text-sm text-[var(--text3)]">
            Host this at your site&apos;s root for AI agent discovery.
          </p>
          <pre className="overflow-x-auto rounded-lg bg-[var(--bg2)] p-4 text-xs text-[var(--text3)]">
            {JSON.stringify(
              generateManifest([tool], { name: 'Your Site', url: 'https://yoursite.com' }),
              null,
              2
            )}
          </pre>
        </div>
      )}

      {/* JSON-LD tab */}
      {tab === 'jsonld' && !parseError && (
        <div className="glass rounded-lg border border-[var(--border)] p-6">
          <h3 className="mb-4 text-xl font-semibold">JSON-LD Structured Data</h3>
          <p className="mb-4 text-sm text-[var(--text3)]">
            Add this in a {'<script type="application/ld+json">'} tag for AI crawlers.
          </p>
          <pre className="overflow-x-auto rounded-lg bg-[var(--bg2)] p-4 text-xs text-[var(--text3)]">
            {JSON.stringify(
              generateJsonLd([tool], { name: 'Your Site', url: 'https://yoursite.com' }),
              null,
              2
            )}
          </pre>
        </div>
      )}

      {/* llms.txt tab */}
      {tab === 'llmstxt' && !parseError && (
        <div className="glass rounded-lg border border-[var(--border)] p-6">
          <h3 className="mb-4 text-xl font-semibold">llms.txt</h3>
          <p className="mb-4 text-sm text-[var(--text3)]">
            Host this at /llms.txt for AI systems to understand your site&apos;s capabilities.
          </p>
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-[var(--bg2)] p-4 text-xs text-[var(--text3)]">
            {generateLlmsTxt([tool], { name: 'Your Site', url: 'https://yoursite.com', description: 'Your site description' })}
          </pre>
        </div>
      )}
    </div>
  )
}
