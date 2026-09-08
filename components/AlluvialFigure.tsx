// The library as one picture: a band per concept, carried unbroken across all
// nine dimensions. Drawn from the same rows the cards below it come from, on
// the server, at request time — so adding a pet adds a band, and the counts on
// the nodes are whatever the table holds right now.
//
// Nothing is re-bundled between columns: band i is the same concept in every
// column, so a single one can be followed the whole way across. Each band keeps
// the colour of its Form code, which makes the first column the legend.

import { DIMENSIONS, type DimId } from '@/lib/designSpace';
import type { LibraryEntry } from '@/lib/library';

// Form drives the band colour. Checked for colour-vision separation: the worst
// pair is 19.9 in OKLab dE100 under deuteranopia, protanopia and tritanopia
// alike, against a floor of 8.
const FORM_COLOUR: Record<string, string> = {
  Intangible: '#009682', // KIT green
  Keepsake: '#E2A03F', // amber, the smallest group so the brightest
  Body: '#1B2F5C', // deep navy
  'Not specified': '#9AA5A2',
};
const INK = '#252827';
const MUTED = '#5C6663';
const NOT_SPEC = 'Not specified';

const FONT = 20; // node labels; every other size derives from this
const WRAP = 14; // characters per label line before it breaks
const WIDTH = 1680;
const HEIGHT = 1020;

const PAD = FONT * 2;
const RPAD = FONT * 9.5; // room for the last column's labels
const NODE_W = 12;
const LINE_H = FONT * 1.16;

const DIMS = DIMENSIONS.map((d) => ({
  id: d.id,
  title: d.title,
  labels: d.positions.map((p) => p.label),
  byId: new Map(d.positions.map((p) => [p.id, p.label])),
}));

/** Label lines short enough not to reach the next column; the count rides on
    the last one. Long single words break after their hyphen. */
function wrapLabel(label: string, count: number): string[] {
  const words = label.split(' ').flatMap((w) => {
    const parts = w.split('-');
    return parts.map((p, i) => (i < parts.length - 1 ? `${p}-` : p));
  });
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const joined = line.endsWith('-') ? line + w : `${line} ${w}`.trim();
    if (line && joined.length > WRAP) {
      lines.push(line);
      line = w;
    } else {
      line = joined;
    }
  }
  lines.push(`${line} ${count}`.trim());
  return lines;
}

