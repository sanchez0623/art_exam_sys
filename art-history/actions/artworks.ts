'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { ArtworkInput } from '@/types';

export async function createArtwork(input: ArtworkInput) {
  const supabase = await createClient();

  const { data: artwork, error } = await supabase
    .from('artworks')
    .insert({
      title: input.title,
      artist_id: input.artist_id ?? null,
      year: input.year ?? null,
      medium: input.medium ?? null,
      dimensions: input.dimensions ?? null,
      description: input.description ?? null,
      image_url: input.image_url ?? null,
      period_id: input.period_id ?? null,
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);

  if (input.tag_ids && input.tag_ids.length > 0) {
    await supabase
      .from('artwork_tags')
      .insert(input.tag_ids.map((tag_id) => ({ artwork_id: artwork.id, tag_id })));
  }

  revalidatePath('/artworks');
  redirect(`/artworks/${artwork.id}`);
}

export async function updateArtwork(id: string, input: ArtworkInput) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('artworks')
    .update({
      title: input.title,
      artist_id: input.artist_id ?? null,
      year: input.year ?? null,
      medium: input.medium ?? null,
      dimensions: input.dimensions ?? null,
      description: input.description ?? null,
      image_url: input.image_url ?? null,
      period_id: input.period_id ?? null,
    })
    .eq('id', id);

  if (error) throw new Error(error.message);

  if (input.tag_ids !== undefined) {
    await supabase.from('artwork_tags').delete().eq('artwork_id', id);
    if (input.tag_ids.length > 0) {
      await supabase
        .from('artwork_tags')
        .insert(input.tag_ids.map((tag_id) => ({ artwork_id: id, tag_id })));
    }
  }

  revalidatePath('/artworks');
  revalidatePath(`/artworks/${id}`);
  redirect(`/artworks/${id}`);
}

export async function deleteArtwork(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('artworks').delete().eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/artworks');
  redirect('/artworks');
}
