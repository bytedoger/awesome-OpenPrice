import { MetadataRoute } from 'next';
import { supabase } from '../lib/supabase';

export const revalidate = 36000; // 缓存 10 小时 (36000秒)，防止每次请求都去查数据库导致超时


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const { data: products } = await supabase
    .from('product_catalog')
    .select('slug')
    .eq('is_active', true);

  const productUrls = (products || []).map((product) => ({
    url: `${baseUrl}/card-products/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
    {
      url: `${baseUrl}/card-products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...productUrls,
  ];
}
