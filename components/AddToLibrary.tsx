'use client';

// Saves the current nine-code pick, plus whatever the visitor wrote, into the
// library everyone sees. The new concept takes the next number and shows up at
// the top of the Library page as its most recent entry.

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DIMENSIONS } from '@/lib/designSpace';
import type { Selection } from '@/lib/designSpace';
import { addToLibrary } from '@/lib/library';

export default function AddToLibrary({
  selection,
  text,
  onSaved,
}: {
  selection: Selection;
  text: string;
  onSaved: () => void;
}) {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'saving' | 'error'>('idle');
  const chosen = Object.keys(selection).length;
  const complete = chosen === DIMENSIONS.length;

  const save = async () => {
    setState('saving');
    try {
      await addToLibrary(selection, text);
      onSaved();
      router.push('/library');
      router.refresh();
    } catch {
      setState('error');
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={save}
        disabled={!complete || state === 'saving'}
        className="rounded-full bg-ink px-5 py-2 text-sm text-paper transition-opacity disabled:cursor-not-allowed disabled:opacity-40 hover:opacity-90"
      >
        {state === 'saving' ? 'Adding…' : 'Add to Library'}
      </button>
      <p className="text-xs text-ink/50">
        {state === 'error'
          ? 'That did not save. Try once more.'
          : complete
            ? 'It joins the library as its most recent entry'
            : `Choose all nine dimensions to add (${chosen} of ${DIMENSIONS.length})`}
      </p>
    </div>
  );
}
