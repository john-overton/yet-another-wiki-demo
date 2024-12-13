/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    PORT: "3003"
  },
  experimental: {
    scrollRestoration: false
  },
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  images: {
    unoptimized: true
  }
}

export default nextConfig
