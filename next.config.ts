import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack(config: any, { isServer }: { isServer: boolean }): any {
      if (!isServer) {
        config.externals = config.externals || [];
        config.externals.push({
          canvas: '{}', // Replace with empty object
          'canvas-prebuilt': '{}' // Also handle canvas-prebuilt if needed
        });
      }
      return config;
    },
};

export default nextConfig;
