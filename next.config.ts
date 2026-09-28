import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: { root: __dirname },
  images: { remotePatterns: [{ protocol: "https", hostname: "flagcdn.com" }] },
  async redirects() {
    return [
      {
        source: "/books/forthcoming-debut",
        destination: "/books",
        permanent: true,
      },
      {
        source: "/books/behind-the-mask",
        destination: "/books",
        permanent: true,
      },
    ];
  },
  reactStrictMode: false,
  async headers() {
    return [{
      source: "/(.*)",
      headers: [{
        key: "Content-Security-Policy",
        value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://web.squarecdn.com https://sandbox.web.squarecdn.com; connect-src 'self' https://connect.squareup.com https://connect.squareupsandbox.com https://web.squarecdn.com https://sandbox.web.squarecdn.com; frame-src 'self' https://web.squarecdn.com https://sandbox.web.squarecdn.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; base-uri 'self'; form-action 'self'; object-src 'none'",
      }],
    }];
  },
};

export default nextConfig;
