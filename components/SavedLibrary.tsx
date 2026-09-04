'use client';

// The visitor's own concepts, above the seventy from the survey and rendered
// with the same card, so a concept built here reads exactly like a concept
// built in the study. Read on the client because they live in localStorage.

import { useEffect, useState } from 'react';
import GalleryCard, { type GalleryEntry } from '@/components/GalleryCard';
import { readEntries } from '@/lib/libraryStore';

export default function SavedLibrary() {
  const [entries, setEntries] = useState<GalleryEntry[] | null>(null);

  useEffect(() => {
    setEntries(
      readEntries().map((e) => ({ id: e.id, codes: e.codes, text: e.text })),
    );
  }, []);

  // null while the first client render settles, so the server and client agree
  if (!entries || entries.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-serif text-xl font-semibold text-ink">
          Yours
        </h3>
        <p className="text-xs text-ink/50">
          {entries.length === 1 ? '1 concept' : `${entries.length} concepts`}, in
          this browser only
        </p>
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {entries.map((entry) => (
          <GalleryCard key={entry.id} entry={entry} />
        ))}
      </ul>
    </section>
  );
}
