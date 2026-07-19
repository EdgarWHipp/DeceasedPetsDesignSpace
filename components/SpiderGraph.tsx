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
// D1-D6 sit on a 380px circle (D1 at -90° then clockwise every 40°);
// D7-D9 render as a selectable text list under an AFTERLIFE title on the left.
const CX = 500;
const CY = 510;
const R_NODE = 380;
const R_RIM = 258;
const NODE_R = 58;
const R_ARC = R_NODE + 78;
const AFTERLIFE_X = 68;
const AFTERLIFE_ROW_Y: Record<'D7' | 'D8' | 'D9', number> = {
  D7: 424,
  D8: 480,
  D9: 536,
};

function polar(angleDeg: number, r: number): [number, number] {
  const a = (angleDeg * Math.PI) / 180;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}

const NODE_ANGLE: Record<DimId, number> = Object.fromEntries(
  DIMENSIONS.map((d, i) => [d.id, -90 + i * 40]),
) as Record<DimId, number>;

const NODE_DIMS = DIMENSIONS.filter((d) => d.group !== 'Afterlife');
const AFTERLIFE_DIMS = DIMENSIONS.filter((d) => d.group === 'Afterlife');

/** Node center as percentages of the square container (for panel anchoring). */
export function nodePercent(dim: DimId): { x: number; y: number } {
  if (dim === 'D7' || dim === 'D8' || dim === 'D9')
    return { x: AFTERLIFE_X / 10, y: AFTERLIFE_ROW_Y[dim] / 10 };
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
  const afterlifeAccent = GROUP_ACCENT['Afterlife'];
  return (
    <svg viewBox="0 0 1000 1000" className="absolute inset-0 w-full h-full">
      {/* group arcs + connector ticks + titles (circle groups only) */}
      {GROUPS.filter((g) => g.name !== 'Afterlife').map((g) => {
        const a0 = NODE_ANGLE[g.dims[0]] - 16;
        const a1 = NODE_ANGLE[g.dims[g.dims.length - 1]] + 16;
        const mid = (a0 + a1) / 2;
        const [tx0, ty0] = polar(mid, R_ARC);
        const [tx1, ty1] = polar(mid, R_NODE + 96);
        const [rawLx, ly] = polar(mid, R_NODE + 114);
        const lx = Math.min(910, Math.max(90, rawLx));
        return (
          <g key={g.name}>
            <path
              d={arcPath(a0, a1, R_ARC)}
              fill="none"
              stroke={g.accent}
              strokeWidth="8"
              strokeLinecap="round"
              opacity="0.4"
            />
            {/* node → arc ticks: each dimension connects through the arc to the title */}
            {g.dims.map((dimId) => {
              const [x0, y0] = polar(NODE_ANGLE[dimId], R_NODE + NODE_R);
              const [x1, y1] = polar(NODE_ANGLE[dimId], R_ARC);
              return (
                <line
                  key={dimId}
                  x1={x0}
                  y1={y0}
                  x2={x1}
                  y2={y1}
                  stroke={g.accent}
                  strokeWidth="2.5"
                  opacity="0.7"
                />
              );
            })}
            {/* arc → title tick */}
            <line
              x1={tx0}
              y1={ty0}
              x2={tx1}
              y2={ty1}
              stroke={g.accent}
              strokeWidth="2.5"
              opacity="0.7"
            />
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="20"
              fontWeight="700"
              fill={g.accent}
              letterSpacing="1.5"
            >
              {g.name.toUpperCase()}
            </text>
          </g>
        );
      })}
      {/* Afterlife: title + rule + selectable text rows on the left column */}
      <g>
        <text
          x={AFTERLIFE_X}
          y={368}
          textAnchor="start"
          fontSize="20"
          fontWeight="700"
          letterSpacing="1.5"
          fill={afterlifeAccent}
        >
          AFTERLIFE
        </text>
        <line
          x1={AFTERLIFE_X}
          y1={382}
          x2={238}
          y2={382}
          stroke={afterlifeAccent}
          strokeWidth="2.5"
          opacity="0.7"
        />
        {AFTERLIFE_DIMS.map((dim) => {
          const y = AFTERLIFE_ROW_Y[dim.id as 'D7' | 'D8' | 'D9'];
          const chosen = getPosition(selection, dim.id);
          const highlighted = activeDim === dim.id || Boolean(chosen);
          return (
            <g
              key={dim.id}
              onClick={() => onNodeClick(dim.id)}
              className="cursor-pointer"
              role="button"
              aria-label={`${dim.title}: ${chosen ? chosen.label : 'not chosen'}`}
            >
              <rect
                x={AFTERLIFE_X - 8}
                y={y - 18}
                width={200}
                height={48}
                fill="transparent"
              />
              <text
                x={AFTERLIFE_X}
                y={y}
                textAnchor="start"
                fontSize="15"
                fontWeight="600"
                fill={highlighted ? afterlifeAccent : '#252827'}
              >
                {dim.title}
              </text>
              <text
                x={AFTERLIFE_X}
                y={y + 20}
                textAnchor="start"
                fontSize="13"
                fontStyle="italic"
                fill={chosen ? afterlifeAccent : '#8b877e'}
              >
                {chosen ? chosen.label : '?'}
              </text>
            </g>
          );
        })}
      </g>
      {/* connectors + circle nodes (Manifestation + Interaction) */}
      {NODE_DIMS.map((dim) => {
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
                y={ny + (multiWordTitle ? 30 : 20)}
                textAnchor="middle"
                fontSize="13"
                fontStyle="italic"
                fill={chosen ? accent : '#8b877e'}
              >
                {labelLines.map((line, i) => (
                  <tspan key={line} x={nx} dy={i === 0 ? 0 : 15}>
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
