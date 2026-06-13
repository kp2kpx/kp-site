import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export so the whole site is plain HTML/CSS/JS that can be pinned to
  // IPFS and served from kp2kp.eth via an ENS contenthash record.
  output: "export",
  // IPFS gateways serve files by path, so emit directory-style routes
  // (e.g. /index.html) which gateways resolve cleanly.
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
