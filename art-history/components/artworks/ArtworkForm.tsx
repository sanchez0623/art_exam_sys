'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/ui/ImageUpload';
import TagBadge from '@/components/ui/TagBadge';
import type { Period, Tag, Artist, Artwork } from '@/types';

interface ArtworkFormProps {
  periods: Period[];
  tags: Tag[];
  artists: Artist[];
  artwork?: Artwork;
  selectedTagIds?: string[];
  onSubmit: (formData: FormData) => Promise<void>;
}

export default function ArtworkForm({
  periods,
  tags,
  artists,
  artwork,
  selectedTagIds = [],
  onSubmit,
}: ArtworkFormProps) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState(artwork?.image_url ?? '');
  const [chosenTags, setChosenTags] = useState<string[]>(selectedTagIds);
  const [saving, setSaving] = useState(false);

  function toggleTag(id: string) {
    setChosenTags((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    fd.set('image_url', imageUrl);
    chosenTags.forEach((id) => fd.append('tag_ids', id));
    await onSubmit(fd);
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Title *</label>
          <input name="title" defaultValue={artwork?.title} required className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Artist</label>
          <select name="artist_id" defaultValue={artwork?.artist_id ?? ''} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none">
            <option value="">— none —</option>
            {artists.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Year</label>
          <input name="year" type="number" defaultValue={artwork?.year ?? ''} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Medium</label>
          <input name="medium" defaultValue={artwork?.medium ?? ''} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Dimensions</label>
          <input name="dimensions" defaultValue={artwork?.dimensions ?? ''} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Period</label>
          <select name="period_id" defaultValue={artwork?.period_id ?? ''} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none">
            <option value="">— none —</option>
            {periods.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea name="description" rows={4} defaultValue={artwork?.description ?? ''} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Image</label>
          <ImageUpload currentUrl={imageUrl} onUpload={setImageUrl} />
        </div>

        {tags.length > 0 && (
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Tags</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)} className={`rounded-full px-3 py-1 text-xs font-medium transition ${chosenTags.includes(tag.id) ? 'ring-2 ring-primary-500 ring-offset-1' : 'opacity-60'}`}>
                  <TagBadge name={tag.name} color={tag.color} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50">
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={() => router.back()} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200">
          Cancel
        </button>
      </div>
    </form>
  );
}
