/** @type {import('next').NextConfig} */
const BACKEND_URL =
  process.env.BACKEND_URL || "http://localhost:8000";

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.iconaves.com" },
      { protocol: "https", hostname: "iconaves.com" },
      { protocol: "https", hostname: "dd.dexscreener.com" },
      { protocol: "https", hostname: "s2.coinmarketcap.com" },
    ],
  },
  async rewrites() {
    // Proxy /api/* to the backend so cookies stay first-party.
    // BACKEND_URL is set per-environment (Vercel env var in prod, default
    // localhost:8000 in dev).
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
