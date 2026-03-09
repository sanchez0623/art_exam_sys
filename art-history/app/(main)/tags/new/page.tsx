import PageHeader from '@/components/layout/PageHeader';
import { createTag } from '@/actions/tags';

const PRESET_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

export default function NewTagPage() {
  return (
    <div>
      <PageHeader title="Add Tag" />
      <form
        action={async (formData: FormData) => {
          'use server';
          await createTag({
            name: formData.get('name') as string,
            color: (formData.get('color') as string) || '#6366f1',
          });
        }}
        className="max-w-sm space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700">Name *</label>
          <input
            name="name"
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Color</label>
          <div className="mt-2 flex gap-2">
            {PRESET_COLORS.map((color) => (
              <label key={color} className="cursor-pointer">
                <input type="radio" name="color" value={color} className="sr-only" defaultChecked={color === '#6366f1'} />
                <span
                  className="block h-7 w-7 rounded-full ring-2 ring-offset-2 ring-transparent hover:ring-gray-400"
                  style={{ backgroundColor: color }}
                />
              </label>
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
        >
          Save tag
        </button>
      </form>
    </div>
  );
}
