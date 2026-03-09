import { Client } from '@notionhq/client';
import type {
  PageObjectResponse,
  RichTextItemResponse,
} from '@notionhq/client/build/src/api-endpoints';

export function createNotionClient() {
  return new Client({ auth: process.env.NOTION_API_KEY });
}

/** Extract plain text from a Notion rich-text array */
export function richTextToPlainText(richText: RichTextItemResponse[]): string {
  return richText.map((t) => t.plain_text).join('');
}

/** Get all pages from a Notion database */
export async function fetchNotionDatabase(databaseId: string): Promise<PageObjectResponse[]> {
  const notion = createNotionClient();
  const pages: PageObjectResponse[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      page_size: 100,
    });

    for (const page of response.results) {
      if (page.object === 'page' && 'properties' in page) {
        pages.push(page as PageObjectResponse);
      }
    }

    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return pages;
}

/** Render page blocks as a simple markdown-like string */
export async function fetchPageContent(pageId: string): Promise<string> {
  const notion = createNotionClient();
  const { results } = await notion.blocks.children.list({ block_id: pageId, page_size: 100 });

  const lines: string[] = [];
  for (const block of results) {
    if (!('type' in block)) continue;

    switch (block.type) {
      case 'paragraph':
        lines.push(richTextToPlainText(block.paragraph.rich_text));
        break;
      case 'heading_1':
        lines.push(`# ${richTextToPlainText(block.heading_1.rich_text)}`);
        break;
      case 'heading_2':
        lines.push(`## ${richTextToPlainText(block.heading_2.rich_text)}`);
        break;
      case 'heading_3':
        lines.push(`### ${richTextToPlainText(block.heading_3.rich_text)}`);
        break;
      case 'bulleted_list_item':
        lines.push(`- ${richTextToPlainText(block.bulleted_list_item.rich_text)}`);
        break;
      case 'numbered_list_item':
        lines.push(`1. ${richTextToPlainText(block.numbered_list_item.rich_text)}`);
        break;
      case 'quote':
        lines.push(`> ${richTextToPlainText(block.quote.rich_text)}`);
        break;
      case 'code':
        lines.push(
          `\`\`\`${block.code.language}\n${richTextToPlainText(block.code.rich_text)}\n\`\`\``,
        );
        break;
    }
  }

  return lines.join('\n\n');
}
