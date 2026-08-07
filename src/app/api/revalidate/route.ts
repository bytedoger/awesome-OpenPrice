import { revalidatePath, revalidateTag } from 'next/cache';

export const dynamic = 'force-dynamic';

type RevalidateScope = 'blog' | 'official' | 'all';

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const authorization = request.headers.get('authorization');

  if (!secret) {
    return Response.json({ error: 'Revalidation is not configured' }, { status: 503 });
  }

  if (authorization !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const scope = body.scope as RevalidateScope | undefined;

  if (!scope || !['blog', 'official', 'all'].includes(scope)) {
    return Response.json({ error: 'Invalid scope' }, { status: 400 });
  }

  if (scope === 'blog' || scope === 'all') {
    revalidateTag('blog-list', 'max');
    revalidateTag('blog-posts', 'max');
    revalidatePath('/blog');
    revalidatePath('/blog/[slug]', 'page');
  }

  if (scope === 'official' || scope === 'all') {
    revalidateTag('official-app-list', 'max');
    revalidateTag('official-prices', 'max');
    revalidatePath('/official-prices');
    revalidatePath('/official-prices/[appId]', 'page');
  }

  return Response.json({ revalidated: true, scope, now: Date.now() });
}
