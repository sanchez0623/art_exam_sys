'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { NoteInput } from '@/types';

export async function createNote(input: NoteInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: note, error } = await supabase
    .from('notes')
    .insert({
      user_id: user.id,
      title: input.title,
      content: input.content ?? null,
      entity_type: input.entity_type ?? null,
      entity_id: input.entity_id ?? null,
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/notes');
  redirect(`/notes/${note.id}`);
}

export async function updateNote(id: string, input: NoteInput) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('notes')
    .update({
      title: input.title,
      content: input.content ?? null,
      entity_type: input.entity_type ?? null,
      entity_id: input.entity_id ?? null,
    })
    .eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath('/notes');
  revalidatePath(`/notes/${id}`);
  redirect(`/notes/${id}`);
}

export async function deleteNote(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('notes').delete().eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/notes');
  redirect('/notes');
}
