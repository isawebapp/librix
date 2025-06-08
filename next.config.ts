/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        canvas: '{}', // Replace with empty object
        'canvas-prebuilt': '{}' // Also handle canvas-prebuilt if needed
      });
    }
    return config;
  }
};

module.exports = nextConfig;
