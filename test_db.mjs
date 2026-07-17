import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const { data, error } = await supabase.from('scraper_test_jobs').select('*').order('created_at', { ascending: false }).limit(1);
console.log("Job status:", data[0].status);
console.log("Created at:", data[0].created_at);
console.log("Is array:", Array.isArray(data[0].result_data));
console.log("Extracted name:", data[0].result_data.extracted_name);
