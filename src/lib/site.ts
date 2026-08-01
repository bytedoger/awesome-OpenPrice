export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.openprice.cc'
).replace(/\/$/, '');

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
