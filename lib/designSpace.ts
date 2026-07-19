// Single source of truth for the design space, adapted from the
// final 9-dimension version in the thesis (text/content.tex, "The
// Workshop-Grounded Design Space"). Consumed by the builder, story card,
// spider graph, and atlas page — no second data source may exist.
// Wording lightly humanized for the site; dimension/position structure,
// labels, and examples match the thesis exactly.

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
    accent: '#1d6a58',
    description:
      'How the pet takes form — what makes it present and recognizable.',
    dims: ['D1', 'D2', 'D3'],
  },
  {
    name: 'Interaction',
    accent: '#8f6228',
    description: 'How the owner can meet and engage with the pet.',
    dims: ['D4', 'D5', 'D6'],
  },
  {
    name: 'Afterlife',
    accent: '#635488',
    description:
      'Where the pet comes from, how the bond carries on, and who shares in it.',
    dims: ['D7', 'D8', 'D9'],
  },
];

export const DIMENSIONS: Dimension[] = [
  {
    id: 'D1',
    title: 'Tangibility',
    question: 'Can the pet be touched?',
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
        definition: 'A touchable object that does not act on its own.',
        examples: ['collar', 'memorial stone', 'candle'],
        story: 'a quiet object you can hold in your hands',
      },
      {
        id: 'D1-P3',
        label: 'Interactive',
        definition: 'A body that can sense and react.',
        examples: ['robot dog', 'animatronic pet', 'responsive avatar'],
        story: 'a responsive body that reacts when you reach out',
      },
    ],
  },
  {
    id: 'D2',
    title: 'Fidelity',
    question: 'How lifelike should it be?',
    group: 'Manifestation',
    positions: [
      {
        id: 'D2-P1',
        label: 'Stylized',
        definition: 'An expressive, simplified likeness.',
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
    question: 'How do you know it is yours?',
    group: 'Manifestation',
    positions: [
      {
        id: 'D3-P1',
        label: 'Symbolic',
        definition: 'Recognized by signs and symbols.',
        examples: ['birthday', 'name tag', 'paw symbol'],
        story: 'you know it by its name tag and paw mark',
      },
      {
        id: 'D3-P2',
        label: 'Sensory',
        definition: 'Recognized by look, sound, and scent.',
        examples: ['fur color', 'scent', 'warmth', 'bark'],
        story: 'you know it by its color, scent, and bark',
      },
      {
        id: 'D3-P3',
        label: 'Behavioral',
        definition: 'Recognized by its habits and routines.',
        examples: ['favorite trick', 'feeding routine', 'play style'],
        story: 'you know it by its favorite trick and daily routine',
      },
    ],
  },
  {
    id: 'D4',
    title: 'Responsiveness',
    question: 'Does it react to you?',
    group: 'Interaction',
    positions: [
      {
        id: 'D4-P1',
        label: 'Passive',
        definition: 'Shows moments and cues without reacting back.',
        examples: ['photo album', 'video replay', 'scent cue'],
        story: 'it shows you moments without reacting back',
      },
      {
        id: 'D4-P2',
        label: 'Active',
        definition: 'Responds to you in the moment.',
        examples: ['chatbot', 'robot dog', 'interactive game pet'],
        story: 'it answers you — nudging, playing, responding',
      },
    ],
  },
  {
    id: 'D5',
    title: 'Availability',
    question: 'When does it appear?',
    group: 'Interaction',
    positions: [
      {
        id: 'D5-P1',
        label: 'User Initiated',
        definition: 'Appears when the owner calls it up.',
        examples: ['button', 'app', 'voice command'],
        story: 'it appears when you choose to call it',
      },
      {
        id: 'D5-P2',
        label: 'Externally Initiated',
        definition: 'Appears when something else triggers it.',
        examples: ['timer', 'arrival cue', 'stress detection'],
        story: 'it arrives when something in the world triggers it',
      },
      {
        id: 'D5-P3',
        label: 'Persistent',
        definition: 'Always available; present by default.',
        examples: ['always-on companion', 'standby display'],
        story: 'it is simply always there',
      },
    ],
  },
  {
    id: 'D6',
    title: 'Mobility',
    question: 'Where can it be?',
    group: 'Interaction',
    positions: [
      {
        id: 'D6-P1',
        label: 'Context-Bound',
        definition: 'Bound to one specific place or context.',
        examples: ['grave', 'old corner', 'fixed display', 'specific VR world'],
        story: 'it lives in one meaningful place',
      },
      {
        id: 'D6-P2',
        label: 'Unrestricted',
        definition: 'Comes along wherever you are.',
        examples: ['mobile AR', 'wearable overlay', 'cloud companion'],
        story: 'it travels with you wherever you go',
      },
    ],
  },
  {
    id: 'D7',
    title: 'Creation',
    question: 'What is it made from?',
    group: 'Afterlife',
    positions: [
      {
        id: 'D7-P1',
        label: 'Subjective Personal Data',
        definition: 'Built from your memories and personal records.',
        examples: ['memory notes', 'questionnaire', 'owner photos', 'voice clips'],
        story: 'built from your own memories, photos, and stories',
      },
      {
        id: 'D7-P2',
        label: 'Objective Data',
        definition: 'Built from data the world recorded.',
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
    question: 'Where does the relationship go from here?',
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
        definition: 'Helps open a new relationship.',
        examples: ['adoption matching', 'meeting another pet'],
        story: 'it walks you toward a new companion',
      },
      {
        id: 'D8-P4',
        label: 'Letting Go',
        definition: 'Helps with farewell and closure.',
        examples: ['farewell ritual', 'limited session'],
        story: 'it helps you say goodbye',
      },
    ],
  },
  {
    id: 'D9',
    title: 'Participation Circle',
    question: 'Who can take part?',
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
        definition: 'Open to the people closest to you.',
        examples: ['family viewing', 'shared keepsake', 'group visit'],
        story: 'your closest people can join you',
      },
      {
        id: 'D9-P3',
        label: 'Public Community',
        definition: 'Open to a wider community.',
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
    blurb: 'A quiet keepsake, lit on meaningful days, that helps say goodbye.',
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
