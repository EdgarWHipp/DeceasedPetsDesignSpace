// The library: every concept anyone has added, newest first.
//
// It lives in one Supabase table, one row per concept, numbered in the order
// the rows were created — so the number a concept carries never changes, and
// the next one added continues the count. Read straight over PostgREST, which
// keeps a client library out of the bundle.
//
// The URL and the publishable key are meant to be public: they travel to every
// browser that opens the page. Row level security is what actually guards the
// table — anyone may read it, anyone may add a concept, and nobody may set a
// number or change a row that is already there. Set NEXT_PUBLIC_SUPABASE_URL
// and NEXT_PUBLIC_SUPABASE_KEY to point the site at a different project.

import type { Selection } from '@/lib/designSpace';
import seed from '@/lib/surveyGallery.json';

const URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  'https://ggncdkallejrdykduyrn.supabase.co';
const KEY =
  process.env.NEXT_PUBLIC_SUPABASE_KEY ??
  'sb_publishable_rN2PUdCgDmSov6Aajq3hwQ_rO-u1rTP';

const TABLE = `${URL}/rest/v1/library_entries`;
const AUTH = { apikey: KEY, Authorization: `Bearer ${KEY}` };

export interface LibraryEntry {
  n: number; // its place in the library; 1 is the oldest
  codes: Selection;
  text: string;
}

interface Row {
  id: number;
  codes: Selection;
  scenario: string | null;
}

const fromRow = (r: Row): LibraryEntry => ({
  n: r.id,
  codes: r.codes ?? {},
  text: r.scenario ?? '',
});

/** Newest first, so a concept added a moment ago is the first one on the page. */
export async function readLibrary(): Promise<LibraryEntry[]> {
  try {
    const res = await fetch(`${TABLE}?select=id,codes,scenario&order=id.desc`, {
      headers: AUTH,
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`library read failed: ${res.status}`);
    return ((await res.json()) as Row[]).map(fromRow);
  } catch {
    return bundled();
  }
}

/** Adds one concept and returns it, with the number it was given. */
export async function addToLibrary(
  codes: Selection,
  text: string,
): Promise<LibraryEntry> {
  const res = await fetch(TABLE, {
    method: 'POST',
    headers: {
      ...AUTH,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ codes, scenario: text.trim().slice(0, 2000) }),
  });
  if (!res.ok) throw new Error(`library write failed: ${res.status}`);
  const [row] = (await res.json()) as Row[];
  return fromRow(row);
}

/** The concepts this repo ships with. Used only when the table is unreachable,
    so the page still has something to show. */
function bundled(): LibraryEntry[] {
  return (seed as { id: string; codes: Selection; text: string }[])
    .map((e) => ({ n: Number(e.id.replace(/\D/g, '')), codes: e.codes, text: e.text }))
    .sort((a, b) => b.n - a.n);
}
