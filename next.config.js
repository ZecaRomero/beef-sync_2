/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/A',
        destination: '/a',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
