'use client';

import {
  DIMENSIONS,
  getPosition,
  type DimId,
  type Selection,
} from '@/lib/designSpace';

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Story template (fragments spliced in D1→D9 order, unchosen slots skipped):
// "Your pet returns as {D1}, {D2}. {D3 cap}. {D4 cap}; {D5}, and {D6}.
//  It is {D7}. {D8 cap} — {D9}."
export function assembleStory(selection: Selection): string {
  const frag = (d: DimId) => getPosition(selection, d)?.story;
  const sentences: string[] = [];

  const d1 = frag('D1');
  const d2 = frag('D2');
  if (d1 || d2) {
    sentences.push(`Your pet returns as ${[d1, d2].filter(Boolean).join(', ')}.`);
  }

  const d3 = frag('D3');
  if (d3) sentences.push(`${cap(d3)}.`);

  const d4 = frag('D4');
  const d5 = frag('D5');
  const d6 = frag('D6');
  const rest = [d5, d6].filter(Boolean).join(', and ');
  if (d4 && rest) sentences.push(`${cap(d4)}; ${rest}.`);
  else if (d4) sentences.push(`${cap(d4)}.`);
  else if (rest) sentences.push(`${cap(rest)}.`);

  const d7 = frag('D7');
  if (d7) sentences.push(`It is ${d7}.`);

  const d8 = frag('D8');
  const d9 = frag('D9');
  if (d8 && d9) sentences.push(`${cap(d8)} — ${d9}.`);
  else if (d8) sentences.push(`${cap(d8)}.`);
  else if (d9) sentences.push(`${cap(d9)}.`);

  return sentences.join(' ');
}

export default function StoryCard({ selection }: { selection: Selection }) {
  const story = assembleStory(selection);
  const coords = DIMENSIONS.map((d) => selection[d.id])
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-black/10 bg-white px-6 py-5 text-center">
      {story ? (
        <>
          <p className="font-serif text-base md:text-lg leading-relaxed text-ink">{story}</p>
          <p className="mt-3 font-mono text-[11px] tracking-wide text-ink/45">{coords}</p>
        </>
      ) : (
        <p className="text-base text-ink/55 italic">
          Tap any dimension to begin building a pet.
        </p>
      )}
    </div>
  );
}
