import {NextConfig} from 'next'

const config: NextConfig = {
  reactCompiler: true,
  async redirects() {
    return [
      // No public /rentals hub — three rental pages only.
      {source: '/rentals', destination: '/rentals/studio', permanent: false},
      // Capabilities is no longer a page — send old links to the homepage band.
      {source: '/capabilities', destination: '/#how-we-can-help', permanent: false},
    ]
  },
  images: {
    remotePatterns: [{hostname: 'cdn.sanity.io'}],
  },
  typescript: {
    // Set this to false if you want production builds to abort if there's type errors
    ignoreBuildErrors: process.env.VERCEL_ENV === 'production',
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  env: {
    // Matches the behavior of `sanity dev` which sets styled-components to use the fastest way of inserting CSS rules in both dev and production. It's default behavior is to disable it in dev mode.
    SC_DISABLE_SPEEDY: 'false',
  },
}

export default config
