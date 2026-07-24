import React from 'react';
import { Metadata } from 'next';
import { supabase } from '../../../lib/supabase';
import { AllProductsClient, OfferItem } from './AllProductsClient';

export const metadata: Metadata = {
  title: '所有渠道商品 - OpenPrice',
  description: '查看 OpenPrice 收录的所有卡网渠道所有商品，涵盖 ChatGPT、Claude、Gemini、Cursor、Gork、Kiro等AI订阅，以及谷歌邮箱、outlook 邮箱以及苹果账号、telegram 账号以及接码服务等。支持多维度价格和平台筛选，快速找到全网最低价。',
  openGraph: {
    title: '所有渠道商品 - OpenPrice',
    description: '查看 OpenPrice 收录的所有卡网渠道所有商品，涵盖 ChatGPT、Claude、Gemini、Cursor、Gork、Kiro等AI订阅，以及谷歌邮箱、outlook 邮箱以及苹果账号、telegram 账号以及接码服务等。支持多维度价格和平台筛选，快速找到全网最低价。',
    url: '/card-products/all',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '所有渠道商品 - OpenPrice',
    description: '查看 OpenPrice 收录的所有卡网渠道所有商品，涵盖 ChatGPT、Claude、Gemini、Cursor、Gork、Kiro等AI订阅，以及谷歌邮箱、outlook 邮箱以及苹果账号、telegram 账号以及接码服务等。支持多维度价格和平台筛选，快速找到全网最低价。',
  },
};

export const revalidate = 300; // 5分钟静态重生成

export default async function AllProductsPage() {
  const [typesResponse, marketQuotes] = await Promise.all([
    supabase.from('product_catalog').select('id, name, platform_id, product_platforms(name, sort_order)'),
    (async () => {
      let allOffers: any[] = [];
      let from = 0;
      const pageSize = 1000;
      while (true) {
        const { data, error } = await supabase
          .from('market_offers')
          .select('id, product_title, price, status, url, updated_at, canonical_product_id, crawler_targets(name, scraper_type)')
          .neq('status', 'blacklisted')
          .range(from, from + pageSize - 1);
        if (error) {
          console.error('Error fetching market_offers:', error);
          break;
        }
        if (data) allOffers = allOffers.concat(data);
        if (!data || data.length < pageSize) break;
        from += pageSize;
      }
      return allOffers;
    })()
  ]);

  const catalogData = typesResponse.data || [];
  const catalogMap = new Map(catalogData.map((row: any) => [row.id, row]));

  const allItems: OfferItem[] = marketQuotes.map((r: any) => {
    const catalogItem = r.canonical_product_id ? catalogMap.get(r.canonical_product_id) : null;
    
    return {
      id: r.id,
      title: r.product_title || 'Unknown Product',
      price: Number(r.price || 0),
      status: r.status,
      url: r.url,
      updatedAt: r.updated_at,
      shopName: r.crawler_targets?.name || 'Unknown Shop',
      category: catalogItem?.name || 'Uncategorized',
      platform: catalogItem?.product_platforms?.name || catalogItem?.platform_id || 'Unknown Platform',
      platformSortOrder: catalogItem?.product_platforms?.sort_order || 9999,
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <AllProductsClient initialItems={allItems} />
    </div>
  );
}
