const SESSION_VERSION = 'v1';

export const ADMIN_SESSION_COOKIE = 'admin_session';
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24;

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET || '';

  if (new TextEncoder().encode(secret).byteLength < 32) {
    return null;
  }

  return secret;
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = '';
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBytes(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}

async function importSigningKey(secret: string) {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export function isAdminSessionConfigured() {
  return getSessionSecret() !== null;
}

export async function createAdminSession() {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET must contain at least 32 bytes');
  }

  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE;
  const nonce = new Uint8Array(16);
  crypto.getRandomValues(nonce);

  const payload = `${SESSION_VERSION}.${expiresAt}.${bytesToBase64Url(nonce)}`;
  const key = await importSigningKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));

  return `${payload}.${bytesToBase64Url(new Uint8Array(signature))}`;
}

export async function verifyAdminSession(session: string | undefined) {
  const secret = getSessionSecret();
  if (!secret || !session) return false;

  try {
    const parts = session.split('.');
    if (parts.length !== 4) return false;

    const [version, expiresAtRaw, nonce, signatureRaw] = parts;
    if (version !== SESSION_VERSION || !/^\d+$/.test(expiresAtRaw) || !nonce || !signatureRaw) {
      return false;
    }

    const expiresAt = Number(expiresAtRaw);
    const now = Math.floor(Date.now() / 1000);
    if (
      !Number.isSafeInteger(expiresAt) ||
      expiresAt <= now ||
      expiresAt > now + ADMIN_SESSION_MAX_AGE + 60
    ) {
      return false;
    }

    const payload = `${version}.${expiresAtRaw}.${nonce}`;
    const key = await importSigningKey(secret);

    return await crypto.subtle.verify(
      'HMAC',
      key,
      base64UrlToBytes(signatureRaw),
      new TextEncoder().encode(payload),
    );
  } catch {
    return false;
  }
}
