import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, BadgeCheck, Scale, ShieldCheck, ShoppingBag, TriangleAlert } from 'lucide-react';

export const metadata: Metadata = {
  title: '官方订阅和卡网渠道有什么区别？AI 订阅购买指南 | OpenPrice',
  description: '用通俗方式了解 AI 官方订阅与卡网渠道在购买来源、价格、账号归属、售后和风险方面的区别，购买前先看清商品类型。',
  keywords: ['官方订阅和卡网区别', 'AI 订阅购买指南', '卡网是什么', 'ChatGPT 官方订阅', '第三方 AI 订阅渠道'],
  openGraph: {
    title: '官方订阅和卡网渠道有什么区别？',
    description: '了解两种购买方式在价格、账号归属、售后和风险方面的区别。',
    type: 'article',
  },
};

const comparisons = [
  ['购买来源', 'App Store 或服务提供方的官方渠道', '销售数字商品的第三方渠道商'],
  ['常见商品', '月付、年付等官方订阅套餐', '代充、兑换、成品号、共享或合租等多种商品'],
  ['账号归属', '通常在自己的账号上开通', '取决于商品，可能是自己的账号，也可能是商家提供的账号'],
  ['价格特点', '规则清晰，不同地区定价可能不同', '价格和商品规格更多样，需仔细确认交付内容'],
  ['售后方式', '按照平台或服务提供方规则处理', '由具体渠道商提供，期限和范围各不相同'],
  ['主要风险', '地区、支付方式、自动续费等规则需要了解', '商品描述、账号安全、稳定性和售后质量存在差异'],
] as const;

export default function OfficialVsCardProductsPage() {
  return (
    <article className="p-5 sm:p-8 lg:p-10">
      <header className="mb-8 border-b border-gray-100 pb-6">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
          <Scale className="h-5 w-5" />
        </div>
        <div className="mb-1 text-xs font-semibold text-emerald-600">用户指南</div>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">官方订阅与卡网渠道有什么区别？</h1>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          两者都是获得 AI 服务的方式，但购买来源、商品形态和承担的风险并不相同。没有绝对适合所有人的选择，关键是先看懂自己买的是什么。
        </p>
      </header>

      <div className="space-y-8 text-sm leading-7 text-gray-600">
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
            <div className="mb-3 flex items-center gap-2 font-bold text-gray-900">
              <BadgeCheck className="h-5 w-5 text-emerald-600" />
              什么是官方订阅？
            </div>
            <p>
              官方订阅是通过 App Store 或服务提供方自己的渠道购买套餐。通常在你自己的账号上开通，套餐、续费和售后规则由官方平台制定。
            </p>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
            <div className="mb-3 flex items-center gap-2 font-bold text-gray-900">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
              什么是卡网渠道？
            </div>
            <p>
              卡网渠道是销售数字商品的第三方商家。商品可能是代充、兑换码、成品账号、共享或合租服务，不同商品的交付方式和使用限制可能完全不同。
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold text-gray-900">两种方式怎么比较？</h2>
          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="min-w-[680px] w-full border-collapse text-left text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="w-28 px-4 py-3 font-semibold">对比项</th>
                  <th className="px-4 py-3 font-semibold">官方订阅</th>
                  <th className="px-4 py-3 font-semibold">卡网渠道</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {comparisons.map(([label, official, card]) => (
                  <tr key={label}>
                    <th className="px-4 py-3 font-medium text-gray-900">{label}</th>
                    <td className="px-4 py-3 align-top">{official}</td>
                    <td className="px-4 py-3 align-top">{card}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="mb-3 flex items-center gap-2 font-bold text-amber-900">
            <TriangleAlert className="h-5 w-5" />
            购买卡网商品前，至少确认这 5 件事
          </h2>
          <ol className="list-decimal space-y-1.5 pl-5 text-amber-900/80">
            <li>是自己的账号开通，还是商家提供的成品号、共享号？</li>
            <li>交付后能否修改密码、绑定邮箱或手机，账号找回权归谁？</li>
            <li>商品实际包含哪些套餐权益，是否与官方同名套餐一致？</li>
            <li>售后期限多长，失效、掉订阅或无法登录时如何处理？</li>
            <li>是否需要提供账号密码；主账号和含敏感资料的账号应格外谨慎。</li>
          </ol>
        </section>

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-gray-900">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            应该怎么选？
          </h2>
          <div className="space-y-2">
            <p><strong className="text-gray-900">更看重稳定、账号归属和隐私：</strong>优先考虑官方订阅。</p>
            <p><strong className="text-gray-900">更看重价格或短期使用：</strong>可以比较卡网商品，但要先确认商品类型、限制和售后。</p>
            <p><strong className="text-gray-900">仍然不确定：</strong>先从自己的实际使用周期和能否承担账号失效风险来判断，不要只看最低价格。</p>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="font-bold text-gray-900">OpenPrice 展示的是什么？</h2>
          <p className="mt-2">
            “官方订阅”展示 App Store 中的官方套餐地区价格；“卡网商品”聚合第三方渠道公开报价。OpenPrice 不直接销售这些商品，也不代表对某个渠道作出担保，购买前仍需自行核对商品说明。
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Link href="/official-prices" className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
              查看官方订阅 <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/card-products" className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100">
              查看卡网商品 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </article>
  );
}
