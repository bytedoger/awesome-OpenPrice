import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

// 开启 ISR，每 5 分钟在服务端后台重新生成并缓存到 CDN
export const revalidate = 300;

export async function GET() {
  try {
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
            console.error('Error fetching market_offers API:', error);
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

    const allItems = marketQuotes.map((r: any) => {
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

    return NextResponse.json(allItems);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch offers' }, { status: 500 });
  }
}
