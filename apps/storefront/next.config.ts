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
};

module.exports = nextConfig;
