import { supabaseAdmin } from '@/lib/supabase-admin';
import PlatformsTable from '@/components/admin/platforms/PlatformsTable';

export const revalidate = 0;

export default async function PlatformsPage() {
  const { data: platforms, error } = await supabaseAdmin
    .from('product_platforms')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching platforms:', error);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">平台管理</h1>
          <p className="text-gray-500 dark:text-zinc-400 mt-1">
            管理所有的商品所属平台，以及配置爬虫在抓取时识别该平台的关键词规则。
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 shadow-sm border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <PlatformsTable initialPlatforms={platforms || []} />
      </div>
    </div>
  );
}
