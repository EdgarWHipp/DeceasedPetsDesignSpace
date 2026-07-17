// Single source of truth for the design space, transcribed verbatim from the
// final 9-dimension version in the thesis (text/content.tex, "The
// Workshop-Grounded Design Space"). Consumed by the builder, story card,
// spider graph, and atlas page — no second data source may exist.

export type DimId =
  | 'D1'
  | 'D2'
  | 'D3'
  | 'D4'
  | 'D5'
  | 'D6'
  | 'D7'
  | 'D8'
  | 'D9';

export type GroupName = 'Manifestation' | 'Interaction' | 'Afterlife';

export interface Position {
  id: string; // e.g. 'D1-P1'
  label: string;
  definition: string;
  examples: string[];
  story: string; // second-person fragment, lowercase start, spliced into sentences
}

export interface Dimension {
  id: DimId;
  title: string;
  question: string;
  group: GroupName;
  positions: Position[];
}

export const GROUPS: {
  name: GroupName;
  accent: string;
  description: string;
  dims: DimId[];
}[] = [
  {
    name: 'Manifestation',
    accent: '#2f8c78',
    description:
      'How the representation appears and takes form — how the pet is made present and recognizable.',
    dims: ['D1', 'D2', 'D3'],
  },
  {
    name: 'Interaction',
    accent: '#b18452',
    description: 'How the owner can encounter and act with the pet.',
    dims: ['D4', 'D5', 'D6'],
  },
  {
    name: 'Afterlife',
    accent: '#8a7ca8',
    description:
      'How the representation is created, how the bond continues or changes, and who can take part.',
    dims: ['D7', 'D8', 'D9'],
  },
];

export const DIMENSIONS: Dimension[] = [
  {
    id: 'D1',
    title: 'Tangibility',
    question: 'How the representation appears and takes form.',
    group: 'Manifestation',
    positions: [
      {
        id: 'D1-P1',
        label: 'Perceived',
        definition: 'Present without a touchable body.',
        examples: ['hologram', 'screen pet', 'voice cue'],
        story: 'a presence you can see and hear but never touch',
      },
      {
        id: 'D1-P2',
        label: 'Material',
        definition: 'Touchable without acting on its own.',
        examples: ['collar', 'memorial stone', 'candle'],
        story: 'a quiet object you can hold in your hands',
      },
      {
        id: 'D1-P3',
        label: 'Interactive',
        definition: 'Appears as an entity that can react.',
        examples: ['robot dog', 'animatronic pet', 'responsive avatar'],
        story: 'a responsive body that reacts when you reach out',
      },
    ],
  },
  {
    id: 'D2',
    title: 'Fidelity',
    question: 'How closely it resembles reality.',
    group: 'Manifestation',
    positions: [
      {
        id: 'D2-P1',
        label: 'Stylized',
        definition: 'Uses an expressive or simplified likeness.',
        examples: ['comic hologram', 'cartoon avatar', 'game pet'],
        story: 'drawn with a soft, simplified likeness',
      },
      {
        id: 'D2-P2',
        label: 'Realistic',
        definition: 'Aims for a lifelike impression.',
        examples: ['lifelike hologram', 'realistic robot', 'detailed photo scene'],
        story: 'rendered as lifelike as memory allows',
      },
    ],
  },
  {
    id: 'D3',
    title: 'Recognizable Cues',
    question: 'What makes it recognizable.',
    group: 'Manifestation',
    positions: [
      {
        id: 'D3-P1',
        label: 'Symbolic',
        definition: 'Recognized through signs or symbols.',
        examples: ['birthday', 'name tag', 'paw symbol'],
        story: 'you know it by its name tag and paw mark',
      },
      {
        id: 'D3-P2',
        label: 'Sensory',
        definition: 'Recognized through sensory cues.',
        examples: ['fur color', 'scent', 'warmth', 'bark'],
        story: 'you know it by its color, scent, and bark',
      },
      {
        id: 'D3-P3',
        label: 'Behavioral',
        definition: 'Recognized through habits or routines.',
        examples: ['favorite trick', 'feeding routine', 'play style'],
        story: 'you know it by its favorite trick and daily routine',
      },
    ],
  },
  {
    id: 'D4',
    title: 'Responsiveness',
    question: 'Whether the pet reacts to the user.',
    group: 'Interaction',
    positions: [
      {
        id: 'D4-P1',
        label: 'Passive',
        definition: 'Presents content or cues without reacting as the pet.',
        examples: ['photo album', 'video replay', 'scent cue'],
        story: 'it shows you moments without reacting back',
      },
      {
        id: 'D4-P2',
        label: 'Active',
        definition: 'The pet responds during use.',
        examples: ['chatbot', 'robot dog', 'interactive game pet'],
        story: 'it answers you — nudging, playing, responding',
      },
    ],
  },
  {
    id: 'D5',
    title: 'Availability',
    question: 'When and why it appears.',
    group: 'Interaction',
    positions: [
      {
        id: 'D5-P1',
        label: 'User Initiated',
        definition: 'Opened or started by the owner.',
        examples: ['album replay', 'saved video', 'guided replay'],
        story: 'it appears when you choose to call it',
      },
      {
        id: 'D5-P2',
        label: 'Externally Initiated',
        definition: 'Appears through external activation.',
        examples: ['button', 'app', 'voice command'],
        story: 'it arrives when something in the world triggers it',
      },
      {
        id: 'D5-P3',
        label: 'Persistent',
        definition: 'Present by default or continuously available.',
        examples: ['timer', 'arrival cue', 'stress detection'],
        story: 'it is simply always there',
      },
    ],
  },
  {
    id: 'D6',
    title: 'Mobility',
    question: 'How far it can move across contexts.',
    group: 'Interaction',
    positions: [
      {
        id: 'D6-P1',
        label: 'Fixed Place',
        definition: 'Limited to a specific context.',
        examples: ['grave', 'old corner', 'fixed display', 'specific VR world'],
        story: 'it lives in one meaningful place',
      },
      {
        id: 'D6-P2',
        label: 'Moves With You',
        definition: 'Can appear across changing contexts.',
        examples: ['mobile AR', 'wearable overlay', 'cloud companion'],
        story: 'it travels with you wherever you go',
      },
    ],
  },
  {
    id: 'D7',
    title: 'Creation',
    question: 'What information is used to make it.',
    group: 'Afterlife',
    positions: [
      {
        id: 'D7-P1',
        label: 'Personal Memories',
        definition: 'Built from subjective accounts of the owner and others.',
        examples: ['memory notes', 'questionnaire', 'owner photos', 'voice clips'],
        story: 'built from your own memories, photos, and stories',
      },
      {
        id: 'D7-P2',
        label: 'Recorded Data',
        definition: 'Built from external data sources.',
        examples: [
          'home sensors',
          'public cameras',
          'veterinary records',
          'shelter databases',
        ],
        story: 'built from recorded traces the world kept of it',
      },
    ],
  },
  {
    id: 'D8',
    title: 'Continuity Logic',
    question: 'What direction the relationship takes after loss.',
    group: 'Afterlife',
    positions: [
      {
        id: 'D8-P1',
        label: 'Past Moment',
        definition: 'Returns to a remembered moment.',
        examples: ['one happy moment', 'replayed walk'],
        story: 'together you return to one remembered moment',
      },
      {
        id: 'D8-P2',
        label: 'Ongoing Bond',
        definition: 'Lets the bond continue.',
        examples: ['check-ins', 'daily companion'],
        story: 'together you keep the bond alive',
      },
      {
        id: 'D8-P3',
        label: 'New Relationship',
        definition: 'Helps move toward a different relationship.',
        examples: ['adoption matching', 'meeting another pet'],
        story: 'it walks you toward a new companion',
      },
      {
        id: 'D8-P4',
        label: 'Letting Go',
        definition: 'Supports farewell or closure.',
        examples: ['farewell ritual', 'limited session'],
        story: 'it helps you say goodbye',
      },
    ],
  },
  {
    id: 'D9',
    title: 'Participation Circle',
    question: 'Who can take part in the experience.',
    group: 'Afterlife',
    positions: [
      {
        id: 'D9-P1',
        label: 'Private',
        definition: 'Keeps the experience personal.',
        examples: ['personal shrine', 'private memory album', 'solo VR visit'],
        story: 'this encounter is yours alone',
      },
      {
        id: 'D9-P2',
        label: 'Close Circle',
        definition: 'Close others can join the experience.',
        examples: ['family viewing', 'shared keepsake', 'group visit'],
        story: 'your closest people can join you',
      },
      {
        id: 'D9-P3',
        label: 'Public Community',
        definition: 'Is meant for wider collective participation.',
        examples: ['online tribute', 'communal ceremony', 'public memory archive'],
        story: 'a whole community remembers with you',
      },
    ],
  },
];

