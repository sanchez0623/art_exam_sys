import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/layout/PageHeader';
import EmptyState from '@/components/ui/EmptyState';

export default async function NotionArticlesPage() {
  const supabase = await createClient();
  const { data: articles } = await supabase
    .from('notion_articles')
    .select('*')
    .order('synced_at', { ascending: false });

  return (
    <div>
      <PageHeader title="Articles" description="Content synced from Notion" />

      {!articles || articles.length === 0 ? (
        <EmptyState message="No articles synced yet. Trigger a Notion sync to import content." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/notion-articles/${article.id}`}
              className="group overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200 transition hover:shadow-md"
            >
              {article.cover_url && (
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image
                    src={article.cover_url}
                    alt={article.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-700">
                  {article.title}
                </h3>
                <p className="mt-1 text-xs text-gray-400">
                  Synced {new Date(article.synced_at).toLocaleDateString()}
                </p>
                {article.tags && article.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {article.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
