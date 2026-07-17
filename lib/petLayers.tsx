// Per-position visual layers for the pet stage. Every art decision for the
// 24 positions is enumerated here; PetStage only composes these layers.
// Stage viewBox is 0 0 480 480, pet centered around (240, 290), ground y=400.

import type { ReactNode } from 'react';
import type { Selection } from './designSpace';

export const INK = '#252827';
export const NEUTRAL = '#c9c3b8';
const MANIFESTATION = '#2f8c78';
const INTERACTION = '#b18452';
const AFTERLIFE = '#8a7ca8';

/* ---------------------------------------------------------------- defs --- */

export function StageDefs() {
  return (
    <defs>
      {/* D1-P1 Perceived: teal hologram gradient fading to transparent */}
      <linearGradient id="holoGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={MANIFESTATION} />
        <stop offset="100%" stopColor={MANIFESTATION} stopOpacity="0" />
      </linearGradient>
      {/* D1-P2 Material: stone gradient */}
      <linearGradient id="stoneGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#b8b0a4" />
        <stop offset="100%" stopColor="#8f887c" />
      </linearGradient>
      {/* D2-P2 Realistic: soft shading overlay */}
      <radialGradient id="shadeGrad" cx="0.5" cy="0.35" r="0.75">
        <stop offset="55%" stopColor={INK} stopOpacity="0" />
        <stop offset="100%" stopColor={INK} stopOpacity="0.22" />
      </radialGradient>
      <filter id="holoGlow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      {/* clip for scanlines / speckles / panel seams */}
      <clipPath id="petClip">
        <ellipse cx="240" cy="312" rx="86" ry="70" />
        <circle cx="240" cy="205" r="58" />
      </clipPath>
    </defs>
  );
}

/* ------------------------------------------------------- pet body (D1/D2) --- */

function bodyFill(d1: string | undefined, d2: string | undefined): string {
  const flat = d2 === 'D2-P1'; // Stylized drops gradients, uses flat fills
  if (d1 === 'D1-P1') return flat ? MANIFESTATION : 'url(#holoGrad)';
  if (d1 === 'D1-P2') return flat ? '#a8a094' : 'url(#stoneGrad)';
  if (d1 === 'D1-P3') return '#ccd2d4';
  return NEUTRAL;
}

