// The visitor's own concepts, kept in their browser.
//
// There is no backend. `postEntry` is a stand-in for the real thing: it has the
// shape of a network call, takes a moment, and can fail, so the button already
// has a pending and an error state to swap a `fetch` into later. Nothing leaves
// the browser, which is also why a visitor's idea can never end up mixed into
// the survey data.

import type { Selection } from '@/lib/designSpace';

export const SAVED_KEY = 'library.saved.v1';
const LIMIT = 24;

export interface SavedEntry {
  id: string;
  codes: Selection;
  text: string;
  at: number;
}

export function readEntries(): SavedEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SAVED_KEY);
    const list = raw ? (JSON.parse(raw) as SavedEntry[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/** Stands in for POST /api/library. Mocked: resolves with the stored entry. */
export async function postEntry(
  codes: Selection,
  text: string,
): Promise<SavedEntry> {
  await new Promise((r) => setTimeout(r, 350));
  const existing = readEntries();
  const entry: SavedEntry = {
    id: `You-${existing.length + 1}`,
    codes,
    text: text.trim(),
    at: Date.now(),
  };
  window.localStorage.setItem(
    SAVED_KEY,
    JSON.stringify([entry, ...existing].slice(0, LIMIT)),
  );
  return entry;
}
