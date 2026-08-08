import { readFileSync, writeFileSync } from 'node:fs';

const SRC = 'public/design_space_visual_examples.svg';
const OUT = 'lib/figureExamples.ts';

const svg = readFileSync(SRC, 'utf8');

// Ordered position ids, matching DIMENSIONS order in lib/designSpace.ts.
const ORDER = [
  'D1-P1', 'D1-P2', 'D1-P3',
  'D2-P1', 'D2-P2', 'D2-P3',
  'D3-P1', 'D3-P2', 'D3-P3',
  'D4-P1', 'D4-P2',
  'D5-P1', 'D5-P2', 'D5-P3',
  'D6-P1', 'D6-P2',
  'D7-P1', 'D7-P2',
  'D8-P1', 'D8-P2', 'D8-P3', 'D8-P4',
  'D9-P1', 'D9-P2', 'D9-P3',
];

// Each per-position illustration is a self-contained inner <svg viewBox="0 0 420 300">…</svg>
// (no nested <svg>), so a non-greedy match to the first </svg> is exact.
const re = /<svg\b[^>]*viewBox="0 0 420 300"[^>]*>([\s\S]*?)<\/svg>/g;
const inners = [];
let m;
while ((m = re.exec(svg)) !== null) {
  // Drop the empty visual-hint placeholder groups; keep everything else verbatim.
  const cleaned = m[1].replace(/<g data-role="visual-hint"><\/g>/g, '').trim();
  inners.push(cleaned);
}

if (inners.length !== ORDER.length) {
  throw new Error(`expected ${ORDER.length} illustrations, found ${inners.length}`);
}

const entries = ORDER.map((id, i) => `  ${JSON.stringify(id)}: ${JSON.stringify(inners[i])},`).join('\n');

const out = `// AUTO-GENERATED from public/design_space_visual_examples.svg — do not edit by hand.
// One per-position illustration from the thesis "Design Space" figure, verbatim.
// Each value is the inner markup of an SVG drawn on a 0 0 420 300 canvas; render
// inside <svg viewBox={FIGURE_EXAMPLE_VIEWBOX}> via dangerouslySetInnerHTML.
// Regenerate with scripts/extract-figure-examples.mjs.

export const FIGURE_EXAMPLE_VIEWBOX = '0 0 420 300';

export const FIGURE_EXAMPLES: Record<string, string> = {
${entries}
};
`;

writeFileSync(OUT, out);
console.log(`wrote ${OUT} with ${inners.length} illustrations`);
