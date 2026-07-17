'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function toggleCatalogStatus(id: string, currentStatus: boolean) {
  const { error } = await supabaseAdmin
    .from('product_catalog')
    .update({ is_active: !currentStatus })
    .eq('id', id);

  if (error) {
    console.error('Failed to toggle catalog status:', error);
    return { error: error.message };
  }

  revalidatePath('/admin/catalog');
  revalidatePath('/card-products/[slug]', 'page');
  return { success: true };
}

export async function deleteCatalog(id: string) {
  const { error } = await supabaseAdmin
    .from('product_catalog')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Failed to delete catalog item:', error);
    return { error: error.message };
  }

  revalidatePath('/admin/catalog');
  revalidatePath('/card-products/[slug]', 'page');
  return { success: true };
}

export async function upsertCatalog(formData: FormData) {
  const isEdit = formData.get('is_edit') === 'true';
  const id = formData.get('id') as string;
  const slug = formData.get('slug') as string;
  const name = formData.get('name') as string;
  const platform_id = formData.get('platform_id') as string;
  const short_desc = formData.get('short_desc') as string;
  const searchKeywordsRaw = formData.get('search_keywords') as string;
  const ruleIncludeRaw = formData.get('rule_include') as string;
  const ruleExcludeRaw = formData.get('rule_exclude') as string;
  const isCatchAllRaw = formData.get('is_catch_all') as string;
  const is_catch_all = isCatchAllRaw === 'on' || isCatchAllRaw === 'true';



  let needsRevalidateMeta = false;
  if (isEdit && id) {
    const { data: oldData } = await supabaseAdmin
      .from('product_catalog')
      .select('name, short_desc, slug')
      .eq('id', id)
      .single();
      
    if (oldData) {
      if (oldData.name !== name || oldData.short_desc !== short_desc || oldData.slug !== slug) {
        needsRevalidateMeta = true;
      }
    } else {
      needsRevalidateMeta = true;
    }
  } else {
    needsRevalidateMeta = true;
  }

  const search_keywords = searchKeywordsRaw 
    ? searchKeywordsRaw.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  let rule_include = [[]];
  if (ruleIncludeRaw) {
    try { rule_include = JSON.parse(ruleIncludeRaw); } catch(e) {}
  }
  
  let rule_exclude = [];
  if (ruleExcludeRaw) {
    try { rule_exclude = JSON.parse(ruleExcludeRaw); } catch(e) {}
  }
  
  const sort_order = parseInt(formData.get('sort_order') as string) || 0;

  const dataToUpsert: any = {
    slug,
    name,
    platform_id,
    short_desc,
    search_keywords,
    rule_include,
    rule_exclude,
    is_catch_all,
    sort_order,
    updated_at: new Date().toISOString(),
  };

  if (id) {
    dataToUpsert.id = id;
  }

  const { error } = await supabaseAdmin
    .from('product_catalog')
    .upsert(dataToUpsert)
    .select();

  if (error) {
    console.error('Failed to upsert catalog item:', error);
    return { error: error.message };
  }

  revalidatePath('/admin/catalog');
  
  if (needsRevalidateMeta) {
    revalidatePath('/card-products/[slug]', 'page');
  }
  
  return { success: true };
}

export async function updateCatalogInline(id: string, updates: any) {
  const { error } = await supabaseAdmin
    .from('product_catalog')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Failed to update catalog inline:', error);
    return { error: error.message };
  }

  revalidatePath('/admin/catalog');
  // Might need to revalidate product page if slug changed
  if (updates.slug) {
    revalidatePath('/card-products/[slug]', 'page');
  }
  return { success: true };
}
