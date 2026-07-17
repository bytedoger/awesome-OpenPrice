'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function togglePlatformStatus(id: string, currentStatus: boolean) {
  const { error } = await supabaseAdmin
    .from('product_platforms')
    .update({ is_active: !currentStatus })
    .eq('id', id);

  if (error) {
    console.error('Failed to toggle platform status:', error);
    return { error: error.message };
  }

  revalidatePath('/admin/platforms');
  revalidatePath('/admin/catalog');
  return { success: true };
}

export async function updatePlatformSortOrder(id: string, sortOrder: number) {
  const { error } = await supabaseAdmin
    .from('product_platforms')
    .update({ sort_order: sortOrder })
    .eq('id', id);

  if (error) {
    console.error('Failed to update platform sort order:', error);
    return { error: error.message };
  }

  revalidatePath('/admin/platforms');
  return { success: true };
}

export async function deletePlatform(id: string) {
  const { error } = await supabaseAdmin
    .from('product_platforms')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Failed to delete platform:', error);
    // Usually fails if there are linked products due to RESTRICT constraint
    return { error: '删除失败：该平台下可能还有绑定的商品。请先删除或转移这些商品。' };
  }

  revalidatePath('/admin/platforms');
  revalidatePath('/admin/catalog');
  return { success: true };
}

export async function upsertPlatform(formData: FormData) {
  const isEdit = formData.get('is_edit') === 'true';
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const ruleIncludeRaw = formData.get('rule_include') as string;
  const ruleExcludeRaw = formData.get('rule_exclude') as string;
  const sortOrderRaw = formData.get('sort_order') as string;

  let rule_include = [[]];
  if (ruleIncludeRaw) {
    try { rule_include = JSON.parse(ruleIncludeRaw); } catch(e) {}
  }
  
  let rule_exclude = [];
  if (ruleExcludeRaw) {
    try { rule_exclude = JSON.parse(ruleExcludeRaw); } catch(e) {}
  }

  const dataToUpsert: any = {
    name,
    rule_include,
    rule_exclude,
    sort_order: sortOrderRaw ? parseInt(sortOrderRaw, 10) : 100,
    updated_at: new Date().toISOString(),
  };

  if (id) {
    dataToUpsert.id = id;
  }

  const { error } = await supabaseAdmin
    .from('product_platforms')
    .upsert(dataToUpsert)
    .select();

  if (error) {
    console.error('Failed to upsert platform:', error);
    return { error: error.message };
  }

  revalidatePath('/admin/platforms');
  revalidatePath('/admin/catalog');
  return { success: true };
}
