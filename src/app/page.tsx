import React from 'react';
import Link from 'next/link';
import { Search, Store, Zap, ArrowRight, Sparkles, TrendingDown } from 'lucide-react';
import { PlatformCountBadge } from '../components/PlatformCountBadge';
import { SubmitChannelButton } from '../components/SubmitChannelButton';
import { getChannelProviderCount } from './actions';

export default async function HomePage() {
  const platformCount = await getChannelProviderCount();

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Background decoration */}
      <div className="absolute inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-100/40 via-gray-50/20 to-transparent"></div>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 relative">
          <PlatformCountBadge count={platformCount} />
          
          {/* Hero Section */}
          <div className="text-center max-w-4xl mx-auto mb-20 pt-8">
            <div className="inline-flex items-center justify-center rounded-full bg-emerald-100/80 px-4 py-1.5 text-sm font-semibold text-emerald-800 mb-8 shadow-sm backdrop-blur-sm border border-emerald-200">
              <Sparkles className="mr-2 h-4 w-4 text-emerald-600" />
              全网卡网渠道数据聚合与比价平台
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl mb-8 leading-[1.15]">
              一个免费无广的<br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">收录所有卡网AI订阅价格的项目</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
              打破信息差，聚合全网各大发卡网底价。在这里货比<span className="text-orange-500 text-3xl font-bold italic mx-1">n</span>多家，让你以最低的价格买到 Claude、ChatGPT 等 ai 订阅会员。
            </p>
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-5 py-4 rounded-2xl mb-10 max-w-2xl mx-auto flex items-start text-left shadow-sm">
              <span className="text-xl mr-3 leading-none">⚠️</span>
              <p className="leading-relaxed"><strong>免责声明：</strong>本网站仅提供全网渠道价格的客观聚合展示，不对任何第三方产品的质量负责。购买前请仔细甄别，并遵循原商品发布平台的规则与质保条款。</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/card-products" 
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-emerald-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 hover:shadow-xl hover:-translate-y-0.5"
              >
                开始浏览商品 <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <SubmitChannelButton 
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-base font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 transition-all hover:bg-gray-50 hover:shadow-md hover:-translate-y-0.5"
              >
                提交渠道免费收录 <Store className="ml-2 h-5 w-5 text-gray-500" />
              </SubmitChannelButton>
            </div>
          </div>

          {/* Features / Value Props Section */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto mt-16">
            
            {/* Card 1: For Buyers */}
            <div className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="absolute top-0 right-0 p-8 opacity-5 transition-opacity group-hover:opacity-10">
                <TrendingDown className="h-24 w-24" />
              </div>
              <div className="relative z-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <Search className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">买家：全网底价透明化</h3>
                <p className="text-gray-500 leading-relaxed mb-6">
                  很难找到靠谱便宜的渠道？我们聚合全网卡网数据，AI 代充、成品号、接码等资源一目了然，无需货比三家，告别买贵。
                </p>
                <Link href="/card-products" className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700">
                  去挑商品 <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Card 2: For Sellers */}
            <div className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="absolute top-0 right-0 p-8 opacity-5 transition-opacity group-hover:opacity-10">
                <Store className="h-24 w-24" />
              </div>
              <div className="relative z-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 mb-6 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                  <Store className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">渠道商：一键免费收录</h3>
                <p className="text-gray-500 leading-relaxed mb-6">
                  无论你是渠道拥有者还是知道优质渠道的人，都欢迎你提交该渠道。站长会在后台仔细审核并上线，让好产品获得全网曝光。
                </p>
                <SubmitChannelButton 
                  className="inline-flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  一键免费收录 <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </SubmitChannelButton>
              </div>
            </div>

            {/* Card 3: User Experience */}
            <div className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:col-span-2 lg:col-span-1">
              <div className="absolute top-0 right-0 p-8 opacity-5 transition-opacity group-hover:opacity-10">
                <Zap className="h-24 w-24" />
              </div>
              <div className="relative z-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 mb-6 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                  <Zap className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">极致的挑选体验</h3>
                <p className="text-gray-500 leading-relaxed mb-6">
                  告别繁杂的信息堆砌，提供直观、清爽的产品聚合展示。无论是手机还是电脑，都能让你流畅地检索、对比和挑选。
                </p>
                <div className="inline-flex items-center text-sm font-semibold text-purple-600 cursor-default">
                  体验顺滑浏览 <Sparkles className="ml-1 h-4 w-4" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
