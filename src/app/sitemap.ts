import { MetadataRoute } from 'next';
import { supabase } from '../lib/supabase';
import { getPublishedBlogPosts } from '../lib/notion';

export const revalidate = 36000; // 缓存 10 小时 (36000秒)，防止每次请求都去查数据库导致超时

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // 1. 获取所有产品
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

  // 2. 获取所有已发布的博客文章
  let blogUrls: MetadataRoute.Sitemap = [];
  try {
    const blogPosts = await getPublishedBlogPosts();
    blogUrls = blogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.date || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('获取博客文章失败，sitemap中将跳过动态博客生成:', error);
  }

  // 3. 定义所有静态路由
  const staticRoutes = [
    { url: baseUrl, priority: 1.0, changeFrequency: 'always' as const },
    { url: `${baseUrl}/card-products`, priority: 0.9, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/card-products/all`, priority: 0.9, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/channels`, priority: 0.9, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/blog`, priority: 0.9, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/guide`, priority: 0.8, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/guide/official-vs-card-products`, priority: 0.8, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/guide/getting-started`, priority: 0.8, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/guide/best-practices`, priority: 0.8, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/about`, priority: 0.7, changeFrequency: 'monthly' as const },
  ];

  const staticUrls = staticRoutes.map((route) => ({
    url: route.url,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  return [
    ...staticUrls,
    ...productUrls,
    ...blogUrls,
  ];
}