export function PetBody({ selection }: { selection: Selection }) {
  const d1 = selection.D1;
  const d2 = selection.D2;
  const stylized = d2 === 'D2-P1';
  const realistic = d2 === 'D2-P2';
  const holo = d1 === 'D1-P1';
  const stone = d1 === 'D1-P2';
  const robot = d1 === 'D1-P3';

  const sw = stylized ? 6 : realistic ? 2 : 3;
  const fill = bodyFill(d1, d2);
  const stroke = INK;

  return (
    <g
      opacity={holo ? 0.65 : 1}
      filter={holo ? 'url(#holoGlow)' : undefined}
      transform={holo ? 'translate(0 -12)' : undefined}
    >
      {/* tail (wagged by PetStage when D4-P2) */}
      <g className={selection.D4 === 'D4-P2' ? 'tail-wag' : undefined}>
        <path
          d="M318 318 Q366 300 372 252"
          fill="none"
          stroke={stroke}
          strokeWidth={18 + sw * 2}
          strokeLinecap="round"
        />
        <path
          d="M318 318 Q366 300 372 252"
          fill="none"
          stroke={fill}
          strokeWidth="18"
          strokeLinecap="round"
        />
        {realistic && (
          <path
            d="M366 262 l10 -12 l-2 14 l10 -8"
            fill="none"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
          />
        )}
      </g>
      {/* body */}
      <ellipse
        cx="240"
        cy="312"
        rx="86"
        ry="70"
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
      />
      {/* haunch contours */}
      <path
        d="M167 332 Q180 294 210 297"
        fill="none"
        stroke={INK}
        strokeWidth={stylized ? 3.5 : 2.5}
        strokeLinecap="round"
        opacity="0.65"
      />
      <path
        d="M313 332 Q300 294 270 297"
        fill="none"
        stroke={INK}
        strokeWidth={stylized ? 3.5 : 2.5}
        strokeLinecap="round"
        opacity="0.65"
      />
      {/* four paw bumps */}
      {[196, 226, 254, 284].map((x) => (
        <ellipse
          key={x}
          cx={x}
          cy="381"
          rx="14"
          ry="10"
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
        />
      ))}
      {/* front-leg contours */}
      <path
        d="M224 338 Q222 358 224 378"
        fill="none"
        stroke={INK}
        strokeWidth={stylized ? 3.5 : 2.5}
        strokeLinecap="round"
        opacity="0.65"
      />
      <path
        d="M256 338 Q258 358 256 378"
        fill="none"
        stroke={INK}
        strokeWidth={stylized ? 3.5 : 2.5}
        strokeLinecap="round"
        opacity="0.65"
      />
      {/* fills-only overlays clipped to body+head */}
      <g clipPath="url(#petClip)">
        {holo &&
          !stylized &&
          [150, 196, 242, 288, 334, 380].map((y) => (
            <rect
              key={y}
              x="140"
              y={y}
              width="200"
              height="5"
              fill="#ffffff"
              opacity="0.35"
            />
          ))}
        {stone &&
          [
            [206, 300],
            [258, 322],
            [230, 348],
            [270, 290],
            [214, 330],
            [250, 360],
            [226, 190],
            [256, 214],
            [238, 236],
            [220, 214],
            [262, 184],
            [284, 330],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="2.4" fill="#6f695f" opacity="0.6" />
          ))}
        {robot && (
          <g stroke="#9aa4a7" strokeWidth="2" fill="none">
            <path d="M240 252 V382" />
            <path d="M158 320 H322" />
            <path d="M196 165 H284" />
          </g>
        )}
        {realistic && (
          <>
            <ellipse cx="240" cy="312" rx="86" ry="70" fill="url(#shadeGrad)" />
            <circle cx="240" cy="205" r="58" fill="url(#shadeGrad)" />
          </>
        )}
      </g>
      {/* D1-P3: rounded chest plate + antenna with blinking LED */}
      {robot && (
        <>
          <rect
            x="214"
            y="290"
            width="52"
            height="46"
            rx="14"
            fill="#b9c1c4"
            stroke={stroke}
            strokeWidth={sw}
          />
          <line x1="240" y1="150" x2="240" y2="120" stroke={stroke} strokeWidth="3" />
          <circle className="led-blink" cx="240" cy="114" r="6" fill="#e2574e" stroke={stroke} strokeWidth="2" />
        </>
      )}
      {/* realistic fur tufts on chest */}
      {realistic && (
        <path
          d="M228 262 l-5 12 l9 -4 l-4 12 l9 -5 M330 322 l11 -3 l-6 10 l11 -2"
          fill="none"
          stroke={stroke}
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
      {/* head group — stylized scales up 1.25 around head center */}
      <g transform={stylized ? 'translate(240 205) scale(1.25) translate(-240 -205)' : undefined}>
        {/* ears */}
        <path
          className="idle-twitch"
          d="M210 154 Q178 150 176 204 Q178 232 196 226 Q208 218 212 184 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
          strokeLinejoin="round"
        />
        <path
          d="M270 154 Q302 150 304 204 Q302 232 284 226 Q272 218 268 184 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
          strokeLinejoin="round"
        />
        {/* head */}
        <circle cx="240" cy="205" r="58" fill={fill} stroke={stroke} strokeWidth={sw} />
        {/* muzzle + mouth */}
        <ellipse cx="240" cy="226" rx="27" ry="19" fill={fill} stroke={stroke} strokeWidth={sw} />
        <path
          d="M228 240 Q234 248 240 240 Q246 248 252 240"
          fill="none"
          stroke={INK}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* stylized blush */}
        {stylized && (
          <>
            <ellipse cx="203" cy="214" rx="7" ry="4.5" fill="#d99a8f" opacity="0.55" />
            <ellipse cx="277" cy="214" rx="7" ry="4.5" fill="#d99a8f" opacity="0.55" />
          </>
        )}
        {/* realistic cheek fur */}
        {realistic && (
          <path
            d="M190 222 l-9 5 M193 231 l-9 5 M290 222 l9 5 M287 231 l9 5"
            fill="none"
            stroke={INK}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        )}
        {/* eyes: stone = closed lines, stylized = oversized ovals, else dots */}
        {stone ? (
          <g stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round">
            <path d="M211 198 Q219 205 227 198" />
            <path d="M253 198 Q261 205 269 198" />
          </g>
        ) : stylized ? (
          <>
            <g className="idle-blink">
              <ellipse cx="219" cy="197" rx="10" ry="13" fill={INK} />
              <circle cx="222" cy="192" r="3" fill="#ffffff" />
            </g>
            <g className="idle-blink">
              <ellipse cx="261" cy="197" rx="10" ry="13" fill={INK} />
              <circle cx="264" cy="192" r="3" fill="#ffffff" />
            </g>
          </>
        ) : (
          <>
            <circle className="idle-blink" cx="219" cy="198" r="6" fill={INK} />
            <circle className="idle-blink" cx="261" cy="198" r="6" fill={INK} />
          </>
        )}
        {/* nose */}
        <path
          d="M231 222 h18 l-9 12 Z"
          fill={INK}
          stroke={INK}
          strokeWidth="4"
          strokeLinejoin="round"
        />
      </g>
      {/* D3 recognizable cues sit on the body */}
      <CueLayer selection={selection} />
    </g>
  );
}

