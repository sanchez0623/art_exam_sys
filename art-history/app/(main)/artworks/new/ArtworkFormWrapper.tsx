'use client';

import ArtworkForm from '@/components/artworks/ArtworkForm';
import { createArtwork } from '@/actions/artworks';
import type { Period, Tag, Artist, Artwork } from '@/types';

interface ArtworkFormWrapperProps {
  periods: Period[];
  tags: Tag[];
  artists: Artist[];
  artwork?: Artwork;
  selectedTagIds?: string[];
}

export default function ArtworkFormWrapper({
  periods,
  tags,
  artists,
  artwork,
  selectedTagIds,
}: ArtworkFormWrapperProps) {
  async function handleSubmit(formData: FormData) {
    const input = {
      title: formData.get('title') as string,
      artist_id: (formData.get('artist_id') as string) || null,
      year: formData.get('year') ? Number(formData.get('year')) : null,
      medium: (formData.get('medium') as string) || null,
      dimensions: (formData.get('dimensions') as string) || null,
      description: (formData.get('description') as string) || null,
      image_url: (formData.get('image_url') as string) || null,
      period_id: (formData.get('period_id') as string) || null,
      tag_ids: formData.getAll('tag_ids') as string[],
    };

    if (artwork) {
      const { updateArtwork } = await import('@/actions/artworks');
      await updateArtwork(artwork.id, input);
    } else {
      await createArtwork(input);
    }
  }

  return (
    <ArtworkForm
      periods={periods}
      tags={tags}
      artists={artists}
      artwork={artwork}
      selectedTagIds={selectedTagIds}
      onSubmit={handleSubmit}
    />
  );
}
