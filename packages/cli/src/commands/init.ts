/**
 * `webmcp init` — Scaffold WebMCP setup for a project.
 */

interface InitOptions {
  framework: string
}

const SNIPPETS: Record<string, string> = {
  html: `<!-- Add to your HTML page -->
<script src="https://cdn.webmcpregistry.com/v1/auto.js" data-mode="auto"></script>

<!-- Or manually register tools -->
<form toolname="search_products" tooldescription="Search the product catalog by keyword">
  <input name="query" type="text" toolparamdescription="Search keywords" required />
  <button type="submit">Search</button>
</form>`,

  react: `// 1. Install the package
// npm install @webmcpregistry/react

// 2. Wrap your app with the provider (app/layout.tsx or App.tsx)
import { WebMCPProvider } from '@webmcpregistry/react'

function App() {
  return (
    <WebMCPProvider mode="auto">
      <YourApp />
    </WebMCPProvider>
  )
}

// 3. Register page-specific tools
import { useWebMCPTool } from '@webmcpregistry/react'

function SearchPage() {
  useWebMCPTool({
    name: 'search_products',
    description: 'Search the product catalog by keyword',
    inputSchema: {
      type: 'object',
      properties: { query: { type: 'string', description: 'Search term' } },
      required: ['query'],
    },
    safetyLevel: 'read',
    handler: async ({ query }) => {
      const res = await fetch(\`/api/search?q=\${query}\`)
      return res.json()
    },
  })

  return <div>Search Page</div>
}`,

  nextjs: `// 1. Install the package
// npm install @webmcpregistry/nextjs

// 2. Add to your root layout (app/layout.tsx)
import { WebMCPProvider } from '@webmcpregistry/nextjs'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <WebMCPProvider mode="auto">
          {children}
        </WebMCPProvider>
      </body>
    </html>
  )
}

// 3. Register tools in page components
import { useWebMCPTool } from '@webmcpregistry/nextjs'
// (same API as @webmcpregistry/react)`,

  vue: `// 1. Install the package
// npm install @webmcpregistry/vue

// 2. Install the plugin (main.ts)
import { createApp } from 'vue'
import { webmcpPlugin } from '@webmcpregistry/vue'

const app = createApp(App)
app.use(webmcpPlugin, { mode: 'auto' })
app.mount('#app')

// 3. Register tools in components
// <script setup>
import { useWebMCPTool } from '@webmcpregistry/vue'

useWebMCPTool({
  name: 'search_products',
  description: 'Search the product catalog',
  inputSchema: { type: 'object', properties: { query: { type: 'string' } } },
  safetyLevel: 'read',
})
// </script>`,

  angular: `// 1. Install the package
// npm install @webmcpregistry/angular

// 2. Add to providers (app.config.ts)
import { provideWebMCP } from '@webmcpregistry/angular'

export const appConfig = {
  providers: [provideWebMCP({ mode: 'auto' })],
}

// 3. Use in components
import { getWebMCPService } from '@webmcpregistry/angular'

const webmcp = getWebMCPService()
webmcp.registerTool({
  name: 'search_products',
  description: 'Search the product catalog',
  inputSchema: { type: 'object', properties: { query: { type: 'string' } } },
  safetyLevel: 'read',
})`,

  svelte: `<!-- 1. Install the package -->
<!-- npm install @webmcpregistry/svelte -->

<!-- 2. Initialize in your root component -->
<script>
  import { initWebMCP, webmcpTools } from '@webmcpregistry/svelte'
  import { onMount } from 'svelte'

  onMount(() => {
    initWebMCP({ mode: 'auto' })
  })
</script>

<!-- 3. Register tools with the action -->
<script>
  import { webmcpTool } from '@webmcpregistry/svelte'
</script>

<form use:webmcpTool={{
  name: 'search_products',
  description: 'Search the product catalog',
  inputSchema: { type: 'object', properties: { query: { type: 'string' } } },
  safetyLevel: 'read',
}}>
  <input name="query" />
  <button type="submit">Search</button>
</form>`,
}

export async function initCommand(options: InitOptions) {
  const framework = options.framework.toLowerCase()
  const snippet = SNIPPETS[framework]

  if (!snippet) {
    console.error(`  Unknown framework: ${framework}`)
    console.error(`  Supported: ${Object.keys(SNIPPETS).join(', ')}`)
    process.exit(1)
  }

  console.log(`\n  WebMCP Setup — ${framework}\n`)
  console.log('  Add the following to your project:\n')
  console.log('  ─────────────────────────────────────')
  console.log(snippet.split('\n').map((l) => `  ${l}`).join('\n'))
  console.log('  ─────────────────────────────────────')
  console.log('\n  Then run: npx @webmcpregistry/cli test <your-url>')
  console.log('  Docs: https://webmcpregistry.com/docs\n')
}
