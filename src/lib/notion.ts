import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';

// Dynamic initialization for Cloudflare Workers edge compatibility
function getNotionConfig() {
  const apiKey = process.env.NOTION_API_KEY || '';
  const databaseId = process.env.NOTION_BLOG_DATABASE_ID || '';
  if (!apiKey || !databaseId) return { apiKey, databaseId, notion: null, n2m: null };
  // The SDK defaults to node-fetch, whose node:http implementation is not
  // compatible with the Cloudflare Workers runtime. Use the runtime-native
  // fetch implementation so Notion requests stay on the Workers Fetch API.
  const notion = new Client({ auth: apiKey, fetch });
  const n2m = new NotionToMarkdown({ notionClient: notion });
  return { apiKey, databaseId, notion, n2m };
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  date: string;
  description: string;
  tags: string[];
  cover: string | null;
}

async function fetchPublishedBlogPosts(): Promise<BlogPost[]> {
  const { apiKey, databaseId, notion } = getNotionConfig();
  if (!apiKey || !databaseId || !notion) {
    console.warn('Notion API Key or Database ID is missing. Returning empty blog posts.');
    return [];
  }

  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'published',
        checkbox: {
          equals: true,
        },
      },
      sorts: [
        {
          property: 'date',
          direction: 'descending',
        },
      ],
    });

    return response.results.map((page: any) => {
      return {
        id: page.id,
        title: page.properties.name?.title?.[0]?.plain_text || 'Untitled',
        slug: page.properties.slug?.rich_text?.[0]?.plain_text || page.id,
        date: page.properties.date?.date?.start || page.created_time,
        description: page.properties.description?.rich_text?.[0]?.plain_text || '',
        tags: page.properties.tags?.multi_select?.map((tag: any) => tag.name) || [],
        cover: page.cover?.external?.url || page.cover?.file?.url || null,
      };
    });
  } catch (error) {
    console.error('Error fetching Notion blog posts:', error);
    return [];
  }
}

async function fetchSingleBlogPost(slug: string): Promise<{ post: BlogPost | null, markdown: string }> {
  const { apiKey, databaseId, notion, n2m } = getNotionConfig();
  if (!apiKey || !databaseId || !notion || !n2m) {
    return { post: null, markdown: '' };
  }

  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        and: [
          {
            property: 'slug',
            rich_text: { equals: slug },
          },
          {
            property: 'published',
            checkbox: { equals: true },
          },
        ],
      },
    });

    if (!response.results.length) {
      return { post: null, markdown: '' };
    }

    const page: any = response.results[0];

    const post: BlogPost = {
      id: page.id,
      title: page.properties.name?.title?.[0]?.plain_text || 'Untitled',
      slug: page.properties.slug?.rich_text?.[0]?.plain_text || page.id,
      date: page.properties.date?.date?.start || page.created_time,
      description: page.properties.description?.rich_text?.[0]?.plain_text || '',
      tags: page.properties.tags?.multi_select?.map((tag: any) => tag.name) || [],
      cover: page.cover?.external?.url || page.cover?.file?.url || null,
    };

    const mdblocks = await n2m.pageToMarkdown(page.id);
    const mdString = n2m.toMarkdownString(mdblocks);

    return { post, markdown: mdString.parent || '' };
  } catch (error) {
    console.error(`Error fetching Notion post ${slug}:`, error);
    return { post: null, markdown: '' };
  }
}

const getCachedPublishedBlogPosts = unstable_cache(
  fetchPublishedBlogPosts,
  ['published-blog-posts'],
  { revalidate: 86400, tags: ['blog-list'] },
);

const getCachedSingleBlogPost = unstable_cache(
  fetchSingleBlogPost,
  ['single-blog-post'],
  { revalidate: 86400, tags: ['blog-posts'] },
);

export const getPublishedBlogPosts = cache(getCachedPublishedBlogPosts);
export const getSingleBlogPost = cache(getCachedSingleBlogPost);
