import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/",
        destination: "/writing",
        has: [{ type: "header", key: "host", value: "writing.mirinae.jp" }],
      },
      {
        source: "/",
        destination: "/writing",
        has: [{ type: "header", key: "host", value: "www.writing.mirinae.jp" }],
      },
    ];
  },
};

export default nextConfig;
