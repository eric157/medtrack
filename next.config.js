/** @type {import('next').NextConfig} */
const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';

const nextConfig = {
  reactStrictMode: true,
  // Static export for GitHub Pages deployment
  ...(isGitHubActions && {
    output: 'export',
    basePath: '/medtrack',
    assetPrefix: '/medtrack/',
  }),
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
