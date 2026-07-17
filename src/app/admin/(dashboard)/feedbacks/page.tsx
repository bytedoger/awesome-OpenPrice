import { supabaseAdmin } from '@/lib/supabase-admin';
import FeedbacksTable from '@/components/admin/feedbacks/FeedbacksTable';

export const revalidate = 0;

export default async function FeedbacksPage() {
  const { data: feedbacks, error } = await supabaseAdmin
    .from('user_feedbacks')
    .select(`
      *,
      market_offers (
        product_title,
        price,
        target_id,
        crawler_targets (
          name
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching feedbacks:', error);
  }

  // Format the data a bit
  const formattedData = (feedbacks || []).map(f => ({
    ...f,
    product_title: f.market_offers?.product_title || '未知商品',
    channel_name: f.market_offers?.crawler_targets?.name || '未知渠道',
    price: f.market_offers?.price || 0,
    target_id: f.market_offers?.target_id || ''
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">用户投诉管理</h1>
          <p className="text-gray-500 dark:text-zinc-400 mt-1">
            审核前台用户提交的商品报错或欺诈投诉，及时下架不良渠道。
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 shadow-sm border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <FeedbacksTable initialData={formattedData} />
      </div>
    </div>
  );
}
