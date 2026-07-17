'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function toggleTargetStatus(id: string, currentStatus: boolean) {
  const newStatus = !currentStatus;
  const { error } = await supabaseAdmin
    .from('crawler_targets')
    .update({ is_active: newStatus })
    .eq('id', id);

  if (error) {
    console.error('Failed to toggle status:', error);
    return { error: error.message };
  }

  // If target is deactivated, mark all its existing offers as offline
  if (!newStatus) {
    await supabaseAdmin
      .from('market_offers')
      .update({ status: 'offline' })
      .eq('target_id', id);
  }

  revalidatePath('/admin/targets');
  return { success: true };
}

export async function deleteTarget(id: string) {
  const { error } = await supabaseAdmin
    .from('crawler_targets')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Failed to delete target:', error);
    return { error: error.message };
  }

  revalidatePath('/admin/targets');
  return { success: true };
}

export async function upsertTarget(formData: FormData) {
  const id = formData.get('id') as string | null;
  const rawName = formData.get('name') as string;
  const name = rawName ? rawName.trim() : '未命名 (自动获取)';
  const site_url_raw = (formData.get('site_url') as string) || '';
  const scrape_url_raw = (formData.get('scrape_url') as string) || '';

  // 规范化 URL，统一去掉结尾的斜杠
  const site_url = site_url_raw.endsWith('/') ? site_url_raw.slice(0, -1) : site_url_raw;
  const scrape_url = scrape_url_raw.endsWith('/') ? scrape_url_raw.slice(0, -1) : scrape_url_raw;
  const scraper_type = formData.get('scraper_type') as string;
  const remarks = formData.get('remarks') as string;

  const dataToUpsert: any = {
    name,
    site_url,
    scrape_url,
    scraper_type,
    remarks,
    updated_at: new Date().toISOString(),
  };

  if (id) {
    dataToUpsert.id = id; // Update existing
    
    // Status overrides (only available during edit)
    const isActiveStr = formData.get('is_active') as string;
    if (isActiveStr) dataToUpsert.is_active = isActiveStr === 'true';

    const isVerifiedStr = formData.get('is_verified') as string;
    if (isVerifiedStr) dataToUpsert.is_verified = isVerifiedStr === 'true';

    const opStatus = formData.get('operational_status') as string;
    if (opStatus) {
      dataToUpsert.operational_status = opStatus;
      if (opStatus === 'healthy') {
        dataToUpsert.error_streak = 0; // Reset error streak if forced to healthy
      }
    }
  }

  // Deduplication logic
  if (scrape_url) {
    const { data: existing } = await supabaseAdmin
      .from('crawler_targets')
      .select('id')
      .eq('scrape_url', scrape_url)
      .maybeSingle();

    if (existing && existing.id !== id) {
      return { error: '该爬取接口 URL 已存在，请勿重复添加相同渠道。' };
    }
  }

  const { error } = await supabaseAdmin
    .from('crawler_targets')
    .upsert(dataToUpsert)
    .select();

  if (error) {
    console.error('Failed to upsert target:', error);
    return { error: error.message };
  }

  // If target is being updated and deactivated, mark all its existing offers as offline
  if (id && dataToUpsert.is_active === false) {
    await supabaseAdmin
      .from('market_offers')
      .update({ status: 'offline' })
      .eq('target_id', id);
  }

  revalidatePath('/admin/targets');
  return { success: true };
}

export async function verifyTarget(id: string) {
  const { error } = await supabaseAdmin
    .from('crawler_targets')
    .update({ 
      is_verified: true,
      operational_status: 'healthy',
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Failed to verify target:', error);
    return { error: error.message };
  }

  revalidatePath('/admin/targets');
  return { success: true };
}

export async function getTestHistory(scrapeUrl: string) {
  const { data, error } = await supabaseAdmin
    .from('scraper_test_jobs')
    .select('*')
    .eq('scrape_url', scrapeUrl)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Failed to get test history:', error);
    return { error: error.message };
  }

  return { success: true, data };
}