/* ------------------------------------------------------------- D3 cues --- */

function CueLayer({ selection }: { selection: Selection }) {
  const d3 = selection.D3;
  if (d3 === 'D3-P1') {
    // Symbolic: collar band + hanging tag with paw glyph
    return (
      <g>
        <path
          d="M194 254 Q240 274 286 254"
          fill="none"
          stroke="#7a3b2e"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <line x1="240" y1="268" x2="240" y2="276" stroke={INK} strokeWidth="2" />
        <circle cx="240" cy="286" r="11" fill="#d9b23c" stroke={INK} strokeWidth="2" />
        <g fill={INK}>
          <circle cx="240" cy="288" r="3" />
          <circle cx="235" cy="282" r="1.6" />
          <circle cx="240" cy="280" r="1.6" />
          <circle cx="245" cy="282" r="1.6" />
        </g>
      </g>
    );
  }
  if (d3 === 'D3-P2') {
    // Sensory: scent wisps near the nose + sound arcs at the ear
    return (
      <g fill="none" stroke={MANIFESTATION} strokeWidth="2.5" strokeLinecap="round" opacity="0.75">
        <path d="M262 218 q10 -8 4 -18 q-6 -9 2 -17" />
        <path d="M276 226 q10 -8 4 -18 q-6 -9 2 -17" />
        <path d="M290 234 q10 -8 4 -18 q-6 -9 2 -17" />
        <path d="M304 148 a20 20 0 0 1 6 26" />
        <path d="M314 138 a30 30 0 0 1 9 40" />
      </g>
    );
  }
  if (d3 === 'D3-P3') {
    // Behavioral: dashed motion trail behind the tail + tennis ball at paws
    return (
      <g>
        <path
          d="M336 344 q42 8 68 -20"
          fill="none"
          stroke={INK}
          strokeWidth="3"
          strokeDasharray="7 7"
          strokeLinecap="round"
          opacity="0.6"
        />
        <circle cx="172" cy="380" r="13" fill="#c9d44a" stroke={INK} strokeWidth="2" />
        <path d="M161 374 q11 6 22 0" fill="none" stroke={INK} strokeWidth="1.5" />
      </g>
    );
  }
  return null;
}

/* ---------------------------------------------------- D6 background --- */

