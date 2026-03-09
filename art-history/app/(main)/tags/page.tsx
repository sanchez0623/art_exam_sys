import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/layout/PageHeader';
import TagBadge from '@/components/ui/TagBadge';
import EmptyState from '@/components/ui/EmptyState';
import { deleteTag } from '@/actions/tags';

export default async function TagsPage() {
  const supabase = await createClient();
  const { data: tags } = await supabase.from('tags').select('*').order('name');

  return (
    <div>
      <PageHeader title="Tags" actionLabel="+ Add tag" actionHref="/tags/new" />

      {!tags || tags.length === 0 ? (
        <EmptyState message="No tags yet." />
      ) : (
        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => (
            <div key={tag.id} className="flex items-center gap-2 rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-200">
              <TagBadge name={tag.name} color={tag.color} />
              <form
                action={async () => {
                  'use server';
                  await deleteTag(tag.id);
                }}
              >
                <button type="submit" className="text-xs text-gray-400 hover:text-red-500">✕</button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
