'use client';

import { useState } from 'react';

interface ImageUploadProps {
  currentUrl?: string | null;
  onUpload: (url: string) => void;
}

export default function ImageUpload({ currentUrl, onUpload }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const json = await res.json() as { url?: string; error?: string };

    setUploading(false);

    if (!res.ok || json.error) {
      setError(json.error ?? 'Upload failed');
      return;
    }

    if (json.url) onUpload(json.url);
  }

  return (
    <div className="space-y-2">
      {currentUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={currentUrl}
          alt="Current"
          className="h-40 w-40 rounded-lg object-cover ring-1 ring-gray-200"
        />
      )}
      <label className="flex cursor-pointer items-center gap-2 text-sm text-primary-600 hover:text-primary-700">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleChange}
          disabled={uploading}
        />
        {uploading ? 'Uploading…' : currentUrl ? 'Change image' : 'Upload image'}
      </label>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
