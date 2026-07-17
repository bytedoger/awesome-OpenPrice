import { supabaseAdmin } from '@/lib/supabase-admin';
import TargetsTable from '@/components/admin/targets/TargetsTable';

export const revalidate = 0; // Disable caching to always show fresh data

export default async function TargetsPage() {
  const { data: targets, error } = await supabaseAdmin
    .from('crawler_targets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching targets:', error);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">爬虫渠道</h1>
          <p className="text-gray-500 dark:text-zinc-400 mt-1">
            管理爬虫的数据源和目标 API。
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 shadow-sm border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <TargetsTable initialTargets={targets || []} />
      </div>
    </div>
  );
}
