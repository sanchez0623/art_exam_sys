import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/layout/PageHeader';
import ArtworkFormWrapper from '../../new/ArtworkFormWrapper';

interface EditArtworkPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArtworkPage({ params }: EditArtworkPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: artwork }, { data: artworkTags }, { data: periods }, { data: tags }, { data: artists }] =
    await Promise.all([
      supabase.from('artworks').select('*').eq('id', id).single(),
      supabase.from('artwork_tags').select('tag_id').eq('artwork_id', id),
      supabase.from('periods').select('*').order('name'),
      supabase.from('tags').select('*').order('name'),
      supabase.from('artists').select('*').order('name'),
    ]);

  if (!artwork) notFound();

  const selectedTagIds = (artworkTags ?? []).map((at) => at.tag_id);

  return (
    <div>
      <PageHeader title={`Edit: ${artwork.title}`} />
      <ArtworkFormWrapper
        periods={periods ?? []}
        tags={tags ?? []}
        artists={artists ?? []}
        artwork={artwork}
        selectedTagIds={selectedTagIds}
      />
    </div>
  );
}
