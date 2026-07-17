'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Edit, Trash2, Plus, ArrowUpCircle, ArrowDownCircle, Save, Copy } from 'lucide-react';
import { deleteCatalog, toggleCatalogStatus, updateCatalogInline } from '@/app/admin/(dashboard)/catalog/actions';
import CatalogFormModal from './CatalogFormModal';

export default function CatalogTable({ 
  initialCatalog: catalog,
  platformOptions
}: { 
  initialCatalog: any[];
  platformOptions: any[];
}) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [drafts, setDrafts] = useState<Record<string, any>>({});

  // Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive
  const [platformFilter, setPlatformFilter] = useState('all');

  // Extract unique platforms
  const platforms = Array.from(new Set(catalog.map(c => c.platform))).filter(Boolean);

  // Filtered data
  const filteredCatalog = catalog.filter(c => {
    // Search
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.id.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // Status
    if (statusFilter === 'active' && !c.is_active) return false;
    if (statusFilter === 'inactive' && c.is_active) return false;

    // Platform
    if (platformFilter !== 'all' && c.platform !== platformFilter) return false;

    return true;
  });

  async function handleToggle(id: string, currentStatus: boolean) {
    await toggleCatalogStatus(id, currentStatus);
  }

  async function handleDelete(id: string) {
    if (confirm('确定要彻底删除该商品吗？这可能会影响关联的历史价格数据！')) {
      await deleteCatalog(id);
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

  function openDuplicateForm(item: any) {
    // Duplicate the item but remove its id so it acts as a new creation
    const { id, ...rest } = item;
    setEditingItem({
      ...rest,
      name: `${item.name} (副本)`,
      slug: `${item.slug}-copy`
    });
    setIsFormOpen(true);
  }

  async function handleInlineUpdate(id: string, updates: any) {
    try {
      const res = await updateCatalogInline(id, updates);
      if (res?.error) {
        alert(`保存失败: ${res.error}`);
      }
    } catch (e) {
      console.error(e);
      alert('保存时发生错误');
    }
  }

  return (
    <div>
      <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex flex-col md:flex-row gap-4 justify-between md:items-center bg-gray-50/50 dark:bg-zinc-900/50">
        <div className="flex flex-wrap items-center gap-3">
          <input 
            type="text" 
            placeholder="搜索商品名称或 ID..." 
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
            <option value="active">已上架</option>
            <option value="inactive">已下架</option>
          </select>
          <select 
            value={platformFilter} 
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-950 text-sm outline-none focus:ring-1 focus:ring-primary max-w-[150px]"
          >
            <option value="all">所有平台</option>
            {platforms.map(p => (
              <option key={p as string} value={p as string}>{p as string}</option>
            ))}
          </select>
        </div>
        <button 
          onClick={openCreateForm}
          className="fixed bottom-10 right-10 z-40 flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3.5 rounded-full shadow-2xl hover:shadow-primary/40 text-base font-semibold hover:bg-primary/90 transition-all hover:-translate-y-1"
        >
          <Plus className="w-5 h-5" />
          新增商品
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
              <th className="p-4 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider w-[320px]">商品名称 & ID</th>
              <th className="p-4 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider w-[260px]">短链 (Slug)</th>
              <th className="p-4 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider w-[160px]">所属平台</th>
              <th className="p-4 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider w-[100px]">排序</th>
              <th className="p-4 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">状态</th>
              <th className="p-4 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
            {filteredCatalog.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                <td className="p-4 max-w-[320px]">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        defaultValue={item.name || ''}
                        onChange={(e) => setDrafts(prev => ({...prev, [item.id]: {...prev[item.id], name: e.target.value}}))}
                        onBlur={(e) => {
                          if (e.target.value !== item.name) {
                            handleInlineUpdate(item.id, { name: e.target.value });
                          }
                        }}
                        className="w-full px-2 py-1 rounded-md font-medium border border-transparent hover:border-gray-300 dark:hover:border-zinc-700 focus:border-primary focus:ring-1 focus:ring-primary bg-transparent focus:bg-white dark:focus:bg-zinc-950 text-gray-900 dark:text-white transition-all outline-none truncate"
                        placeholder="商品名称"
                        title={item.name}
                      />
                      {item.is_catch_all && (
                        <span className="shrink-0 inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                          兜底
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono px-2">
                      {item.display_id && <span className="font-bold text-primary mr-1">{item.display_id}</span>}
                      {item.id.substring(0, 8)}...
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <input
                    type="text"
                    defaultValue={item.slug || ''}
                    onChange={(e) => setDrafts(prev => ({...prev, [item.id]: {...prev[item.id], slug: e.target.value}}))}
                    onBlur={(e) => {
                      if (e.target.value !== item.slug) {
                        handleInlineUpdate(item.id, { slug: e.target.value });
                      }
                    }}
                    className="w-full px-2 py-1.5 rounded-md border border-transparent hover:border-gray-300 dark:hover:border-zinc-700 focus:border-primary focus:ring-1 focus:ring-primary bg-transparent focus:bg-white dark:focus:bg-zinc-950 text-sm transition-all outline-none"
                    placeholder="输入 slug"
                  />
                </td>
                <td className="p-4">
                  <select
                    defaultValue={item.platform_id}
                    onChange={(e) => {
                      setDrafts(prev => ({...prev, [item.id]: {...prev[item.id], platform_id: e.target.value}}));
                      handleInlineUpdate(item.id, { platform_id: e.target.value });
                    }}
                    className="w-full px-2 py-1.5 rounded-md border border-transparent hover:border-gray-300 dark:hover:border-zinc-700 focus:border-primary focus:ring-1 focus:ring-primary bg-transparent focus:bg-white dark:focus:bg-zinc-950 text-sm transition-all outline-none cursor-pointer"
                  >
                    <option value="" disabled>请选择</option>
                    {platformOptions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-4">
                  <input
                    type="number"
                    defaultValue={item.sort_order || 0}
                    onChange={(e) => setDrafts(prev => ({...prev, [item.id]: {...prev[item.id], sort_order: parseInt(e.target.value) || 0}}))}
                    onBlur={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      if (val !== item.sort_order) {
                        handleInlineUpdate(item.id, { sort_order: val });
                      }
                    }}
                    className="w-20 px-2 py-1.5 rounded-md border border-transparent hover:border-gray-300 dark:hover:border-zinc-700 focus:border-primary focus:ring-1 focus:ring-primary bg-transparent focus:bg-white dark:focus:bg-zinc-950 text-sm transition-all outline-none"
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
                    {item.is_active ? '已上架' : '已下架'}
                  </button>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => {
                        const updates = drafts[item.id];
                        if (updates && Object.keys(updates).length > 0) {
                          handleInlineUpdate(item.id, updates);
                        } else {
                          handleInlineUpdate(item.id, { name: item.name, slug: item.slug, platform_id: item.platform_id, sort_order: item.sort_order });
                        }
                      }}
                      className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-md transition-colors"
                      title="强制保存行内修改"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => openDuplicateForm(item)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-md transition-colors"
                      title="一键复制商品"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => openEditForm(item)}
                      className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                      title="编辑"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            
            {filteredCatalog.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500 dark:text-zinc-400">
                  没有找到符合条件的商品。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <CatalogFormModal 
          item={editingItem} 
          platformOptions={platformOptions}
          onClose={() => setIsFormOpen(false)} 
        />
      )}
    </div>
  );
}