export default function AlluvialFigure({
  entries,
}: {
  entries: LibraryEntry[];
}) {
  const n = entries.length;
  if (n === 0) return null;

  // Every concept as nine labels, in dimension order.
  const people = entries.map((e) =>
    DIMS.map((d, i) => {
      const code = e.codes[`D${i + 1}` as DimId];
      return (code && d.byId.get(code)) || NOT_SPEC;
    }),
  );

  const rank = DIMS.map((d) => {
    const order = new Map<string, number>();
    [...d.labels, NOT_SPEC].forEach((l, i) => order.set(l, i));
    return order;
  });

  // Column 0 is sorted by the whole nine-code tuple, so concepts that agree on
  // the early dimensions start out adjacent. Every later column keeps the
  // canonical node order and, inside a node, the order of the column before it:
  // one sweep of crossing reduction, so ribbons entering a node never cross.
  const slots: number[][] = [];
  const first = [...Array(n).keys()].sort((a, b) => {
    for (let c = 0; c < 9; c++) {
      const d = (rank[c].get(people[a][c]) ?? 99) - (rank[c].get(people[b][c]) ?? 99);
      if (d) return d;
    }
    return a - b;
  });
  const zero = Array<number>(n);
  first.forEach((p, i) => (zero[p] = i));
  slots.push(zero);

  for (let col = 1; col < 9; col++) {
    const prev = slots[col - 1];
    const here = Array<number>(n);
    const codes = [...new Set(people.map((p) => p[col]))].sort(
      (a, b) => (rank[col].get(a) ?? 99) - (rank[col].get(b) ?? 99),
    );
    let r = 0;
    for (const code of codes) {
      const members = [...Array(n).keys()]
        .filter((p) => people[p][col] === code)
        .sort((a, b) => prev[a] - prev[b]);
      for (const p of members) here[p] = r++;
    }
    slots.push(here);
  }

  const columns = DIMS.map((_, col) => {
    const counts = new Map<string, number>();
    for (const p of people) counts.set(p[col], (counts.get(p[col]) ?? 0) + 1);
    return [...counts.entries()].sort(
      (a, b) => (rank[col].get(a[0]) ?? 99) - (rank[col].get(b[0]) ?? 99),
    );
  });

  // A node's label sits above it, so the gap between two nodes has to hold the
  // tallest label in that column.
  const maxLines = Math.max(
    ...columns.flat().map(([code, cnt]) => wrapLabel(code, cnt).length),
  );
  const gap = maxLines * LINE_H + FONT * 1.1;
  const top = PAD + FONT * 7.4;
  // the topmost node in a column carries its label above it, so the bands start
  // one label-height below the column titles
  const areaTop = top + gap;
  const usable = HEIGHT - areaTop - (PAD + FONT * 1.6);
  const widest = Math.max(...columns.map((c) => c.length));
  const unit = (usable - gap * (widest - 1)) / n;
  const step = (WIDTH - PAD - RPAD - NODE_W) / 8;
  const colX = DIMS.map((_, i) => PAD + i * step);

  const nodeTop: Map<string, number>[] = [];
  const bandY: number[][] = [];
  for (let col = 0; col < 9; col++) {
    const stack = n * unit + gap * (columns[col].length - 1);
    let y = areaTop + (usable - stack) / 2;
    const tops = new Map<string, number>();
    for (const [code, cnt] of columns[col]) {
      tops.set(code, y);
      y += cnt * unit + gap;
    }
    nodeTop.push(tops);
    const cursor = new Map(tops);
    const ys = Array<number>(n);
    for (const p of [...Array(n).keys()].sort((a, b) => slots[col][a] - slots[col][b])) {
      const code = people[p][col];
      ys[p] = cursor.get(code)!;
      cursor.set(code, ys[p] + unit);
    }
    bandY.push(ys);
  }

  const ribbons = [];
  for (let col = 0; col < 8; col++) {
    const x0 = colX[col] + NODE_W;
    const x1 = colX[col + 1];
    const mx = (x0 + x1) / 2;
    for (const p of [...Array(n).keys()].sort((a, b) => slots[col][a] - slots[col][b])) {
      const y0 = bandY[col][p];
      const y1 = bandY[col + 1][p];
      const h = unit + 0.35; // hairline overlap so a run reads as one ribbon
      ribbons.push(
        <path
          key={`${col}-${p}`}
          d={`M ${x0} ${y0.toFixed(2)} C ${mx} ${y0.toFixed(2)} ${mx} ${y1.toFixed(2)} ${x1} ${y1.toFixed(2)} L ${x1} ${(y1 + h).toFixed(2)} C ${mx} ${(y1 + h).toFixed(2)} ${mx} ${(y0 + h).toFixed(2)} ${x0} ${(y0 + h).toFixed(2)} Z`}
          fill={FORM_COLOUR[people[p][0]] ?? FORM_COLOUR[NOT_SPEC]}
          fillOpacity={0.62}
        />,
      );
    }
  }

  let legendX = PAD;
  const legend = (['Intangible', 'Keepsake', 'Body'] as const).map((code) => {
    const x = legendX;
    legendX += FONT * 2.2 + code.length * FONT * 0.55;
    return (
      <g key={code}>
        <rect
          x={x}
          y={PAD + FONT * 3.6}
          width={FONT * 0.75}
          height={FONT * 0.75}
          rx={3}
          fill={FORM_COLOUR[code]}
        />
        <text
          x={x + FONT * 1.15}
          y={PAD + FONT * 4.25}
          fontSize={FONT * 0.85}
          fill={INK}
        >
          {code}
        </text>
      </g>
    );
  });

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width={WIDTH}
      height={HEIGHT}
      className="h-auto w-full min-w-[760px]"
      fontFamily="var(--font-inter), Helvetica, sans-serif"
      role="img"
      aria-label={`Alluvial diagram following each of the ${n} concepts in the library across all nine dimensions`}
    >
      <rect width={WIDTH} height={HEIGHT} fill="#ffffff" />
      <text
        x={PAD}
        y={PAD + FONT * 1.3}
        fontSize={FONT * 1.4}
        fontWeight={700}
        fill={INK}
      >
        Every concept across the nine dimensions
      </text>
      <text x={PAD} y={PAD + FONT * 2.7} fontSize={FONT * 0.85} fill={MUTED}>
        One band per concept in the library, followed from the form it takes to
        the circle it is shared with. Band colour is its Form code.
      </text>
      {legend}

      {DIMS.map((d, col) => (
        <text
          key={d.id}
          x={colX[col]}
          y={top - FONT * 1.1}
          fontSize={FONT * 0.9}
          fontWeight={700}
          fill={INK}
        >
          {d.title}
        </text>
      ))}

      {ribbons}

      {columns.map((column, col) =>
        column.map(([code, cnt]) => {
          const y = nodeTop[col].get(code)!;
          const lines = wrapLabel(code, cnt);
          const plateW =
            Math.max(...lines.map((l) => l.length)) * FONT * 0.56 + FONT * 0.5;
          const plateH = lines.length * LINE_H + FONT * 0.25;
          const plateY = y - plateH - FONT * 0.3;
          return (
            <g key={`${col}-${code}`}>
              <rect
                x={colX[col]}
                y={y}
                width={NODE_W}
                height={cnt * unit}
                rx={2}
                fill={INK}
              />
              {/* labels sit over the ribbons, so each gets a white plate first */}
              <rect
                x={colX[col] - FONT * 0.2}
                y={plateY}
                width={plateW}
                height={plateH}
                rx={4}
                fill="#ffffff"
                fillOpacity={0.88}
              />
              {lines.map((line, i) => {
                const last = i === lines.length - 1;
                const cut = line.lastIndexOf(' ');
                return (
                  <text
                    key={i}
                    x={colX[col]}
                    y={plateY + (i + 1) * LINE_H}
                    fontSize={FONT}
                    fill={INK}
                  >
                    {last && cut > 0 ? (
                      <>
                        <tspan fontWeight={600}>{line.slice(0, cut)}</tspan>
                        <tspan fill={MUTED}>{line.slice(cut)}</tspan>
                      </>
                    ) : (
                      <tspan fontWeight={600}>{line}</tspan>
                    )}
                  </text>
                );
              })}
            </g>
          );
        }),
      )}

      <text
        x={PAD}
        y={HEIGHT - FONT * 0.9}
        fontSize={FONT * 0.75}
        fill={MUTED}
      >
        Not specified means that dimension was left open.
      </text>
    </svg>
  );
}
