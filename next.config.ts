import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Optimisation Vercel
  compress: true,
  poweredByHeader: false,

  // Configuration images pour Vercel
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        port: '',
        pathname: '/api/portraits/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Configuration des redirects pour Next.js
  async redirects() {
    return [
      // Redirections pour le SEO et l'expérience utilisateur
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/index',
        destination: '/',
        permanent: true,
      },
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },

      // Redirections pour les pages de services (anciennes URLs)
      {
        source: '/cybersecurity-audit',
        destination: '/services/cybersecurity-audit',
        permanent: true,
      },
      {
        source: '/penetration-testing',
        destination: '/services/penetration-testing',
        permanent: true,
      },
      {
        source: '/security-training',
        destination: '/services/security-training',
        permanent: true,
      },
      {
        source: '/incident-response',
        destination: '/services/incident-response',
        permanent: true,
      },
      {
        source: '/compliance-management',
        destination: '/services/compliance-management',
        permanent: true,
      },

      // Redirections temporaires (302) pour les campagnes marketing
      {
        source: '/promo',
        destination: '/services',
        permanent: false,
      },
      {
        source: '/special-offer',
        destination: '/services',
        permanent: false,
      },

      // Redirections pour les erreurs courantes
      {
        source: '/404',
        destination: '/',
        permanent: true,
      },
      {
        source: '/500',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // Configuration des réécritures d'URL
  async rewrites() {
    return [
      // Réécritures pour les API legacy
      {
        source: '/api/v1/:path*',
        destination: '/api/:path*',
      },

      // Réécritures pour les services (si vous avez des routes dynamiques)
      {
        source: '/service/:slug',
        destination: '/services/:slug',
      },
    ];
  },

  // Configuration des headers optimisée pour Vercel
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Experimental features pour Vercel
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'react-icons'],
  },

  // Output configuration removed for compatibility with next start
  trailingSlash: false, // Fix for dynamic routes

  // Désactiver le prérendering pour les pages admin
  excludeDefaultMomentLocales: true,

  // Ensure pages are properly handled
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // React Compiler (expérimental)
  reactCompiler: true,
};

export default nextConfig;
