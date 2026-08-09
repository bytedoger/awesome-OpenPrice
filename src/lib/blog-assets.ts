import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Client } from '@notionhq/client';
import { createHash } from 'node:crypto';
import { getCloudflareContext } from '@opennextjs/cloudflare';

type NotionFile = {
  type?: string;
  file?: { url?: string };
  external?: { url?: string };
  caption?: unknown[];
};

type NotionBlock = {
  id: string;
  type: string;
  has_children?: boolean;
  image?: NotionFile;
};

type NotionPage = {
  id: string;
  cover?: NotionFile | null;
  properties?: {
    slug?: { rich_text?: Array<{ plain_text?: string }> };
  };
};

export type BlogAssetSyncResult = {
  pages: number;
  uploaded: number;
  skipped: number;
  failed: number;
  errors: string[];
};

const notionApiKey = process.env.NOTION_API_KEY || '';
const databaseId = process.env.NOTION_BLOG_DATABASE_ID || '';
const r2AccountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID || '';
const r2AccessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '';
const r2SecretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '';
const r2Bucket = process.env.CLOUDFLARE_R2_BUCKET || '';
const r2PublicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL?.replace(/\/$/, '') || '';

type ImageTransformOptions = {
  width?: number;
  height?: number;
  fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad';
};

type ImagesBinding = {
  input(source: ReadableStream<Uint8Array>): {
    transform(options: ImageTransformOptions): {
      output(options: { format: 'image/webp'; quality: number; anim: false }): Promise<{
        response(): Response;
      }>;
    };
  };
};

function assertConfiguration() {
  const missing = [
    ['NOTION_API_KEY', notionApiKey],
    ['NOTION_BLOG_DATABASE_ID', databaseId],
    ['CLOUDFLARE_R2_ACCOUNT_ID', r2AccountId],
    ['CLOUDFLARE_R2_ACCESS_KEY_ID', r2AccessKeyId],
    ['CLOUDFLARE_R2_SECRET_ACCESS_KEY', r2SecretAccessKey],
    ['CLOUDFLARE_R2_BUCKET', r2Bucket],
    ['CLOUDFLARE_R2_PUBLIC_URL', r2PublicUrl],
  ].filter(([, value]) => !value).map(([name]) => name);

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

function sourceUrl(file?: NotionFile | null) {
  if (!file) return null;
  return file.type === 'file' ? file.file?.url : file.external?.url || null;
}

function isOptimizedR2Url(url: string) {
  return url.startsWith(`${r2PublicUrl}/`) && url.includes('/optimized-') && url.endsWith('.webp');
}

function createR2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: r2AccessKeyId, secretAccessKey: r2SecretAccessKey },
  });
}

async function uploadImage(
  client: S3Client,
  images: ImagesBinding,
  source: string,
  keyPrefix: string,
  createThumbnail: boolean,
) {
  const response = await fetch(source, { cache: 'no-store' });
  if (!response.ok) throw new Error(`source returned HTTP ${response.status}`);

  const contentType = response.headers.get('content-type')?.split(';')[0] || 'image/jpeg';
  if (!contentType.startsWith('image/')) throw new Error(`source is not an image (${contentType})`);

  const sourceBytes = await response.arrayBuffer();
  // The digest makes URLs immutable: replacing an image never leaves a CDN cache serving the old bytes.
  const digest = createHash('sha256').update(Buffer.from(sourceBytes)).digest('hex').slice(0, 16);

  const transform = async (options: ImageTransformOptions, quality: number) => {
    const sourceStream = new Blob([sourceBytes]).stream();
    const result = await images
      .input(sourceStream)
      .transform(options)
      .output({ format: 'image/webp', quality, anim: false });
    const transformed = result.response();
    if (!transformed.ok) {
      throw new Error(`image transformation returned HTTP ${transformed.status}`);
    }
    return Buffer.from(await transformed.arrayBuffer());
  };

  const variants = [
    {
      key: `${keyPrefix}/optimized-${digest}.webp`,
      body: await transform({ width: 1600, fit: 'scale-down' }, 82),
    },
  ];
  if (createThumbnail) {
    variants.push({
      key: `${keyPrefix}/thumbnail-${digest}.webp`,
      body: await transform({ width: 640, height: 480, fit: 'cover' }, 75),
    });
  }

  await Promise.all(variants.map(variant => client.send(new PutObjectCommand({
    Bucket: r2Bucket,
    Key: variant.key,
    Body: variant.body,
    ContentType: 'image/webp',
    CacheControl: 'public, max-age=31536000, immutable',
  }))));

  return `${r2PublicUrl}/${variants[0].key}`;
}

