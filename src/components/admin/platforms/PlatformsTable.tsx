'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Edit, Trash2, Plus, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { deletePlatform, togglePlatformStatus, updatePlatformSortOrder } from '@/app/admin/(dashboard)/platforms/actions';
import PlatformFormModal from './PlatformFormModal';

export default function PlatformsTable({ initialPlatforms: platforms }: { initialPlatforms: any[] }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive

  // Filtered data
  const filteredPlatforms = platforms.filter(p => {
    // Search
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // Status
    if (statusFilter === 'active' && !p.is_active) return false;
    if (statusFilter === 'inactive' && p.is_active) return false;

    return true;
  });

  async function handleToggle(id: string, currentStatus: boolean) {
    await togglePlatformStatus(id, currentStatus);
  }

  async function handleDelete(id: string) {
    if (confirm('确定要删除该平台吗？如果有关联的商品目录，删除将会失败。')) {
      const res = await deletePlatform(id);
      if (res.error) {
        alert(res.error);
      }
    }
  }

  function openEditForm(item: any) {
    setEditingItem(item);
    setIsFormOpen(true);
  }

  function openCreateForm() {
    setEditingItem(null);
    setIsFormOpen(true);
  }

  return (
    <div>
      <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex flex-col md:flex-row gap-4 justify-between md:items-center bg-gray-50/50 dark:bg-zinc-900/50">
        <div className="flex flex-wrap items-center gap-3">
          <input 
            type="text" 
            placeholder="搜索平台名称..." 
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
            <option value="active">启用中</option>
            <option value="inactive">已禁用</option>
          </select>
        </div>
        <button 
          onClick={openCreateForm}
          className="fixed bottom-10 right-10 z-40 flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3.5 rounded-full shadow-2xl hover:shadow-primary/40 text-base font-semibold hover:bg-primary/90 transition-all hover:-translate-y-1"
        >
          <Plus className="w-5 h-5" />
          新增平台
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
              <th className="p-4 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">平台名称 & ID</th>
              <th className="p-4 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">包含匹配词</th>
              <th className="p-4 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">排除匹配词</th>
              <th className="p-4 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">排序</th>
              <th className="p-4 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">状态</th>
              <th className="p-4 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
            {filteredPlatforms.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                <td className="p-4">
                  <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                  <div className="text-xs text-gray-500 dark:text-zinc-400 font-mono mt-0.5">{item.id.substring(0, 8)}...</div>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {item.rule_include && item.rule_include.length > 0 ? (
                      item.rule_include.map((rule: string) => (
                        <span key={rule} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          {rule}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {item.rule_exclude && item.rule_exclude.length > 0 ? (
                      item.rule_exclude.map((rule: string) => (
                        <span key={rule} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                          {rule}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <input
                    type="number"
                    defaultValue={item.sort_order ?? 100}
                    onBlur={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val !== item.sort_order) {
                        updatePlatformSortOrder(item.id, val);
                      }
                    }}
                    className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-950 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </td>
                <td className="p-4">
                  <button 
                    onClick={() => handleToggle(item.id, item.is_active)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      item.is_active 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {item.is_active ? <ArrowUpCircle className="w-3 h-3" /> : <ArrowDownCircle className="w-3 h-3" />}
                    {item.is_active ? '启用中' : '已禁用'}
                  </button>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => openEditForm(item)}
                      className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            
            {filteredPlatforms.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500 dark:text-zinc-400">
                  没有找到符合条件的平台。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <PlatformFormModal 
          item={editingItem} 
          onClose={() => setIsFormOpen(false)} 
        />
      )}
    </div>
  );
}
