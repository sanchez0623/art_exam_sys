import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/layout/PageHeader';
import ArtworkFormWrapper from './ArtworkFormWrapper';

export default async function NewArtworkPage() {
  const supabase = await createClient();
  const [{ data: periods }, { data: tags }, { data: artists }] = await Promise.all([
    supabase.from('periods').select('*').order('name'),
    supabase.from('tags').select('*').order('name'),
    supabase.from('artists').select('*').order('name'),
  ]);

  return (
    <div>
      <PageHeader title="Add Artwork" />
      <ArtworkFormWrapper periods={periods ?? []} tags={tags ?? []} artists={artists ?? []} />
    </div>
  );
}
