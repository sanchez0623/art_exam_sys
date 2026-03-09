import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/layout/PageHeader';
import NoteCard from '@/components/notes/NoteCard';
import EmptyState from '@/components/ui/EmptyState';

interface NotesPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function NotesPage({ searchParams }: NotesPageProps) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from('notes').select('*').order('updated_at', { ascending: false });
  if (q) query = query.ilike('title', `%${q}%`);

  const { data: notes } = await query;

  return (
    <div>
      <PageHeader title="Notes" actionLabel="+ New note" actionHref="/notes/new" />

      <form method="GET" className="mb-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search notes…"
          className="w-full max-w-sm rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none"
        />
      </form>

      {!notes || notes.length === 0 ? (
        <EmptyState message="No notes yet. Create your first note!" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}
