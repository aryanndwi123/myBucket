import type { NextConfig } from "next";

// Proxies /api and /mcp to the backend so the session cookie stays first-party
// (same-origin from the browser's perspective) instead of needing SameSite=None.
const API_URL = process.env.API_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${API_URL}/api/:path*` },
      { source: "/mcp", destination: `${API_URL}/mcp` },
    ];
  },
};

export default nextConfig;
