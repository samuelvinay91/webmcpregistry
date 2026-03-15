'use client'

import { useState } from 'react'
import { useWebMCPTool } from '@webmcpregistry/react'

// Sample product data
const PRODUCTS = [
  { id: 'p1', name: 'Wireless Headphones', price: 79.99, category: 'electronics', rating: 4.5, stock: 23 },
  { id: 'p2', name: 'Running Shoes', price: 129.99, category: 'clothing', rating: 4.8, stock: 15 },
  { id: 'p3', name: 'TypeScript Handbook', price: 34.99, category: 'books', rating: 4.9, stock: 100 },
  { id: 'p4', name: 'Mechanical Keyboard', price: 149.99, category: 'electronics', rating: 4.7, stock: 8 },
  { id: 'p5', name: 'Winter Jacket', price: 199.99, category: 'clothing', rating: 4.3, stock: 5 },
  { id: 'p6', name: 'AI Engineering Book', price: 49.99, category: 'books', rating: 4.6, stock: 42 },
]

const CART: Array<{ id: string; name: string; qty: number }> = []

export function ShopDemo() {
  const [activeTab, setActiveTab] = useState<'before' | 'after'>('after')

  // Register WebMCP tools for this demo shop
  useWebMCPTool({
    name: 'search_products',
    description: 'Search the product catalog by keyword, category, or price range',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search keywords (e.g., "headphones", "running")' },
        category: { type: 'string', description: 'Filter by category', enum: ['electronics', 'clothing', 'books'] },
        max_price: { type: 'number', description: 'Maximum price in USD' },
      },
      required: ['query'],
    },
    safetyLevel: 'read',
    annotations: { readOnlyHint: true },
    handler: async (input) => {
      const query = (input['query'] as string).toLowerCase()
      const category = input['category'] as string | undefined
      const maxPrice = input['max_price'] as number | undefined

      let results = PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(query) || p.category.includes(query)
      )
      if (category) results = results.filter((p) => p.category === category)
      if (maxPrice) results = results.filter((p) => p.price <= maxPrice)

      return { count: results.length, products: results }
    },
  })

  useWebMCPTool({
    name: 'get_product_details',
    description: 'Get full details for a specific product by ID',
    inputSchema: {
      type: 'object',
      properties: {
        product_id: { type: 'string', description: 'Product ID (e.g., "p1")' },
      },
      required: ['product_id'],
    },
    safetyLevel: 'read',
    annotations: { readOnlyHint: true },
    handler: async (input) => {
      const product = PRODUCTS.find((p) => p.id === input['product_id'])
      if (!product) return { error: 'Product not found' }
      return product
    },
  })

  useWebMCPTool({
    name: 'add_to_cart',
    description: 'Add a product to the shopping cart',
    inputSchema: {
      type: 'object',
      properties: {
        product_id: { type: 'string', description: 'Product ID to add' },
        quantity: { type: 'integer', description: 'Number of items (default: 1)' },
      },
      required: ['product_id'],
    },
    safetyLevel: 'write',
    handler: async (input) => {
      const product = PRODUCTS.find((p) => p.id === input['product_id'])
      if (!product) return { error: 'Product not found' }
      const qty = (input['quantity'] as number) ?? 1
      CART.push({ id: product.id, name: product.name, qty })
      return { success: true, message: `Added ${qty}x ${product.name} to cart`, cartSize: CART.length }
    },
  })

  useWebMCPTool({
    name: 'get_cart',
    description: 'View current shopping cart contents and total',
    inputSchema: { type: 'object', properties: {} },
    safetyLevel: 'read',
    annotations: { readOnlyHint: true },
    handler: async () => {
      const total = CART.reduce((sum, item) => {
        const product = PRODUCTS.find((p) => p.id === item.id)
        return sum + (product?.price ?? 0) * item.qty
      }, 0)
      return { items: CART, total: Math.round(total * 100) / 100, itemCount: CART.length }
    },
  })

  useWebMCPTool({
    name: 'checkout',
    description: 'Begin the checkout process for items in the cart',
    inputSchema: {
      type: 'object',
      properties: {
        shipping_address: { type: 'string', description: 'Delivery address' },
      },
      required: ['shipping_address'],
    },
    safetyLevel: 'danger',
    annotations: { readOnlyHint: false },
    handler: async (input) => {
      if (CART.length === 0) return { error: 'Cart is empty' }
      const address = input['shipping_address'] as string
      return {
        status: 'order_created',
        items: CART.length,
        shipping_to: address,
        message: 'Demo checkout — no real order created',
      }
    },
  })

  return (
    <div>
      {/* Tab switcher */}
      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('before')}
          className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'before'
              ? 'bg-[var(--grade-f)]/20 text-[var(--grade-f)] border border-[var(--grade-f)]/30'
              : 'bg-[var(--surface)] text-[var(--text3)] border border-[var(--border)]'
          }`}
        >
          Without WebMCP
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('after')}
          className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'after'
              ? 'bg-[var(--grade-a)]/20 text-[var(--grade-a)] border border-[var(--grade-a)]/30'
              : 'bg-[var(--surface)] text-[var(--text3)] border border-[var(--border)]'
          }`}
        >
          With WebMCP SDK
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* The shop UI (same on both sides) */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="mb-4 text-xl font-semibold">Demo Shop</h2>
          <div className="space-y-3">
            {PRODUCTS.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg bg-[var(--bg2)] p-3">
                <div>
                  <div className="font-medium text-[var(--text)]">{p.name}</div>
                  <div className="text-xs text-[var(--text3)]">
                    {p.category} · ${p.price} · {p.rating} stars · {p.stock} in stock
                  </div>
                </div>
                <span className="font-mono text-sm text-[var(--accent)]">${p.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* What the AI agent sees */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="mb-4 text-xl font-semibold">
            {activeTab === 'before' ? 'What an AI Agent Sees' : 'What an AI Agent Gets'}
          </h2>

          {activeTab === 'before' ? <BeforeView /> : <AfterView />}
        </div>
      </div>

      {/* Key differences */}
      <div className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="mb-4 text-xl font-semibold">Key Differences</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <DiffCard
            title="Discovery"
            before="Scrape DOM, guess button purposes, parse CSS selectors"
            after="navigator.modelContext.getTools() → typed tool catalog"
          />
          <DiffCard
            title="Interaction"
            before="Click buttons, fill forms, wait for DOM changes, pray"
            after="tool.execute({ query: 'shoes' }) → structured JSON response"
          />
          <DiffCard
            title="Safety"
            before="No way to know if action is destructive until it's done"
            after="safetyLevel: 'danger' tells agent to ask for confirmation"
          />
        </div>
      </div>
    </div>
  )
}

