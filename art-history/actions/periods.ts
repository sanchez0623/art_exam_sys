'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { PeriodInput } from '@/types';

export async function createPeriod(input: PeriodInput) {
  const supabase = await createClient();
  const { error } = await supabase.from('periods').insert({
    name: input.name,
    start_year: input.start_year ?? null,
    end_year: input.end_year ?? null,
    description: input.description ?? null,
  });

  if (error) throw new Error(error.message);

  revalidatePath('/periods');
  redirect('/periods');
}

export async function updatePeriod(id: string, input: PeriodInput) {
  const supabase = await createClient();
  const { error } = await supabase.from('periods').update({
    name: input.name,
    start_year: input.start_year ?? null,
    end_year: input.end_year ?? null,
    description: input.description ?? null,
  }).eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath('/periods');
  redirect('/periods');
}

export async function deletePeriod(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('periods').delete().eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/periods');
  redirect('/periods');
}
