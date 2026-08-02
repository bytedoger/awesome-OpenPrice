/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/images/official-apps/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  experimental: {
    // 限制构建时的 worker 数量，从而从根源上降低 SSG 的页面并发生成度
    cpus: 1,
  },
};

export default nextConfig;
