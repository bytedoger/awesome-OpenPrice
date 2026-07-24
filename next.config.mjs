/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // 限制构建时的 worker 数量，从而从根源上降低 SSG 的页面并发生成度
    cpus: 1,
  },
};

export default nextConfig;
