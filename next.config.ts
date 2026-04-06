import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow remote access securely
  allowedDevOrigins: ['10.118.20.240']
};

export default nextConfig;
