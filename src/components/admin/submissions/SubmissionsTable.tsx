'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, CheckCircle, XCircle, Zap } from 'lucide-react';
import { rejectSubmission } from '@/app/admin/(dashboard)/submissions/actions';
import ApprovalModal from './ApprovalModal';
import TestScrapeModal from '../shared/TestScrapeModal';

export default function SubmissionsTable({ initialSubmissions: submissions }: { initialSubmissions: any[] }) {
  const [approvingItem, setApprovingItem] = useState<any>(null);
  const [testingItem, setTestingItem] = useState<any>(null);

  // Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending'); // all, pending, approved, rejected, duplicate

  // Filtered data
  const filteredSubmissions = submissions.filter(s => {
    // Search
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (s.site_url && s.site_url.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;

    // Status
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;

    return true;
  });

  async function handleReject(id: string) {
    if (confirm('确定要拒绝该提报吗？')) {
      await rejectSubmission(id);
    }
  }

  return (
    <div>
      <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex flex-col md:flex-row gap-4 justify-between md:items-center bg-gray-50/50 dark:bg-zinc-900/50">
        <div className="flex flex-wrap items-center gap-3">
          <input 
            type="text" 
            placeholder="搜索提报..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-950 text-sm w-64"
          />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-950 text-sm outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">所有状态</option>
            <option value="pending">待审核</option>
            <option value="approved">已批准</option>
            <option value="rejected">已拒绝</option>
            <option value="duplicate">已重复</option>
          </select>
        </div>
        <div className="text-sm text-gray-500">
          共 {filteredSubmissions.length} 条记录
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
              <th className="p-4 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">用户提报名称 & URL</th>
              <th className="p-4 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">提交时间</th>
              <th className="p-4 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">审核状态</th>
              <th className="p-4 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
            {filteredSubmissions.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                <td className="p-4">
                  <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                  {item.site_url && (
                    <a href={item.site_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1">
                      {item.site_url} <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </td>

                <td className="p-4">
                  <div className="text-sm text-gray-900 dark:text-white font-medium">
                    {formatDistanceToNow(new Date(item.created_at))}前
                  </div>
                  <div className="text-xs text-gray-500 mt-1" suppressHydrationWarning>
                    {new Date(item.created_at).toLocaleString()}
                  </div>
                </td>

                <td className="p-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    item.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500' :
                    item.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    item.status === 'duplicate' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400' :
                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {item.status === 'pending' ? '待审核' :
                     item.status === 'approved' ? '已批准' :
                     item.status === 'duplicate' ? '已重复' : '已拒绝'}
                  </span>
                </td>

                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    {item.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => setTestingItem(item)}
                          className="px-3 py-1.5 text-xs font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20 rounded-md transition-colors flex items-center gap-1"
                          title="极客测试"
                        >
                          <Zap className="w-3 h-3" /> 测试
                        </button>
                        <button 
                          onClick={() => setApprovingItem(item)}
                          className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20 rounded-md transition-colors"
                        >
                          批准/补全
                        </button>
                        <button 
                          onClick={() => handleReject(item.id)}
                          className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 rounded-md transition-colors"
                        >
                          拒绝
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            
            {filteredSubmissions.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500 dark:text-zinc-400">
                  没有找到符合条件的提报记录。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {approvingItem && (
        <ApprovalModal 
          item={approvingItem} 
          onClose={() => setApprovingItem(null)} 
        />
      )}

      {testingItem && (
        <TestScrapeModal
          title={testingItem.name}
          url={testingItem.site_url}
          scraperType="auto"
          submissionId={testingItem.id}
          onClose={() => setTestingItem(null)}
        />
      )}
    </div>
  );
}
