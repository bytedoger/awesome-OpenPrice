'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';

export async function createTestJob(scrapeUrl: string, scraperType: string) {
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
