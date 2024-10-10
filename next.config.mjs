import nextra from 'nextra'

const nextConfig = {
  useFileSystemPublicRoutes: false,
}

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.jsx',
  defaultShowCopyCode: true
})

export default withNextra({
  ...nextConfig,
  // Additional Next.js config options can be added here
})
