import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/layout/PageHeader';
import { deleteNote, updateNote } from '@/actions/notes';

interface NoteDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function NoteDetailPage({ params }: NoteDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: note } = await supabase.from('notes').select('*').eq('id', id).single();

  if (!note) notFound();

  return (
    <div>
      <PageHeader title={note.title} />

      <form
        action={async (formData: FormData) => {
          'use server';
          await updateNote(id, {
            title: formData.get('title') as string,
            content: (formData.get('content') as string) || null,
          });
        }}
        className="max-w-2xl space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700">Title *</label>
          <input
            name="title"
            defaultValue={note.title}
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Content</label>
          <textarea
            name="content"
            rows={12}
            defaultValue={note.content ?? ''}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
          >
            Save changes
          </button>
          <form
            action={async () => {
              'use server';
              await deleteNote(id);
            }}
          >
            <button
              type="submit"
              className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
            >
              Delete
            </button>
          </form>
        </div>
      </form>

      <p className="mt-4 text-xs text-gray-400">
        Last updated: {new Date(note.updated_at).toLocaleString()}
      </p>
    </div>
  );
}
