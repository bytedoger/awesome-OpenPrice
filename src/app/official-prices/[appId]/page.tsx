import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getOfficialAppConfig } from '@/lib/official-apps';
import { getOfficialAppByIdentifier, getOfficialApps, getOfficialPrices } from '@/lib/official-price-data';
import AppDetailClient from './AppDetailClient';
import { JsonLd } from '@/components/JsonLd';
import { DEFAULT_SHARE_IMAGE, absoluteUrl } from '@/lib/site';

export const revalidate = 86400;

function billingPeriodFromName(name: string): 'monthly' | 'annual' | null {
  if (/[（(]月付[）)]$/.test(name)) return 'monthly';
  if (/[（(]年付[）)]$/.test(name)) return 'annual';
  return null;
}

function isCreditLike(name: string): boolean {
  return /\bcredits?\b|积分|点数|额度/i.test(name);
}

export async function generateStaticParams() {
  const apps = await getOfficialApps();
  return apps.map(app => ({ appId: app.slug }));
}

export async function generateMetadata({ params }: { params: { appId: string } }): Promise<Metadata> {
  const app = await getOfficialAppByIdentifier(params.appId);
  const appConfig = app ? getOfficialAppConfig(app.apple_app_id) : undefined;
  const appName = appConfig?.name || app?.name || 'AI 应用';
  const appSlug = app?.slug || params.appId;
  const title = appConfig?.seo.title || `${appName} App Store 官方订阅价格 - OpenPrice`;
  const description = appConfig?.seo.description || `查看 ${appName} 在不同 App Store 国家和地区的官方订阅价格与低价排行。`;

  return {
    title,
    description,
    keywords: appConfig?.seo.keywords,
    alternates: { canonical: `/official-prices/${appSlug}` },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `/official-prices/${appSlug}`,
      images: [DEFAULT_SHARE_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [DEFAULT_SHARE_IMAGE],
    },
  };
}

export default async function AppPricesDetailPage({ params }: { params: { appId: string } }) {
  const appData = await getOfficialAppByIdentifier(params.appId);

  if (!appData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">找不到该应用的数据或已下架</div>
      </div>
    );
  }

  if (params.appId !== appData.slug) {
    redirect(`/official-prices/${appData.slug}`);
  }

  const appId = appData.apple_app_id;

  const allPrices = await getOfficialPrices();
  const pricesData = allPrices.filter(price => price.apple_app_id === appId);

  const appConfig = getOfficialAppConfig(appId);
  const latestUpdatedAt = pricesData.reduce<string | null>((latest, price) => {
    if (!price.updated_at) return latest;
    if (!latest) return price.updated_at;
    return new Date(price.updated_at).getTime() > new Date(latest).getTime()
      ? price.updated_at
      : latest;
  }, null);

  // Group prices by subscription name
  const subscriptionsMap: Record<string, any[]> = {};
  if (pricesData) {
    for (const p of pricesData) {
      const groupingKey = p.subscription_name;
      if (!subscriptionsMap[groupingKey]) {
        subscriptionsMap[groupingKey] = [];
      }
      subscriptionsMap[groupingKey].push({
        country: p.country,
        originalPrice: p.original_price_str,
        priceRmb: p.price_rmb,
        updatedAt: p.updated_at
      });
    }
  }

  // Convert to array format for the client
  const subscriptions = Object.keys(subscriptionsMap)
    .map(name => ({
      name,
      kind: isCreditLike(name) ? 'credit' as const : 'subscription' as const,
      billingPeriod: billingPeriodFromName(name),
      prices: subscriptionsMap[name]
    }))
    .sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === 'subscription' ? -1 : 1;
      if (a.kind === 'subscription') {
        const periodOrder: Record<string, number> = {
          monthly: 0,
          annual: 1,
        };
        const periodComparison = (
          periodOrder[a.billingPeriod || ''] ?? 2
        ) - (
          periodOrder[b.billingPeriod || ''] ?? 2
        );
        if (periodComparison !== 0) return periodComparison;
      }
      const aLowestPrice = a.prices[0]?.priceRmb ?? Number.POSITIVE_INFINITY;
      const bLowestPrice = b.prices[0]?.priceRmb ?? Number.POSITIVE_INFINITY;
      return aLowestPrice - bLowestPrice || a.name.localeCompare(b.name);
    });

  const appDetails = {
    id: appData.apple_app_id,
    name: appConfig?.name || appData.name,
    iconUrl: appConfig?.iconUrl || '',
    description: appConfig?.description || '',
    updatedAt: latestUpdatedAt,
    subscriptions
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '官方订阅', item: absoluteUrl('/official-prices') },
          { '@type': 'ListItem', position: 2, name: appDetails.name },
        ],
      }} />
      <AppDetailClient app={appDetails} />
    </div>
  );
}
