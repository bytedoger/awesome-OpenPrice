'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/admin-auth';

export async function createTestJob(scrapeUrl: string, scraperType: string) {
  await requireAdmin();

  const { data, error } = await supabaseAdmin
    .from('scraper_test_jobs')
    .insert([
      { scrape_url: scrapeUrl, scraper_type: scraperType, status: 'pending' }
    ])
    .select('id')
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data: data.id };
}

export async function getTestJob(jobId: string) {
  await requireAdmin();

  const { data, error } = await supabaseAdmin
    .from('scraper_test_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}
