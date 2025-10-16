/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['src'],
  },
  images: {
    remotePatterns: [
      // Google OAuth profile images
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh4.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh5.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh6.googleusercontent.com',
      },
      // GitHub avatars (if using GitHub OAuth)
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      // Cloudinary (if using for image hosting)
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      // Gravatar (if using)
      {
        protocol: 'https',
        hostname: 'www.gravatar.com',
      },
      {
        protocol: 'https',
        hostname: 'gravatar.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
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