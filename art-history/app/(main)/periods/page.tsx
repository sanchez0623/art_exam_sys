import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/layout/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { deletePeriod } from '@/actions/periods';

export default async function PeriodsPage() {
  const supabase = await createClient();
  const { data: periods } = await supabase.from('periods').select('*').order('start_year');

  return (
    <div>
      <PageHeader title="Art Periods" actionLabel="+ Add period" actionHref="/periods/new" />

      {!periods || periods.length === 0 ? (
        <EmptyState message="No periods yet. Add your first art period!" />
      ) : (
        <div className="space-y-3">
          {periods.map((period) => (
            <div
              key={period.id}
              className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200"
            >
              <div>
                <h3 className="font-semibold text-gray-900">{period.name}</h3>
                {(period.start_year || period.end_year) && (
                  <p className="text-sm text-gray-500">
                    {period.start_year ?? '?'} – {period.end_year ?? 'present'}
                  </p>
                )}
                {period.description && (
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">{period.description}</p>
                )}
              </div>
              <form
                action={async () => {
                  'use server';
                  await deletePeriod(period.id);
                }}
              >
                <button
                  type="submit"
                  className="rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                >
                  Delete
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
