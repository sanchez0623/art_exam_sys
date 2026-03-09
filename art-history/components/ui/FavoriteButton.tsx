'use client';

import { toggleFavorite } from '@/actions/favorites';
import { useTransition } from 'react';

interface FavoriteButtonProps {
  entityType: string;
  entityId: string;
  isFavorited: boolean;
}

export default function FavoriteButton({ entityType, entityId, isFavorited }: FavoriteButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(() => {
      toggleFavorite(entityType, entityId);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      className="rounded-full p-2 text-xl hover:bg-gray-100 disabled:opacity-50"
    >
      {isFavorited ? '★' : '☆'}
    </button>
  );
}
