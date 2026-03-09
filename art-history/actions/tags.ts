'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { TagInput } from '@/types';

export async function createTag(input: TagInput) {
  const supabase = await createClient();
  const { error } = await supabase.from('tags').insert({
    name: input.name,
    color: input.color ?? '#6366f1',
  });
  if (error) throw new Error(error.message);

  revalidatePath('/tags');
  redirect('/tags');
}

export async function updateTag(id: string, input: TagInput) {
  const supabase = await createClient();
  const { error } = await supabase.from('tags').update({
    name: input.name,
    color: input.color ?? '#6366f1',
  }).eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/tags');
  redirect('/tags');
}

export async function deleteTag(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('tags').delete().eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/tags');
  redirect('/tags');
}
