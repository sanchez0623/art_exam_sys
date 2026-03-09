'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

interface SearchBarProps {
  placeholder?: string;
  paramName?: string;
}

export default function SearchBar({ placeholder = 'Search…', paramName = 'q' }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set(paramName, e.target.value);
    } else {
      params.delete(paramName);
    }
    startTransition(() => {
      router.replace(`?${params.toString()}`);
    });
  }

  return (
    <input
      type="search"
      defaultValue={searchParams.get(paramName) ?? ''}
      onChange={handleChange}
      placeholder={placeholder}
      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
    />
  );
}
