import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublishedBlogPosts, getSingleBlogPost } from '@/lib/notion';
import ReactMarkdown from 'react-markdown';
import { Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import FloatingButtons from './FloatingButtons';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL, absoluteUrl } from '@/lib/site';

export const revalidate = 86400;

export async function generateStaticParams() {
  const posts = await getPublishedBlogPosts();
  return posts.map(post => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { post } = await getSingleBlogPost(params.slug);
  
  if (!post) {
    return { title: '未找到文章 | OpenPrice', robots: { index: false } };
  }

  const canonicalPath = `/blog/${post.slug}`;
  const coverPath = post.cover
    ? `/api/blog-cover/${encodeURIComponent(post.slug)}`
    : '/openprice-share.jpg';

  return {
    title: `${post.title} | OpenPrice 博客`,
    description: post.description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      url: canonicalPath,
      publishedTime: post.date,
      tags: post.tags,
      images: [{ url: absoluteUrl(coverPath), alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [absoluteUrl(coverPath)],
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const { post, markdown } = await getSingleBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  const canonicalPath = `/blog/${post.slug}`;
  const coverPath = post.cover
    ? `/api/blog-cover/${encodeURIComponent(post.slug)}`
    : null;

  return (
    <div className="bg-white pb-16 min-h-screen relative">
      <JsonLd data={[
        {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          dateModified: post.date,
          inLanguage: 'zh-CN',
          mainEntityOfPage: absoluteUrl(canonicalPath),
          image: absoluteUrl(coverPath || '/openprice-share.jpg'),
          author: { '@type': 'Organization', name: 'OpenPrice', url: SITE_URL },
          publisher: { '@id': `${SITE_URL}/#organization` },
          keywords: post.tags.join(', '),
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: '博客', item: absoluteUrl('/blog') },
            { '@type': 'ListItem', position: 2, name: post.title },
          ],
        },
      ]} />
      {/* 头部区 */}
      <div className="bg-gray-50 border-b border-gray-100 py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Link href="/blog" className="inline-flex items-center text-xs text-gray-500 hover:text-emerald-600 transition-colors mb-5">
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回博客列表
          </Link>

          <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
            {post.tags.map(tag => (
              <span key={tag} className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                {tag}
              </span>
            ))}
            <time className="flex items-center text-gray-500 font-medium ml-2">
              <Calendar className="w-4 h-4 mr-1.5" />
              {post.date ? format(new Date(post.date), 'yyyy-MM-dd') : ''}
            </time>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-3">
            {post.title}
          </h1>
          
          {post.description && (
            <p className="text-sm sm:text-base leading-6 text-gray-600">
              {post.description}
            </p>
          )}
        </div>
      </div>

      {/* 封面图 */}
      {coverPath && (
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 -mt-7 mb-8">
          <div className="relative h-[220px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md sm:h-[360px]">
            <Image
              src={coverPath}
              alt={post.title}
              fill
              priority
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* 正文渲染 */}
      <article className={`mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 ${!coverPath ? 'pt-8' : ''}`}>
        <div className="prose prose-base prose-emerald max-w-none prose-headings:text-gray-900 prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:leading-7 prose-a:text-emerald-600 hover:prose-a:text-emerald-700">
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
      </article>

      {/* 悬浮按钮组 */}
      <FloatingButtons />
    </div>
  );
}
