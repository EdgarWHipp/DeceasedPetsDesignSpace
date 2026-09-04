'use client';

// Saves the current nine-code pick to the browser and sends the visitor to the
// Library, where their concept sits at the top of the seventy from the survey.
// Local only: nothing is uploaded, so a visitor's idea never joins the research
// data.

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DIMENSIONS } from '@/lib/designSpace';
import type { Selection } from '@/lib/designSpace';

export const SAVED_KEY = 'library.saved.v1';

export default function AddToLibrary({ selection }: { selection: Selection }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const chosen = Object.keys(selection).length;
  const complete = chosen === DIMENSIONS.length;

  const save = () => {
    try {
      const raw = window.localStorage.getItem(SAVED_KEY);
      const list: { codes: Selection; at: number }[] = raw ? JSON.parse(raw) : [];
      list.unshift({ codes: selection, at: Date.now() });
      window.localStorage.setItem(SAVED_KEY, JSON.stringify(list.slice(0, 24)));
      setSaved(true);
      router.push('/library');
    } catch {
      setSaved(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={save}
        disabled={!complete}
        className="rounded-full bg-ink px-5 py-2 text-sm text-paper transition-opacity disabled:cursor-not-allowed disabled:opacity-40 hover:opacity-90"
      >
        {saved ? 'Added to Library' : 'Add to Library'}
      </button>
      <p className="text-xs text-ink/50">
        {complete
          ? 'Saved in this browser only, and shown beside the seventy from the survey'
          : `Choose all nine dimensions to add (${chosen} of ${DIMENSIONS.length})`}
      </p>
    </div>
  );
}
