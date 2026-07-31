import React from 'react';
import { CheckCircle, Info } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { CopyableCode } from '@/components/CopyableCode';
import { CopyableText } from '@/components/CopyableText';
import { CopyableAllFields } from '@/components/CopyableAllFields';

export const metadata: Metadata = {
  title: '如何被收录？(渠道接入指南) | OpenPrice',
  description: '卡网怎么免费引流？如何被全网比价平台收录？OpenPrice 提供详细的渠道接入指南。无论您使用的是主流发卡系统还是自建商城，都能轻松完成对接，让您的 ChatGPT、Claude 等数字商品快速获取海量免费曝光。',
  keywords: ['卡网免费引流', '发卡系统对接', '卡网推广', '渠道收录', 'AI订阅分销', 'JSON-LD'],
  openGraph: {
    title: '如何被收录？(渠道接入指南) | OpenPrice',
    description: '卡网怎么免费引流？如何被全网比价平台收录？OpenPrice 提供详细的渠道接入指南。无论您使用的是主流发卡系统还是自建商城，都能轻松完成对接，让您的 ChatGPT、Claude 等数字商品快速获取海量免费曝光。',
    type: 'article',
  }
};

export default function GuideOverviewPage() {
  return (
    <div className="p-8 sm:p-12">
      <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
          <CheckCircle className="h-5 w-5" />
        </div>
        <div>
          <div className="mb-1 text-xs font-semibold text-emerald-600">渠道商指南</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            如何被平台收录？
          </h1>
          <p className="text-gray-500 text-sm">
            请先阅读下方的接入说明，再点击网站右上角“提交渠道”，只需两步即可将你的站点收录。
          </p>
        </div>
      </div>

      <div className="prose prose-emerald max-w-none prose-p:text-gray-600 prose-p:leading-relaxed">
        
        <p className="text-gray-600 mb-8">
          平台针对不同类型的建站系统提供了相应的收录方式，请根据你的情况查看：
          <br />
          1. <a href="#standard-sites" className="text-emerald-600 font-medium hover:underline">标准建站系统接入</a>
          <br />
          2. <a href="#self-built-sites" className="text-emerald-600 font-medium hover:underline">非标准建站 / 自建商城</a>
        </p>

        {/* 标准建站系统 */}
        <div id="standard-sites" className="scroll-mt-28 mb-12">
          <h2 className="text-xl font-bold text-gray-900 border-l-4 border-emerald-500 pl-3 m-0 mb-4">
            1. 标准建站系统
          </h2>
          <p>
            如果你使用的是主流商业发卡系统，我们的爬虫引擎已内置解析支持，可直接被收录。当前已完美支持的系统包括：
          </p>
          <ul className="list-disc pl-5 text-gray-700 font-medium">
            <li>链动小铺</li>
            <li>独角数卡 (DuJiao)</li>
            <li>二次元发卡 (acg-faka)</li>
          </ul>
          <p className="text-sm text-gray-500 mt-4">
            * 只要你的建站工具在上述列表中，提交网址后，我们在后台审核后，就可以被收录并自动抓取你的网站里的商品信息。可以在<Link href="/channels" className="text-emerald-600 hover:underline">这里</Link>查看是否被收录。
          </p>
        </div>

        {/* 非标准建站系统 */}
        <div id="self-built-sites" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-gray-900 border-l-4 border-purple-500 pl-3 m-0 mb-4">
            2. 非标准建站(自建商城)
          </h2>
          <p>
            如果你拥有自主研发的商城系统，或者使用的是小众的定制系统，为了能够被 OpenPrice 爬虫精准识别和收录，<strong className="text-gray-900">请务必在你的商品列表页嵌入 JSON-LD 结构化数据</strong>。
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start my-6">
            <Info className="h-5 w-5 text-amber-500 mr-2 shrink-0 mt-0.5" />
            <div className="text-amber-800 text-sm">
              <strong>为什么需要 JSON-LD？</strong><br/>
              JSON-LD 是由 W3C 推荐、Google 官方极力主推的 <strong>国际标准结构化数据（Schema.org）规范</strong>。接入此规范，不仅能确保你的商品在 OpenPrice 上被 100% 精准解析，更是向全球搜索引擎提交了最标准的“官方档案”。它完全符合 Google 及 Bing 官方推荐的列表页结构化数据标准（Listings Rich Results），<strong>有助于你的站点获得搜索引擎富媒体卡片展示，提升 SEO 排名，极大提升搜索点击率与免费自然流量</strong>。
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-4">JSON-LD 植入示例</h3>
          <p>
            请在你商城的 <strong className="text-gray-900">商品列表页</strong> 的 <code>&lt;head&gt;</code> 或 <code>&lt;body&gt;</code> 标签内，加入包含所有商品的 JSON 数组格式的 <code>&lt;script type="application/ld+json"&gt;</code> 标签：
          </p>

          <CopyableCode code={`<script type="application/ld+json">
[
  {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": "ChatGPT Plus 独享账号",
    "offers": {
      "@type": "Offer",
      "url": "https://example.com/product/chatgpt-plus",
      "priceCurrency": "CNY",
      "price": "145.00",
      "availability": "https://schema.org/InStock",
      "inventoryLevel": {
        "@type": "QuantitativeValue",
        "value": 50
      }
    }
  },
  {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": "Netflix 4K 高级会员",
    "offers": {
      "@type": "Offer",
      "url": "https://example.com/product/netflix-4k",
      "priceCurrency": "CNY",
      "price": "20.00",
      "availability": "https://schema.org/InStock",
      "inventoryLevel": {
        "@type": "QuantitativeValue",
        "value": 999
      }
    }
  }
]
</script>`} />

          <div className="flex justify-between items-center mt-8 mb-4">
            <h3 className="text-lg font-bold text-gray-900 m-0">关键字段说明</h3>
            <CopyableAllFields />
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm border border-gray-200 rounded-xl">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">字段</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">必填</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">说明</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                <tr>
                  <td className="px-4 py-3 font-mono text-purple-600"><CopyableText text="name" /></td>
                  <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">是</span></td>
                  <td className="px-4 py-3 text-gray-600">商品标题。尽量清晰准确，包含类型和时长。</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-purple-600"><CopyableText text="url" /></td>
                  <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">是</span></td>
                  <td className="px-4 py-3 text-gray-600">指向该商品的直达详情页 URL。</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-purple-600"><CopyableText text="price" /></td>
                  <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">是</span></td>
                  <td className="px-4 py-3 text-gray-600">商品的售价，纯数字（如 <code>145.00</code>）。</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-purple-600"><CopyableText text="priceCurrency" /></td>
                  <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">是</span></td>
                  <td className="px-4 py-3 text-gray-600">货币单位，通常为 <code>CNY</code>。</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-purple-600"><CopyableText text="availability" /></td>
                  <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">是</span></td>
                  <td className="px-4 py-3 text-gray-600">库存状态。<br/>有货: <code>https://schema.org/InStock</code><br/>缺货: <code>https://schema.org/OutOfStock</code></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-purple-600"><CopyableText text="inventoryLevel" /></td>
                  <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">否</span></td>
                  <td className="px-4 py-3 text-gray-600">具体库存数量（类型为 QuantitativeValue）。提供此项可以让平台显示具体的剩余库存。</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-8 mb-4 bg-blue-50/50 border border-blue-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-blue-900 text-sm">
              <strong className="block text-base mb-1">✅ 验证你的代码格式</strong>
              植入代码完成后，强烈建议你使用 Google 官方的富媒体搜索结果测试工具，输入你的网页链接进行检测，确保 JSON-LD 格式完全正确。
            </div>
            <a 
              href="https://search.google.com/test/rich-results" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="shrink-0 inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-sm text-sm"
            >
              前往 Google 测试工具 ➔
            </a>
          </div>
        </div>
        
      </div>
    </div>
  );
}
