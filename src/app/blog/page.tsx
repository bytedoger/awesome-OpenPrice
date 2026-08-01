import React from 'react';
import { Metadata } from 'next';
import { BookOpen } from 'lucide-react';
import { getPublishedBlogPosts } from '@/lib/notion';
import BlogListClient from './BlogListClient';
import { DEFAULT_SHARE_IMAGE } from '@/lib/site';

export const metadata: Metadata = {
  title: '博客 | OpenPrice',
  description: 'OpenPrice 官方博客 - 为您提供最新、最全的 AI 订阅教程、买号避坑指南及防封号攻略。全面涵盖 ChatGPT Plus 充值、Claude Pro 防封、AI 工具使用技巧等前沿动态。每天五分钟，跟上最新技术。',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'OpenPrice 博客｜AI 订阅教程与购买指南',
    description: '获取 AI 订阅教程、购买指南、避坑建议和 OpenPrice 平台动态。',
    type: 'website',
    url: '/blog',
    images: [DEFAULT_SHARE_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OpenPrice 博客｜AI 订阅教程与购买指南',
    description: '获取 AI 订阅教程、购买指南、避坑建议和 OpenPrice 平台动态。',
    images: [DEFAULT_SHARE_IMAGE],
  },
};

// Revalidate every 3 hours for ISR
export const revalidate = 10800;

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();
  const postsWithStableCovers = posts.map(post => ({
    ...post,
    cover: post.cover ? `/api/blog-cover/${encodeURIComponent(post.slug)}` : null,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-0.5">博客</h1>
            <p className="text-xs text-gray-500">获取最新的行业动态、使用教程和平台更新</p>
          </div>
        </div>

        {(!process.env.NOTION_API_KEY || !process.env.NOTION_BLOG_DATABASE_ID) && (
          <div className="mb-8 p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 text-sm">
            <strong>未配置 Notion 环境变量</strong>：请在 `.env.local` 中配置 `NOTION_API_KEY` 和 `NOTION_BLOG_DATABASE_ID` 以获取真实的博客数据。
          </div>
        )}

        <React.Suspense fallback={<div className="py-8 text-center text-gray-500">Loading blog posts...</div>}>
          <BlogListClient initialPosts={postsWithStableCovers} />
        </React.Suspense>
      </div>
    </div>
  );
}