export function BackgroundLayer({ selection }: { selection: Selection }) {
  const d6 = selection.D6;
  if (d6 === 'D6-P1') {
    // Fixed Place: room corner, window, pet bed
    return (
      <g>
        <line x1="90" y1="120" x2="90" y2="400" stroke="#d8d2c4" strokeWidth="3" />
        <line x1="28" y1="400" x2="452" y2="400" stroke="#d8d2c4" strokeWidth="4" />
        <rect x="330" y="82" width="92" height="112" rx="4" fill="#efece4" stroke="#d8d2c4" strokeWidth="3" />
        <line x1="376" y1="82" x2="376" y2="194" stroke="#d8d2c4" strokeWidth="3" />
        <line x1="330" y1="138" x2="422" y2="138" stroke="#d8d2c4" strokeWidth="3" />
        <ellipse cx="240" cy="396" rx="115" ry="22" fill="#e6dfd0" stroke="#d8d2c4" strokeWidth="3" />
      </g>
    );
  }
  if (d6 === 'D6-P2') {
    // Moves With You: horizon + drifting clouds + path dots
    return (
      <g>
        <line x1="0" y1="400" x2="480" y2="400" stroke="#d8d2c4" strokeWidth="3" />
        <g className="cloud-drift" fill="#ffffff" opacity="0.85">
          <ellipse cx="60" cy="92" rx="34" ry="14" />
          <ellipse cx="86" cy="84" rx="24" ry="12" />
        </g>
        <g className="cloud-drift-late" fill="#ffffff" opacity="0.7">
          <ellipse cx="-40" cy="146" rx="28" ry="11" />
          <ellipse cx="-18" cy="140" rx="18" ry="9" />
        </g>
        {[152, 180, 208, 272, 300, 328].map((x) => (
          <circle key={x} cx={x} cy="410" r="3" fill={INK} opacity="0.25" />
        ))}
      </g>
    );
  }
  return null;
}

/* --------------------------------- D5-P3 ambient ring (behind the pet) --- */

export function AmbientLayer({ selection }: { selection: Selection }) {
  if (selection.D5 !== 'D5-P3') return null;
  return (
    <circle
      className="ring-breathe"
      cx="240"
      cy="295"
      r="155"
      fill="none"
      stroke={INTERACTION}
      strokeWidth="18"
    />
  );
}

/* ------------------------------------------------------- D7 motes --- */

export function MotesLayer({ selection }: { selection: Selection }) {
  const d7 = selection.D7;
  if (!d7) return null;
  const personal = d7 === 'D7-P1';
  const angles = [0, 72, 144, 216, 288];
  return (
    <g className="mote-orbit">
      {angles.map((a, i) => {
        const rad = (a * Math.PI) / 180;
        const x = 240 + 150 * Math.cos(rad);
        const y = 290 + 150 * Math.sin(rad);
        if (personal) {
          // tiny photo frames and hearts
          return i % 2 === 0 ? (
            <g key={a} transform={`translate(${x - 8} ${y - 6})`}>
              <rect width="16" height="12" fill="#ffffff" stroke={INK} strokeWidth="1.5" />
              <rect x="2.5" y="2.5" width="11" height="7" fill={AFTERLIFE} opacity="0.7" />
            </g>
          ) : (
            <path
              key={a}
              transform={`translate(${x} ${y - 5})`}
              d="M0 3 C-1 0 -6 0 -6 4 C-6 8 0 11 0 11 C0 11 6 8 6 4 C6 0 1 0 0 3"
              fill={AFTERLIFE}
              opacity="0.85"
            />
          );
        }
        // recorded data: tiny squares and waveform ticks
        return i % 2 === 0 ? (
          <rect
            key={a}
            x={x - 5}
            y={y - 5}
            width="10"
            height="10"
            fill="none"
            stroke={AFTERLIFE}
            strokeWidth="2"
          />
        ) : (
          <g key={a} stroke={AFTERLIFE} strokeWidth="2" strokeLinecap="round">
            <line x1={x - 5} y1={y - 3} x2={x - 5} y2={y + 3} />
            <line x1={x} y1={y - 7} x2={x} y2={y + 7} />
            <line x1={x + 5} y1={y - 4} x2={x + 5} y2={y + 4} />
          </g>
        );
      })}
    </g>
  );
}

/* --------------------------------------- D4/D5 foreground glyphs --- */

