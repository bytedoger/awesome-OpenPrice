import { getPublishedBlogPosts } from '@/lib/notion';

export const revalidate = 86400;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const posts = await getPublishedBlogPosts();
  const post = posts.find(item => item.slug === slug);

  if (!post?.cover) {
    return new Response(null, { status: 404 });
  }

  try {
    const imageResponse = await fetch(post.cover, { cache: 'no-store' });
    if (!imageResponse.ok) {
      return new Response(null, { status: 404 });
    }

    return new Response(await imageResponse.arrayBuffer(), {
      headers: {
        'Content-Type': imageResponse.headers.get('content-type') || 'image/jpeg',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    console.error(`Failed to proxy blog cover for ${slug}:`, error);
    return new Response(null, { status: 502 });
  }
}
