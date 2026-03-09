import Image from 'next/image';
import Link from 'next/link';
import type { ArtistWithPeriod } from '@/types';

interface ArtistCardProps {
  artist: ArtistWithPeriod;
}

export default function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <Link
      href={`/artists/${artist.id}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200 transition hover:shadow-md"
    >
      <div className="relative aspect-square w-full bg-gray-100">
        {artist.image_url ? (
          <Image
            src={artist.image_url}
            alt={artist.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl text-gray-300">🎨</div>
        )}
      </div>
      <div className="flex flex-col gap-1 p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-primary-700">{artist.name}</h3>
        {artist.nationality && (
          <p className="text-xs text-gray-500">{artist.nationality}</p>
        )}
        {artist.birth_year && (
          <p className="text-xs text-gray-400">
            {artist.birth_year}
            {artist.death_year ? ` – ${artist.death_year}` : ''}
          </p>
        )}
        {artist.periods && (
          <p className="text-xs text-primary-600">{artist.periods.name}</p>
        )}
      </div>
    </Link>
  );
}
