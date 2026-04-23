/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const adminOrigin = process.env.ADMIN_ORIGIN || "http://localhost:3000";
    return [
      {
        source: "/api/admin/:path*",
        destination: `${adminOrigin}/api/admin/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
