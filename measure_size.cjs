const { createClient } = require('@supabase/supabase-js');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  require('dotenv').config({ path: '.env.local' });
}
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  let allOffers = [];
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('market_offers')
      .select('id, product_title, price, status, url, updated_at, canonical_product_id, crawler_targets(name, scraper_type)')
      .neq('status', 'blacklisted')
      .range(from, from + pageSize - 1);
    if (error) throw error;
    if (data) allOffers = allOffers.concat(data);
    if (!data || data.length < pageSize) break;
    from += pageSize;
  }
  const jsonStr = JSON.stringify(allOffers);
  console.log('Total items:', allOffers.length);
  console.log('Raw JSON size:', (jsonStr.length / 1024 / 1024).toFixed(2), 'MB');
}
run();
