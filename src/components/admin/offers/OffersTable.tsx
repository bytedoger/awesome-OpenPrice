'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Edit, Trash2, ExternalLink, ShieldBan, CheckCircle, Copy } from 'lucide-react';
import { deleteOffer, updateOffer } from '@/app/admin/(dashboard)/offers/actions';
import OfferEditModal from './OfferEditModal';

export default function OffersTable({ 
  initialOffers: offers, 
  catalogOptions 
}: { 
  initialOffers: any[], 
  catalogOptions: any[] 
}) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, normal, blacklisted
  const [matchFilter, setMatchFilter] = useState('all'); // all, matched, unmatched

  // Filtered data
  const filteredOffers = offers.filter(o => {
    // Search
    const matchesSearch = o.product_title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // Status
    if (statusFilter === 'normal' && o.status === 'blacklisted') return false;
    if (statusFilter === 'blacklisted' && o.status !== 'blacklisted') return false;

    // Match
    if (matchFilter === 'matched' && !o.canonical_product_id) return false;
    if (matchFilter === 'unmatched' && o.canonical_product_id) return false;

    return true;
  });

  async function handleDelete(id: string) {
    if (confirm('确定要彻底物理删除这条抓取记录吗？注意：如果爬虫再次抓取到该页面，仍会重新生成。推荐使用“拉黑”功能！')) {
      await deleteOffer(id);
    }
  }

  async function toggleBlacklist(id: string, currentStatus: string) {
    const formData = new FormData();
    const newStatus = currentStatus === 'blacklisted' ? 'unknown' : 'blacklisted';
    formData.append('status', newStatus);
    
    // We need to keep the canonical ID as is, but we don't have it easily available here without passing the full object.
    // Actually, it's better if `updateOffer` handles partial updates, but currently it replaces canonical_id if empty.
    // Let's just find the offer and grab its current canonical_product_id.
    const offer = offers.find(o => o.id === id);
    if (offer && offer.canonical_product_id) {
      formData.append('canonical_product_id', offer.canonical_product_id);
    }

    await updateOffer(id, formData);
  }

  function openEditForm(item: any) {
    setEditingItem(item);
    setIsFormOpen(true);
  }

  return (
    <div>
      <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex flex-col md:flex-row gap-4 justify-between md:items-center bg-gray-50/50 dark:bg-zinc-900/50">
        <div className="flex flex-wrap items-center gap-3">
          <input 
            type="text" 
            placeholder="搜索报价标题..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-950 text-sm w-64"
          />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-950 text-sm outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">所有展示状态</option>
            <option value="normal">正常展示</option>
            <option value="blacklisted">已拉黑屏蔽</option>
          </select>
          <select 
            value={matchFilter} 
            onChange={(e) => setMatchFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-950 text-sm outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">所有匹配状态</option>
            <option value="matched">已匹配标准商品</option>
            <option value="unmatched">未自动匹配</option>
          </select>
        </div>
        <div className="text-sm text-gray-500">
          显示最新的 {filteredOffers.length} 条记录
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
              <th className="p-4 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">报价 ID</th>
              <th className="p-4 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">原始标题 & 价格</th>
              <th className="p-4 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">映射的标准商品</th>
              <th className="p-4 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">抓取来源</th>
              <th className="p-4 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">状态</th>
              <th className="p-4 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
            {filteredOffers.map((item) => (
              <tr key={item.id} className={`transition-colors ${item.status === 'blacklisted' ? 'bg-red-50/50 dark:bg-red-900/10' : 'hover:bg-gray-50 dark:hover:bg-zinc-800/50'}`}>
                <td className="p-4">
                  <div className="flex items-center gap-1.5">
                    <div className="text-xs text-gray-500 dark:text-zinc-400 font-mono" title={item.id}>
                      {item.id.substring(0, 8)}...
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(item.id)}
                      title="复制完整 ID"
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
                <td className="p-4">
                  <div className="font-medium text-gray-900 dark:text-white line-clamp-2" title={item.product_title}>
                    {item.product_title}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-lg font-bold text-green-600 dark:text-green-500">
                      ¥{item.price}
                    </span>
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                        查看链接 <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </td>
                
                <td className="p-4">
                  {item.canonical_product_id ? (
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.product_catalog?.name || '未知商品'}
                      </span>
                      <span className="text-xs text-gray-500 font-mono">
                        {item.canonical_product_id.substring(0, 8)}...
                      </span>
                    </div>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">
                      未自动匹配
                    </span>
                  )}
                </td>

                <td className="p-4">
                  <div className="text-sm text-gray-900 dark:text-white font-medium">
                    {item.crawler_targets?.name || '未知渠道'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(item.scraped_at))}前抓取
                  </div>
                </td>

                <td className="p-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    item.status === 'in_stock' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : item.status === 'out_of_stock'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : item.status === 'offline'
                      ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {item.status === 'in_stock' 
                      ? '正常在售' 
                      : item.status === 'out_of_stock'
                      ? '暂时缺货'
                      : item.status === 'offline'
                      ? '链接失效/下架'
                      : '已拉黑屏蔽'}
                  </span>
                </td>

                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => toggleBlacklist(item.id, item.status)}
                      title={item.status === 'blacklisted' ? '恢复正常' : '拉黑屏蔽'}
                      className={`p-1.5 rounded-md transition-colors ${
                        item.status === 'blacklisted'
                          ? 'text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                          : 'text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                      }`}
                    >
                      {item.status === 'blacklisted' ? <CheckCircle className="w-4 h-4" /> : <ShieldBan className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => openEditForm(item)}
                      title="手动重新绑定标准商品"
                      className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      title="物理删除"
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            
            {filteredOffers.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500 dark:text-zinc-400">
                  没有找到符合条件的抓取数据。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <OfferEditModal 
          item={editingItem} 
          catalogOptions={catalogOptions}
          onClose={() => setIsFormOpen(false)} 
        />
      )}
    </div>
  );
}
