'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { ArtistInput } from '@/types';

export async function createArtist(input: ArtistInput) {
  const supabase = await createClient();

  const { data: artist, error } = await supabase
    .from('artists')
    .insert({
      name: input.name,
      birth_year: input.birth_year ?? null,
      death_year: input.death_year ?? null,
      nationality: input.nationality ?? null,
      bio: input.bio ?? null,
      period_id: input.period_id ?? null,
      image_url: input.image_url ?? null,
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);

  if (input.tag_ids && input.tag_ids.length > 0) {
    await supabase
      .from('artist_tags')
      .insert(input.tag_ids.map((tag_id) => ({ artist_id: artist.id, tag_id })));
  }

  revalidatePath('/artists');
  redirect(`/artists/${artist.id}`);
}

export async function updateArtist(id: string, input: ArtistInput) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('artists')
    .update({
      name: input.name,
      birth_year: input.birth_year ?? null,
      death_year: input.death_year ?? null,
      nationality: input.nationality ?? null,
      bio: input.bio ?? null,
      period_id: input.period_id ?? null,
      image_url: input.image_url ?? null,
    })
    .eq('id', id);

  if (error) throw new Error(error.message);

  if (input.tag_ids !== undefined) {
    await supabase.from('artist_tags').delete().eq('artist_id', id);
    if (input.tag_ids.length > 0) {
      await supabase
        .from('artist_tags')
        .insert(input.tag_ids.map((tag_id) => ({ artist_id: id, tag_id })));
    }
  }

  revalidatePath('/artists');
  revalidatePath(`/artists/${id}`);
  redirect(`/artists/${id}`);
}

export async function deleteArtist(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('artists').delete().eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/artists');
  redirect('/artists');
}