function BeforeView() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[var(--grade-f)]/20 bg-[var(--grade-f)]/5 p-3 text-sm text-[var(--grade-f)]">
        No structured tool interface. Agent must reverse-engineer the DOM.
      </div>

      <div className="text-xs text-[var(--text3)]">
        <p className="mb-2 font-semibold text-[var(--text2)]">The agent sees raw HTML:</p>
        <pre className="overflow-x-auto rounded-lg bg-[var(--bg)] p-3 text-[10px] leading-relaxed">
{`<div class="product-grid">
  <div class="product-card" data-id="p1">
    <h3>Wireless Headphones</h3>
    <span class="price">$79.99</span>
    <button class="btn-add-cart"
            onclick="addToCart('p1')">
      Add to Cart
    </button>
  </div>
  <!-- 5 more cards... -->
</div>

<form class="search-form" action="/search">
  <input type="text" name="q"
         placeholder="Search...">
  <button type="submit">Go</button>
</form>`}
        </pre>
      </div>

      <div className="text-xs text-[var(--text3)]">
        <p className="mb-2 font-semibold text-[var(--text2)]">Agent must:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>Parse HTML to find interactive elements</li>
          <li>Guess what <code>.btn-add-cart</code> does</li>
          <li>Figure out that <code>onclick=&quot;addToCart(&apos;p1&apos;)&quot;</code> adds item p1</li>
          <li>Hope the DOM doesn&apos;t change between releases</li>
          <li>No idea if &quot;checkout&quot; is destructive or reversible</li>
          <li>No typed input/output — everything is string manipulation</li>
        </ul>
      </div>
    </div>
  )
}

function AfterView() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[var(--grade-a)]/20 bg-[var(--grade-a)]/5 p-3 text-sm text-[var(--grade-a)]">
        5 structured tools with typed schemas, safety levels, and live handlers.
      </div>

      <div className="text-xs text-[var(--text3)]">
        <p className="mb-2 font-semibold text-[var(--text2)]">The agent sees structured tools:</p>
        <pre className="overflow-x-auto rounded-lg bg-[var(--bg)] p-3 text-[10px] leading-relaxed text-[var(--accent)]">
{`navigator.modelContext.getTools()
// Returns:
[
  {
    name: "search_products",
    description: "Search the product catalog
      by keyword, category, or price range",
    safetyLevel: "read",
    inputSchema: {
      properties: {
        query: { type: "string" },
        category: { enum: ["electronics",
                    "clothing", "books"] },
        max_price: { type: "number" }
      },
      required: ["query"]
    }
  },
  { name: "get_product_details", ... },
  { name: "add_to_cart", safety: "write" },
  { name: "get_cart", safety: "read" },
  { name: "checkout", safety: "danger" ⚠️ }
]`}
        </pre>
      </div>

      <div className="text-xs text-[var(--text3)]">
        <p className="mb-2 font-semibold text-[var(--text2)]">Agent can:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li className="text-[var(--grade-a)]">Call <code>search_products(&#123;query: &quot;shoes&quot;, max_price: 150&#125;)</code> → typed JSON</li>
          <li className="text-[var(--grade-a)]">Call <code>add_to_cart(&#123;product_id: &quot;p2&quot;, quantity: 1&#125;)</code> → success response</li>
          <li className="text-[var(--grade-a)]">See <code>checkout</code> is <code>danger</code> → ask user for confirmation</li>
          <li className="text-[var(--grade-a)]">Know required vs optional inputs from schema</li>
          <li className="text-[var(--grade-a)]">Get structured errors, not broken DOM</li>
          <li className="text-[var(--grade-a)]">Works across DOM changes — tool contract is stable</li>
        </ul>
      </div>
    </div>
  )
}

function DiffCard({ title, before, after }: { title: string; before: string; after: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg2)] p-4">
      <h3 className="mb-3 font-semibold text-[var(--text)]">{title}</h3>
      <div className="mb-2 rounded bg-[var(--grade-f)]/10 p-2 text-xs text-[var(--grade-f)]">
        <span className="font-bold">Without:</span> {before}
      </div>
      <div className="rounded bg-[var(--grade-a)]/10 p-2 text-xs text-[var(--grade-a)]">
        <span className="font-bold">With:</span> {after}
      </div>
    </div>
  )
}
