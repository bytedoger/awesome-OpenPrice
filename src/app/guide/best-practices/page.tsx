import React from 'react';
import { Star, Hash } from 'lucide-react';
import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import ContactButtons from './ContactButtons';
import { CopyableText } from '@/components/CopyableText';
import { CopyButton } from '@/components/CopyButton';
import { ShareLinkButton } from '@/components/ShareLinkButton';

export const metadata: Metadata = {
  title: '如何更好的展示商品？(渠道商最佳实践) | OpenPrice',
  description: '了解如何在 OpenPrice 开源比价平台上获得更好的商品展示效果。通过简单的类目 ID 映射，帮助爬虫引擎更精准地分类您的 ChatGPT、Claude 等商品，让买家更容易找到您的优质渠道。',
  keywords: ['OpenPrice接入', '商品类目映射', '卡网收录规范', '渠道商指南', '开源比价平台'],
  openGraph: {
    title: '如何更好的展示商品？(渠道商最佳实践) | OpenPrice',
    description: '了解如何在 OpenPrice 开源比价平台上获得更好的商品展示效果。通过简单的类目 ID 映射，帮助爬虫引擎更精准地分类您的 ChatGPT、Claude 等商品，让买家更容易找到您的优质渠道。',
    type: 'article',
  }
};

export default async function BestPracticesPage() {
  const { data: categories } = await supabase
    .from('product_catalog')
    .select('name, display_id')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  const categoriesTextToCopy = `OpenPrice 官方类目 ID 映射表\n------------------------\n` + 
    (categories || []).map(cat => `${cat.name} : ${cat.display_id || '-'}`).join('\n');

  return (
    <div className="p-8 sm:p-12">
      <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
          <Star className="h-6 w-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          如何获取更好的展示？
        </h1>
      </div>

      <div className="prose prose-amber max-w-none prose-p:text-gray-600 prose-p:leading-relaxed">
        <p>
          在 OpenPrice 平台上，我们会对全网的卡网商品进行客观的聚合与排序。为了让你的商品和渠道能获得更多的点击和更高的转化，建议你遵循以下最佳实践：
        </p>

        <div id="category-id" className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-6 sm:p-8 shadow-sm mb-12 relative overflow-hidden scroll-mt-24">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Hash className="w-32 h-32" />
          </div>
          <div className="flex items-start gap-4 relative z-10">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white shadow-md">
              <Hash className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                核心优化：使用商品类目 ID 实现 100% 精准收录
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                <strong>渠道商强烈建议：</strong> 默认分类方式是按照商品标题关键词匹配，<strong>但可能存在误差，有可能把你的商品错误分类</strong>。想要你的商品被收录在指定类目，<strong>只需在你的商品标题任意位置，加上我们平台指定商品类目 ID 即可</strong>。
              </p>
              
              <div className="bg-white/60 rounded-xl p-4 border border-purple-100 mb-6">
                <p className="text-sm text-gray-800 mb-3 font-medium">举个例子（假设 ChatGPT 成品账号的类目 ID 是 #044）：</p>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="flex-1 w-full bg-white p-3 rounded-lg border border-gray-200 text-sm text-gray-500 line-through">
                    ChatGPT Plus 成品账号
                  </div>
                  <div className="hidden sm:block text-purple-400 font-bold">➔</div>
                  <div className="block sm:hidden text-purple-400 font-bold">⬇</div>
                  <div className="flex-1 w-full bg-white p-3 rounded-lg border-2 border-purple-400 text-sm font-semibold text-gray-900 shadow-sm relative">
                    ChatGPT Plus 成品账号 #044
                    <div className="absolute -top-2.5 -right-2.5 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">推荐</div>
                  </div>
                </div>
              </div>

              <details open className="group border-2 border-purple-400 rounded-xl bg-white overflow-hidden shadow-lg mb-6">
                <summary className="px-5 py-4 cursor-pointer text-base font-bold text-white bg-purple-600 hover:bg-purple-700 flex items-center justify-between transition-colors">
                  <span className="flex items-center gap-3">
                    <span className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-300 fill-yellow-300" />
                      【必看】OpenPrice 官方类目 ID 映射表
                    </span>
                    <ShareLinkButton hashId="category-id" />
                  </span>
                  <span className="text-xs font-medium text-purple-100 group-open:hidden border border-purple-400 bg-purple-500 px-3 py-1 rounded-full shadow-sm">
                    点击展开全部
                  </span>
                  <span className="text-xs font-medium text-purple-100 hidden group-open:block border border-purple-400 bg-purple-500 px-3 py-1 rounded-full shadow-sm">
                    点击收起
                  </span>
                </summary>
                
                {/* 复制全部控制栏 */}
                <div className="px-5 py-3 bg-purple-100/50 border-t border-purple-200 flex justify-between items-center">
                  <span className="text-sm text-purple-800 font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                    当前已支持 {categories?.length || 0} 个有效类目
                  </span>
                  <CopyButton 
                    textToCopy={categoriesTextToCopy} 
                    buttonText="一键复制全部" 
                    className="text-purple-700 bg-white hover:bg-purple-100 rounded-lg border-purple-200 shadow-sm"
                  />
                </div>

                <div className="px-5 py-4 bg-purple-50/50 border-t border-purple-200 max-h-[500px] overflow-y-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr>
                        <th className="py-2 px-3 text-left font-semibold text-gray-600 border-b">类目名称</th>
                        <th className="py-2 px-3 text-left font-semibold text-gray-600 border-b">类目 ID (展示ID)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {categories?.map((cat, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="py-2 px-3 text-gray-800">{cat.name}</td>
                          <td className="py-2 px-3">
                            {cat.display_id ? (
                              <code className="text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md text-sm font-mono font-bold tracking-wider cursor-pointer hover:bg-purple-100 transition-colors inline-flex items-center">
                                <CopyableText text={cat.display_id} />
                              </code>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>

              <div className="bg-white/90 rounded-xl p-5 border border-purple-100 shadow-sm flex flex-col sm:flex-row gap-5 items-center justify-between">
                <div>
                  <h4 className="text-gray-900 font-bold mb-1.5 flex items-center gap-2">
                    <span className="text-purple-500">💡</span>
                    没找到合适的类目？
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    如果你对当前的类目划分不满意，或者想要增加新的类目，欢迎加入官方群聊联系管理员。
                  </p>
                </div>
                <div className="flex shrink-0 w-full sm:w-auto">
                  <ContactButtons />
                </div>
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-6 border-l-4 border-amber-500 pl-3">
          其他基础优化建议
        </h3>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm">
          <ul className="space-y-6 text-sm text-gray-600 leading-relaxed">
            <li className="flex gap-3.5">
              <span className="shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-amber-100 text-amber-700 font-bold text-xs mt-0.5">1</span>
              <div>
                <strong className="text-gray-900 block text-base mb-1">保持商品名称清晰</strong>
                请如实描述商品规格，避免堆砌无关关键词，在默认情况下是按照关键词匹配进行收录的。当然，建议你使用上述的类目 ID 的方式，这种方式优先级最高。
              </div>
            </li>
            
            <li className="flex gap-3.5">
              <span className="shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-amber-100 text-amber-700 font-bold text-xs mt-0.5">2</span>
              <div>
                <strong className="text-gray-900 block text-base mb-1">提供真实的联系方式</strong>
                提交收录时请留下有效的联系方式（如 TG/QQ/邮箱）。当系统检测到你的网站无法访问或规则失效时，我们会第一时间通知你，避免收录失败。
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
