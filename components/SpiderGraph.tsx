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
const CX = 500;
const CY = 510;
const R_NODE = 380;
const R_RIM = 258;
const NODE_R = 46;

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
      {/* group arcs behind the nodes */}
      {GROUPS.map((g) => {
        const a0 = NODE_ANGLE[g.dims[0]] - 16;
        const a1 = NODE_ANGLE[g.dims[g.dims.length - 1]] + 16;
        const [rawLx, ly] = polar((a0 + a1) / 2, R_NODE + 88);
        const lx = Math.min(910, Math.max(90, rawLx));
        return (
          <g key={g.name}>
            <path
              d={arcPath(a0, a1, R_NODE + 62)}
              fill="none"
              stroke={g.accent}
              strokeWidth="10"
              strokeLinecap="round"
              opacity="0.18"
            />
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="19"
              fontWeight="600"
              fill={g.accent}
              letterSpacing="1.5"
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
                y={titleWords.length > 1 ? ny - 12 : ny - 6}
                textAnchor="middle"
                fontSize="13.5"
                fontWeight="600"
                fill="#252827"
              >
                {titleWords.length > 1 ? (
                  titleWords.map((w, i) => (
                    <tspan key={w} x={nx} dy={i === 0 ? 0 : 14}>
                      {w}
                    </tspan>
                  ))
                ) : (
                  dim.title
                )}
              </text>
              <text
                x={nx}
                y={ny + (titleWords.length > 1 ? 26 : 18)}
                textAnchor="middle"
                fontSize="12.5"
                fontStyle="italic"
                fill={chosen ? accent : '#8b877e'}
              >
                {chosen ? chosen.label : '?'}
              </text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}
