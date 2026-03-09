import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/layout/PageHeader';
import ArtistFormWrapper from '../../new/ArtistFormWrapper';
import type { Tag } from '@/types';

interface EditArtistPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArtistPage({ params }: EditArtistPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: artist }, { data: artistTags }, { data: periods }, { data: tags }] =
    await Promise.all([
      supabase.from('artists').select('*').eq('id', id).single(),
      supabase.from('artist_tags').select('tag_id').eq('artist_id', id),
      supabase.from('periods').select('*').order('name'),
      supabase.from('tags').select('*').order('name'),
    ]);

  if (!artist) notFound();

  const selectedTagIds = (artistTags ?? []).map((at) => at.tag_id);

  return (
    <div>
      <PageHeader title={`Edit: ${artist.name}`} />
      <ArtistFormWrapper
        periods={periods ?? []}
        tags={(tags ?? []) as Tag[]}
        artist={artist}
        selectedTagIds={selectedTagIds}
      />
    </div>
  );
}
