import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchNotionDatabase, fetchPageContent, richTextToPlainText } from '@/lib/notion';
import type { Database } from '@/types/database';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

/** POST /api/notion-sync
 *  Syncs all pages from the configured Notion database into notion_articles.
 *  Uses the service-role key so it can bypass RLS.
 */
export async function POST(request: Request) {
  // Simple secret-header guard so the endpoint is not publicly callable
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const databaseId = process.env.NOTION_ARTICLES_DATABASE_ID;
  if (!databaseId) {
    return NextResponse.json({ error: 'NOTION_ARTICLES_DATABASE_ID not set' }, { status: 500 });
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const pages = await fetchNotionDatabase(databaseId);
  const synced: string[] = [];
  const errors: string[] = [];

  for (const page of pages) {
    try {
      const title = extractTitle(page);
      const content = await fetchPageContent(page.id);
      const coverUrl = extractCoverUrl(page);
      const tags = extractTags(page);

      await supabase.from('notion_articles').upsert(
        {
          notion_page_id: page.id,
          title,
          content,
          cover_url: coverUrl,
          tags,
          synced_at: new Date().toISOString(),
        },
        { onConflict: 'notion_page_id' },
      );

      synced.push(page.id);
    } catch (err) {
      errors.push(`${page.id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return NextResponse.json({ synced: synced.length, errors });
}

function extractTitle(page: PageObjectResponse): string {
  const titleProp = Object.values(page.properties).find((p) => p.type === 'title');
  if (titleProp && titleProp.type === 'title') {
    return richTextToPlainText(titleProp.title) || 'Untitled';
  }
  return 'Untitled';
}

function extractCoverUrl(page: PageObjectResponse): string | null {
  if (!page.cover) return null;
  if (page.cover.type === 'external') return page.cover.external.url;
  if (page.cover.type === 'file') return page.cover.file.url;
  return null;
}

function extractTags(page: PageObjectResponse): string[] {
  const multiSelectProp = Object.values(page.properties).find((p) => p.type === 'multi_select');
  if (multiSelectProp && multiSelectProp.type === 'multi_select') {
    return multiSelectProp.multi_select.map((t) => t.name);
  }
  return [];
}
