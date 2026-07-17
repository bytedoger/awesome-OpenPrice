'use client';

import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { upsertCatalog } from '@/app/admin/(dashboard)/catalog/actions';
import { useAdminForm } from '@/hooks/useAdminForm';

export default function CatalogFormModal({ 
  item, 
  platformOptions,
  onClose 
}: { 
  item?: any;
  platformOptions: any[];
  onClose: () => void;
}) {
  const { isSubmitting, error, submitAction } = useAdminForm();

  // Multi-level rule state (store as raw strings to allow trailing commas during typing)
  const [includeGroups, setIncludeGroups] = useState<string[]>(() => {
    if (item?.rule_include && Array.isArray(item.rule_include) && item.rule_include.length > 0) {
      if (Array.isArray(item.rule_include[0])) {
        return item.rule_include.map((group: string[]) => group.join(', '));
      }
      return [item.rule_include.join(', ')];
    }
    return ['']; // Default 1 empty group
  });
  
  const [excludeWords, setExcludeWords] = useState<string>(() => {
    if (item?.rule_exclude && Array.isArray(item.rule_exclude)) {
      return item.rule_exclude.join(', ');
    }
    return '';
  });

  const handleGroupChange = (index: number, value: string) => {
    const newGroups = [...includeGroups];
    newGroups[index] = value;
    setIncludeGroups(newGroups);
  };

  const addGroup = () => {
    setIncludeGroups([...includeGroups, '']);
  };

  const removeGroup = (index: number) => {
    const newGroups = [...includeGroups];
    newGroups.splice(index, 1);
    setIncludeGroups(newGroups.length > 0 ? newGroups : ['']);
  };

  async function handleSubmit(formData: FormData) {
    if (item?.id) {
      formData.append('id', item.id);
    }
    formData.append('is_edit', item?.id ? 'true' : 'false');
    
    // Append the JSON serialized arrays
    const parsedIncludeGroups = includeGroups.map(g => g.split(',').map(s => s.trim()).filter(Boolean));
    const parsedExcludeWords = excludeWords.split(',').map(s => s.trim()).filter(Boolean);
    formData.set('rule_include', JSON.stringify(parsedIncludeGroups));
    formData.set('rule_exclude', JSON.stringify(parsedExcludeWords));
    
    await submitAction(upsertCatalog(formData), onClose);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {item?.id ? '编辑商品' : (item ? '复制新增商品' : '新增标准商品')}
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
            {item?.id && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">商品 ID (UUID)</label>
                <input 
                  type="text" 
                  name="id" 
                  defaultValue={item?.id} 
                  readOnly
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 text-sm bg-gray-100 dark:bg-zinc-800 text-gray-500 cursor-not-allowed outline-none transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">友好短链 (Slug)</label>
              <input 
                type="text" 
                name="slug" 
                defaultValue={item?.slug} 
                required
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="例如：netflix-premium"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">商品显示名称</label>
              <input 
                type="text" 
                name="name" 
                defaultValue={item?.name} 
                required
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="例如：奈飞 Netflix 4K 高级版"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">所属平台</label>
                <select 
                  name="platform_id" 
                  defaultValue={item?.platform_id || ''} 
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                >
                  <option value="" disabled>请选择所属平台</option>
                  {platformOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">展示排序</label>
                <input 
                  type="number" 
                  name="sort_order" 
                  defaultValue={item?.sort_order || 0} 
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="数字越小越靠前"
                />
              </div>
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">简短描述</label>
              <textarea 
                name="short_desc" 
                defaultValue={item?.short_desc} 
                rows={2}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="一句话介绍商品亮点..."
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                  爬虫包含匹配词 (多组条件)
                </label>
                <button
                  type="button"
                  onClick={addGroup}
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  添加条件组
                </button>
              </div>
              <p className="text-xs text-gray-500">组与组之间是 <b>并且(AND)</b> 的关系。单个组内的词是 <b>或者(OR)</b> 的关系，请用英文逗号分隔。</p>
              
              <div className="space-y-2">
                {includeGroups.map((group, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="flex-1">
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs font-semibold text-gray-400 bg-gray-100 dark:bg-zinc-800 px-1.5 rounded">
                          组 {index + 1}
                        </span>
                        <input
                          type="text"
                          value={group}
                          onChange={(e) => handleGroupChange(index, e.target.value)}
                          className="w-full pl-14 pr-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                          placeholder="例如: gpt plus, chatgpt plus"
                        />
                      </div>
                    </div>
                    {includeGroups.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeGroup(index)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="删除该组"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">爬虫排除匹配词 (英文逗号分隔)</label>
              <textarea 
                value={excludeWords} 
                onChange={(e) => setExcludeWords(e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="例如：代充, 失败号"
              />
              <p className="text-xs text-gray-500 mt-1">遇到这些词时将直接跳过此商品匹配，防止误伤。</p>
            </div>

            <div className="flex items-center gap-2 mt-4 p-3 bg-gray-50 dark:bg-zinc-900/50 rounded-lg border border-gray-200 dark:border-zinc-800">
              <input 
                type="checkbox" 
                id="is_catch_all" 
                name="is_catch_all" 
                defaultChecked={item?.is_catch_all}
                className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
              />
              <div className="flex flex-col">
                <label htmlFor="is_catch_all" className="text-sm font-medium text-gray-900 dark:text-zinc-100 cursor-pointer">
                  设为该平台的兜底商品 (Catch-All)
                </label>
                <span className="text-xs text-gray-500">
                  开启后，如果爬虫匹配了该平台但没有匹配到任何特定商品，将自动归类到此商品。
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">站内搜索关键词 (英文逗号分隔)</label>
              <input 
                type="text" 
                name="search_keywords" 
                defaultValue={item?.search_keywords?.join(', ')} 
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="例如：netflix, 奈飞, 4k (用于前台搜索)"
              />
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
                {isSubmitting ? '保存中...' : '保存商品'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
