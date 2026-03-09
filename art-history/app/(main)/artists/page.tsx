import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/layout/PageHeader';
import ArtistCard from '@/components/artists/ArtistCard';
import EmptyState from '@/components/ui/EmptyState';
import type { ArtistWithPeriod } from '@/types';

interface ArtistsPageProps {
  searchParams: Promise<{ q?: string; period?: string }>;
}

export default async function ArtistsPage({ searchParams }: ArtistsPageProps) {
  const { q, period } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('artists')
    .select('*, periods(*)')
    .order('name');

  if (q) query = query.ilike('name', `%${q}%`);
  if (period) query = query.eq('period_id', period);

  const { data: artists } = await query;

  const { data: periods } = await supabase.from('periods').select('id, name').order('name');

  return (
    <div>
      <PageHeader title="Artists" actionLabel="+ Add artist" actionHref="/artists/new" />

      <div className="mb-6 flex flex-wrap gap-3">
        <form method="GET" className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search artists…"
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none"
          />
          {periods && periods.length > 0 && (
            <select
              name="period"
              defaultValue={period}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none"
            >
              <option value="">All periods</option>
              {periods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
          <button
            type="submit"
            className="rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
          >
            Filter
          </button>
        </form>
      </div>

      {!artists || artists.length === 0 ? (
        <EmptyState message="No artists found. Add your first artist!" />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {(artists as ArtistWithPeriod[]).map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      )}
    </div>
  );
}
