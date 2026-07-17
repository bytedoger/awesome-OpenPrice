import { supabaseAdmin } from '@/lib/supabase-admin';
import SubmissionsTable from '@/components/admin/submissions/SubmissionsTable';

export const revalidate = 0;

export default async function SubmissionsPage() {

  const { data: submissions, error } = await supabaseAdmin
    .from('user_target_submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching submissions:', error);
    // Don't crash, let it render empty or show warning
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">用户渠道提报审核</h1>
          <p className="text-gray-500 dark:text-zinc-400 mt-1">
            审核来自前台用户提交的比价请求。批准时需要补充技术参数才能加入正式爬虫队列。
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 shadow-sm border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <SubmissionsTable initialSubmissions={submissions || []} />
      </div>
    </div>
  );
}
