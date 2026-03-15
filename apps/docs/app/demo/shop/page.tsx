import { ShopDemo } from './ShopDemo'

export const metadata = {
  title: 'Before vs After WebMCP — Live Demo',
  description: 'See the real difference WebMCP makes. Same e-commerce page — without WebMCP vs with WebMCP tools registered.',
}

export default function ShopDemoPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-2 text-4xl font-bold">Before vs After WebMCP</h1>
      <p className="mb-2 text-lg text-[var(--text2)]">
        Same e-commerce page. Left side: what an AI agent sees without WebMCP.
        Right side: with our SDK installed.
      </p>
      <p className="mb-8 text-sm text-[var(--text3)]">
        The floating inspector (bottom-right) shows live tools registered by the SDK on this page.
      </p>

      <ShopDemo />
    </div>
  )
}
