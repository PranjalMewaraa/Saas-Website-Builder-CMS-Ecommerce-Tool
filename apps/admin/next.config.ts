import type { NextConfig } from "next";
import path from "node:path";

const skipBuildChecks = process.env.DOCKER_BUILD_SKIP_CHECKS === "1";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../../"),
  transpilePackages: [
    "@acme/auth",
    "@acme/blocks",
    "@acme/core",
    "@acme/db-mongo",
    "@acme/db-mysql",
    "@acme/renderer",
    "@acme/schemas",
    "@acme/ui",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: skipBuildChecks,
  },
};

export default nextConfig;
