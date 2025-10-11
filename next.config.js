/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['src'],
  },
  images: {
    domains: [],
  },
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/analytics',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig