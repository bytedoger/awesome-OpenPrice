'use client';

import React, { useMemo } from 'react';
import type { BlogPost } from '@/lib/notion';
import { Search, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { useUrlState } from '@/hooks/useUrlState';

export default function BlogListClient({ initialPosts }: { initialPosts: BlogPost[] }) {
  const [searchQuery, setSearchQuery] = useUrlState('q', '');
  const [selectedTagRaw, setSelectedTag] = useUrlState('tag', '');
  const selectedTag = selectedTagRaw || null;

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    initialPosts.forEach((post) => {
      post.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags);
  }, [initialPosts]);

  // Filter posts based on search query and selected tag
  const filteredPosts = useMemo(() => {
    return initialPosts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = selectedTag ? post.tags.includes(selectedTag) : true;
      return matchesSearch && matchesTag;
    });
  }, [initialPosts, searchQuery, selectedTag]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Sidebar - Sticky (Left Side) */}
      <aside className="w-full lg:w-64 shrink-0 order-1 lg:sticky lg:top-24 space-y-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">搜索</h3>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-sm"
              placeholder="搜索文章标题或简介..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {allTags.length > 0 && (
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">按标签筛选</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag('')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedTag === null
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                全部
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    selectedTag === tag
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Main Content - Blog List (Right Side) */}
      <div className="flex-1 w-full order-2">
        <div className="grid gap-3">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <p className="text-gray-500 mb-2">未找到匹配的文章</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTag('');
                }}
                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
              >
                清除搜索条件
              </button>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <article
                key={post.id}
                className="group relative flex flex-col md:flex-row gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
              >
                {post.cover && (
                  <div className="shrink-0 w-full md:w-36 h-32 md:h-28 rounded-lg overflow-hidden block">
                    <div className="relative h-full w-full">
                    <Image
                      src={post.cover}
                      alt={post.title}
                      fill
                      sizes="(min-width: 768px) 144px, 100vw"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    </div>
                  </div>
                )}

                <div className="flex flex-col justify-center flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] mb-2">
                    <time
                      dateTime={post.date}
                      className="flex items-center text-gray-500 font-medium"
                    >
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      {post.date ? format(new Date(post.date), 'yyyy-MM-dd') : ''}
                    </time>
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-100"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-base font-bold leading-snug text-gray-900 mb-1.5 group-hover:text-emerald-600 transition-colors">
                    <Link href={`/blog/${post.slug}`} className="focus:outline-none">
                      <span className="absolute inset-0" aria-hidden="true" />
                      {post.title}
                    </Link>
                  </h3>

                  <p className="text-xs text-gray-600 line-clamp-1 leading-5 mb-2">
                    {post.description}
                  </p>

                  <div className="mt-auto flex items-center text-xs font-semibold text-emerald-600 group-hover:text-emerald-700">
                    阅读全文{' '}
                    <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