export function GlyphLayer({
  selection,
  generation,
}: {
  selection: Selection;
  generation: number;
}) {
  const nodes: ReactNode[] = [];
  if (selection.D4 === 'D4-P1') {
    // Passive: thin frame corner brackets at the 4 stage corners
    nodes.push(
      <g key="brackets" fill="none" stroke={INTERACTION} strokeWidth="3" opacity="0.8">
        <path d="M16 44 V16 H44" />
        <path d="M436 16 H464 V44" />
        <path d="M464 436 V464 H436" />
        <path d="M44 464 H16 V436" />
      </g>,
    );
  }
  if (selection.D5 === 'D5-P1') {
    // User Initiated: summon-button glyph bottom-left + ripple on spawn
    nodes.push(
      <g key="summon">
        <rect x="20" y="420" width="46" height="32" rx="9" fill="#ffffff" stroke={INK} strokeWidth="2.5" />
        <path d="M38 428 l14 8 l-14 8 Z" fill={INTERACTION} />
        <circle
          key={`ripple-${generation}`}
          className="spawn-ripple"
          cx="240"
          cy="360"
          r="46"
          fill="none"
          stroke={INTERACTION}
          strokeWidth="3"
        />
      </g>,
    );
  }
  if (selection.D5 === 'D5-P2') {
    // Externally Initiated: clock glyph top-left + expanding pulse on spawn
    nodes.push(
      <g key="clock">
        <circle cx="46" cy="46" r="19" fill="#ffffff" stroke={INK} strokeWidth="2.5" />
        <line x1="46" y1="46" x2="46" y2="34" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="46" y1="46" x2="55" y2="50" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
        <circle
          key={`pulse-${generation}`}
          className="spawn-ripple"
          cx="46"
          cy="46"
          r="24"
          fill="none"
          stroke={INTERACTION}
          strokeWidth="3"
        />
      </g>,
    );
  }
  return <>{nodes}</>;
}

/* ------------------------------------------------------ D8 timeline --- */

export function TimelineLayer({ selection }: { selection: Selection }) {
  const d8 = selection.D8;
  if (!d8) return null;
  const xs = [168, 216, 264, 312];
  const y = 446;
  const cut = d8 === 'D8-P4';
  return (
    <g>
      <line
        x1={xs[0]}
        y1={y}
        x2={cut ? xs[1] : xs[3]}
        y2={y}
        stroke={AFTERLIFE}
        strokeWidth="3"
      />
      {xs.map((x, i) => (
        <circle
          key={x}
          cx={x}
          cy={y}
          r="6"
          fill={AFTERLIFE}
          opacity={cut && i > 1 ? 0.25 : 1}
        />
      ))}
      {d8 === 'D8-P1' && (
        // arrow curving back to dot 1
        <g fill="none" stroke={AFTERLIFE} strokeWidth="2.5">
          <path d="M312 438 Q240 412 174 436" />
          <path d="M182 428 L174 436 L185 439" fill="none" />
        </g>
      )}
      {d8 === 'D8-P2' && (
        // loop arcs across all dots
        <g fill="none" stroke={AFTERLIFE} strokeWidth="2.5">
          <path d="M168 440 q24 -20 48 0" />
          <path d="M216 440 q24 -20 48 0" />
          <path d="M264 440 q24 -20 48 0" />
        </g>
      )}
      {d8 === 'D8-P3' && (
        // arrow to a hollow extra dot
        <g stroke={AFTERLIFE} strokeWidth="2.5" fill="none">
          <line x1="312" y1={y} x2="348" y2={y} />
          <path d="M341 440 L349 446 L341 452" />
          <circle cx="360" cy={y} r="6" fill="#f7f5f0" />
        </g>
      )}
    </g>
  );
}

/* ------------------------------------------- D9 participation circle --- */

function Person({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={INK} opacity="0.55">
      <circle cx="0" cy="-15" r="6" />
      <path d="M-8 12 Q-8 -6 0 -6 Q8 -6 8 12 Z" />
    </g>
  );
}

export function ParticipationLayer({ selection }: { selection: Selection }) {
  const d9 = selection.D9;
  if (d9 === 'D9-P1') {
    return <Person x={418} y={430} />;
  }
  if (d9 === 'D9-P2') {
    return (
      <g>
        <Person x={396} y={432} s={0.85} />
        <Person x={419} y={428} />
        <Person x={441} y={433} s={0.85} />
      </g>
    );
  }
  if (d9 === 'D9-P3') {
    // arc of 12 crowd dots along the lower stage rim
    const dots = Array.from({ length: 12 }, (_, i) => {
      const t = ((18 + i * 12) * Math.PI) / 180; // 18°..150°
      return [240 + 215 * Math.cos(t), 300 + 152 * Math.sin(t)];
    });
    return (
      <g fill={INK} opacity="0.45">
        {dots.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="5" />
        ))}
      </g>
    );
  }
  return null;
}
