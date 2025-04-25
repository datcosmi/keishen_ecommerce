import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "keishen-bcknd.onrender.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "keishen.com.mx",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "assets.keishen.com.mx",
        pathname: "/**",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
