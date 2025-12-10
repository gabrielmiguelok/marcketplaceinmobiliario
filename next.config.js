// next.config.js
/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  /* ───── 1) Entorno ───── */
  env: {
    BASE_DATA_DIR: './data/directorio_empresas',
  },

  /* ───── 2) Núcleo ───── */
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,

  /* ───── 3) Transpilación externa ───── */
  transpilePackages: [
    '@mui/material',
    '@mui/system',
    '@mui/icons-material',
  ],

  /* ───── 4) Webpack (DX en dev, sin tocar prod) ───── */
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        ignored: ['**/node_modules', './node_modules/**', './.next/**'],
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },

  /* ───── 5) Imágenes (apto SSG/export) ───── */
  images: {
    unoptimized: true,
    remotePatterns: [
      // Lo que ya usas…
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'cdn.weatherapi.com', pathname: '/weather/**' },
      // Google & mapas (iframes e imágenes)
      { protocol: 'https', hostname: 'maps.googleapis.com' },
      { protocol: 'https', hostname: 'maps.gstatic.com' },
      { protocol: 'https', hostname: 'maps.google.com' },
      { protocol: 'https', hostname: 'www.google.com' },
      { protocol: 'https', hostname: 'google.com' },
      { protocol: 'https', hostname: 'googleusercontent.com' },
      { protocol: 'https', hostname: 'ggpht.com' },
      // Red de respaldo genérica (sin bloquear dominios eventuales)
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },

  /* ───── 6) Cabeceras de seguridad (permitiendo Google Maps, Leaflet, CartoDB) ───── */
  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.google.com *.googleapis.com *.gstatic.com *.ggpht.com *.googleusercontent.com maps.googleapis.com www.google.com google.com *.googletagmanager.com www.googletagmanager.com unpkg.com cdnjs.cloudflare.com",
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com *.googleapis.com *.gstatic.com maps.googleapis.com *.google.com google.com unpkg.com cdnjs.cloudflare.com",
      "img-src 'self' data: blob: *.google.com *.googleapis.com *.gstatic.com *.googleusercontent.com *.ggpht.com maps.googleapis.com maps.gstatic.com www.google.com google.com images.unsplash.com *.unsplash.com *.basemaps.cartocdn.com *.tile.openstreetmap.org tile.openstreetmap.org *.openstreetmap.org cdnjs.cloudflare.com unpkg.com",
      "font-src 'self' fonts.gstatic.com *.googleapis.com",
      "connect-src 'self' *.google.com *.googleapis.com *.gstatic.com *.ggpht.com *.googleusercontent.com maps.googleapis.com www.google.com google.com *.googletagmanager.com *.google-analytics.com *.basemaps.cartocdn.com *.tile.openstreetmap.org wss: ws:",
      "frame-src 'self' *.google.com *.googleapis.com *.gstatic.com *.googleusercontent.com maps.google.com www.google.com google.com",
      "frame-ancestors 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          // COOP/COEP para embebidos de Google
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'unsafe-none' },

          // Endurecimiento
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },

          // Permissions-Policy: geolocalización para Google Maps
          {
            key: 'Permissions-Policy',
            value:
              'geolocation=(self "https://www.google.com" "https://maps.google.com" "https://maps.googleapis.com" "https://google.com"), microphone=(), camera=(), fullscreen=(self "https://www.google.com" "https://google.com"), browsing-topics=()'
          },

          // CSP compatible con Maps/Analytics/recursos asociados
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ];
  },

  /* ───── 7) TypeScript ───── */
  typescript: { ignoreBuildErrors: true },
  turbopack: {},

  /* ───── 8) Redirects ───── */
  async redirects() {
    return [];
  },

  /* ───── 9) Rewrites internos ───── */
  async rewrites() {
    return [];
  },
};

module.exports = withBundleAnalyzer(nextConfig);
