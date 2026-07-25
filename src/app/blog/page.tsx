import React from 'react';
import { Metadata } from 'next';
import { BookOpen } from 'lucide-react';
import { getPublishedBlogPosts } from '@/lib/notion';
import BlogListClient from './BlogListClient';

export const metadata: Metadata = {
  title: '博客 | OpenPrice',
  description: 'OpenPrice 官方博客 - 为您提供最新、最全的 AI 订阅教程、买号避坑指南及防封号攻略。全面涵盖 ChatGPT Plus 充值、Claude Pro 防封、AI 工具使用技巧等前沿动态。每天五分钟，跟上最新技术。',
};

// Revalidate every 60 seconds for ISR
export const revalidate = 60;

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">博客</h1>
            <p className="text-gray-500">获取最新的行业动态、使用教程和平台更新</p>
          </div>
        </div>

        {(!process.env.NOTION_API_KEY || !process.env.NOTION_BLOG_DATABASE_ID) && (
          <div className="mb-8 p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 text-sm">
            <strong>未配置 Notion 环境变量</strong>：请在 `.env.local` 中配置 `NOTION_API_KEY` 和 `NOTION_BLOG_DATABASE_ID` 以获取真实的博客数据。
          </div>
        )}

        <BlogListClient initialPosts={posts} />
      </div>
    </div>
  );
}
