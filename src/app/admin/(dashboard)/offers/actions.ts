'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function deleteOffer(id: string) {
  const { error } = await supabaseAdmin
    .from('market_offers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Failed to delete offer:', error);
    return { error: error.message };
  }

  revalidatePath('/admin/offers');
  return { success: true };
}

export async function updateOffer(id: string, formData: FormData) {
  const status = formData.get('status') as string;
  const canonical_product_id = formData.get('canonical_product_id') as string;
  const isManualOverrideRaw = formData.get('is_manual_override') as string;
  const is_manual_override = isManualOverrideRaw === 'on' || isManualOverrideRaw === 'true';

  const dataToUpdate: any = {
    status,
    canonical_product_id: canonical_product_id || null, // null if empty string
    is_manual_override,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin
    .from('market_offers')
    .update(dataToUpdate)
    .eq('id', id);

  if (error) {
    console.error('Failed to update offer:', error);
    return { error: error.message };
  }

  revalidatePath('/admin/offers');
  return { success: true };
}
