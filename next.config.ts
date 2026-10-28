import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  // Keep the national catalogue's page cache small enough for a Worker instance.
  cacheMaxMemorySize: 8 * 1024 * 1024,
};

export default nextConfig;
