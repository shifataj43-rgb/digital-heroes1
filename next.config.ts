import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow mobile testing on the local network
  allowedDevOrigins: ['192.168.1.12'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'loremflickr.com',
      },
    ],
  },
};

export default nextConfig;
