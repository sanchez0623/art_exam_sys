import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/layout/PageHeader';
import EmptyState from '@/components/ui/EmptyState';

export default async function FavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <EmptyState message="Please sign in to view favorites." />;

  const { data: favorites } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (!favorites || favorites.length === 0) {
    return (
      <div>
        <PageHeader title="Favorites" />
        <EmptyState message="No favorites yet. Star artists or artworks to save them here." />
      </div>
    );
  }

  // Resolve entities in parallel
  const artistIds = favorites.filter((f) => f.entity_type === 'artist').map((f) => f.entity_id);
  const artworkIds = favorites.filter((f) => f.entity_type === 'artwork').map((f) => f.entity_id);

  const [{ data: artists }, { data: artworks }] = await Promise.all([
    artistIds.length > 0
      ? supabase.from('artists').select('id, name, image_url').in('id', artistIds)
      : Promise.resolve({ data: [] }),
    artworkIds.length > 0
      ? supabase.from('artworks').select('id, title, image_url').in('id', artworkIds)
      : Promise.resolve({ data: [] }),
  ]);

  const artistMap = Object.fromEntries((artists ?? []).map((a) => [a.id, a]));
  const artworkMap = Object.fromEntries((artworks ?? []).map((a) => [a.id, a]));

  return (
    <div>
      <PageHeader title="Favorites" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {favorites.map((fav) => {
          const entity =
            fav.entity_type === 'artist' ? artistMap[fav.entity_id] : artworkMap[fav.entity_id];
          if (!entity) return null;

          const href = `/${fav.entity_type}s/${fav.entity_id}`;
          const label = 'name' in entity ? entity.name : (entity as { title: string }).title;

          return (
            <Link
              key={fav.id}
              href={href}
              className="group overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200 transition hover:shadow-md"
            >
              <div className="relative aspect-square w-full bg-gray-100">
                {entity.image_url ? (
                  <Image
                    src={entity.image_url}
                    alt={label}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-4xl">
                    {fav.entity_type === 'artist' ? '🎨' : '🖼️'}
                  </div>
                )}
              </div>
              <p className="p-3 text-sm font-medium text-gray-900 group-hover:text-primary-700 line-clamp-1">
                {label}
              </p>
              <p className="px-3 pb-3 text-xs text-gray-400 capitalize">{fav.entity_type}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
