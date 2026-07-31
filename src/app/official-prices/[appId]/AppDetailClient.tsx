"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy } from 'lucide-react';
import { getCountryNameChinese } from '@/lib/country-names';

interface PriceInfo {
  country: string;
  originalPrice: string;
  priceRmb: number;
  updatedAt: string;
}

interface SubscriptionData {
  name: string;
  kind: 'subscription' | 'credit';
  billingPeriod?: string | null;
  prices: PriceInfo[];
}

interface AppDetails {
  id: string;
  name: string;
  iconUrl: string;
  description: string;
  subscriptions: SubscriptionData[];
}

interface Props {
  app: AppDetails;
}

const BILLING_LABELS: Record<string, string> = {
  weekly: '周付',
  monthly: '月付',
  three_months: '季付',
  six_months: '半年付',
  annual: '年付',
  one_time: '一次性',
};

function getPlanBaseName(name: string, billingPeriod?: string | null): string {
  const label = billingPeriod ? BILLING_LABELS[billingPeriod] : null;
  return label ? name.replace(new RegExp(`[（(]${label}[）)]$`), '').trim() : name;
}

export default function AppDetailClient({ app }: Props) {
  const [activeTab, setActiveTab] = useState<string>(app.subscriptions[0]?.name || '');
  const [showFullDescription, setShowFullDescription] = useState(false);

  const activeSubscription = app.subscriptions.find(s => s.name === activeTab);
  const subscriptionPlans = app.subscriptions.filter(s => s.kind === 'subscription');
  const creditPlans = app.subscriptions.filter(s => s.kind === 'credit');

  const renderPlanButtons = (plans: SubscriptionData[]) => (
    <div className="flex flex-wrap gap-2">
      {plans.map(sub => (
        <button
          key={sub.name}
          onClick={() => setActiveTab(sub.name)}
          className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === sub.name
              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900'
          }`}
        >
          <span>{getPlanBaseName(sub.name, sub.billingPeriod)}</span>
          {sub.billingPeriod && BILLING_LABELS[sub.billingPeriod] && (
            <span className="ml-1.5 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
              {BILLING_LABELS[sub.billingPeriod]}
            </span>
          )}
        </button>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link href="/official-prices" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6 group">
        <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" />
        返回列表
      </Link>

      {/* App summary */}
      <section className="mb-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-4 sm:gap-5">
          {app.iconUrl ? (
            <img src={app.iconUrl} alt={app.name} className="h-16 w-16 shrink-0 rounded-2xl border border-gray-100 object-cover shadow-sm sm:h-20 sm:w-20" />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-2xl font-bold text-gray-400 sm:h-20 sm:w-20 sm:text-3xl">
              {app.name.charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{app.name} 官方订阅价格</h1>
            {app.description && (
              <>
                <p
                  className={`mt-2 whitespace-pre-line text-sm leading-6 text-gray-600 ${
                    showFullDescription ? '' : 'line-clamp-4'
                  }`}
                >
                  {app.description}
                </p>
                {app.description.length > 240 && (
                  <button
                    type="button"
                    onClick={() => setShowFullDescription(current => !current)}
                    className="mt-2 text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700"
                  >
                    {showFullDescription ? '收起介绍' : '展开完整介绍'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {app.subscriptions.length === 0 ? (
        <div className="text-center text-gray-500 py-12">暂无订阅报价数据</div>
      ) : (
        <>
          {/* Wrapped plan filters */}
          <div className="mb-6 space-y-4">
            {subscriptionPlans.length > 0 && (
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">订阅套餐</div>
                {renderPlanButtons(subscriptionPlans)}
              </div>
            )}
            {creditPlans.length > 0 && (
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Credits / 充值</div>
                {renderPlanButtons(creditPlans)}
              </div>
            )}
          </div>

          {/* Price Leaderboard List */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 grid grid-cols-12 gap-4 text-xs font-medium text-gray-500">
              <div className="col-span-2 sm:col-span-1 text-center">排名</div>
              <div className="col-span-4 sm:col-span-5">国家/地区</div>
              <div className="col-span-3 sm:col-span-3 text-right">当地原价</div>
              <div className="col-span-3 sm:col-span-3 text-right">折合人民币</div>
            </div>

            <div className="divide-y divide-gray-100">
              {activeSubscription?.prices.map((price, index) => {
                const isFirst = index === 0;
                return (
                  <div 
                    key={price.country} 
                    className={`grid grid-cols-12 gap-4 items-center px-5 py-4 hover:bg-gray-50/50 transition-colors ${
                      isFirst ? 'bg-emerald-50/30' : ''
                    }`}
                  >
                    <div className="col-span-2 sm:col-span-1 flex justify-center">
                      {isFirst ? (
                        <Trophy className="w-5 h-5 text-yellow-500" />
                      ) : (
                        <span className="text-gray-400 font-medium text-sm">{index + 1}</span>
                      )}
                    </div>
                    
                    <div className="col-span-4 sm:col-span-5 flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {getCountryNameChinese(price.country)}
                      </span>
                      {isFirst && (
                        <span className="hidden sm:inline-flex items-center rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                          全网最低
                        </span>
                      )}
                    </div>
                    
                    <div className="col-span-3 sm:col-span-3 text-right text-sm text-gray-500 font-mono">
                      {price.originalPrice}
                    </div>
                    
                    <div className="col-span-3 sm:col-span-3 text-right">
                      <span className={`text-sm font-bold ${isFirst ? 'text-emerald-600' : 'text-gray-900'}`}>
                        ¥{price.priceRmb.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="mt-4 text-center text-xs text-gray-400">
            * 价格可能随地区和时间变化，实际扣款金额以 Apple 账单为准
          </div>
        </>
      )}
    </div>
  );
}
