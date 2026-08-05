import { revalidatePath, revalidateTag } from 'next/cache';
import { syncPublishedBlogAssets } from '@/lib/blog-assets';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 120;

async function runSync(slug?: string) {
  const result = await syncPublishedBlogAssets(slug);
  revalidateTag('blog-list');
  revalidateTag('blog-posts');
  revalidatePath('/blog');
  revalidatePath('/blog/[slug]', 'page');
  return Response.json({ synced: true, ...result });
}

// Vercel Cron invokes configured routes with GET and sends CRON_SECRET as a Bearer token.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return Response.json({ error: 'Cron synchronization is not configured' }, { status: 503 });
  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    return await runSync();
  } catch (error) {
    console.error('Scheduled blog asset synchronization failed:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Blog asset sync failed' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) return Response.json({ error: 'Revalidation is not configured' }, { status: 503 });
  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  if (body.slug !== undefined && (typeof body.slug !== 'string' || !body.slug.trim())) {
    return Response.json({ error: 'slug must be a non-empty string when provided' }, { status: 400 });
  }

  try {
    return await runSync(body.slug?.trim());
  } catch (error) {
    console.error('Failed to sync blog assets to R2:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Blog asset sync failed' },
      { status: 500 },
    );
  }
}
