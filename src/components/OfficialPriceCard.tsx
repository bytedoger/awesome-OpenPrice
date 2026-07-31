import React from 'react';
import { getCountryNameChinese } from '@/lib/country-names';
import { getRelativeTime } from '@/lib/utils';
import Link from 'next/link';

interface PriceInfo {
  country: string;
  originalPrice: string;
  priceRmb: number;
}

export interface OfficialApp {
  id: string;
  name: string;
  iconUrl: string;
  subscriptions: {
    name: string;
    billingPeriod?: string | null;
    cheapest: PriceInfo;
  }[];
  coverage: {
    covered: number;
    total: number;
  };
  updatedAt: string | null;
}

interface OfficialPriceCardProps {
  app: OfficialApp;
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

export const OfficialPriceCard: React.FC<OfficialPriceCardProps> = ({ app }) => {
  return (
    <Link 
      href={`/official-prices/${app.id}`}
      className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer block"
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="flex items-center gap-3">
          {app.iconUrl ? (
            <img src={app.iconUrl} alt={app.name} className="w-12 h-12 rounded-xl object-cover shadow-sm border border-gray-100" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-lg">
              {app.name.charAt(0)}
            </div>
          )}
          
          <h3 className="text-lg font-bold leading-tight text-gray-900">{app.name}</h3>
        </div>

      </div>

      <p className="text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100 border-dashed">
        热门订阅在不同地区的最低价格。
      </p>

      {/* Subscriptions List */}
      <div className="flex-1 flex flex-col gap-3">
        {app.subscriptions.length > 0 ? (
          app.subscriptions.map((sub, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm font-medium text-gray-700 truncate" title={sub.name}>
                  {getPlanBaseName(sub.name, sub.billingPeriod)}
                </span>
                {sub.billingPeriod && BILLING_LABELS[sub.billingPeriod] && (
                  <span className="shrink-0 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                    {BILLING_LABELS[sub.billingPeriod]}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0 text-sm">
                <span className="text-gray-500">{getCountryNameChinese(sub.cheapest.country)}</span>
                <span className="text-gray-300">·</span>
                <span className="font-semibold text-gray-900">¥{sub.cheapest.priceRmb.toFixed(2)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-gray-400 text-center py-4">暂无订阅数据</div>
        )}
      </div>

      {/* Footer */}
      {app.updatedAt && (
        <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-400">
          <span>覆盖 {app.coverage.covered}/{app.coverage.total} 个目标地区</span>
          <span>{getRelativeTime(app.updatedAt)}更新</span>
        </div>
      )}
    </Link>
  );
};
