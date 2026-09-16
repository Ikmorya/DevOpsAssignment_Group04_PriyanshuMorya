/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow cross-origin requests to the Express backend during dev
  async rewrites() {
    return [];
  },
};

module.exports = nextConfig;
