"""Build the concept-classification Sankey the Library page shows.

Every cell is a (participant, dimension) judgment on the one concept card that
participant was shown: 70 raters x 9 dimensions = 630 cells. Each cell is
assigned exactly ONE outcome, so the diagram is a partition and every ribbon
counts a cell once.

The match rule is not restated here. The lookup tables and the answer keys are
read straight out of analysis/reproduce_results.py, the script that reproduces
the thesis's 330 of 495, so the two cannot drift apart.

One subtlety the diagram has to take a position on: the archived key for
guided_memory_replay / d6_context accepts "Cannot tell" as a correct reading,
because the card's text does not place the replay anywhere. Two cells ticked
only that. They are drawn as matches, not as escapes. The thesis's escape count
of 78 "Cannot tell" cells counts escape USE and therefore still includes them;
this diagram counts where each cell ENDED, so its Cannot tell node reads 76.
The subtitle says so.

    python scripts/figures/build_classification.py [archive-root] [out-dir]

The archive root defaults to the thesis archive checked out beside this repo;
it holds the survey data and the answer keys.
"""
import ast
import csv
import json
import os
import sys
from collections import Counter, defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sankey2

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DEFAULT_ARCHIVE = os.path.join(os.path.dirname(ROOT), '1935_hipp_edgar_wilhelm')

MATCHED = "Matches the key"
DIFFERENT = "A different code"
CANNOT = "Cannot tell"
NOTAPPLY = "Does not apply"
CODED = "Coded anyway (no single key)"
OUTCOMES = [MATCHED, DIFFERENT, CANNOT, NOTAPPLY, CODED]

# One colour per node, per column. No column may repeat one, because a ribbon
# is filled with its source node's colour.
CARD_COLOUR = ["#009682", "#4664AA", "#8f6228", "#635488", "#7FCAC0",
               "#A2B0D6", "#C89A5C", "#A594C4", "#1B4A44", "#9AA5A2"]
OUTCOME_COLOUR = {MATCHED: "#1B2F5C", DIFFERENT: "#009682", CANNOT: "#4664AA",
                  NOTAPPLY: "#8f6228", CODED: "#9AA5A2"}
DIM_COLOUR = ["#009682", "#4664AA", "#8f6228", "#635488", "#7FCAC0",
              "#A2B0D6", "#C89A5C", "#A594C4", "#1B4A44"]

TITLES = {
    'd1_form': 'D1 Form', 'd2_visual_fidelity': 'D2 Visual Fidelity',
    'd3_cues': 'D3 Recognizable Cues', 'd4_responsiveness': 'D4 Responsiveness',
    'd5_availability': 'D5 Availability', 'd6_context': 'D6 Context',
    'd7_creation': 'D7 Creation', 'd8_continuity': 'D8 Continuity Logic',
    'd9_participation_circle': 'D9 Participation Circle',
}
CARD_TITLE = {
    'ar_park_encounter': 'AR park encounter',
    'robot_surrogate_pet': 'Robot surrogate pet',
    'vr_reunion_world': 'VR reunion world',
    'responsive_screen_companion': 'Responsive screen companion',
    'guided_memory_replay': 'Guided memory replay',
    'memory_archive_tablet': 'Memory archive tablet',
    'ar_hologram_living_room': 'AR hologram, living room',
    'ambient_sleeping_spot': 'Ambient sleeping spot',
    'partly_responsive_hologram': 'Partly responsive hologram',
    'pet_immortality_treatment': 'Pet immortality treatment',
}


def load_tables(path):
    """Pull the constants out of reproduce_results.py without running it."""
    want = {'DIMS', 'LABEL2CODE', 'ESC', 'KEYS', 'HYBRID', 'UNMAPPABLE'}
    ns = {}
    for node in ast.parse(open(path).read()).body:
        if not isinstance(node, ast.Assign) or len(node.targets) != 1:
            continue
        target = node.targets[0]
        # Both `KEYS = {...}` and `HYBRID, UNMAPPABLE = 'a', 'b'` appear there.
        if isinstance(target, ast.Name):
            pairs = [(target, node.value)]
        elif isinstance(target, ast.Tuple) and isinstance(node.value, ast.Tuple):
            pairs = list(zip(target.elts, node.value.elts))
        else:
            continue
        for name, value in pairs:
            if isinstance(name, ast.Name) and name.id in want:
                ns[name.id] = ast.literal_eval(value)
    missing = want - set(ns)
    if missing:
        raise SystemExit("could not read %s from %s" % (sorted(missing), path))
    return ns


