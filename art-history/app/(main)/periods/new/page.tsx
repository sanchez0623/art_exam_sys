import PageHeader from '@/components/layout/PageHeader';
import { createPeriod } from '@/actions/periods';

export default function NewPeriodPage() {
  return (
    <div>
      <PageHeader title="Add Art Period" />
      <form
        action={async (formData: FormData) => {
          'use server';
          await createPeriod({
            name: formData.get('name') as string,
            start_year: formData.get('start_year') ? Number(formData.get('start_year')) : null,
            end_year: formData.get('end_year') ? Number(formData.get('end_year')) : null,
            description: (formData.get('description') as string) || null,
          });
        }}
        className="max-w-lg space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700">Name *</label>
          <input
            name="name"
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start year</label>
            <input
              name="start_year"
              type="number"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End year</label>
            <input
              name="end_year"
              type="number"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            rows={3}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
        >
          Save period
        </button>
      </form>
    </div>
  );
}
