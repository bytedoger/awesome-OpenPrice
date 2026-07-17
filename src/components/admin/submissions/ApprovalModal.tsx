'use client';

import { useState } from 'react';
import { X, Info } from 'lucide-react';
import { approveSubmission } from '@/app/admin/(dashboard)/submissions/actions';
import { useAdminForm } from '@/hooks/useAdminForm';

export default function ApprovalModal({ 
  item, 
  onClose 
}: { 
  item: any, 
  onClose: () => void 
}) {
  const { isSubmitting, error, submitAction } = useAdminForm();

  async function handleSubmit(formData: FormData) {
    if (!formData.get('name')) formData.append('name', item.name);
    if (!formData.get('site_url')) formData.append('site_url', item.site_url);

    await submitAction(approveSubmission(item.id, formData), onClose);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            批准并转正为爬虫渠道
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800 dark:text-blue-300">
              普通用户只提交了基础信息。请您作为管理员，在此补全<strong>爬虫接口 URL</strong> 和 <strong>引擎类型</strong>。保存后，该数据将正式转入 <code>crawler_targets</code> 队列并立刻激活。
            </p>
          </div>

          {error && (
            <div className="mb-6 text-sm text-red-500 bg-red-50 dark:bg-red-500/10 p-3 rounded-lg border border-red-200 dark:border-red-500/20">
              {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">渠道名称 (可修改)</label>
              <input 
                type="text" 
                name="name" 
                defaultValue={item?.name} 
                required
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">原始平台网址</label>
              <input 
                type="url" 
                name="site_url" 
                defaultValue={item?.site_url} 
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="border-t border-gray-200 dark:border-zinc-800 pt-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">技术参数配置 (必填)</h3>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">爬取接口 URL</label>
                  <input 
                    type="url" 
                    name="scrape_url" 
                    required
                    defaultValue={item?.site_url}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="https://api.example.com/products"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">爬虫引擎类型</label>
                  <select 
                    name="scraper_type" 
                    defaultValue={item?.scraper_type || 'ldxp'}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  >
                    <option value="ldxp">链动小铺 (LDXP)</option>
                    <option value="dujiao">独角数卡 (Dujiao)</option>
                    <option value="lizhi">二次元发卡 (Lizhi)</option>
                    <option value="other">其它</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">管理员内部备注 (可选)</label>
                  <textarea 
                    name="remarks" 
                    rows={2}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="填写审核时的注意事项..."
                  />
                </div>
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
                className="px-6 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? '转移中...' : '转正为真实渠道'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
