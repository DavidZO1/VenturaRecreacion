import type { NextConfig } from "next";

const nextConfig = {
  experimental: {
    appDir: true,
  },
  trailingSlash: true
}

module.exports = nextConfig

export default nextConfig;
