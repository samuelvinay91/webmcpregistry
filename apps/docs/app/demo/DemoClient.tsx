'use client'

import { useWebMCPContext, useWebMCPTool } from '@webmcpregistry/react'
import { validateTools, runSecurityScan } from '@webmcpregistry/core'
import { useState } from 'react'

export function DemoClient() {
  // Register a demo-page-specific tool
  useWebMCPTool({
    name: 'submit_feedback',
    description: 'Submit user feedback about the WebMCP Registry SDK',
    inputSchema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Feedback message' },
        rating: { type: 'integer', description: 'Rating from 1-5' },
      },
      required: ['message'],
    },
    safetyLevel: 'write',
    handler: async (input) => {
      return { status: 'received', message: input['message'] }
    },
  })

  const ctx = useWebMCPContext()
  const [validationResult, setValidationResult] = useState<string | null>(null)
  const [securityResult, setSecurityResult] = useState<string | null>(null)

  const handleValidate = () => {
    const result = validateTools(ctx.tools)
    setValidationResult(JSON.stringify(result, null, 2))
  }

  const handleSecurityScan = () => {
    const result = runSecurityScan(ctx.tools)
    setSecurityResult(JSON.stringify(result, null, 2))
  }

  return (
    <div className="space-y-8">
      {/* Status panel */}
      <div className="rounded-lg border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-6">
        <h2 className="mb-4 text-xl font-semibold text-[var(--accent)]">SDK Status</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-[var(--text3)]">Ready:</span>{' '}
            <span className={ctx.ready ? 'text-[var(--grade-a)]' : 'text-[var(--grade-f)]'}>
              {ctx.ready ? 'Yes' : 'Loading...'}
            </span>
          </div>
          <div>
            <span className="text-[var(--text3)]">Mode:</span>{' '}
            <span className="text-[var(--text)]">{ctx.mode}</span>
          </div>
          <div>
            <span className="text-[var(--text3)]">Native API:</span>{' '}
            <span className="text-[var(--text)]">{ctx.nativeAPI ? 'Yes' : 'No (polyfill)'}</span>
          </div>
          <div>
            <span className="text-[var(--text3)]">Registered tools:</span>{' '}
            <span className="text-[var(--accent)] font-bold">{ctx.tools.length}</span>
          </div>
        </div>
      </div>

      {/* Registered tools */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Registered Tools</h2>
        <p className="mb-4 text-sm text-[var(--text3)]">
          These tools are live on this page. AI agents can call them via{' '}
          <code className="text-[var(--accent)]">navigator.modelContext</code>.
        </p>
        <div className="space-y-3">
          {ctx.tools.map((tool) => (
            <div
              key={tool.name}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4"
            >
              <div className="mb-2 flex items-center gap-3">
                <code className="text-sm font-bold text-[var(--accent)]">{tool.name}</code>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-mono uppercase ${
                    tool.safetyLevel === 'danger'
                      ? 'bg-[var(--grade-f)]/20 text-[var(--grade-f)]'
                      : tool.safetyLevel === 'write'
                        ? 'bg-[var(--grade-c)]/20 text-[var(--grade-c)]'
                        : 'bg-[var(--grade-a)]/20 text-[var(--grade-a)]'
                  }`}
                >
                  {tool.safetyLevel}
                </span>
              </div>
              <p className="mb-2 text-sm text-[var(--text2)]">{tool.description}</p>
              <details className="text-xs">
                <summary className="cursor-pointer text-[var(--text3)] hover:text-[var(--text2)]">
                  Input schema
                </summary>
                <pre className="mt-2 overflow-x-auto rounded bg-[var(--bg2)] p-3 text-[var(--text3)]">
                  {JSON.stringify(tool.inputSchema, null, 2)}
                </pre>
              </details>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={handleValidate}
          className="rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--bg)] hover:opacity-90"
        >
          Run Validation
        </button>
        <button
          onClick={handleSecurityScan}
          className="rounded-lg border border-[var(--border)] px-5 py-2.5 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface)]"
        >
          Run Security Scan
        </button>
      </div>

      {/* Results */}
      {validationResult && (
        <div>
          <h3 className="mb-2 text-lg font-semibold">Validation Result</h3>
          <pre className="overflow-x-auto rounded-lg bg-[var(--surface)] p-4 text-xs text-[var(--text3)]">
            {validationResult}
          </pre>
        </div>
      )}

      {securityResult && (
        <div>
          <h3 className="mb-2 text-lg font-semibold">Security Scan Result</h3>
          <pre className="overflow-x-auto rounded-lg bg-[var(--surface)] p-4 text-xs text-[var(--text3)]">
            {securityResult}
          </pre>
        </div>
      )}

      {/* DevTools hint */}
      <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg2)] p-6 text-center">
        <p className="text-sm text-[var(--text3)]">
          Open your browser DevTools console and try:
        </p>
        <code className="mt-2 block text-sm text-[var(--accent)]">
          navigator.modelContext.getTools()
        </code>
        <p className="mt-2 text-xs text-[var(--text3)]">
          You&apos;ll see all {ctx.tools.length} tools registered on this page.
        </p>
      </div>
    </div>
  )
}
