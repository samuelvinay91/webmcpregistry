import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  transpilePackages: ['@webmcpregistry/core', '@webmcpregistry/react', '@webmcpregistry/nextjs'],
}

export default nextConfig
