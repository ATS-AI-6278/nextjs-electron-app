/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: '../app',
  images: {
    unoptimized: true,
  },
  // Disable trailing slashes for better Electron compatibility
  trailingSlash: true,
}

module.exports = nextConfig