export type Selection = Partial<Record<DimId, string>>; // position id per dim

export const TOTAL_CONFIGURATIONS = 5184; // 3·2·3·2·3·2·2·4·3

export const PRESETS: {
  name: string;
  blurb: string;
  selection: Record<DimId, string>;
}[] = [
  {
    name: 'Holographic Reliving',
    blurb:
      'A lifelike hologram of the pet replayed in the place where the memory happened.',
    selection: {
      D1: 'D1-P1',
      D2: 'D2-P2',
      D3: 'D3-P2',
      D4: 'D4-P1',
      D5: 'D5-P1',
      D6: 'D6-P1',
      D7: 'D7-P1',
      D8: 'D8-P1',
      D9: 'D9-P1',
    },
  },
  {
    name: 'PVP Pet Game',
    blurb:
      'A stylized game companion that plays back and keeps the bond going day to day.',
    selection: {
      D1: 'D1-P1',
      D2: 'D2-P1',
      D3: 'D3-P3',
      D4: 'D4-P2',
      D5: 'D5-P3',
      D6: 'D6-P2',
      D7: 'D7-P1',
      D8: 'D8-P2',
      D9: 'D9-P2',
    },
  },
  {
    name: 'Memorial Candle',
    blurb: 'A quiet keepsake lit on meaningful days to say goodbye gently.',
    selection: {
      D1: 'D1-P2',
      D2: 'D2-P1',
      D3: 'D3-P1',
      D4: 'D4-P1',
      D5: 'D5-P1',
      D6: 'D6-P1',
      D7: 'D7-P1',
      D8: 'D8-P4',
      D9: 'D9-P1',
    },
  },
];

// --- lookup constants and helpers shared across components ---

export const DIM_BY_ID = Object.fromEntries(
  DIMENSIONS.map((d) => [d.id, d]),
) as Record<DimId, Dimension>;

export const GROUP_ACCENT = Object.fromEntries(
  GROUPS.map((g) => [g.name, g.accent]),
) as Record<GroupName, string>;

export function getPosition(sel: Selection, dim: DimId): Position | undefined {
  const pid = sel[dim];
  if (!pid) return undefined;
  return DIM_BY_ID[dim].positions.find((p) => p.id === pid);
}

export function randomSelection(): Record<DimId, string> {
  const sel = {} as Record<DimId, string>;
  for (const d of DIMENSIONS) {
    sel[d.id] = d.positions[Math.floor(Math.random() * d.positions.length)].id;
  }
  return sel;
}
