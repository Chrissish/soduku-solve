import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/soduku-solve' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/soduku-solve' : '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
