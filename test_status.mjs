import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const { data, error } = await supabase.from('user_target_submissions').update({ status: 'duplicate' }).eq('id', '00000000-0000-0000-0000-000000000000');
console.log('Error:', error);
