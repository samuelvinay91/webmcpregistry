import type { Metadata } from 'next'
import './globals.css'
import { WebMCPProviderWrapper } from '@/components/WebMCPProviderWrapper'
import { Navbar } from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'WebMCP Registry — The SDK that makes any website agent-ready',
  description:
    'Open-source SDK for implementing the WebMCP browser standard. Make your website callable by AI agents in under 5 minutes.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {/* Dogfooding: our own site uses @webmcpregistry/nextjs */}
        <WebMCPProviderWrapper>
          <Navbar />
          <main>{children}</main>
        </WebMCPProviderWrapper>
      </body>
    </html>
  )
}
