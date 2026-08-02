import { Metadata } from 'next';
import { OFFICIAL_APP_CONFIGS } from '@/lib/official-apps';
import { getOfficialApps, getOfficialPrices } from '@/lib/official-price-data';
import OfficialPricesClient from './OfficialPricesClient';
import { DEFAULT_SHARE_IMAGE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'ChatGPT、Claude、Grok 官方订阅价格对比 - OpenPrice',
  description: '对比 ChatGPT Plus、Claude Pro、Claude Max、SuperGrok 等官方订阅在不同 App Store 国家和地区的月付、年付价格，查看各套餐低价区和完整价格排行。',
  keywords: [
    'AI 官方订阅价格',
    'App Store 订阅价格对比',
    'ChatGPT Plus 价格',
    'Claude Pro 价格',
    'SuperGrok 价格',
    'App Store 低价区',
    'AI 订阅哪个区便宜',
  ],
  alternates: { canonical: '/official-prices' },
  openGraph: {
    title: 'ChatGPT、Claude、Grok 官方订阅价格对比',
    description: '对比热门 AI 官方订阅在不同 App Store 国家和地区的月付、年付价格与低价区排行。',
    type: 'website',
    url: '/official-prices',
    images: [DEFAULT_SHARE_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ChatGPT、Claude、Grok 官方订阅价格对比',
    description: '对比热门 AI 官方订阅在不同 App Store 国家和地区的月付、年付价格与低价区排行。',
    images: [DEFAULT_SHARE_IMAGE],
  },
};

export const revalidate = 86400;

function billingPeriodFromName(name: string): 'monthly' | 'annual' | null {
  if (/[（(]月付[）)]$/.test(name)) return 'monthly';
  if (/[（(]年付[）)]$/.test(name)) return 'annual';
  return null;
}

function basePlanName(name: string): string {
  return name.replace(/[（(](?:月付|年付)[）)]$/, '');
}

function isCreditLike(name: string): boolean {
  return /\bcredits?\b|积分|点数|额度/i.test(name);
}

export default async function OfficialPricesPage() {
  const [appsData, pricesData] = await Promise.all([
    getOfficialApps(),
    getOfficialPrices(),
  ]);

  // Aggregate prices: Group by App ID -> Subscription Name -> find cheapest
  const appsWithPrices = appsData.map((app) => {
    const appConfig = OFFICIAL_APP_CONFIGS[app.apple_app_id];
    
    // Filter prices for this app
    const appPrices = pricesData.filter(p => p.apple_app_id === app.apple_app_id);
    const coveredCountries = new Set(appPrices.map(p => p.country)).size;
    const totalCountries = new Set(app.target_countries || []).size;
    
    // Only standard plans are comparable across storefronts.
    const subscriptionNames = Array.from(new Set(
      appPrices.map(p => p.subscription_name)
    ));
    
    const allSubscriptions = subscriptionNames.map(subscriptionName => {
      // Since it's sorted ascending by price_rmb from DB, the first element is the cheapest
      const pricesForSub = appPrices.filter(p => p.subscription_name === subscriptionName);
      const cheapest = pricesForSub[0];
      
      return {
        name: String(subscriptionName),
        billingPeriod: billingPeriodFromName(String(subscriptionName)),
        cheapest: {
          country: cheapest.country,
          originalPrice: cheapest.original_price_str,
          priceRmb: cheapest.price_rmb
        }
      };
    }).sort((a, b) => {
      const baseComparison = basePlanName(a.name).localeCompare(basePlanName(b.name));
      if (baseComparison !== 0) return baseComparison;
      if (a.billingPeriod === b.billingPeriod) return 0;
      return a.billingPeriod === 'monthly' ? -1 : 1;
    });

    const subscriptionsByName = new Map(allSubscriptions.map(item => [item.name, item]));
    const configuredPopularPlans = appConfig?.popularPlans || [];
    const configuredSubscriptions = configuredPopularPlans
      .map(name => subscriptionsByName.get(name))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
    const aggregatedSubscriptions = configuredSubscriptions.length > 0
      ? configuredSubscriptions
      : allSubscriptions
          .filter(item => !isCreditLike(item.name))
          .sort((a, b) => a.cheapest.priceRmb - b.cheapest.priceRmb)
          .slice(0, 2);

    // Find the latest update time
    const latestUpdate = appPrices.length > 0 
      ? new Date(Math.max(...appPrices.map(p => new Date(p.updated_at).getTime()))).toISOString()
      : null;

    return {
      id: app.apple_app_id,
      slug: app.slug,
      name: appConfig?.name || app.name,
      iconUrl: appConfig?.iconUrl || '',
      subscriptions: aggregatedSubscriptions,
      coverage: {
        covered: coveredCountries,
        total: totalCountries
      },
      updatedAt: latestUpdate
    };
  });

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">AI 官方订阅价格对比</h1>
          <p className="text-gray-500 text-sm">
            对比 ChatGPT Plus、Claude Pro、Claude Max 和 SuperGrok 等套餐在不同 App Store 国家和地区的月付、年付价格。
          </p>
        </div>
        
        <OfficialPricesClient apps={appsWithPrices} />
      </div>
    </div>
  );
}
