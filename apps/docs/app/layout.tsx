import type { Metadata } from 'next'
import './globals.css'
import { WebMCPProviderWrapper } from '@/components/WebMCPProviderWrapper'
import { Navbar } from '@/components/Navbar'
import { ToolInspector } from '@/components/inspector/ToolInspector'

export const metadata: Metadata = {
  title: {
    template: '%s | WebMCP Registry SDK',
    default: 'WebMCP Registry — Make any website callable by AI agents',
  },
  description:
    'Open-source SDK for the WebMCP browser standard (navigator.modelContext). Register typed tools on your website so AI agents can discover and call them directly. Framework adapters for React, Next.js, Vue, Angular, Svelte, and plain HTML. No scraping, no fragile selectors — structured, typed, secure.',
  keywords: [
    'WebMCP',
    'WebMCP Registry',
    'SDK',
    'AI agents',
    'navigator.modelContext',
    'Model Context Protocol',
    'MCP',
    'React',
    'Next.js',
    'Vue',
    'Angular',
    'Svelte',
    'browser API',
    'web tools',
    'agentic web',
    'W3C',
    'polyfill',
    'tool registration',
    'AI web integration',
    'open source',
  ],
  authors: [{ name: 'RAPHATECH OÜ' }],
  creator: 'RAPHATECH OÜ',
  publisher: 'RAPHATECH OÜ',
  metadataBase: new URL('https://webmcpregistry.com'),
  openGraph: {
    type: 'website',
    siteName: 'WebMCP Registry',
    locale: 'en_US',
    title: 'WebMCP Registry — Make any website callable by AI agents',
    description:
      'Open-source SDK for the WebMCP browser standard. Register typed tools on your website so AI agents can discover and call them. Adapters for React, Next.js, Vue, Angular, Svelte, and plain HTML.',
    url: 'https://webmcpregistry.com',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'WebMCP Registry — Make any website callable by AI agents',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@webmcpregistry',
    title: 'WebMCP Registry — Make any website callable by AI agents',
    description:
      'Open-source SDK for the WebMCP browser standard. Register typed tools so AI agents can call your website directly.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://webmcpregistry.com',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'PLACEHOLDER_GOOGLE_VERIFICATION',
  },
}

const jsonLdWebSite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'WebMCP Registry',
  url: 'https://webmcpregistry.com',
  description:
    'Open-source SDK for the WebMCP browser standard. Register typed tools on your website so AI agents can discover and call them directly.',
  publisher: {
    '@type': 'Organization',
    name: 'RAPHATECH OÜ',
  },
}

const jsonLdSoftwareApp = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'WebMCP Registry SDK',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  url: 'https://www.npmjs.com/package/@webmcpregistry/core',
  codeRepository: 'https://github.com/samuelvinay91/webmcpregistry',
  license: 'https://www.apache.org/licenses/LICENSE-2.0',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdWebSite),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdSoftwareApp),
          }}
        />
        {/* Dogfooding: our own site uses @webmcpregistry/nextjs */}
        <WebMCPProviderWrapper>
          <Navbar />
          <main>{children}</main>
          <ToolInspector />
        </WebMCPProviderWrapper>
      </body>
    </html>
  )
}