def classify(root):
    """Every cell, tagged with its single outcome."""
    T = load_tables(os.path.join(root, 'analysis', 'reproduce_results.py'))
    rows = list(csv.DictReader(open(os.path.join(root, 'data', 'cleaned_dataset.csv'))))
    cells = []
    for r in rows:
        for card, dims in json.loads(r['classification_selections']).items():
            for dim in T['DIMS']:
                labels = dims.get(dim, [])
                codes = [T['ESC'].get(l) or T['LABEL2CODE'][dim].get(l, '?')
                         for l in labels]
                ct = 'cannot_tell' in codes
                dna = 'does_not_apply' in codes
                assert not (ct and dna), (r['participant_label'], card, dim)
                key = T['KEYS'].get(card)
                if key is not None and any(c in key[dim] for c in codes):
                    outcome = MATCHED
                elif dna:
                    outcome = NOTAPPLY
                elif ct:
                    outcome = CANNOT
                else:
                    outcome = DIFFERENT if key is not None else CODED
                cells.append({'card': card, 'dim': dim, 'outcome': outcome,
                              'keyed': key is not None, 'used_ct': ct, 'used_dna': dna})
    return cells, T


def card_diagram(cells, T, out_svg):
    per_card = defaultdict(Counter)
    raters = Counter()
    for c in cells:
        per_card[c['card']][c['outcome']] += 1
    for card in per_card:
        raters[card] = sum(per_card[card].values()) // 9

    def rate(card):
        n = sum(per_card[card].values())
        return per_card[card][MATCHED] / n if n else -1
    order = sorted((c for c in per_card if c in T['KEYS']), key=rate, reverse=True)
    order += [T['HYBRID'], T['UNMAPPABLE']]

    stage = [(CARD_TITLE[c], o, per_card[c][o])
             for c in order for o in OUTCOMES if per_card[c][o]]
    colours = {(0, CARD_TITLE[c]): CARD_COLOUR[i] for i, c in enumerate(order)}
    colours.update({(1, o): OUTCOME_COLOUR[o] for o in OUTCOMES})

    used_ct = sum(1 for c in cells if c['used_ct'])
    used_dna = sum(1 for c in cells if c['used_dna'])
    ct_accepted = sum(1 for c in cells if c['used_ct'] and c['outcome'] == MATCHED)

    svg = sankey2.render(
        [stage], width=1680, height=860, pad=40, node_w=16, gap=12,
        label_pad=350, font=20, colours=colours,
        title="Ten concepts, read through the space",
        subtitle=[
            "Each card was placed on all nine dimensions by five to nine people."
            " Every placement is traced here, from the card to where it landed.",
            "“Cannot tell” and “Does not apply” were offered alongside the"
            " codes, so a reader could decline a dimension instead of forcing it.",
        ],
        col_titles=["Concept", "Where it landed"])
    open(out_svg, 'w').write(svg)
    return per_card, order, raters


def dimension_diagram(cells, out_svg):
    per_dim = defaultdict(Counter)
    for c in cells:
        if c['keyed']:
            per_dim[c['dim']]['Matched the key' if c['outcome'] == MATCHED
                              else 'Did not match'] += 1
    dims = [d for d in TITLES if d in per_dim]
    stage = [(TITLES[d], o, per_dim[d][o]) for d in dims
             for o in ('Matched the key', 'Did not match') if per_dim[d][o]]
    colours = {(0, TITLES[d]): DIM_COLOUR[i] for i, d in enumerate(dims)}
    colours.update({(1, 'Matched the key'): "#1B2F5C",
                    (1, 'Did not match'): "#009682"})
    total = sum(sum(v.values()) for v in per_dim.values())
    matched = sum(v['Matched the key'] for v in per_dim.values())
    svg = sankey2.render(
        [stage], width=2000, height=1060, pad=54, node_w=20, gap=13, label_pad=250,
        colours=colours,
        title="Concept classification: how each dimension performed",
        subtitle=[
            "Eight key-carrying cards, %d judgments per dimension, %d cells."
            " Totals reproduce analysis/reproduce_results.py: %d of %d."
            % (total // 9, total, matched, total),
            "“Did not match” lumps a different code together with the two"
            " escape answers; the per-card diagram separates them.",
        ],
        col_titles=["Dimension", "Against the archived key"])
    open(out_svg, 'w').write(svg)
    return per_dim


def main():
    root = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_ARCHIVE
    out = (sys.argv[2] if len(sys.argv) > 2
           else os.path.join(ROOT, 'public', 'figures', 'sankey-classification.svg'))
    cells, T = classify(root)
    assert len(cells) == 630, len(cells)

    per_card, order, raters = card_diagram(cells, T, out)

    tally = Counter(c['outcome'] for c in cells)
    print("cells            %d" % len(cells))
    for o in OUTCOMES:
        print("  %-28s %3d" % (o, tally[o]))
    print("  %-28s %3d  (must equal %d)" % ("sum", sum(tally.values()), len(cells)))
    keyed = [c for c in cells if c['keyed']]
    print("\nkey-carrying cards: %d cells, %d matched  [thesis: 330/495]"
          % (len(keyed), sum(1 for c in keyed if c['outcome'] == MATCHED)))
    print("wrote %s" % out)


if __name__ == '__main__':
    main()
