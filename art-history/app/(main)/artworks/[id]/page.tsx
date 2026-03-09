import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/layout/PageHeader';
import TagBadge from '@/components/ui/TagBadge';
import FavoriteButton from '@/components/ui/FavoriteButton';
import { deleteArtwork } from '@/actions/artworks';
import type { Tag } from '@/types';

interface ArtworkDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ArtworkDetailPage({ params }: ArtworkDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: artwork },
    { data: artworkTags },
    { data: favorite },
    { data: { user } },
  ] = await Promise.all([
    supabase
      .from('artworks')
      .select('*, artists(id, name), periods(id, name)')
      .eq('id', id)
      .single(),
    supabase.from('artwork_tags').select('tags(*)').eq('artwork_id', id),
    supabase
      .from('favorites')
      .select('id')
      .eq('entity_type', 'artwork')
      .eq('entity_id', id)
      .maybeSingle(),
    supabase.auth.getUser(),
  ]);

  if (!artwork) notFound();

  const tags: Tag[] = (artworkTags ?? []).map((at) => at.tags as unknown as Tag).filter(Boolean);
  const isFavorited = Boolean(favorite);

  const artist = artwork.artists as { id: string; name: string } | null;
  const period = artwork.periods as { id: string; name: string } | null;

  return (
    <div>
      <PageHeader title={artwork.title} />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
            <div className="relative aspect-video w-full bg-gray-100">
              {artwork.image_url ? (
                <Image src={artwork.image_url} alt={artwork.title} fill className="object-contain" />
              ) : (
                <div className="flex h-full items-center justify-center text-6xl">🖼️</div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">{artwork.title}</h2>
              {user && (
                <FavoriteButton entityType="artwork" entityId={id} isFavorited={isFavorited} />
              )}
            </div>

            <dl className="space-y-2 text-sm">
              {artist && (
                <div>
                  <dt className="text-xs text-gray-500">Artist</dt>
                  <dd>
                    <Link href={`/artists/${artist.id}`} className="text-primary-600 hover:underline">
                      {artist.name}
                    </Link>
                  </dd>
                </div>
              )}
              {artwork.year && (
                <div>
                  <dt className="text-xs text-gray-500">Year</dt>
                  <dd className="text-gray-900">{artwork.year}</dd>
                </div>
              )}
              {artwork.medium && (
                <div>
                  <dt className="text-xs text-gray-500">Medium</dt>
                  <dd className="text-gray-900">{artwork.medium}</dd>
                </div>
              )}
              {artwork.dimensions && (
                <div>
                  <dt className="text-xs text-gray-500">Dimensions</dt>
                  <dd className="text-gray-900">{artwork.dimensions}</dd>
                </div>
              )}
              {period && (
                <div>
                  <dt className="text-xs text-gray-500">Period</dt>
                  <dd className="text-primary-600">{period.name}</dd>
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

          {artwork.description && (
            <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
              <h3 className="mb-2 text-sm font-semibold text-gray-700">Description</h3>
              <p className="whitespace-pre-line text-sm text-gray-600">{artwork.description}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Link
              href={`/artworks/${id}/edit`}
              className="flex-1 rounded-lg bg-gray-100 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Edit
            </Link>
            <form
              action={async () => {
                'use server';
                await deleteArtwork(id);
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
      </div>
    </div>
  );
}
