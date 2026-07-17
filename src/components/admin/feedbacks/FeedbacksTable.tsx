'use client';

import { useState } from 'react';
import { ShieldCheck, XCircle, AlertCircle } from 'lucide-react';
import { resolveFeedback, ignoreFeedback } from '@/app/admin/(dashboard)/feedbacks/actions';
import { toggleTargetStatus } from '@/app/admin/(dashboard)/targets/actions';
import { useAdminForm } from '@/hooks/useAdminForm';

export default function FeedbacksTable({ initialData }: { initialData: any[] }) {
  const [data, setData] = useState(initialData);
  const { isSubmitting, error, submitAction } = useAdminForm();

  const handleResolve = async (id: string, targetId: string) => {
    if (!confirm('确定要标记为已解决吗？这会将相关的渠道立刻停用，并下架其所有商品。')) return;
    
    // Deactivate the channel which also sets its offers to offline
    if (targetId) {
      await toggleTargetStatus(targetId, true);
    }
    
    await submitAction(resolveFeedback(id), () => {
      setData(prev => prev.map(item => item.id === id ? { ...item, status: 'resolved' } : item));
    });
  };

  const handleIgnore = async (id: string) => {
    if (!confirm('确定要忽略此投诉吗？')) return;
    await submitAction(ignoreFeedback(id), () => {
      setData(prev => prev.map(item => item.id === id ? { ...item, status: 'ignored' } : item));
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">待处理</span>;
      case 'resolved': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">已处理</span>;
      case 'ignored': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-gray-300">已忽略</span>;
      default: return null;
    }
  };

  const getIssueLabel = (type: string) => {
    switch (type) {
      case 'price_error': return '价格不一致';
      case 'link_invalid': return '链接失效/店铺关闭';
      case 'scammer': return '欺诈跑路风险';
      case 'out_of_stock': return '长时间缺货未更新';
      default: return '其他问题';
    }
  };

  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        暂无用户投诉
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {error && <div className="p-4 bg-red-50 text-red-600 text-sm">{error}</div>}
      <table className="w-full text-left text-sm text-gray-700 dark:text-zinc-300">
        <thead className="bg-gray-50/50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800">
          <tr>
            <th className="p-4 font-semibold">状态</th>
            <th className="p-4 font-semibold">渠道 / 商品</th>
            <th className="p-4 font-semibold">投诉类型</th>
            <th className="p-4 font-semibold">详情说明</th>
            <th className="p-4 font-semibold">时间</th>
            <th className="p-4 font-semibold text-right">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
              <td className="p-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>
              <td className="p-4">
                <div className="font-medium text-gray-900 dark:text-white mb-1">{item.channel_name}</div>
                <div className="text-xs text-gray-500 truncate max-w-[200px]">{item.product_title} (¥{item.price})</div>
              </td>
              <td className="p-4 whitespace-nowrap">
                <span className="inline-flex items-center gap-1.5 text-red-600 dark:text-red-400 font-medium bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md text-xs">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {getIssueLabel(item.issue_type)}
                </span>
              </td>
              <td className="p-4">
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 max-w-xs" title={item.description}>
                  {item.description}
                </p>
              </td>
              <td className="p-4 text-xs text-gray-500 whitespace-nowrap" suppressHydrationWarning>
                {new Date(item.created_at).toLocaleString('zh-CN')}
              </td>
              <td className="p-4 text-right whitespace-nowrap">
                {item.status === 'pending' && (
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => handleIgnore(item.id)}
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      忽略
                    </button>
                    <button 
                      onClick={() => handleResolve(item.id, item.target_id)}
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-md shadow-sm transition-colors disabled:opacity-50"
                      title="封禁渠道并下架商品"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      封禁渠道并解决
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
