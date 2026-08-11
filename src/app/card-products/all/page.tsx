import React from 'react';
import { Metadata } from 'next';
import { supabase } from '../../../lib/supabase';
import { AllProductsClient, CategoryFilterOption } from './AllProductsClient';
import { DEFAULT_SHARE_IMAGE } from '@/lib/site';

export const metadata: Metadata = {
  title: '所有渠道商品 - OpenPrice',
  description: '查看 OpenPrice 收录的所有卡网渠道所有商品，涵盖 ChatGPT、Claude、Gemini、Cursor、Grok、Kiro等 AI 订阅，以及谷歌邮箱、outlook 邮箱以及苹果账号、telegram 账号以及接码服务等。支持多维度价格和平台筛选，快速找到全网最低价。',
  alternates: { canonical: '/card-products/all' },
  openGraph: {
    title: '所有渠道商品 - OpenPrice',
    description: '查看 OpenPrice 收录的所有卡网渠道所有商品，涵盖 ChatGPT、Claude、Gemini、Cursor、Grok、Kiro等 AI 订阅，以及谷歌邮箱、outlook 邮箱以及苹果账号、telegram 账号以及接码服务等。支持多维度价格和平台筛选，快速找到全网最低价。',
    url: '/card-products/all',
    type: 'website',
    images: [DEFAULT_SHARE_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: '所有渠道商品 - OpenPrice',
    description: '查看 OpenPrice 收录的所有卡网渠道所有商品，涵盖 ChatGPT、Claude、Gemini、Cursor、Grok、Kiro等AI订阅，以及谷歌邮箱、outlook 邮箱以及苹果账号、telegram 账号以及接码服务等。支持多维度价格和平台筛选，快速找到全网最低价。',
    images: [DEFAULT_SHARE_IMAGE],
  },
};

export const revalidate = 300; // 5分钟静态重生成

interface CatalogFilterRow {
  name: string;
  platform_id: string;
  sort_order: number | null;
  product_platforms: { name: string } | { name: string }[] | null;
}

export default async function AllProductsPage() {
  const { data: catalog } = await supabase
    .from('product_catalog')
    .select('name, platform_id, sort_order, product_platforms(name)')
    .eq('is_active', true);

  const catalogRows = (catalog || []) as unknown as CatalogFilterRow[];
  const initialCategories: CategoryFilterOption[] = catalogRows.map((item) => {
    const platform = Array.isArray(item.product_platforms)
      ? item.product_platforms[0]?.name
      : item.product_platforms?.name;

    return {
      name: item.name,
      platform: platform || item.platform_id,
      sortOrder: item.sort_order ?? 9999,
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <React.Suspense fallback={<div className="py-8 text-center text-gray-500">Loading products...</div>}>
        <AllProductsClient initialCategories={initialCategories} />
      </React.Suspense>
    </div>
  );
}
