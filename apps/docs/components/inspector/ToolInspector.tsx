'use client'

/**
 * Floating Tool Inspector — shows registered WebMCP tools in real-time.
 *
 * This is always visible on the site (bottom-right corner), proving
 * that our dogfooding works. Visitors can expand it to see all tools,
 * their schemas, and try calling them.
 */

import { useState } from 'react'
import { useWebMCPContext } from '@webmcpregistry/react'

export function ToolInspector() {
  const ctx = useWebMCPContext()
  const [expanded, setExpanded] = useState(false)
  const [callResult, setCallResult] = useState<{ tool: string; result: string } | null>(null)
  const [calling, setCalling] = useState(false)

  const handleCallTool = async (toolName: string) => {
    setCalling(true)
    setCallResult(null)
    try {
      // Find the tool and call its handler with minimal input
      const tool = ctx.tools.find((t) => t.name === toolName)
      const handler = tool?.handler
      if (!handler) {
        setCallResult({ tool: toolName, result: 'No handler available (tools need a handler for browser execution)' })
        return
      }

      // Build minimal input from required fields
      const input: Record<string, unknown> = {}
      const required = tool?.inputSchema?.required ?? []
      for (const name of required) {
        input[name] = 'test'
      }

      const result = await handler(input)
      setCallResult({ tool: toolName, result: JSON.stringify(result, null, 2) })
    } catch (err) {
      setCallResult({ tool: toolName, result: `Error: ${err instanceof Error ? err.message : String(err)}` })
    } finally {
      setCalling(false)
    }
  }

  if (!ctx.ready) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Collapsed badge */}
      {!expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--surface)] px-4 py-2 text-sm shadow-lg shadow-black/20 hover:border-[var(--accent)]/60 transition-colors"
        >
          <span className="h-2 w-2 rounded-full bg-[var(--grade-a)] animate-pulse" />
          <span className="font-mono text-[var(--accent)]">{ctx.tools.length}</span>
          <span className="text-[var(--text3)]">WebMCP tools live</span>
        </button>
      )}

      {/* Expanded panel */}
      {expanded && (
        <div className="w-[420px] max-h-[70vh] overflow-auto rounded-xl border border-[var(--border)] bg-[var(--bg)] shadow-2xl shadow-black/40">
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[var(--grade-a)] animate-pulse" />
              <span className="text-sm font-semibold text-[var(--text)]">WebMCP Inspector</span>
              <span className="rounded bg-[var(--accent)]/10 px-1.5 py-0.5 font-mono text-xs text-[var(--accent)]">
                {ctx.tools.length} tools
              </span>
            </div>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="text-[var(--text3)] hover:text-[var(--text)]"
            >
              ✕
            </button>
          </div>

          {/* Status */}
          <div className="border-b border-[var(--border)] px-4 py-2 text-xs text-[var(--text3)]">
            <span>Mode: {ctx.mode}</span>
            <span className="mx-2">·</span>
            <span>API: {ctx.nativeAPI ? 'Native' : 'Polyfill'}</span>
            <span className="mx-2">·</span>
            <span className="text-[var(--grade-a)]">Dogfooding: active</span>
          </div>

          {/* Tools */}
          <div className="divide-y divide-[var(--border)]">
            {ctx.tools.map((tool) => (
              <div key={tool.name} className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-bold text-[var(--accent)]">{tool.name}</code>
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-mono uppercase ${
                      tool.safetyLevel === 'danger' ? 'bg-[var(--grade-f)]/20 text-[var(--grade-f)]'
                        : tool.safetyLevel === 'write' ? 'bg-[var(--grade-c)]/20 text-[var(--grade-c)]'
                          : 'bg-[var(--grade-a)]/20 text-[var(--grade-a)]'
                    }`}>
                      {tool.safetyLevel}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCallTool(tool.name)}
                    disabled={calling}
                    className="rounded bg-[var(--accent)]/10 px-2 py-1 text-[10px] font-mono text-[var(--accent)] hover:bg-[var(--accent)]/20 disabled:opacity-50"
                  >
                    {calling && callResult?.tool === tool.name ? '...' : 'Call'}
                  </button>
                </div>
                <p className="mt-1 text-xs text-[var(--text3)]">{tool.description}</p>

                {/* Schema preview */}
                {tool.inputSchema?.properties && Object.keys(tool.inputSchema.properties).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {Object.entries(tool.inputSchema.properties).map(([name, prop]) => (
                      <span key={name} className="rounded bg-[var(--bg2)] px-1.5 py-0.5 text-[10px] text-[var(--text3)]">
                        {name}
                        {tool.inputSchema?.required?.includes(name) && <span className="text-[var(--grade-f)]">*</span>}
                        <span className="ml-1 opacity-50">{(prop as { type?: string }).type}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Call result */}
                {callResult?.tool === tool.name && (
                  <pre className="mt-2 max-h-32 overflow-auto rounded bg-[var(--bg2)] p-2 text-[10px] text-[var(--text3)]">
                    {callResult.result}
                  </pre>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-[var(--border)] px-4 py-2 text-center text-[10px] text-[var(--text3)]">
            Open DevTools console → <code className="text-[var(--accent)]">navigator.modelContext.getTools()</code>
          </div>
        </div>
      )}
    </div>
  )
}
