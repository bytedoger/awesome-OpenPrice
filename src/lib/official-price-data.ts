import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { supabaseAdmin as supabase } from '@/lib/supabase-admin';

export interface OfficialAppRow {
  apple_app_id: string;
  slug: string;
  name: string;
  is_active: boolean;
  target_countries: string[];
}

export interface OfficialPriceRow {
  apple_app_id: string;
  country: string;
  subscription_name: string;
  original_price_str: string;
  price_rmb: number;
  updated_at: string;
}

async function fetchOfficialApps(): Promise<OfficialAppRow[]> {
  const { data, error } = await supabase
    .from('apple_store_apps')
    .select('apple_app_id, slug, name, is_active, target_countries')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching official apps:', error);
    return [];
  }

  return data || [];
}

async function fetchOfficialPrices(): Promise<OfficialPriceRow[]> {
  const { data, error } = await supabase
    .from('apple_store_prices')
    .select('apple_app_id, country, subscription_name, original_price_str, price_rmb, updated_at')
    .order('price_rmb', { ascending: true });

  if (error) {
    console.error('Error fetching official prices:', error);
    return [];
  }

  return data || [];
}

const getCachedOfficialApps = unstable_cache(
  fetchOfficialApps,
  ['official-apps'],
  { revalidate: 86400, tags: ['official-app-list'] },
);

const getCachedOfficialPrices = unstable_cache(
  fetchOfficialPrices,
  ['official-prices'],
  { revalidate: 86400, tags: ['official-prices'] },
);

export const getOfficialApps = cache(getCachedOfficialApps);
export const getOfficialPrices = cache(getCachedOfficialPrices);

export const getOfficialAppByIdentifier = cache(async (identifier: string) => {
  const apps = await getOfficialApps();
  return apps.find(app => (
    app.slug === identifier || app.apple_app_id === identifier
  )) || null;
});
