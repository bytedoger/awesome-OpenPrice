import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { ProductType, ProductDetail } from '../data';

// Helper to extract value from tags array (e.g. 'risk:low')
const extractTagValue = (tags: string[] | null, prefix: string, defaultValue: string) => {
  if (!tags || !Array.isArray(tags)) return defaultValue;
  const tag = tags.find(t => t.startsWith(prefix + ':'));
  return tag ? tag.split(':')[1] : defaultValue;
};

// Helper to format date to relative time
const formatRelativeTime = (dateStr: string | number | Date) => {
  const ts = new Date(dateStr).getTime();
  if (!ts || isNaN(ts)) return '-';
  const diffMs = Date.now() - ts;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}小时前`;
  return `${Math.floor(diffMins / 1440)}天前`;
};

export function useProducts() {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [productDetails, setProductDetails] = useState<ProductDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch data concurrently from the newly renamed schema tables
        const [typesResponse, detailsResponse] = await Promise.all([
          supabase.from('product_catalog').select('id, slug, name, short_desc, search_keywords, is_active, platform_id, sort_order, display_id, product_platforms(name)'),
          supabase.from('market_offers').select('id, product_title, price, status, url, tags, inventory_level, updated_at, canonical_product_id, crawler_targets(name, scraper_type, created_at)'),
        ]);

        if (typesResponse.error) throw typesResponse.error;
        if (detailsResponse.error) throw detailsResponse.error;

        const marketQuotes = (detailsResponse.data || []).filter((row: any) => row.status !== 'blacklisted');
        const catalogData = typesResponse.data || [];

        // 1. Map market_offers to ProductDetail
        const mappedDetails: ProductDetail[] = marketQuotes.map((row: any) => ({
          id: row.id,
          typeId: row.canonical_product_id,
          status: row.status as 'in_stock' | 'out_of_stock' | 'offline',
          channel: row.crawler_targets?.name || '未知渠道',
          channelType: row.crawler_targets?.scraper_type || '未知渠道',
          originalName: row.product_title,
          price: Number(row.price || 0),
          url: row.url,
          updateTime: formatRelativeTime(row.updated_at),
          // Parse specific front-end required metadata from the generic tags array
          includedTime: row.crawler_targets?.created_at || extractTagValue(row.tags, 'includedTime', '2026-01-01'),
          operateTime: extractTagValue(row.tags, 'operateTime', '1年'),
          risk: extractTagValue(row.tags, 'risk', 'medium') as 'low' | 'medium' | 'high',
          inventory: row.inventory_level,
        }));

        const mappedTypes: ProductType[] = catalogData.map((row: any) => {
          // Dynamically calculate lowest and max (warranty mock) price from related offers
          const relatedDetails = mappedDetails.filter(d => d.typeId === row.id && d.price > 0);
          const prices = relatedDetails.map(d => d.price);
          const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;
          const warrantyPrice = prices.length > 0 ? Math.max(...prices) : 0;
          
          const relatedQuotes = marketQuotes.filter((r: any) => r.canonical_product_id === row.id);
          const uniqueChannels = new Set(relatedQuotes.map((r: any) => r.crawler_targets?.name || '未知渠道'));
          const channelCount = uniqueChannels.size;
          
          let latestDate = 0;
          relatedQuotes.forEach((r: any) => {
             const ts = new Date(r.updated_at).getTime();
             if (ts > latestDate) latestDate = ts;
          });
          let updatedAt = formatRelativeTime(latestDate);

          return {
            id: row.id,
            slug: row.slug,
            name: row.name,
            platform: row.product_platforms?.name || row.platform_id,
            lowestPrice,
            warrantyPrice, // We simulate warrantyPrice as the max price for now
            channelCount,
            updatedAt,
            shortDesc: row.short_desc,
            searchKeywords: row.search_keywords || [],
            sort_order: row.sort_order || 0,
            display_id: row.display_id,
          };
        });

        setProductTypes(mappedTypes);
        setProductDetails(mappedDetails);
      } catch (err: any) {
        console.error('Error fetching data from Supabase:', err);
        setError(err.message || 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return {
    productTypes,
    productDetails,
    isLoading,
    error,
  };
}
