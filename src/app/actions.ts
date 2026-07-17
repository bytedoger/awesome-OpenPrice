'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';

export async function getChannelProviderCount() {
  try {
    const { count, error } = await supabaseAdmin
      .from('crawler_targets')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    if (error) {
      console.error('Error fetching channel provider count:', error);
      return 0;
    }
    return count || 0;
  } catch (err) {
    console.error('Exception fetching channel provider count:', err);
    return 0;
  }
}


export async function submitChannel(formData: FormData) {
  try {
    const rawName = formData.get('site_name') as string;
    const name = rawName ? rawName.trim() : '未命名 (用户未提供)';
    const site_url_raw = (formData.get('site_url') as string) || '';
    const site_url = site_url_raw.endsWith('/') ? site_url_raw.slice(0, -1) : site_url_raw;
    const contact = formData.get('contact') as string;
    const remarks = formData.get('remarks') as string;

    if (!site_url) {
      return { success: false, error: '请填写带*的必填项' };
    }

    const { error } = await supabaseAdmin
      .from('user_target_submissions')
      .insert([
        {
          name,
          site_url,
          contact: contact || '',
          remarks: remarks || '',
          status: 'pending'
        }
      ]);

    if (error) {
      console.error('Error submitting channel:', error);
      return { success: false, error: '提交失败，请稍后重试' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Exception submitting channel:', err);
    return { success: false, error: '系统异常，请稍后重试' };
  }
}

export async function submitFeedback(formData: FormData) {
  try {
    const offer_id = formData.get('offer_id') as string;
    const issue_type = formData.get('issue_type') as string;
    const description = formData.get('description') as string;

    if (!offer_id || !issue_type || !description) {
      return { success: false, error: '请填写所有必填项' };
    }

    const { error } = await supabaseAdmin
      .from('user_feedbacks')
      .insert([
        {
          offer_id,
          issue_type,
          description,
          status: 'pending'
        }
      ]);

    if (error) {
      console.error('Error submitting feedback:', error);
      return { success: false, error: '提交失败，请稍后重试' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Exception submitting feedback:', err);
    return { success: false, error: '系统异常，请稍后重试' };
  }
}
