import type { BlogPost } from '@/lib/notion';

/**
 * Serve immutable R2 assets directly so they can use their year-long browser
 * cache. Keep the proxy fallback for expiring Notion-hosted image URLs.
 */
export function blogCoverUrl(post: Pick<BlogPost, 'cover' | 'slug'>): string | null {
  if (!post.cover) return null;

  const r2PublicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL?.replace(/\/$/, '');
  if (r2PublicUrl && post.cover.startsWith(`${r2PublicUrl}/`)) {
    return post.cover;
  }

  return `/api/blog-cover/${encodeURIComponent(post.slug)}`;
}

/** Uses the pre-generated 640x480 WebP variant on blog listing pages. */
export function blogCoverThumbnailUrl(post: Pick<BlogPost, 'cover' | 'slug'>): string | null {
  const cover = blogCoverUrl(post);
  if (!cover) return null;

  const r2PublicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL?.replace(/\/$/, '');
  if (r2PublicUrl && cover.startsWith(`${r2PublicUrl}/`) && cover.includes('/optimized-')) {
    return cover.replace('/optimized-', '/thumbnail-');
  }

  return cover;
}
