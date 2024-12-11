/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    scrollRestoration: false
  },
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  images: {
    unoptimized: true
  }
}

export default nextConfig
