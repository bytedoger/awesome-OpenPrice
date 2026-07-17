'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { updateOffer } from '@/app/admin/(dashboard)/offers/actions';
import { useAdminForm } from '@/hooks/useAdminForm';

export default function OfferEditModal({ 
  item, 
  catalogOptions, 
  onClose 
}: { 
  item: any, 
  catalogOptions: any[], 
  onClose: () => void 
}) {
  const { isSubmitting, error, submitAction } = useAdminForm();

  // Find the initial platform for the selected item if it's already bound
  const initialProduct = item.canonical_product_id ? catalogOptions.find(c => c.id === item.canonical_product_id) : null;
  const [selectedPlatform, setSelectedPlatform] = useState(initialProduct?.platform_id || '');

  // Unique platforms from catalogOptions
  const platforms = Array.from(
    new Map(
      catalogOptions
        .filter(c => c.product_platforms)
        .map(c => [c.platform_id, c.product_platforms])
    ).values()
  );

  const filteredProducts = selectedPlatform 
    ? catalogOptions.filter(c => c.platform_id === selectedPlatform)
    : [];

  async function handleSubmit(formData: FormData) {
    if (!formData.has('status')) {
      formData.append('status', item.status);
    }

    await submitAction(updateOffer(item.id, formData), onClose);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            手动纠偏 / 编辑报价
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-6 text-sm text-red-500 bg-red-50 dark:bg-red-500/10 p-3 rounded-lg border border-red-200 dark:border-red-500/20">
              {error}
            </div>
          )}

          <div className="mb-6 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg border border-gray-200 dark:border-zinc-800">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">当前原始数据信息</h3>
            <p className="text-sm text-gray-900 dark:text-white font-medium mb-1">{item.product_title}</p>
            <p className="text-sm text-green-600 dark:text-green-500 font-bold mb-2">¥{item.price}</p>
            <p className="text-xs text-gray-500">来源: {item.crawler_targets?.name || '未知'}</p>
          </div>

          <form action={handleSubmit} className="space-y-5">
            
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">手动绑定至标准商品 (Remapping)</label>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <select 
                  value={selectedPlatform}
                  onChange={(e) => {
                    setSelectedPlatform(e.target.value);
                  }}
                  className="w-full sm:w-1/2 px-3 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                >
                  <option value="">-- 先选择平台 --</option>
                  {platforms.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                <select 
                  name="canonical_product_id" 
                  defaultValue={item.canonical_product_id || ''}
                  disabled={!selectedPlatform}
                  className="w-full sm:w-1/2 px-3 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-zinc-900"
                >
                  <option value="">-- 再选择商品 (或取消绑定) --</option>
                  {filteredProducts.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-1.5 text-xs text-gray-500 dark:text-zinc-400">
                请先选择平台，再选择对应的标准商品。
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">状态设定</label>
              <select 
                name="status" 
                defaultValue={item.status}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              >
                <option value="in_stock">正常有货 (In Stock)</option>
                <option value="out_of_stock">暂时缺货 (Out of Stock)</option>
                <option value="offline">失效下架 (Offline)</option>
                <option value="blacklisted">拉黑屏蔽 (Blacklisted)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 mt-4 p-3 bg-gray-50 dark:bg-zinc-900/50 rounded-lg border border-gray-200 dark:border-zinc-800">
              <input 
                type="checkbox" 
                id="is_manual_override" 
                name="is_manual_override" 
                defaultChecked={item.is_manual_override}
                className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
              />
              <div className="flex flex-col">
                <label htmlFor="is_manual_override" className="text-sm font-medium text-gray-900 dark:text-zinc-100 cursor-pointer">
                  锁定人工编辑状态 (Manual Override)
                </label>
                <span className="text-xs text-gray-500">
                  开启后，该报价的分类和状态将不会被爬虫后续的抓取结果所覆盖。
                </span>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-zinc-800">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                取消
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-6 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? '保存中...' : '确认修改'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
