/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  // Force Pages Router for API routes
  experimental: {
    appDir: false,
  },
}

module.exports = nextConfig
