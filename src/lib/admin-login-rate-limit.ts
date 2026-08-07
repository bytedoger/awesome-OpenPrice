import 'server-only';

import { headers } from 'next/headers';
import { env } from './env';
import { supabaseAdmin } from './supabase-admin';

const MAX_ATTEMPTS = 10;
const WINDOW_SECONDS = 10 * 60;
const BLOCK_SECONDS = 15 * 60;

async function getRequestIdentifierHash() {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get('x-forwarded-for');
  const clientIp = (
    forwardedFor?.split(',')[0]?.trim() ||
    requestHeaders.get('x-real-ip')?.trim() ||
    'unknown'
  ).slice(0, 128);

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.ADMIN_SESSION_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`admin-login:${clientIp}`),
  );

  return Array.from(new Uint8Array(signature), byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function consumeAdminLoginAttempt() {
  const identifierHash = await getRequestIdentifierHash();
  const { data, error } = await supabaseAdmin.rpc('consume_admin_login_attempt', {
    p_identifier_hash: identifierHash,
    p_limit: MAX_ATTEMPTS,
    p_window_seconds: WINDOW_SECONDS,
    p_block_seconds: BLOCK_SECONDS,
  });

  if (error) {
    console.error('Failed to check admin login rate limit:', error.message);
    return { allowed: false, identifierHash };
  }

  return { allowed: data === true, identifierHash };
}

export async function resetAdminLoginAttempts(identifierHash: string) {
  const { error } = await supabaseAdmin.rpc('reset_admin_login_attempts', {
    p_identifier_hash: identifierHash,
  });

  if (error) {
    console.error('Failed to reset admin login rate limit:', error.message);
  }
}