async function listChildren(notion: Client, blockId: string): Promise<NotionBlock[]> {
  const blocks: NotionBlock[] = [];
  let startCursor: string | undefined;

  do {
    const response = await notion.blocks.children.list({ block_id: blockId, start_cursor: startCursor, page_size: 100 });
    blocks.push(...(response.results as NotionBlock[]));
    startCursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (startCursor);

  return blocks;
}

async function listPublishedPages(notion: Client) {
  const pages: NotionPage[] = [];
  let startCursor: string | undefined;

  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: { property: 'published', checkbox: { equals: true } },
      start_cursor: startCursor,
      page_size: 100,
    });
    pages.push(...(response.results as NotionPage[]));
    startCursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (startCursor);

  return pages;
}

async function syncPageAssets(notion: Client, r2: S3Client, page: NotionPage, result: BlogAssetSyncResult) {
  const context = getCloudflareContext();
  const images = (context.env as unknown as { IMAGES?: ImagesBinding }).IMAGES;
  if (!images) throw new Error('Missing required Cloudflare Images binding: IMAGES');

  const syncImage = async (
    source: string | null,
    keyPrefix: string,
    update: (url: string) => Promise<unknown>,
    createThumbnail = false,
  ) => {
    if (!source || isOptimizedR2Url(source)) {
      result.skipped += 1;
      return;
    }

    try {
      const url = await uploadImage(r2, images, source, keyPrefix, createThumbnail);
      await update(url);
      result.uploaded += 1;
    } catch (error) {
      result.failed += 1;
      result.errors.push(`${keyPrefix}: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  };

  await syncImage(sourceUrl(page.cover), `blog/${page.id}/cover`, (url) =>
    notion.pages.update({ page_id: page.id, cover: { type: 'external', external: { url } } }), true,
  );

  const visit = async (parentId: string): Promise<void> => {
    const blocks = await listChildren(notion, parentId);
    for (const block of blocks) {
      if (block.type === 'image') {
        await syncImage(sourceUrl(block.image), `blog/${page.id}/${block.id}`, (url) =>
          notion.blocks.update({
            block_id: block.id,
            // Notion returns a richer caption response shape than its update request type.
            image: { external: { url }, caption: (block.image?.caption || []) as any },
          }),
        );
      }
      if (block.has_children) await visit(block.id);
    }
  };

  await visit(page.id);
}

/** Copies published Notion blog images to R2 and changes their Notion references to stable public URLs. */
export async function syncPublishedBlogAssets(slug?: string): Promise<BlogAssetSyncResult> {
  assertConfiguration();

  const notion = new Client({ auth: notionApiKey });
  const r2 = createR2Client();
  const pages = await listPublishedPages(notion);
  const filteredPages = slug
    ? pages.filter((page) => page.properties?.slug?.rich_text?.[0]?.plain_text === slug)
    : pages;

  if (slug && !filteredPages.length) throw new Error(`No published post found for slug "${slug}"`);

  const result: BlogAssetSyncResult = { pages: filteredPages.length, uploaded: 0, skipped: 0, failed: 0, errors: [] };
  for (const page of filteredPages) await syncPageAssets(notion, r2, page, result);
  return result;
}
