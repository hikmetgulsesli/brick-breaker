import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'dist',
  images: {
    unoptimized: true,
  },
  turbopack: {
    resolveAlias: {
      // Workaround for symlink issues
    },
  },
};

export default nextConfig;
