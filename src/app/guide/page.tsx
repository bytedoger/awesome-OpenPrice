import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, CheckCircle, Scale, Star, Store, UserRound } from 'lucide-react';

export const metadata: Metadata = {
  title: 'OpenPrice 指南｜用户购买指南与渠道商接入',
  description: '按用户和渠道商分类查看 OpenPrice 指南，了解官方订阅与卡网渠道的区别、渠道收录方式和商品展示建议。',
};

const sections = [
  {
    title: '用户指南',
    description: '帮助普通用户看懂不同购买方式，在价格、稳定性和风险之间做出适合自己的选择。',
    icon: UserRound,
    tone: 'emerald',
    links: [
      {
        title: '官方订阅与卡网渠道有什么区别？',
        description: '了解购买来源、账号归属、售后和常见风险。',
        href: '/guide/official-vs-card-products',
        icon: Scale,
      },
    ],
  },
  {
    title: '渠道商指南',
    description: '帮助渠道商接入 OpenPrice，并让商品被更准确地识别和展示。',
    icon: Store,
    tone: 'blue',
    links: [
      {
        title: '如何被平台收录？',
        description: '了解标准建站系统和自建商城的接入方式。',
        href: '/guide/getting-started',
        icon: CheckCircle,
      },
      {
        title: '如何获取更好的展示？',
        description: '使用清晰标题和类目 ID 提升商品识别准确度。',
        href: '/guide/best-practices',
        icon: Star,
      },
    ],
  },
] as const;

export default function GuidePage() {
  return (
    <div className="p-5 sm:p-8 lg:p-10">
      <header className="mb-8 border-b border-gray-100 pb-6">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">OpenPrice 指南</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
          根据你的身份选择指南。普通用户可以先了解购买方式，渠道商可以查看收录和展示规则。
        </p>
      </header>

      <div className="space-y-8">
        {sections.map(section => {
          const SectionIcon = section.icon;
          const isEmerald = section.tone === 'emerald';

          return (
            <section key={section.title}>
              <div className="mb-4 flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  isEmerald ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  <SectionIcon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">{section.title}</h2>
                  <p className="mt-1 text-sm leading-5 text-gray-500">{section.description}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {section.links.map(item => {
                  const ItemIcon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50/60 p-4 transition-all hover:border-emerald-200 hover:bg-emerald-50/50"
                    >
                      <ItemIcon className="mt-0.5 h-5 w-5 shrink-0 text-gray-400 transition-colors group-hover:text-emerald-600" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-gray-900">{item.title}</span>
                        <span className="mt-1 block text-xs leading-5 text-gray-500">{item.description}</span>
                      </span>
                      <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-500" />
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
