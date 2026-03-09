import Link from 'next/link';
import { logoutAction } from '@/actions/auth';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/artists', label: 'Artists' },
  { href: '/artworks', label: 'Artworks' },
  { href: '/periods', label: 'Periods' },
  { href: '/tags', label: 'Tags' },
  { href: '/notes', label: 'Notes' },
  { href: '/favorites', label: 'Favorites' },
  { href: '/notion-articles', label: 'Articles' },
  { href: '/search', label: 'Search' },
];

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-56 flex-col border-r border-gray-200 bg-white px-4 py-6">
      <div className="mb-8">
        <Link href="/dashboard" className="text-xl font-bold text-primary-700">
          Art History
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700"
          >
            {label}
          </Link>
        ))}
      </nav>

      <form action={logoutAction} className="mt-4">
        <button
          type="submit"
          className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-100"
        >
          Sign out
        </button>
      </form>
    </aside>
  );
}
