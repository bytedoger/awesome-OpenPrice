import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSingleBlogPost } from '@/lib/notion';
import ReactMarkdown from 'react-markdown';
import { Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import FloatingButtons from './FloatingButtons';

export const revalidate = 60; // ISR 60 seconds

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { post } = await getSingleBlogPost(params.slug);
  
  if (!post) {
    return { title: '未找到文章 | OpenPrice' };
  }

  return {
    title: `${post.title} | OpenPrice 博客`,
    description: post.description,
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const { post, markdown } = await getSingleBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="bg-white pb-24 min-h-screen relative">
      {/* 头部区 */}
      <div className="bg-gray-50 border-b border-gray-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Link href="/blog" className="inline-flex items-center text-sm text-gray-500 hover:text-emerald-600 transition-colors mb-8">
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回博客列表
          </Link>

          <div className="flex flex-wrap items-center gap-3 text-sm mb-4">
            {post.tags.map(tag => (
              <span key={tag} className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                {tag}
              </span>
            ))}
            <time className="flex items-center text-gray-500 font-medium ml-2">
              <Calendar className="w-4 h-4 mr-1.5" />
              {post.date ? format(new Date(post.date), 'yyyy-MM-dd') : ''}
            </time>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">
            {post.title}
          </h1>
          
          {post.description && (
            <p className="text-lg text-gray-600">
              {post.description}
            </p>
          )}
        </div>
      </div>

      {/* 封面图 */}
      {post.cover && (
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 -mt-10 mb-12">
          <div className="rounded-3xl overflow-hidden shadow-lg border border-gray-100 bg-white">
            <img src={post.cover} alt={post.title} className="w-full h-auto max-h-[500px] object-cover" />
          </div>
        </div>
      )}

      {/* 正文渲染 */}
      <article className={`mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 ${!post.cover ? 'pt-12' : ''}`}>
        <div className="prose prose-lg prose-emerald max-w-none prose-headings:text-gray-900 prose-a:text-emerald-600 hover:prose-a:text-emerald-700">
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
      </article>

      {/* 悬浮按钮组 */}
      <FloatingButtons />
    </div>
  );
}
