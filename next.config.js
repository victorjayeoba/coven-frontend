/** @type {import('next').NextConfig} */
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
};

module.exports = nextConfig;
