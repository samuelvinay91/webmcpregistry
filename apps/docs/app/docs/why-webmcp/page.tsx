import { LiveDemoSection } from './LiveDemoSection'
import WhyWebMCPClient from './WhyWebMCPClient'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Why WebMCP? — From scraping to structured AI agent tools',
  description:
    'Why WebMCP beats web scraping for AI agents. Typed tool calls replace fragile selectors. Compare crawling vs navigator.modelContext side-by-side.',
  openGraph: {
    title: 'Why WebMCP? — WebMCP Registry',
    description:
      'From simulating users to calling APIs. Learn why WebMCP matters vs web crawling for AI agents.',
    url: 'https://webmcpregistry.com/docs/why-webmcp',
  },
}

export default function WhyWebMCPPage() {
  return (
    <WhyWebMCPClient liveDemoSlot={<LiveDemoSection />} />
  )
}
