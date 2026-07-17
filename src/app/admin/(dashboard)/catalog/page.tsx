import { supabaseAdmin } from '@/lib/supabase-admin';
import CatalogTable from '@/components/admin/catalog/CatalogTable';

export const revalidate = 0;

export default async function CatalogPage() {

  const { data: rawCatalog, error } = await supabaseAdmin
    .from('product_catalog')
    .select('*, product_platforms(name)')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  const { data: platforms } = await supabaseAdmin
    .from('product_platforms')
    .select('id, name')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching catalog:', error);
  }

  const catalog = (rawCatalog || []).map((item: any) => ({
    ...item,
    platform: item.product_platforms?.name || item.platform_id
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">商品目录</h1>
          <p className="text-gray-500 dark:text-zinc-400 mt-1">
            管理标准商品字典，所有爬虫抓回来的价格都会映射到这里的商品。
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 shadow-sm border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <CatalogTable initialCatalog={catalog || []} platformOptions={platforms || []} />
      </div>
    </div>
  );
}
