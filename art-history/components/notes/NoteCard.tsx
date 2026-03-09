import Link from 'next/link';
import type { Note } from '@/types';

interface NoteCardProps {
  note: Note;
}

export default function NoteCard({ note }: NoteCardProps) {
  return (
    <Link
      href={`/notes/${note.id}`}
      className="group flex flex-col gap-2 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 transition hover:shadow-md"
    >
      <h3 className="font-semibold text-gray-900 group-hover:text-primary-700">{note.title}</h3>
      {note.content && (
        <p className="line-clamp-3 text-sm text-gray-500">{note.content}</p>
      )}
      <p className="text-xs text-gray-400">
        {new Date(note.updated_at).toLocaleDateString()}
      </p>
    </Link>
  );
}
