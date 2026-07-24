'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Edit, Play, Pause, Trash2, Plus, ExternalLink, Zap, History, FastForward } from 'lucide-react';
import { deleteTarget, toggleTargetStatus, resetTargetAttemptTime } from '@/app/admin/(dashboard)/targets/actions';
import TargetFormModal from './TargetFormModal';
import TestScrapeModal from '../shared/TestScrapeModal';
import TestHistoryModal from './TestHistoryModal';

export default function TargetsTable({ initialTargets: targets }: { initialTargets: any[] }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [testingItem, setTestingItem] = useState<any>(null);
  const [historyItem, setHistoryItem] = useState<any>(null);

  // Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, paused
  const [healthFilter, setHealthFilter] = useState('all'); // all, healthy, failing, unknown
  const [verifyFilter, setVerifyFilter] = useState('all'); // all, verified, unverified

  // Filtered data
  const filteredTargets = targets.filter(t => {
    // Search
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.scrape_url.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // Status
    if (statusFilter === 'active' && !t.is_active) return false;
    if (statusFilter === 'paused' && t.is_active) return false;

    // Health
    if (healthFilter !== 'all' && t.operational_status !== healthFilter) return false;

    // Verify
    if (verifyFilter === 'verified' && !t.is_verified) return false;
    if (verifyFilter === 'unverified' && t.is_verified) return false;

    return true;
  });

  async function handleToggle(id: string, currentStatus: boolean) {
    await toggleTargetStatus(id, currentStatus);
  }

  async function handleDelete(id: string) {
    if (confirm('确定要删除这个渠道吗？')) {
      await deleteTarget(id);
    }
  }

  async function handlePrioritize(id: string) {
    if (confirm('确定要优先更新该渠道吗？后台程序将会在下一次任务中抓取它。')) {
      const result = await resetTargetAttemptTime(id);
      if (result.error) {
        alert('操作失败: ' + result.error);
      } else {
        alert('已加入优先更新队列！');
      }
    }
  }

  function openEditForm(target: any) {
    setEditingItem(target);
    setIsFormOpen(true);
  }

  function openCreateForm() {
    setEditingItem(null);
    setIsFormOpen(true);
  }

  function formatScraperType(type: string) {
    if (type === 'ldxp') return '链动小铺';
    if (type === 'dujiao') return '独角数卡';
    if (type === 'lizhi') return '二次元发卡';
    if (type === 'other') return '其它';
    return type || '未知';
  }

  return (
    <div>
      <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex flex-col md:flex-row gap-4 justify-between md:items-center bg-gray-50/50 dark:bg-zinc-900/50">
        <div className="flex flex-wrap items-center gap-3">
          <input 
            type="text" 
            placeholder="搜索渠道..." 
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
            <option value="active">运行中</option>
            <option value="paused">已暂停</option>
          </select>
          <select 
            value={healthFilter} 
            onChange={(e) => setHealthFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-950 text-sm outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">所有健康度</option>
            <option value="healthy">健康</option>
            <option value="failing">故障</option>
            <option value="unknown">未知</option>
          </select>
          <select 
            value={verifyFilter} 
            onChange={(e) => setVerifyFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-950 text-sm outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">所有验证状态</option>
            <option value="verified">已验证</option>
            <option value="unverified">待验证</option>
          </select>
        </div>
        <button 
          onClick={openCreateForm}
          className="fixed bottom-10 right-10 z-40 flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3.5 rounded-full shadow-2xl hover:shadow-primary/40 text-base font-semibold hover:bg-primary/90 transition-all hover:-translate-y-1"
        >
          <Plus className="w-5 h-5" />
          新增渠道
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
              <th className="p-4 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">渠道名称 & URL</th>
              <th className="p-4 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">爬虫类型</th>
              <th className="p-4 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">状态</th>
              <th className="p-4 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">健康度</th>
              <th className="p-4 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
            {filteredTargets.map((target) => (
              <tr key={target.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                <td className="p-4">
                  <div className="font-medium text-gray-900 dark:text-white">{target.name}</div>
                  <div className="text-sm text-gray-500 dark:text-zinc-400 truncate max-w-xs">{target.scrape_url}</div>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {formatScraperType(target.scraper_type)}
                  </span>
                </td>
                <td className="p-4">
                  <button 
                    onClick={() => handleToggle(target.id, target.is_active)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      target.is_active 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {target.is_active ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                    {target.is_active ? '运行中' : '已暂停'}
                  </button>
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-1.5">
                    {target.operational_status === 'healthy' ? (
                      <span className="inline-flex w-fit items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        健康
                      </span>
                    ) : target.operational_status === 'failing' ? (
                      <span className="inline-flex w-fit items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        故障
                      </span>
                    ) : (
                      <span className="inline-flex w-fit items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                        未知
                      </span>
                    )}

                    {target.is_verified ? (
                      <span className="inline-flex w-fit items-center px-2 py-0.5 rounded text-xs font-medium border border-green-200 text-green-600 dark:border-green-900/50 dark:text-green-500">
                        已验证
                      </span>
                    ) : (
                      <span className="inline-flex w-fit items-center px-2 py-0.5 rounded text-xs font-medium border border-amber-200 text-amber-600 dark:border-amber-900/50 dark:text-amber-500">
                        待验证
                      </span>
                    )}

                    <div className="mt-1">
                      {target.error_streak > 0 ? (
                        <div className="text-xs text-red-600 dark:text-red-400 font-medium">
                          连续 {target.error_streak} 次失败
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 dark:text-zinc-400">
                          {target.last_valid_at ? `活跃于 ${formatDistanceToNow(new Date(target.last_valid_at))}前` : '从未运行'}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => handlePrioritize(target.id)}
                      className="p-1.5 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-md transition-colors"
                      title="优先更新"
                    >
                      <FastForward className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setHistoryItem(target)}
                      className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-md transition-colors"
                      title="查看历史测试记录"
                    >
                      <History className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setTestingItem(target)}
                      className="p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-md transition-colors"
                      title="极客测试"
                    >
                      <Zap className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => openEditForm(target)}
                      className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                      title="编辑"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(target.id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            
            {filteredTargets.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500 dark:text-zinc-400">
                  没有找到符合条件的渠道。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <TargetFormModal 
          target={editingItem} 
          onClose={() => setIsFormOpen(false)} 
        />
      )}

      {testingItem && (
        <TestScrapeModal
          targetId={testingItem.id}
          title={testingItem.name}
          url={testingItem.scrape_url}
          scraperType={testingItem.scraper_type}
          onClose={() => setTestingItem(null)}
        />
      )}

      {historyItem && (
        <TestHistoryModal 
          scrapeUrl={historyItem.scrape_url}
          onClose={() => setHistoryItem(null)}
        />
      )}
    </div>
  );
}
