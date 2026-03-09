import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/layout/PageHeader';
import TagBadge from '@/components/ui/TagBadge';
import FavoriteButton from '@/components/ui/FavoriteButton';
import { deleteArtist } from '@/actions/artists';
import type { Tag } from '@/types';

interface ArtistDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ArtistDetailPage({ params }: ArtistDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: artist }, { data: artistTags }, { data: artworksData }, { data: favorite }, { data: { user } }] =
    await Promise.all([
      supabase.from('artists').select('*, periods(*)').eq('id', id).single(),
      supabase.from('artist_tags').select('tags(*)').eq('artist_id', id),
      supabase.from('artworks').select('id, title, image_url, year').eq('artist_id', id).limit(12),
      supabase
        .from('favorites')
        .select('id')
        .eq('entity_type', 'artist')
        .eq('entity_id', id)
        .maybeSingle(),
      supabase.auth.getUser(),
    ]);

  if (!artist) notFound();

  const tags: Tag[] = (artistTags ?? []).map((at) => at.tags as unknown as Tag).filter(Boolean);
  const isFavorited = Boolean(favorite);

  return (
    <div>
      <PageHeader title={artist.name} />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
            <div className="relative aspect-square w-full bg-gray-100">
              {artist.image_url ? (
                <Image src={artist.image_url} alt={artist.name} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-6xl">🎨</div>
              )}
            </div>
            <div className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">{artist.name}</h2>
                {user && (
                  <FavoriteButton entityType="artist" entityId={id} isFavorited={isFavorited} />
                )}
              </div>
              <dl className="space-y-1 text-sm">
                {artist.nationality && (
                  <div className="flex gap-2">
                    <dt className="text-gray-500">Nationality</dt>
                    <dd className="text-gray-900">{artist.nationality}</dd>
                  </div>
                )}
                {artist.birth_year && (
                  <div className="flex gap-2">
                    <dt className="text-gray-500">Born</dt>
                    <dd className="text-gray-900">
                      {artist.birth_year}
                      {artist.death_year ? ` – ${artist.death_year}` : ''}
                    </dd>
                  </div>
                )}
                {(artist as { periods?: { name: string } | null }).periods && (
                  <div className="flex gap-2">
                    <dt className="text-gray-500">Period</dt>
                    <dd className="text-primary-700">
                      {(artist as { periods?: { name: string } | null }).periods!.name}
                    </dd>
                  </div>
                )}
              </dl>
              {tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {tags.map((tag) => (
                    <TagBadge key={tag.id} name={tag.name} color={tag.color} />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Link
              href={`/artists/${id}/edit`}
              className="flex-1 rounded-lg bg-gray-100 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Edit
            </Link>
            <form
              action={async () => {
                'use server';
                await deleteArtist(id);
              }}
            >
              <button
                type="submit"
                className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
              >
                Delete
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          {artist.bio && (
            <div className="mb-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <h3 className="mb-2 font-semibold text-gray-900">Biography</h3>
              <p className="whitespace-pre-line text-sm text-gray-700">{artist.bio}</p>
            </div>
          )}

          {artworksData && artworksData.length > 0 && (
            <div>
              <h3 className="mb-3 font-semibold text-gray-900">Artworks</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {artworksData.map((aw) => (
                  <Link
                    key={aw.id}
                    href={`/artworks/${aw.id}`}
                    className="group overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200 hover:shadow-md"
                  >
                    <div className="relative aspect-video w-full bg-gray-100">
                      {aw.image_url ? (
                        <Image
                          src={aw.image_url}
                          alt={aw.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-3xl">🖼️</div>
                      )}
                    </div>
                    <p className="p-2 text-xs font-medium text-gray-700 group-hover:text-primary-700">
                      {aw.title}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
