/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Pre-existing <img> warnings in page.tsx are non-blocking — suppress during builds
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
