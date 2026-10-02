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
        value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://web.squarecdn.com https://sandbox.web.squarecdn.com; connect-src 'self' https://connect.squareup.com https://connect.squareupsandbox.com https://web.squarecdn.com https://sandbox.web.squarecdn.com https://pci-connect.squareup.com https://pci-connect.squareupsandbox.com https://o160250.ingest.sentry.io; frame-src 'self' https://web.squarecdn.com https://sandbox.web.squarecdn.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://web.squarecdn.com https://sandbox.web.squarecdn.com; font-src 'self' data: https://square-fonts-production-f.squarecdn.com https://d1g145x70srn7h.cloudfront.net https://cash-f.squarecdn.com; base-uri 'self'; form-action 'self'; object-src 'none'",
      }],
    }];
  },
};

export default nextConfig;
