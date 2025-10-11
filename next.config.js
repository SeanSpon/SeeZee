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
      // Redirect www to apex
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.see-zee.com' }],
        destination: 'https://see-zee.com/:path*',
        permanent: true,
      },
      // Admin dashboard redirect
      {
        source: '/admin',
        destination: '/admin/analytics',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig