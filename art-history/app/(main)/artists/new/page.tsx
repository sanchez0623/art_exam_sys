import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/layout/PageHeader';
import ArtistFormWrapper from './ArtistFormWrapper';

export default async function NewArtistPage() {
  const supabase = await createClient();
  const [{ data: periods }, { data: tags }] = await Promise.all([
    supabase.from('periods').select('*').order('name'),
    supabase.from('tags').select('*').order('name'),
  ]);

  return (
    <div>
      <PageHeader title="Add Artist" />
      <ArtistFormWrapper periods={periods ?? []} tags={tags ?? []} />
    </div>
  );
}
