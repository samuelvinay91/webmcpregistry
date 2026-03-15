/**
 * Tool executor — runs WebMCP tools inside the browser via Playwright.
 *
 * When Claude calls a tool, we:
 * 1. Find the page where the tool was discovered
 * 2. Re-resolve the tool reference (JS objects don't survive across evaluations)
 * 3. Call tool.execute(args) in the page context
 * 4. Serialize the result back
 */

import type { Page } from 'playwright'

export interface ExecutionResult {
  success: boolean
  data?: unknown
  error?: string
  durationMs: number
}

/**
 * Execute a WebMCP tool by name in a browser page context.
 */
export async function executeTool(
  page: Page,
  toolName: string,
  args: Record<string, unknown>,
): Promise<ExecutionResult> {
  const start = Date.now()

  try {
    const result = await page.evaluate(
      async ({ name, args }) => {
        const mc = (navigator as any).modelContext
        if (!mc || typeof mc.getTools !== 'function') {
          throw new Error('navigator.modelContext not available on this page')
        }

        const tools = mc.getTools()
        const tool = tools.find((t: any) => t.name === name)
        if (!tool) {
          throw new Error(`Tool "${name}" not found. Available: ${tools.map((t: any) => t.name).join(', ')}`)
        }

        // Call the tool's execute callback (or handler)
        const handler = tool.execute ?? tool.handler
        if (!handler) {
          throw new Error(`Tool "${name}" has no execute/handler callback`)
        }

        return await handler(args)
      },
      { name: toolName, args },
    )

    return {
      success: true,
      data: result,
      durationMs: Date.now() - start,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    }
  }
}

/**
 * Execute a tool and format the result for MCP protocol response.
 */
export async function executeToolForMCP(
  page: Page,
  toolName: string,
  args: Record<string, unknown>,
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const result = await executeTool(page, toolName, args)

  if (result.success) {
    const text = typeof result.data === 'string'
      ? result.data
      : JSON.stringify(result.data, null, 2)

    return {
      content: [{
        type: 'text',
        text: `${text}\n\n[Executed in ${result.durationMs}ms]`,
      }],
    }
  }

  return {
    content: [{
      type: 'text',
      text: `Error executing tool "${toolName}": ${result.error}`,
    }],
    isError: true,
  }
}
