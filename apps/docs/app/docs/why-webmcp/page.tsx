import { LiveDemoSection } from './LiveDemoSection'
import WhyWebMCPClient from './WhyWebMCPClient'

export const metadata = {
  title: 'Why WebMCP? — WebMCP Registry',
  description:
    'From simulating users to calling APIs. Learn why WebMCP matters vs web crawling for AI agents.',
}

export default function WhyWebMCPPage() {
  return (
    <WhyWebMCPClient liveDemoSlot={<LiveDemoSection />} />
  )
}
