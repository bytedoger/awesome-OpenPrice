export const env = {
  // Supabase Configuration
  get SUPABASE_URL() { return process.env.NEXT_PUBLIC_SUPABASE_URL || ''; },
  get SUPABASE_ANON_KEY() { return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''; },
  get SUPABASE_SERVICE_ROLE_KEY() { return process.env.SUPABASE_SERVICE_ROLE_KEY || ''; },
  
  // Admin Configuration
  get ADMIN_PASSWORD() { return process.env.ADMIN_PASSWORD || ''; },
  get ADMIN_SESSION_SECRET() { return process.env.ADMIN_SESSION_SECRET || ''; },
  
  // App Environment
  get NODE_ENV() { return process.env.NODE_ENV || 'development'; },
  get IS_PRODUCTION() { return process.env.NODE_ENV === 'production'; },
};

// Validate required server-side environment variables if we are on the server
if (typeof window === 'undefined') {
  if (!env.SUPABASE_URL) {
    console.warn('⚠️ Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('⚠️ Missing environment variable: SUPABASE_SERVICE_ROLE_KEY');
  }
  if (!env.ADMIN_PASSWORD) {
    console.warn('⚠️ Missing environment variable: ADMIN_PASSWORD');
  }
  if (new TextEncoder().encode(env.ADMIN_SESSION_SECRET).byteLength < 32) {
    console.warn('⚠️ ADMIN_SESSION_SECRET must contain at least 32 bytes');
  }
}
