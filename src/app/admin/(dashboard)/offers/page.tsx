import { supabaseAdmin } from '@/lib/supabase-admin';
import OffersTable from '@/components/admin/offers/OffersTable';

export const revalidate = 0;

export default async function OffersPage() {

  // Fetch recent offers, joined with targets and catalog
  const { data: offers, error: offersError } = await supabaseAdmin
    .from('market_offers')
    .select(`
      *,
      crawler_targets(name),
      product_catalog(name)
    `)
    .order('scraped_at', { ascending: false })
    .limit(100);

  if (offersError) {
    console.error('Error fetching offers:', offersError);
  }

  // Fetch all products with platform info for the remapping dropdown
  const { data: catalog, error: catalogError } = await supabaseAdmin
    .from('product_catalog')
    .select(`
      id, 
      name, 
      platform_id,
      product_platforms(id, name)
    `)
    .order('name');

  if (catalogError) {
    console.error('Error fetching catalog:', catalogError);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">原始报价数据审计</h1>
          <p className="text-gray-500 dark:text-zinc-400 mt-1">
            清洗爬虫抓取的脏数据，拉黑错误链接，并手动将报价重新绑定至标准商品。
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 shadow-sm border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <OffersTable initialOffers={offers || []} catalogOptions={catalog || []} />
      </div>
    </div>
  );
}
