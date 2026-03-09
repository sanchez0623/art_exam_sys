'use client';

import ArtistForm from '@/components/artists/ArtistForm';
import { createArtist } from '@/actions/artists';
import type { Period, Tag, Artist } from '@/types';

interface ArtistFormWrapperProps {
  periods: Period[];
  tags: Tag[];
  artist?: Artist;
  selectedTagIds?: string[];
}

export default function ArtistFormWrapper({
  periods,
  tags,
  artist,
  selectedTagIds,
}: ArtistFormWrapperProps) {
  async function handleSubmit(formData: FormData) {
    const input = {
      name: formData.get('name') as string,
      birth_year: formData.get('birth_year') ? Number(formData.get('birth_year')) : null,
      death_year: formData.get('death_year') ? Number(formData.get('death_year')) : null,
      nationality: (formData.get('nationality') as string) || null,
      bio: (formData.get('bio') as string) || null,
      period_id: (formData.get('period_id') as string) || null,
      image_url: (formData.get('image_url') as string) || null,
      tag_ids: formData.getAll('tag_ids') as string[],
    };

    if (artist) {
      const { updateArtist } = await import('@/actions/artists');
      await updateArtist(artist.id, input);
    } else {
      await createArtist(input);
    }
  }

  return (
    <ArtistForm
      periods={periods}
      tags={tags}
      artist={artist}
      selectedTagIds={selectedTagIds}
      onSubmit={handleSubmit}
    />
  );
}
