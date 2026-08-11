/** @type {import('next').NextConfig} */
const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';

const nextConfig = {
  reactStrictMode: true,
  ...(isGitHubActions && {
    output: 'export',
    basePath: '/medtrack',
    assetPrefix: '/medtrack/',
  }),
  images: { unoptimized: true },
};

const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development' || isGitHubActions,
  register: true,
  skipWaiting: true,
  customWorkerSrc: 'worker',
  fallbacks: {
    document: '/offline',
  },
});

module.exports = withPWA(nextConfig);
