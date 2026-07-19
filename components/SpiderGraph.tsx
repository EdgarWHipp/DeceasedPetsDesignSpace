'use client';

import {
  DIMENSIONS,
  GROUPS,
  GROUP_ACCENT,
  getPosition,
  type DimId,
  type Selection,
} from '@/lib/designSpace';

// Radial layout: viewBox 1000x1000, pet stage centered at (500, 510).
// 9 nodes on a 380px circle, D1 at -90° then clockwise every 40°.
// The ring around them is split into three 120° group segments, each in its
// group colour, with a leader line out to the section title.
const CX = 500;
const CY = 510;
const R_NODE = 380;
const R_RIM = 258;
const NODE_R = 58;
const R_ARC = R_NODE + 78;
const PAPER = '#f7f5f0';

function polar(angleDeg: number, r: number): [number, number] {
  const a = (angleDeg * Math.PI) / 180;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}

const NODE_ANGLE: Record<DimId, number> = Object.fromEntries(
  DIMENSIONS.map((d, i) => [d.id, -90 + i * 40]),
) as Record<DimId, number>;

/** Node center as percentages of the square container (for panel anchoring). */
export function nodePercent(dim: DimId): { x: number; y: number } {
  const [x, y] = polar(NODE_ANGLE[dim], R_NODE);
  return { x: x / 10, y: y / 10 };
}

function arcPath(a0: number, a1: number, r: number): string {
  const [x0, y0] = polar(a0, r);
  const [x1, y1] = polar(a1, r);
  return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
}

/** Split a chosen label into 1 or 2 lines at the space nearest its middle. */
function splitLabel(label: string): string[] {
  if (label.length <= 14 || !label.includes(' ')) return [label];
  const mid = label.length / 2;
  let best = -1;
  for (let i = label.indexOf(' '); i !== -1; i = label.indexOf(' ', i + 1)) {
    if (best === -1 || Math.abs(i - mid) < Math.abs(best - mid)) best = i;
  }
  return [label.slice(0, best), label.slice(best + 1)];
}

export default function SpiderGraph({
  selection,
  activeDim,
  onNodeClick,
}: {
  selection: Selection;
  activeDim: DimId | null;
  onNodeClick: (dim: DimId) => void;
}) {
  return (
    <svg viewBox="0 0 1000 1000" className="absolute inset-0 w-full h-full">
      {/* group ring: one 1/3 colour segment per group + leader line + title */}
      {GROUPS.map((g) => {
        const a0 = NODE_ANGLE[g.dims[0]] - 16;
        const a1 = NODE_ANGLE[g.dims[g.dims.length - 1]] + 16;
        // Title anchor angle: segment midpoint, except Afterlife (mid-left
        // has no free space outside the ring) which hangs off its lower end.
        const ta = g.name === 'Afterlife' ? 140 : (a0 + a1) / 2;
        const [tx0, ty0] = polar(ta, R_ARC);
        const [tx1, ty1] = polar(ta, R_NODE + 88);
        // The title starts at the leader line and extends AWAY from the
        // circle (start-anchored on the right half, end-anchored on the
        // left), so long names never curl back over the arc.
        const rightSide = Math.cos((ta * Math.PI) / 180) >= 0;
        const [ex, ey] = polar(ta, R_NODE + 96);
        const lx = rightSide ? ex + 8 : Math.max(130, ex - 8);
        return (
          <g key={g.name}>
            <path
              d={arcPath(a0, a1, R_ARC)}
              fill="none"
              stroke={g.accent}
              strokeWidth="12"
              strokeLinecap="round"
              opacity="0.55"
            />
            {/* leader line from the segment out to the section title */}
            <line
              x1={tx0}
              y1={ty0}
              x2={tx1}
              y2={ty1}
              stroke={g.accent}
              strokeWidth="2.5"
              opacity="0.8"
            />
            <text
              x={lx}
              y={ey}
              textAnchor={rightSide ? 'start' : 'end'}
              dominantBaseline="middle"
              fontSize="20"
              fontWeight="700"
              fill={g.accent}
              letterSpacing="1.5"
              stroke={PAPER}
              strokeWidth="6"
              paintOrder="stroke"
            >
              {g.name.toUpperCase()}
            </text>
          </g>
        );
      })}
      {/* connectors + nodes */}
      {DIMENSIONS.map((dim) => {
        const angle = NODE_ANGLE[dim.id];
        const accent = GROUP_ACCENT[dim.group];
        const chosen = getPosition(selection, dim.id);
        const [rx, ry] = polar(angle, R_RIM);
        const [ex, ey] = polar(angle, R_NODE - NODE_R);
        const [nx, ny] = polar(angle, R_NODE);
        const titleWords = dim.title.split(' ');
        const multiWordTitle = titleWords.length > 1;
        const labelLines = chosen ? splitLabel(chosen.label) : ['?'];
        const isActive = activeDim === dim.id;
        return (
          <g key={dim.id}>
            <line
              x1={rx}
              y1={ry}
              x2={ex}
              y2={ey}
              stroke={accent}
              strokeWidth={chosen ? 3 : 2}
              strokeDasharray={chosen ? undefined : '6 6'}
              opacity={chosen ? 0.9 : 0.5}
            />
            <g
              onClick={() => onNodeClick(dim.id)}
              className="cursor-pointer"
              role="button"
              aria-label={`${dim.title}: ${chosen ? chosen.label : 'not chosen'}`}
            >
              <circle
                cx={nx}
                cy={ny}
                r={NODE_R}
                fill="#fffdf8"
                stroke={accent}
                strokeWidth={chosen || isActive ? 4 : 2.5}
              />
              <text
                x={nx}
                y={multiWordTitle ? ny - 14 : ny - 6}
                textAnchor="middle"
                fontSize="15"
                fontWeight="600"
                fill="#252827"
              >
                {multiWordTitle ? (
                  titleWords.map((w, i) => (
                    <tspan key={w} x={nx} dy={i === 0 ? 0 : 16}>
                      {w}
                    </tspan>
                  ))
                ) : (
                  dim.title
                )}
              </text>
              <text
                x={nx}
                y={ny + (multiWordTitle ? 28 : 20)}
                textAnchor="middle"
                fontSize="13"
                fontStyle="italic"
                fill={chosen ? accent : '#8b877e'}
              >
                {labelLines.map((line, i) => (
                  <tspan key={line} x={nx} dy={i === 0 ? 0 : 12}>
                    {line}
                  </tspan>
                ))}
              </text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}
