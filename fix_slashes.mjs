import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data: targets } = await supabase.from('crawler_targets').select('id, scrape_url');
let updated = 0;
for (const t of (targets || [])) {
  if (t.scrape_url.endsWith('/')) {
    const cleanUrl = t.scrape_url.slice(0, -1);
    await supabase.from('crawler_targets').update({ scrape_url: cleanUrl, site_url: cleanUrl }).eq('id', t.id);
    updated++;
  }
}
console.log(`Updated ${updated} crawler_targets.`);

const { data: subs } = await supabase.from('user_target_submissions').select('id, scrape_url');
let updatedSubs = 0;
for (const s of (subs || [])) {
  if (s.scrape_url && s.scrape_url.endsWith('/')) {
    const cleanUrl = s.scrape_url.slice(0, -1);
    await supabase.from('user_target_submissions').update({ scrape_url: cleanUrl, site_url: cleanUrl }).eq('id', s.id);
    updatedSubs++;
  }
}
console.log(`Updated ${updatedSubs} user_target_submissions.`);

