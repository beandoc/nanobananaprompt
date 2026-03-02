import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Standalone output ensures all required node_modules and files are bundled for Vercel functions
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
