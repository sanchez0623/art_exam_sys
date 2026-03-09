import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/layout/PageHeader';
import ArtworkCard from '@/components/artworks/ArtworkCard';
import EmptyState from '@/components/ui/EmptyState';
import type { ArtworkWithRelations } from '@/types';

interface ArtworksPageProps {
  searchParams: Promise<{ q?: string; artist?: string; period?: string; tag?: string }>;
}

export default async function ArtworksPage({ searchParams }: ArtworksPageProps) {
  const { q, artist, period, tag } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('artworks')
    .select('*, artists(id, name), periods(id, name), artwork_tags(tags(*))')
    .order('title');

  if (q) query = query.ilike('title', `%${q}%`);
  if (artist) query = query.eq('artist_id', artist);
  if (period) query = query.eq('period_id', period);

  const { data: rawArtworks } = await query;

  const artworks: ArtworkWithRelations[] = (rawArtworks ?? []).map((aw) => ({
    ...aw,
    artists: aw.artists as ArtworkWithRelations['artists'],
    periods: aw.periods as ArtworkWithRelations['periods'],
    tags: ((aw.artwork_tags ?? []) as { tags: unknown }[]).map((at) => at.tags).filter(Boolean) as ArtworkWithRelations['tags'],
  }));

  const [{ data: artists }, { data: periods }, { data: tags }] = await Promise.all([
    supabase.from('artists').select('id, name').order('name'),
    supabase.from('periods').select('id, name').order('name'),
    supabase.from('tags').select('id, name').order('name'),
  ]);

  // If filtering by tag, post-filter
  const filtered = tag
    ? artworks.filter((aw) => aw.tags.some((t) => t.id === tag))
    : artworks;

  return (
    <div>
      <PageHeader title="Artworks" actionLabel="+ Add artwork" actionHref="/artworks/new" />

      <form method="GET" className="mb-6 flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search artworks…"
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none"
        />
        <select name="artist" defaultValue={artist} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none">
          <option value="">All artists</option>
          {(artists ?? []).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <select name="period" defaultValue={period} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none">
          <option value="">All periods</option>
          {(periods ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select name="tag" defaultValue={tag} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none">
          <option value="">All tags</option>
          {(tags ?? []).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <button type="submit" className="rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700">
          Filter
        </button>
      </form>

      {filtered.length === 0 ? (
        <EmptyState message="No artworks found." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((artwork) => (
            <ArtworkCard key={artwork.id} artwork={artwork} />
          ))}
        </div>
      )}
    </div>
  );
}
