'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { upsertTarget } from '@/app/admin/(dashboard)/targets/actions';
import { useAdminForm } from '@/hooks/useAdminForm';

export default function TargetFormModal({ target, onClose }: { target?: any, onClose: () => void }) {
  const { isSubmitting, error, submitAction } = useAdminForm();

  async function handleSubmit(formData: FormData) {
    if (target?.id) {
      formData.append('id', target.id);
    }
    
    await submitAction(upsertTarget(formData), onClose);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {target ? '编辑渠道' : '新增爬虫渠道'}
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

          <form action={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">渠道名称 (选填，支持自动获取)</label>
              <input 
                type="text" 
                name="name" 
                defaultValue={target?.name} 
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="不填则在测试或运行时自动获取"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">平台网址 (供用户跳转)</label>
              <input 
                type="url" 
                name="site_url" 
                defaultValue={target?.site_url} 
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="https://taobao.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">爬取接口 URL (供爬虫调用)</label>
              <input 
                type="url" 
                name="scrape_url" 
                defaultValue={target?.scrape_url} 
                required
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="https://api.example.com/products"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">爬虫引擎类型</label>
              <select 
                name="scraper_type" 
                defaultValue={target?.scraper_type || 'ldxp'}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              >
                <option value="ldxp">链动小铺 (LDXP)</option>
                <option value="dujiao">独角数卡 (Dujiao)</option>
                <option value="lizhi">二次元 (Lizhi)</option>
                <option value="other">其它</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">内部备注 (Remarks)</label>
              <textarea 
                name="remarks" 
                defaultValue={target?.remarks} 
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="填写给管理员看的一些注意事项..."
              />
            </div>

            {target && (
              <div className="p-4 bg-gray-50 dark:bg-zinc-950/50 rounded-lg border border-gray-200 dark:border-zinc-800 space-y-4 mt-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-800 pb-2">高级状态干预区</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1.5">运行状态</label>
                    <select 
                      name="is_active" 
                      defaultValue={target.is_active ? 'true' : 'false'}
                      className="w-full px-2 py-1.5 rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value="true">运行中</option>
                      <option value="false">已暂停</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1.5">验证状态</label>
                    <select 
                      name="is_verified" 
                      defaultValue={target.is_verified ? 'true' : 'false'}
                      className="w-full px-2 py-1.5 rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value="true">已验证</option>
                      <option value="false">待验证</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1.5">健康度</label>
                    <select 
                      name="operational_status" 
                      defaultValue={target.operational_status || 'unknown'}
                      className="w-full px-2 py-1.5 rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value="unknown">未知 (Unknown)</option>
                      <option value="healthy">健康 (Healthy)</option>
                      <option value="failing">故障 (Failing)</option>
                    </select>
                  </div>
                </div>
                <div className="text-[10px] text-gray-500 mt-2">
                  注意：强制将健康度修改为“健康”会自动清零错误计数。
                </div>
              </div>
            )}

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
                {isSubmitting ? '保存中...' : '保存渠道'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
