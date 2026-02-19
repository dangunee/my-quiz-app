import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        has: [{ type: "header", key: "host", value: "writing.mirinae.jp" }],
        destination: "/writing",
        permanent: false,
      },
      {
        source: "/",
        has: [{ type: "header", key: "host", value: "www.writing.mirinae.jp" }],
        destination: "/writing",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
