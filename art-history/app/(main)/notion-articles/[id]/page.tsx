import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/layout/PageHeader';

interface ArticleDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: article } = await supabase
    .from('notion_articles')
    .select('*')
    .eq('id', id)
    .single();

  if (!article) notFound();

  return (
    <div className="max-w-3xl">
      <PageHeader title={article.title} />

      {article.cover_url && (
        <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-xl">
          <Image src={article.cover_url} alt={article.title} fill className="object-cover" />
        </div>
      )}

      {article.tags && article.tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1">
          {article.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <p className="mb-4 text-xs text-gray-400">
          Synced from Notion · {new Date(article.synced_at).toLocaleString()}
        </p>
        {article.content ? (
          <article className="prose prose-sm max-w-none whitespace-pre-line text-gray-700">
            {article.content}
          </article>
        ) : (
          <p className="text-sm text-gray-400">No content available.</p>
        )}
      </div>
    </div>
  );
}
