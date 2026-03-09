import PageHeader from '@/components/layout/PageHeader';
import { createNote } from '@/actions/notes';

export default function NewNotePage() {
  return (
    <div>
      <PageHeader title="New Note" />
      <form
        action={async (formData: FormData) => {
          'use server';
          await createNote({
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
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Content</label>
          <textarea
            name="content"
            rows={12}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
        >
          Save note
        </button>
      </form>
    </div>
  );
}
