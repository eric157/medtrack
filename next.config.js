/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: process.env.GITHUB_ACTIONS ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
