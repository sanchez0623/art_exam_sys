import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/layout/PageHeader';
import type { SearchResult } from '@/types';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let results: SearchResult[] = [];

  if (q && q.trim().length > 0) {
    const term = `%${q.trim()}%`;

    const [{ data: artists }, { data: artworks }, { data: periods }, { data: notes }, { data: articles }] =
      await Promise.all([
        supabase.from('artists').select('id, name, image_url, nationality').ilike('name', term).limit(5),
        supabase.from('artworks').select('id, title, image_url, year').ilike('title', term).limit(5),
        supabase.from('periods').select('id, name').ilike('name', term).limit(5),
        supabase.from('notes').select('id, title').ilike('title', term).limit(5),
        supabase.from('notion_articles').select('id, title, cover_url').ilike('title', term).limit(5),
      ]);

    results = [
      ...(artists ?? []).map((a) => ({
        id: a.id,
        type: 'artist' as const,
        title: a.name,
        subtitle: a.nationality,
        image_url: a.image_url,
        href: `/artists/${a.id}`,
      })),
      ...(artworks ?? []).map((a) => ({
        id: a.id,
        type: 'artwork' as const,
        title: a.title,
        subtitle: a.year ? String(a.year) : null,
        image_url: a.image_url,
        href: `/artworks/${a.id}`,
      })),
      ...(periods ?? []).map((p) => ({
        id: p.id,
        type: 'period' as const,
        title: p.name,
        href: `/periods`,
      })),
      ...(notes ?? []).map((n) => ({
        id: n.id,
        type: 'note' as const,
        title: n.title,
        href: `/notes/${n.id}`,
      })),
      ...(articles ?? []).map((a) => ({
        id: a.id,
        type: 'notion_article' as const,
        title: a.title,
        image_url: a.cover_url,
        href: `/notion-articles/${a.id}`,
      })),
    ];
  }

  return (
    <div>
      <PageHeader title="Search" />

      <form method="GET" className="mb-6">
        <div className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search artists, artworks, periods, notes…"
            autoFocus
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            Search
          </button>
        </div>
      </form>

      {q && results.length === 0 && (
        <p className="text-sm text-gray-500">No results for &ldquo;{q}&rdquo;.</p>
      )}

      {results.length > 0 && (
        <ul className="space-y-2">
          {results.map((result) => (
            <li key={`${result.type}-${result.id}`}>
              <Link
                href={result.href}
                className="flex items-center gap-4 rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-200 transition hover:shadow-md"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {result.image_url ? (
                    <Image
                      src={result.image_url}
                      alt={result.title}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-2xl">
                      {result.type === 'artist' ? '🎨' : result.type === 'artwork' ? '🖼️' : result.type === 'note' ? '📝' : '📄'}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{result.title}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {result.type.replace('_', ' ')}
                    {result.subtitle ? ` · ${result.subtitle}` : ''}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
