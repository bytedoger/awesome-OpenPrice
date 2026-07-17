export const env = {
  // Supabase Configuration
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  
  // Admin Configuration
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',
  
  // App Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
};

// Validate required server-side environment variables if we are on the server
if (typeof window === 'undefined') {
  if (!env.SUPABASE_URL) {
    console.warn('⚠️ Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('⚠️ Missing environment variable: SUPABASE_SERVICE_ROLE_KEY');
  }
}
