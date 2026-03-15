/**
 * Browser manager — handles Playwright browser lifecycle.
 *
 * Manages a persistent browser context across all MCP tool calls.
 * Pages are created per-URL and reused for tool discovery + execution.
 */

import type { Browser, BrowserContext, Page } from 'playwright'

export interface BrowserConfig {
  /** Run headless (default: true). */
  headless?: boolean
  /** Browser type: chromium, firefox, webkit (default: chromium). */
  browserType?: 'chromium' | 'firefox' | 'webkit'
  /** Timeout for page navigation in ms (default: 30000). */
  timeout?: number
  /** Custom user agent. */
  userAgent?: string
  /** Path to storage state JSON for auth (cookies, localStorage). */
  storageState?: string
  /** Maximum number of pages to keep open (default: 10). Oldest pages are closed when exceeded. */
  maxPages?: number
}

const DEFAULT_CONFIG: Required<BrowserConfig> = {
  headless: true,
  browserType: 'chromium',
  timeout: 30000,
  userAgent: 'WebMCPServer/0.2.0 (+https://webmcpregistry.com)',
  storageState: '',
  maxPages: 10,
}

export class BrowserManager {
  private config: Required<BrowserConfig>
  private browser: Browser | null = null
  private context: BrowserContext | null = null
  private pages = new Map<string, Page>()

  constructor(config: BrowserConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Lazily initialize browser on first use.
   */
  private async ensureContext(): Promise<BrowserContext> {
    if (this.context) return this.context

    const pw = await import('playwright')
    const browserType = pw[this.config.browserType]

    this.browser = await browserType.launch({
      headless: this.config.headless,
    })

    const contextOptions: Record<string, unknown> = {
      userAgent: this.config.userAgent,
    }

    if (this.config.storageState) {
      contextOptions['storageState'] = this.config.storageState
    }

    this.context = await this.browser.newContext(contextOptions)
    return this.context
  }

  /**
   * Get or create a page for a URL. Reuses existing pages.
   */
  async getPage(url: string): Promise<Page> {
    // Normalize URL for caching
    const key = new URL(url).origin + new URL(url).pathname

    if (this.pages.has(key)) {
      const page = this.pages.get(key)!
      if (!page.isClosed()) return page
      this.pages.delete(key)
    }

    const context = await this.ensureContext()
    const page = await context.newPage()

    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: this.config.timeout,
    })

    // Wait for WebMCP tools to register (they may register after page load)
    try {
      await page.waitForFunction(
        () => {
          const mc = (navigator as any).modelContext
          return mc && typeof mc.getTools === 'function'
        },
        { timeout: 5000 },
      )
    } catch {
      // Site may not have WebMCP — that's okay, we'll fall back to HTML detection
    }

    // Evict oldest page if we've exceeded maxPages
    if (this.pages.size >= this.config.maxPages) {
      const oldestKey = this.pages.keys().next().value!
      const oldestPage = this.pages.get(oldestKey)!
      this.pages.delete(oldestKey)
      if (!oldestPage.isClosed()) await oldestPage.close().catch(() => {})
    }

    this.pages.set(key, page)
    return page
  }

  /**
   * Close all pages and the browser.
   */
  async dispose(): Promise<void> {
    for (const page of this.pages.values()) {
      if (!page.isClosed()) await page.close().catch(() => {})
    }
    this.pages.clear()
    await this.context?.close().catch(() => {})
    await this.browser?.close().catch(() => {})
    this.context = null
    this.browser = null
  }
}
