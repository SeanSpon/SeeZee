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
      // Removed admin dashboard redirect - now goes to main dashboard page
    ]
  },
}

module.exports = nextConfig