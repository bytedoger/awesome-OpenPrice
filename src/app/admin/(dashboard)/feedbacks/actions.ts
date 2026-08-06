'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/admin-auth';

export async function resolveFeedback(id: string) {
  await requireAdmin();

  const { error } = await supabaseAdmin
    .from('user_feedbacks')
    .update({ status: 'resolved' })
    .eq('id', id);

  if (error) {
    console.error('Failed to resolve feedback:', error);
    return { error: error.message };
  }

  revalidatePath('/admin/feedbacks');
  return { success: true };
}

export async function ignoreFeedback(id: string) {
  await requireAdmin();

  const { error } = await supabaseAdmin
    .from('user_feedbacks')
    .update({ status: 'ignored' })
    .eq('id', id);

  if (error) {
    console.error('Failed to ignore feedback:', error);
    return { error: error.message };
  }

  revalidatePath('/admin/feedbacks');
  return { success: true };
}
