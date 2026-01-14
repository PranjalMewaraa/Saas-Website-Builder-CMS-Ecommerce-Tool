/** @type {import('next').NextConfig} */

const nextConfig = {
  transpilePackages: [
    "../../packages/blocks",
    "../../packages/renderer",
    "../../packages/schemas",
    "../../packages/db-mysql",
    "../../packages/db-mongo",
    "../../packages/core",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
