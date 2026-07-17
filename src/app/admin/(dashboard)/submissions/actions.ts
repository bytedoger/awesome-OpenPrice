'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function rejectSubmission(id: string) {
  const { error } = await supabaseAdmin
    .from('user_target_submissions')
    .update({ status: 'rejected' })
    .eq('id', id);

  if (error) {
    console.error('Failed to reject submission:', error);
    return { error: error.message };
  }

  revalidatePath('/admin/submissions');
  return { success: true };
}

export async function approveSubmission(id: string, formData: FormData) {
  let name = formData.get('name') as string;
  const isAutoApprove = formData.get('is_auto_approve') === 'true';
  const site_url_raw = (formData.get('site_url') as string) || '';
  const scrape_url_raw = formData.get('scrape_url') as string;
  const scraper_type = formData.get('scraper_type') as string;
  const remarks = formData.get('remarks') as string;

  // 规范化 URL，统一去掉结尾的斜杠，防止因为多一个斜杠导致去重失败
  const scrape_url = scrape_url_raw.endsWith('/') ? scrape_url_raw.slice(0, -1) : scrape_url_raw;
  
  const site_url = site_url_raw.endsWith('/') ? site_url_raw.slice(0, -1) : site_url_raw;

  // Always fetch the latest record from DB as the source of truth
  const { data: latestSub } = await supabaseAdmin
    .from('user_target_submissions')
    .select('*')
    .eq('id', id)
    .single();

  if (isAutoApprove) {
    // For auto-approves, if the modal provided an explicitly edited name, use it.
    // Otherwise, fallback to the DB truth.
    const formName = formData.get('name') as string;
    if (formName) {
      name = formName;
    } else {
      name = latestSub?.name || '未命名';
    }
  } else {
    // For manual approval, prefer the form's name (in case admin edited it), 
    // but if it's empty, fallback to the fresh DB name.
    if (!name) {
      name = latestSub?.name || '未命名';
    }
  }

  // 0. 检验 URL 是否已经存在于正式渠道表中，防止重复转正
  const { data: existingTargets } = await supabaseAdmin
    .from('crawler_targets')
    .select('id, name')
    .eq('scrape_url', scrape_url)
    .limit(1);

  if (existingTargets && existingTargets.length > 0) {
    // 自动将该提报的状态更新为 duplicate，区分于普通的拒绝
    await supabaseAdmin
      .from('user_target_submissions')
      .update({ status: 'duplicate' })
      .eq('id', id);

    revalidatePath('/admin/submissions');
    return { error: `该爬虫 URL 已在渠道表中存在 (${existingTargets[0].name})，系统已自动将该重复提报驳回！` };
  }

  // 1. Insert into crawler_targets
  const { error: targetError } = await supabaseAdmin
    .from('crawler_targets')
    .insert({
      name,
      site_url,
      scrape_url,
      scraper_type,
      remarks: remarks ? `[由用户提报转正] ${remarks}` : '[由用户提报转正]',
      is_active: true,
      is_verified: true,
    });

  if (targetError) {
    console.error('Failed to create target from submission:', targetError);
    return { error: targetError.message };
  }

  // 2. Update submission status to approved
  const { error: updateError } = await supabaseAdmin
    .from('user_target_submissions')
    .update({ status: 'approved' })
    .eq('id', id);

  if (updateError) {
    console.error('Failed to update submission status:', updateError);
    return { error: updateError.message };
  }

  revalidatePath('/admin/submissions');
  revalidatePath('/admin/targets'); // Need to revalidate the targets page too
  return { success: true };
}

export async function updateSubmissionScraperType(id: string, scraperType: string) {
  const { error } = await supabaseAdmin
    .from('user_target_submissions')
    .update({ scraper_type: scraperType })
    .eq('id', id);

  if (error) {
    console.error('Failed to update submission scraper type:', error);
    return { error: error.message };
  }

  revalidatePath('/admin/submissions');
  return { success: true };
}
