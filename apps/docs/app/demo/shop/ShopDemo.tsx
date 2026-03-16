'use client'

import { useState, useCallback } from 'react'
import { useWebMCPTool } from '@webmcpregistry/react'
import { GlowCard, FadeInSection } from '../../../components/InteractiveEffects'

/* ------------------------------------------------------------------ */
/*  Book data                                                         */
/* ------------------------------------------------------------------ */

interface Book {
  id: string
  title: string
  author: string
  price: number
  genre: string
  year: number
  pages: number
  rating: number
  coverColor: string
  coverAccent: string
  synopsis: string
}

const BOOKS: Book[] = [
  {
    id: 'dune',
    title: 'Dune',
    author: 'Frank Herbert',
    price: 14.99,
    genre: 'sci-fi',
    year: 1965,
    pages: 688,
    rating: 4.8,
    coverColor: '#c2742f',
    coverAccent: '#f5deb3',
    synopsis: 'A noble family is entrusted with the protection of the most valuable asset in the galaxy.',
  },
  {
    id: 'neuromancer',
    title: 'Neuromancer',
    author: 'William Gibson',
    price: 12.99,
    genre: 'sci-fi',
    year: 1984,
    pages: 271,
    rating: 4.5,
    coverColor: '#1a8a5e',
    coverAccent: '#a3f7bf',
    synopsis: 'A washed-up hacker is hired for one last job in the sprawl of a dystopian future.',
  },
  {
    id: 'gatsby',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    price: 9.99,
    genre: 'fiction',
    year: 1925,
    pages: 180,
    rating: 4.4,
    coverColor: '#2a4a7f',
    coverAccent: '#ffd700',
    synopsis: 'The mysterious millionaire Jay Gatsby and his obsession with the beautiful Daisy Buchanan.',
  },
  {
    id: '1984',
    title: '1984',
    author: 'George Orwell',
    price: 11.99,
    genre: 'dystopian',
    year: 1949,
    pages: 328,
    rating: 4.7,
    coverColor: '#8b0000',
    coverAccent: '#ff6b6b',
    synopsis: 'A totalitarian regime controls every aspect of life. One man dares to dream of freedom.',
  },
  {
    id: 'sapiens',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    price: 16.99,
    genre: 'non-fiction',
    year: 2011,
    pages: 443,
    rating: 4.6,
    coverColor: '#5b3a8c',
    coverAccent: '#d4a5ff',
    synopsis: 'A brief history of humankind — from the Stone Age to the Silicon Age.',
  },
  {
    id: 'hailmary',
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    price: 15.99,
    genre: 'sci-fi',
    year: 2021,
    pages: 476,
    rating: 4.9,
    coverColor: '#0d3b66',
    coverAccent: '#00d4ff',
    synopsis: 'A lone astronaut must save Earth from an extinction-level threat — if only he could remember how.',
  },
]

/* ------------------------------------------------------------------ */
/*  Cart state                                                        */
/* ------------------------------------------------------------------ */

interface CartItem {
  bookId: string
  title: string
  price: number
  quantity: number
}

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */

