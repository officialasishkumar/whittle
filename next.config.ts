import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // node:sqlite and the tokenizer run on the server only
  serverExternalPackages: ["gpt-tokenizer"],
};

export default nextConfig;
