/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    scrollRestoration: false
  },
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/user-avatars/**',
      }
    ]
  }
}

export default nextConfig