export function ShopDemo() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [tryItLog, setTryItLog] = useState<Array<{ type: 'call' | 'result'; text: string }>>([])
  const [isRunning, setIsRunning] = useState(false)

  /* ---- Register WebMCP tools ---- */

  const searchBooksHandler = useCallback(
    async (input: Record<string, unknown>) => {
      const query = ((input['query'] as string) ?? '').toLowerCase()
      const genre = input['genre'] as string | undefined
      const maxPrice = input['max_price'] as number | undefined

      let results = BOOKS.filter((b) => {
        if (query && !b.title.toLowerCase().includes(query) && !b.author.toLowerCase().includes(query)) {
          return false
        }
        return true
      })

      if (genre) results = results.filter((b) => b.genre === genre)
      if (maxPrice !== undefined) results = results.filter((b) => b.price <= maxPrice)

      return {
        count: results.length,
        books: results.map((b) => ({
          id: b.id,
          title: b.title,
          author: b.author,
          price: b.price,
          genre: b.genre,
          rating: b.rating,
        })),
      }
    },
    [],
  )

  useWebMCPTool({
    name: 'search_books',
    description: 'Search the Cosmic Books catalog by keyword, genre, or price range',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search by title or author name' },
        genre: {
          type: 'string',
          description: 'Filter by genre',
          enum: ['sci-fi', 'fiction', 'dystopian', 'non-fiction'],
        },
        max_price: { type: 'number', description: 'Maximum price in USD' },
      },
    },
    safetyLevel: 'read',
    annotations: { readOnlyHint: true },
    handler: searchBooksHandler,
  })

  const addToCartHandler = useCallback(
    async (input: Record<string, unknown>) => {
      const bookId = input['book_id'] as string
      const quantity = (input['quantity'] as number) ?? 1
      const book = BOOKS.find((b) => b.id === bookId)
      if (!book) return { error: `Book "${bookId}" not found` }

      setCart((prev) => {
        const existing = prev.find((i) => i.bookId === bookId)
        if (existing) {
          return prev.map((i) => (i.bookId === bookId ? { ...i, quantity: i.quantity + quantity } : i))
        }
        return [...prev, { bookId: book.id, title: book.title, price: book.price, quantity }]
      })

      return {
        success: true,
        added: { title: book.title, quantity, price: book.price },
        message: `Added ${quantity}x "${book.title}" to cart`,
      }
    },
    [],
  )

  useWebMCPTool({
    name: 'add_to_cart',
    description: 'Add a book to the shopping cart by its ID',
    inputSchema: {
      type: 'object',
      properties: {
        book_id: {
          type: 'string',
          description: 'Book ID (e.g., "dune", "neuromancer", "gatsby", "1984", "sapiens", "hailmary")',
        },
        quantity: { type: 'integer', description: 'Number of copies (default: 1)' },
      },
      required: ['book_id'],
    },
    safetyLevel: 'write',
    handler: addToCartHandler,
  })

  const getBookDetailsHandler = useCallback(async (input: Record<string, unknown>) => {
    const bookId = input['book_id'] as string
    const book = BOOKS.find((b) => b.id === bookId)
    if (!book) return { error: `Book "${bookId}" not found` }
    return {
      id: book.id,
      title: book.title,
      author: book.author,
      price: book.price,
      genre: book.genre,
      year: book.year,
      pages: book.pages,
      rating: book.rating,
      synopsis: book.synopsis,
    }
  }, [])

  useWebMCPTool({
    name: 'get_book_details',
    description: 'Get full details for a specific book by ID, including synopsis and metadata',
    inputSchema: {
      type: 'object',
      properties: {
        book_id: {
          type: 'string',
          description: 'Book ID (e.g., "dune", "neuromancer", "gatsby", "1984", "sapiens", "hailmary")',
        },
      },
      required: ['book_id'],
    },
    safetyLevel: 'read',
    annotations: { readOnlyHint: true },
    handler: getBookDetailsHandler,
  })

  /* ---- Try It helpers ---- */

  const runExample = useCallback(
    async (label: string, toolName: string, args: Record<string, unknown>) => {
      if (isRunning) return
      setIsRunning(true)

      const callText = `${toolName}(${JSON.stringify(args)})`
      setTryItLog((prev) => [...prev, { type: 'call', text: callText }])

      // Small delay for visual effect
      await new Promise((r) => setTimeout(r, 400))

      let result: unknown
      if (toolName === 'search_books') result = await searchBooksHandler(args)
      else if (toolName === 'add_to_cart') result = await addToCartHandler(args)
      else if (toolName === 'get_book_details') result = await getBookDetailsHandler(args)

      setTryItLog((prev) => [...prev, { type: 'result', text: JSON.stringify(result, null, 2) }])
      setIsRunning(false)
    },
    [isRunning, searchBooksHandler, addToCartHandler, getBookDetailsHandler],
  )

  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0)

  return (
    <div className="space-y-10">
      {/* ============================================================ */}
      {/*  SIDE-BY-SIDE COMPARISON                                     */}
      {/* ============================================================ */}
      <FadeInSection delay={0}>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* ---------- LEFT: Without WebMCP ---------- */}
        <div className="relative flex flex-col">
          {/* Label pill */}
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--grade-f)]/15 px-3 py-1 text-xs font-semibold tracking-wide text-[var(--grade-f)] uppercase">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.5" />
                <line x1="3" y1="3" x2="7" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="7" y1="3" x2="3" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Without WebMCP
            </span>
          </div>

          {/* Card */}
          <div
            className="glow-red flex flex-1 flex-col rounded-2xl border border-[var(--grade-f)]/20 p-1"
            style={{
              background: 'linear-gradient(135deg, rgba(255,77,109,0.04) 0%, rgba(255,77,109,0.01) 100%)',
            }}
          >
            <div className="flex-1 rounded-xl bg-[var(--surface)]/80 p-5 backdrop-blur">
              {/* Mini bookstore (dimmed) */}
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-[var(--text3)]">Cosmic Books</h3>
                <span className="rounded bg-[var(--grade-f)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--grade-f)]">
                  No SDK
                </span>
              </div>

              <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {BOOKS.map((book) => (
                  <div
                    key={book.id}
                    className="rounded-lg border border-[var(--border)] bg-[var(--bg2)] p-2 opacity-50"
                  >
                    {/* Cover swatch */}
                    <div
                      className="mb-1.5 flex h-16 items-end justify-center rounded"
                      style={{
                        background: `linear-gradient(145deg, ${book.coverColor} 0%, ${book.coverColor}99 100%)`,
                      }}
                    >
                      <span className="mb-1 text-[8px] font-bold uppercase tracking-wider text-white/70">
                        {book.genre}
                      </span>
                    </div>
                    <p className="truncate text-[10px] font-medium text-[var(--text3)]">{book.title}</p>
                    <p className="text-[9px] text-[var(--text3)]/60">{book.author}</p>
                  </div>
                ))}
              </div>

              {/* What the agent sees */}
              <div className="mb-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--grade-f)]/70">
                  What an AI agent sees
                </p>
                <div className="overflow-hidden rounded-lg border border-[var(--grade-f)]/10 bg-[var(--bg)]">
                  <div className="flex items-center gap-1.5 border-b border-[var(--grade-f)]/10 bg-[var(--grade-f)]/5 px-3 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--grade-f)]/40" />
                    <span className="text-[9px] font-medium text-[var(--grade-f)]/60">Raw HTML DOM</span>
                  </div>
                  <pre className="overflow-x-auto max-h-60 p-3 text-[9px] leading-[1.6] text-[var(--text3)]/70">
{`<div class="shop-grid" id="main">
  <div class="book-card" data-v-3a81f>
    <div class="bc__cover" style="bg:#c27">
      <span class="bc__badge">sci-fi</span>
    </div>
    <h3 class="bc__title">Dune</h3>
    <p class="bc__author">Frank Herbert</p>
    <span class="bc__price">$14.99</span>
    <button class="btn btn--primary btn--sm
      js-add-cart" data-pid="dune"
      onclick="__cart.add('dune',1)">
      Add to Cart
    </button>
  </div>
  <div class="book-card" data-v-3a81f>
    <div class="bc__cover" style="bg:#1a8">
      ...
    </div>
    ...
  </div>
  <!-- 4 more cards... -->
</div>
<form id="search-form" class="sf"
  action="/api/search" method="GET">
  <input class="sf__input" name="q"
    placeholder="Search books...">
  <select class="sf__select" name="cat">
    <option value="">All</option>
    <option value="sci-fi">Sci-Fi</option>
    ...
  </select>
</form>`}
                  </pre>
                </div>
              </div>

              {/* Red warning box */}
              <div className="rounded-lg border border-[var(--grade-f)]/30 bg-[var(--grade-f)]/8 p-3">
                <p className="mb-1.5 text-[11px] font-bold text-[var(--grade-f)]">
                  The agent must:
                </p>
                <div className="space-y-1 text-[10px] leading-relaxed text-[var(--grade-f)]/80">
                  <p>1. Parse HTML &rarr; guess what <code className="rounded bg-[var(--bg)] px-1 py-0.5 text-[var(--grade-f)]">.btn.js-add-cart</code> does</p>
                  <p>2. Reverse-engineer <code className="rounded bg-[var(--bg)] px-1 py-0.5 text-[var(--grade-f)]">__cart.add(&apos;dune&apos;,1)</code></p>
                  <p>3. Fill form inputs &rarr; submit &rarr; scrape response page</p>
                  <p>4. Hope selectors don&apos;t change in the next deploy</p>
                  <p>5. No idea if any action is destructive</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- RIGHT: With WebMCP ---------- */}
        <div className="relative flex flex-col">
          {/* Label pill */}
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--grade-a)]/15 px-3 py-1 text-xs font-semibold tracking-wide text-[var(--grade-a)] uppercase">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.5" />
                <polyline points="3,5.5 4.5,7 7,3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              With WebMCP
            </span>
            {cartCount > 0 && (
              <span className="rounded-full bg-[var(--accent)]/15 px-2.5 py-0.5 text-[10px] font-medium text-[var(--accent)]">
                Cart: {cartCount} item{cartCount !== 1 ? 's' : ''} &middot; ${cartTotal.toFixed(2)}
              </span>
            )}
          </div>

          {/* Card with glowing border */}
          <div
            className="glow-green flex flex-1 flex-col rounded-2xl border border-[var(--grade-a)]/30 p-1"
            style={{
              background: 'linear-gradient(135deg, rgba(0,255,157,0.06) 0%, rgba(0,212,255,0.03) 100%)',
              boxShadow: '0 0 40px rgba(0,255,157,0.06), 0 0 80px rgba(0,212,255,0.03)',
            }}
          >
            <div className="flex-1 rounded-xl bg-[var(--surface)]/80 p-5 backdrop-blur">
              {/* Mini bookstore (bright) */}
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-[var(--text)]">Cosmic Books</h3>
                <span className="rounded bg-[var(--grade-a)]/15 px-2 py-0.5 text-[10px] font-medium text-[var(--grade-a)]">
                  WebMCP Enabled
                </span>
              </div>

              <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {BOOKS.map((book) => {
                  const inCart = cart.find((i) => i.bookId === book.id)
                  return (
                    <div
                      key={book.id}
                      className="group relative rounded-lg border border-[var(--border)] bg-[var(--bg2)] p-2 transition-all hover:border-[var(--accent)]/30"
                    >
                      {/* Cover swatch */}
                      <div
                        className="relative mb-1.5 flex h-16 items-end justify-center overflow-hidden rounded"
                        style={{
                          background: `linear-gradient(145deg, ${book.coverColor} 0%, ${book.coverColor}cc 100%)`,
                        }}
                      >
                        <span className="mb-1 text-[8px] font-bold uppercase tracking-wider text-white/80">
                          {book.genre}
                        </span>
                        {inCart && (
                          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-[8px] font-bold text-[var(--bg)]">
                            {inCart.quantity}
                          </span>
                        )}
                      </div>
                      <p className="truncate text-[10px] font-medium text-[var(--text)]">{book.title}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-[9px] text-[var(--text3)]">{book.author}</p>
                        <p className="text-[9px] font-semibold text-[var(--accent)]">${book.price}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* What the agent sees */}
              <div className="mb-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--grade-a)]/70">
                  What an AI agent sees
                </p>
                <div className="overflow-hidden rounded-lg border border-[var(--grade-a)]/10 bg-[var(--bg)]">
                  <div className="flex items-center gap-1.5 border-b border-[var(--grade-a)]/10 bg-[var(--grade-a)]/5 px-3 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--grade-a)]" style={{ boxShadow: '0 0 4px var(--grade-a)' }} />
                    <span className="text-[9px] font-medium text-[var(--grade-a)]/70">navigator.modelContext.getTools()</span>
                  </div>
                  <pre className="overflow-x-auto p-3 text-[9px] leading-[1.6] text-[var(--accent)]">
{`[
  {
    "name": "search_books",
    "description": "Search the Cosmic Books
      catalog by keyword, genre, or price",
    "safetyLevel": "read",
    "inputSchema": {
      "properties": {
        "query":     { "type": "string" },
        "genre":     { "enum": ["sci-fi",
          "fiction", "dystopian",
          "non-fiction"] },
        "max_price": { "type": "number" }
      }
    }
  },
  {
    "name": "add_to_cart",
    "description": "Add a book to the cart",
    "safetyLevel": "write",
    "inputSchema": {
      "properties": {
        "book_id":  { "type": "string" },
        "quantity": { "type": "integer" }
      },
      "required": ["book_id"]
    }
  },
  {
    "name": "get_book_details",
    "description": "Get full book details",
    "safetyLevel": "read",
    "inputSchema": {
      "properties": {
        "book_id": { "type": "string" }
      },
      "required": ["book_id"]
    }
  }
]`}
                  </pre>
                </div>
              </div>

              {/* Green success box */}
              <div className="rounded-lg border border-[var(--grade-a)]/30 bg-[var(--grade-a)]/8 p-3">
                <p className="mb-1.5 text-[11px] font-bold text-[var(--grade-a)]">
                  The agent calls:
                </p>
                <div className="space-y-1 text-[10px] leading-relaxed text-[var(--grade-a)]/80">
                  <p>
                    <code className="rounded bg-[var(--bg)] px-1.5 py-0.5 text-[var(--grade-a)]">
                      search_books({'{'} genre: &quot;sci-fi&quot;, max_price: 20 {'}'})
                    </code>
                  </p>
                  <p className="text-[9px] text-[var(--text3)]">
                    &rarr; Typed JSON with 3 results, prices, ratings, IDs
                  </p>
                  <p className="mt-1">
                    <code className="rounded bg-[var(--bg)] px-1.5 py-0.5 text-[var(--grade-a)]">
                      add_to_cart({'{'} book_id: &quot;dune&quot; {'}'})
                    </code>
                  </p>
                  <p className="text-[9px] text-[var(--text3)]">
                    &rarr; {'{'} success: true, message: &quot;Added 1x Dune to cart&quot; {'}'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </FadeInSection>

      {/* ============================================================ */}
      {/*  KEY DIFFERENCES                                             */}
      {/* ============================================================ */}
      <FadeInSection delay={0.2}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <GlowCard>
        <DiffCard
          icon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="8" r="5" />
              <line x1="12" y1="12" x2="17" y2="17" />
            </svg>
          }
          title="Discovery"
          before="Scrape DOM, guess button purposes, parse CSS class names"
          after="getTools() returns a typed catalog of every available action"
        />
        </GlowCard>
        <GlowCard>
        <DiffCard
          icon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4,7 4,4 7,4" />
              <polyline points="16,13 16,16 13,16" />
              <line x1="4" y1="4" x2="9" y2="9" />
              <line x1="11" y1="11" x2="16" y2="16" />
            </svg>
          }
          title="Interaction"
          before="Click buttons, fill forms, wait for DOM changes, pray"
          after="tool.execute(input) returns structured JSON — no DOM needed"
        />
        </GlowCard>
        <GlowCard>
        <DiffCard
          icon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="8" width="14" height="9" rx="2" />
              <path d="M7 8V5a3 3 0 0 1 6 0v3" />
            </svg>
          }
          title="Safety"
          before="No way to know if an action is destructive until it's done"
          after='safetyLevel: "write" tells the agent to confirm before acting'
        />
        </GlowCard>
      </div>
      </FadeInSection>

      {/* ============================================================ */}
      {/*  TRY IT PANEL                                                */}
      {/* ============================================================ */}
      <FadeInSection delay={0.3}>
      <div
        className="overflow-hidden rounded-2xl border border-[var(--accent)]/20"
        style={{
          background: 'linear-gradient(180deg, rgba(0,212,255,0.04) 0%, rgba(0,212,255,0.01) 100%)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--accent)]/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)]/10"
              style={{ boxShadow: '0 0 12px rgba(0,212,255,0.15)' }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4,12 4,8 8,4 12,8 12,12" />
                <line x1="4" y1="12" x2="12" y2="12" />
                <line x1="8" y1="4" x2="8" y2="1" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--text)]">Try It Live</h2>
              <p className="text-[11px] text-[var(--text3)]">
                Click an example to execute a real WebMCP tool call on this page
              </p>
            </div>
          </div>
          {tryItLog.length > 0 && (
            <button
              type="button"
              onClick={() => { setTryItLog([]); setCart([]) }}
              className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-[11px] font-medium text-[var(--text3)] transition-colors hover:border-[var(--accent)]/30 hover:text-[var(--text)]"
            >
              Clear
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-0 lg:grid-cols-[340px_1fr]">
          {/* Example buttons */}
          <div className="border-b border-[var(--accent)]/10 p-5 lg:border-b-0 lg:border-r">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--text3)]">
              Example Queries
            </p>
            <div className="space-y-2">
              <ExampleButton
                disabled={isRunning}
                label='Search sci-fi under $20'
                detail='search_books({ genre: "sci-fi", max_price: 20 })'
                color="var(--accent)"
                onClick={() => runExample('Search sci-fi under $20', 'search_books', { genre: 'sci-fi', max_price: 20 })}
              />
              <ExampleButton
                disabled={isRunning}
                label='Search "Gatsby"'
                detail='search_books({ query: "Gatsby" })'
                color="var(--accent)"
                onClick={() => runExample('Search Gatsby', 'search_books', { query: 'Gatsby' })}
              />
              <ExampleButton
                disabled={isRunning}
                label="Add Dune to cart"
                detail='add_to_cart({ book_id: "dune" })'
                color="var(--grade-c)"
                onClick={() => runExample('Add Dune to cart', 'add_to_cart', { book_id: 'dune' })}
              />
              <ExampleButton
                disabled={isRunning}
                label="Add Project Hail Mary to cart"
                detail='add_to_cart({ book_id: "hailmary" })'
                color="var(--grade-c)"
                onClick={() => runExample('Add Hail Mary', 'add_to_cart', { book_id: 'hailmary' })}
              />
              <ExampleButton
                disabled={isRunning}
                label="Get details for 1984"
                detail='get_book_details({ book_id: "1984" })'
                color="var(--grade-b)"
                onClick={() => runExample('Get details for 1984', 'get_book_details', { book_id: '1984' })}
              />
              <ExampleButton
                disabled={isRunning}
                label="Browse all non-fiction"
                detail='search_books({ genre: "non-fiction" })'
                color="var(--accent)"
                onClick={() => runExample('Browse non-fiction', 'search_books', { genre: 'non-fiction' })}
              />
            </div>
          </div>

          {/* Log output */}
          <div className="p-5">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--text3)]">
              Tool Call Log
            </p>
            <div
              className="glass min-h-[220px] overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4"
              style={{ maxHeight: '360px' }}
            >
              {tryItLog.length === 0 ? (
                <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-2 text-center">
                  <div className="text-[var(--text3)]/30">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M8 24 L16 8 L24 24" />
                      <line x1="12" y1="18" x2="20" y2="18" />
                    </svg>
                  </div>
                  <p className="text-xs text-[var(--text3)]/50">
                    Click an example to see the tool call and response here
                  </p>
                </div>
              ) : (
                <div className="space-y-3 font-mono text-xs">
                  {tryItLog.map((entry, i) => (
                    <div key={i}>
                      {entry.type === 'call' ? (
                        <div className="flex items-start gap-2">
                          <span className="mt-0.5 flex-shrink-0 rounded bg-[var(--accent)]/15 px-1.5 py-0.5 text-[9px] font-bold text-[var(--accent)]">
                            CALL
                          </span>
                          <code className="break-all text-[var(--accent)]">{entry.text}</code>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2">
                          <span className="mt-0.5 flex-shrink-0 rounded bg-[var(--grade-a)]/15 px-1.5 py-0.5 text-[9px] font-bold text-[var(--grade-a)]">
                            OK
                          </span>
                          <pre className="break-all whitespace-pre-wrap text-[var(--grade-a)]/80">{entry.text}</pre>
                        </div>
                      )}
                    </div>
                  ))}
                  {isRunning && (
                    <div className="flex items-center gap-2 text-[var(--text3)]">
                      <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[var(--accent)]" />
                      Executing...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </FadeInSection>

      {/* ============================================================ */}
      {/*  DEVTOOLS HINT                                               */}
      {/* ============================================================ */}
      <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg2)] p-6 text-center">
        <p className="text-sm text-[var(--text3)]">
          These tools are live. Open DevTools console and run:
        </p>
        <code className="mt-2 block text-sm text-[var(--accent)]">
          const tools = navigator.modelContext.getTools()
        </code>
        <code className="mt-1 block text-sm text-[var(--accent)]">
          await tools[0].execute({'{'} genre: &quot;sci-fi&quot;, max_price: 20 {'}'})
        </code>
        <p className="mt-3 text-xs text-[var(--text3)]">
          3 tools registered on this page right now: search_books, add_to_cart, get_book_details
        </p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                    */
/* ------------------------------------------------------------------ */

function DiffCard({
  icon,
  title,
  before,
  after,
}: {
  icon: React.ReactNode
  title: string
  before: string
  after: string
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--accent)]/20">
      <div className="mb-3 flex items-center gap-2.5">
        <div className="text-[var(--accent)]">{icon}</div>
        <h3 className="text-sm font-semibold text-[var(--text)]">{title}</h3>
      </div>
      <div className="mb-2 rounded-lg bg-[var(--grade-f)]/8 p-2.5 text-[11px] leading-relaxed text-[var(--grade-f)]/80">
        <span className="mr-1 font-bold text-[var(--grade-f)]">Without:</span>
        {before}
      </div>
      <div className="rounded-lg bg-[var(--grade-a)]/8 p-2.5 text-[11px] leading-relaxed text-[var(--grade-a)]/80">
        <span className="mr-1 font-bold text-[var(--grade-a)]">With:</span>
        {after}
      </div>
    </div>
  )
}

function ExampleButton({
  label,
  detail,
  color,
  onClick,
  disabled,
}: {
  label: string
  detail: string
  color: string
  onClick: () => void
  disabled: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="hover-lift group w-full rounded-lg border border-[var(--border)] bg-[var(--bg2)] p-3 text-left transition-all hover:border-[var(--accent)]/30 hover:bg-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <div className="mb-0.5 flex items-center gap-2">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-xs font-medium text-[var(--text)] group-hover:text-[var(--accent)]">
          {label}
        </span>
      </div>
      <code className="text-[10px] text-[var(--text3)] group-hover:text-[var(--text3)]">
        {detail}
      </code>
    </button>
  )
}
