import React from 'react';
import { Metadata } from 'next';
import { supabase } from '../../../lib/supabase';
import { ProductDetailClient } from './ProductDetailClient';
import { JsonLd } from '@/components/JsonLd';
import { DEFAULT_SHARE_IMAGE, absoluteUrl } from '@/lib/site';

interface PageProps {
  params: Promise<{ slug: string }>;
}

import { notFound } from 'next/navigation';
import { ProductType, ProductDetail } from '../../../data';

export const revalidate = 300; // 每5分钟刷新一次静态缓存

export async function generateStaticParams() {
  const { data: products } = await supabase
    .from('product_catalog')
    .select('slug')
    .eq('is_active', true);

  return (products || []).map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  const { data: product } = await supabase
    .from('product_catalog')
    .select('id, name, short_desc')
    .eq('slug', slug)
    .single();

  if (!product) {
    return {
      title: '商品未找到 - OpenPrice',
    };
  }

  const { data: offers } = await supabase
    .from('market_offers')
    .select('price, status')
    .eq('canonical_product_id', product.id)
    .eq('status', 'in_stock');

  const inStockPrices = (offers || [])
    .map((offer) => Number(offer.price || 0))
    .filter((price) => price > 0);
  const lowestPrice = inStockPrices.length > 0 ? Math.min(...inStockPrices) : 0;
  const channelCount = inStockPrices.length;
  const shortDesc = String(product.short_desc || '').trim();
  const descriptionSubject = (shortDesc || `查看 ${product.name} 的实时渠道报价`).replace(/[。.!！]+$/, '');

  const title = `${product.name}价格对比｜AI订阅卡网渠道比价 - OpenPrice`;
  const description = channelCount > 0 && lowestPrice > 0
    ? `${descriptionSubject}。OpenPrice 当前收录 ${channelCount} 个在售渠道报价，最低价约 ¥${lowestPrice}，按价格排序展示库存和更新时间，不参与交易。`
    : `${descriptionSubject}。OpenPrice 聚合公开渠道价格，支持 AI 订阅和数字产品多渠道比价，不参与交易。`;

  return {
    title,
    description,
    alternates: { canonical: `/card-products/${slug}` },
    openGraph: {
      title,
      description,
      url: `/card-products/${slug}`,
      type: 'website',
      images: [DEFAULT_SHARE_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [DEFAULT_SHARE_IMAGE],
    },
  };
}

// Helper for extracting tag values
const extractTagValue = (tags: string[] | null, prefix: string, defaultValue: string) => {
  if (!tags || !Array.isArray(tags)) return defaultValue;
  const tag = tags.find(t => t.startsWith(prefix + ':'));
  return tag ? tag.split(':')[1] : defaultValue;
};

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  
  // 1. Fetch Product
  const { data: productRow } = await supabase
    .from('product_catalog')
    .select('id, slug, name, short_desc, search_keywords, is_active, platform_id, sort_order, display_id, product_platforms(name)')
    .eq('slug', slug)
    .single();

  if (!productRow) {
    notFound();
  }

  // 2. Fetch Offers
  const { data: offersData } = await supabase
    .from('market_offers')
    .select('id, product_title, price, status, url, tags, inventory_level, updated_at, canonical_product_id, crawler_targets(name, scraper_type, created_at)')
    .eq('canonical_product_id', productRow.id)
    .neq('status', 'blacklisted');

  const marketQuotes = offersData || [];

  // 3. Map to ProductDetail
  const mappedDetails: ProductDetail[] = marketQuotes.map((row: any) => ({
    id: row.id,
    typeId: row.canonical_product_id,
    status: row.status as 'in_stock' | 'out_of_stock' | 'offline',
    channel: row.crawler_targets?.name || '未知渠道',
    channelType: row.crawler_targets?.scraper_type || '未知渠道',
    originalName: row.product_title,
    price: Number(row.price || 0),
    url: row.url,
    updateTime: row.updated_at,
    includedTime: row.crawler_targets?.created_at || extractTagValue(row.tags, 'includedTime', '2026-01-01'),
    operateTime: extractTagValue(row.tags, 'operateTime', '1年'),
    risk: extractTagValue(row.tags, 'risk', 'medium') as 'low' | 'medium' | 'high',
    inventory: row.inventory_level,
  }));

  // 4. Map ProductType
  const inStockDetails = mappedDetails.filter(d => d.status === 'in_stock' && d.price > 0);
  const prices = inStockDetails.map(d => d.price);
  const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const warrantyPrice = prices.length > 0 ? Math.max(...prices) : 0;
  
  const inStockQuotes = marketQuotes.filter((r: any) => r.status === 'in_stock');
  const channelCount = inStockQuotes.length;
  
  let latestDate = 0;
  marketQuotes.forEach((r: any) => {
     const ts = new Date(r.updated_at).getTime();
     if (ts > latestDate) latestDate = ts;
  });
  
  const updatedAt = new Date(latestDate || Date.now()).toISOString();

  // Type workaround for Supabase relation inference
  const platformData: any = productRow.product_platforms;
  const platformName = Array.isArray(platformData) ? platformData[0]?.name : platformData?.name;

  const product: ProductType = {
    id: productRow.id,
    slug: productRow.slug,
    name: productRow.name,
    platform: platformName || productRow.platform_id,
    lowestPrice,
    warrantyPrice,
    channelCount,
    updatedAt,
    shortDesc: productRow.short_desc,
    searchKeywords: productRow.search_keywords || [],
    sort_order: productRow.sort_order || 0,
    display_id: productRow.display_id,
  };
  
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '卡网商品', item: absoluteUrl('/card-products') },
          { '@type': 'ListItem', position: 2, name: productRow.name },
        ],
      }} />
      <ProductDetailClient slug={slug} initialProduct={product} initialDetails={mappedDetails} />
    </div>
  );
}
