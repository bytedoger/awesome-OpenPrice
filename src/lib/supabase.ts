import { createClient } from '@supabase/supabase-js';
import { env } from './env';

if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
  console.warn('Supabase credentials are not provided. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
}

// 增加自定义 fetch 拦截器，解决构建时并发请求导致的 ECONNRESET 和 fetch failed
const customFetch = async (url: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  let retries = 3;
  while (retries > 0) {
    try {
      return await fetch(url, init);
    } catch (error: any) {
      const isConnectionReset = 
        error?.cause?.code === 'ECONNRESET' || 
        error?.code === 'ECONNRESET' || 
        error?.message?.includes('fetch failed') ||
        error?.message?.includes('network socket disconnected');
        
      retries--;
      if (retries === 0 || !isConnectionReset) {
        throw error;
      }
      // 添加随机延迟重试 500ms - 1500ms
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    }
  }
  throw new Error('fetch failed after retries');
};

// Client for public / frontend usage (uses Anon Key)
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  global: {
    fetch: customFetch,
  },
});
