import React from 'react';
import { supabase } from '../../lib/supabase';
import { ProductType } from '../../data';
import { CardProductsClient } from './CardProductsClient';
import { getChannelProviderCount } from '../actions';

export const revalidate = 300; // 5分钟静态重生成

export default async function CardProductsPage() {
  const [typesResponse, detailsResponse, platformCount] = await Promise.all([
    supabase.from('product_catalog').select('id, slug, name, short_desc, search_keywords, is_active, platform_id, sort_order, display_id, product_platforms(name, sort_order)').eq('is_active', true),
    supabase.from('market_offers').select('id, product_title, price, status, url, tags, inventory_level, updated_at, canonical_product_id, crawler_targets(name, scraper_type, created_at)').neq('status', 'blacklisted'),
    getChannelProviderCount(),
  ]);

  const marketQuotes = detailsResponse.data || [];
  const catalogData = typesResponse.data || [];

  const mappedTypes: ProductType[] = catalogData.map((row: any) => {
    const relatedQuotes = marketQuotes.filter((r: any) => r.canonical_product_id === row.id);
    const inStockQuotes = relatedQuotes.filter((r: any) => r.status === 'in_stock');
    const validInStockPrices = inStockQuotes.map((r: any) => Number(r.price || 0)).filter(p => p > 0);
    const lowestPrice = validInStockPrices.length > 0 ? Math.min(...validInStockPrices) : 0;
    const warrantyPrice = validInStockPrices.length > 0 ? Math.max(...validInStockPrices) : 0;
    
    const channelCount = inStockQuotes.length;
    
    let latestDate = 0;
    relatedQuotes.forEach((r: any) => {
       const ts = new Date(r.updated_at).getTime();
       if (ts > latestDate) latestDate = ts;
    });
    const updatedAt = latestDate ? new Date(latestDate).toISOString() : null;

    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      platform: row.product_platforms?.name || row.platform_id,
      lowestPrice,
      warrantyPrice,
      channelCount,
      updatedAt,
      shortDesc: row.short_desc,
      searchKeywords: row.search_keywords || [],
      sort_order: row.sort_order || 0,
      display_id: row.display_id,
      platform_sort_order: row.product_platforms?.sort_order || 0,
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <CardProductsClient initialProducts={mappedTypes} platformCount={platformCount} />
    </div>
  );
}
