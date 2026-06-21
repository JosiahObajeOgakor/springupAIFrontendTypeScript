import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  turbopack: {
    root: __dirname,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // NOTE: headers() is not supported with output:'export' (static export).
  // CSP and security headers must be set at the CDN/hosting layer (Vercel,
  // Netlify, Nginx, etc.) for static deployments.
}

export default nextConfig
