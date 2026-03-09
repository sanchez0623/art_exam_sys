import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { count: artistCount },
    { count: artworkCount },
    { count: periodCount },
    { count: noteCount },
    { count: articleCount },
  ] = await Promise.all([
    supabase.from('artists').select('*', { count: 'exact', head: true }),
    supabase.from('artworks').select('*', { count: 'exact', head: true }),
    supabase.from('periods').select('*', { count: 'exact', head: true }),
    supabase.from('notes').select('*', { count: 'exact', head: true }),
    supabase.from('notion_articles').select('*', { count: 'exact', head: true }),
  ]);

  const stats = [
    { label: 'Artists', count: artistCount ?? 0, href: '/artists', emoji: '🎨' },
    { label: 'Artworks', count: artworkCount ?? 0, href: '/artworks', emoji: '🖼️' },
    { label: 'Periods', count: periodCount ?? 0, href: '/periods', emoji: '📅' },
    { label: 'Notes', count: noteCount ?? 0, href: '/notes', emoji: '📝' },
    { label: 'Articles', count: articleCount ?? 0, href: '/notion-articles', emoji: '📄' },
  ];

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mb-8 text-sm text-gray-500">Welcome to your personal art history system.</p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map(({ label, count, href, emoji }) => (
          <Link
            key={label}
            href={href}
            className="flex flex-col gap-2 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200 transition hover:shadow-md"
          >
            <span className="text-3xl">{emoji}</span>
            <span className="text-2xl font-bold text-gray-900">{count}</span>
            <span className="text-sm text-gray-500">{label}</span>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="mb-3 font-semibold text-gray-900">Quick actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/artists/new" className="rounded-lg bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700 hover:bg-primary-100">
              + Add artist
            </Link>
            <Link href="/artworks/new" className="rounded-lg bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700 hover:bg-primary-100">
              + Add artwork
            </Link>
            <Link href="/notes/new" className="rounded-lg bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700 hover:bg-primary-100">
              + New note
            </Link>
            <Link href="/search" className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200">
              🔍 Search
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
