import Image from 'next/image';
import Link from 'next/link';
import type { ArtworkWithRelations } from '@/types';
import TagBadge from '@/components/ui/TagBadge';

interface ArtworkCardProps {
  artwork: ArtworkWithRelations;
}

export default function ArtworkCard({ artwork }: ArtworkCardProps) {
  return (
    <Link
      href={`/artworks/${artwork.id}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200 transition hover:shadow-md"
    >
      <div className="relative aspect-video w-full bg-gray-100">
        {artwork.image_url ? (
          <Image
            src={artwork.image_url}
            alt={artwork.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl text-gray-300">🖼️</div>
        )}
      </div>
      <div className="flex flex-col gap-2 p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-primary-700">{artwork.title}</h3>
        {artwork.artists && (
          <p className="text-sm text-gray-600">{artwork.artists.name}</p>
        )}
        <div className="flex flex-wrap gap-1">
          {artwork.year && <span className="text-xs text-gray-400">{artwork.year}</span>}
          {artwork.medium && <span className="text-xs text-gray-400">· {artwork.medium}</span>}
        </div>
        {artwork.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {artwork.tags.map((tag) => (
              <TagBadge key={tag.id} name={tag.name} color={tag.color} />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
