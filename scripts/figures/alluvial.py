"""Alluvial diagram of the library, one band per concept, across all nine dimensions.

Unlike an aggregated Sankey, nothing is re-bundled between columns: band i is
the same concept in every column, so a reader can follow one line the whole way
across. Each band keeps a single colour, taken from its Form code, so the first
column doubles as the legend.

Vocabulary comes from lib/designSpace.ts, the site's single source of truth, so
the figure and the pages around it always agree on titles, codes and order.

    python scripts/figures/alluvial.py [out.svg]

Type sizes are set so the labels stay readable when the figure is dropped into a
paper or a screen recording: everything scales with FONT, and the layout (label
plates, gaps, margins) is derived from it.
"""
import json
import os
import re
import sys

# Form drives the band colour. Checked for colour-vision separation: the worst
# pair is 19.9 in OKLab dE100 under deuteranopia, protanopia and tritanopia
# alike, against a floor of 8.
FORM_COLOUR = {
    "Intangible": "#009682",   # KIT green
    "Keepsake": "#E2A03F",     # amber, the smallest group so the brightest
    "Body": "#1B2F5C",         # deep navy
    "Not specified": "#9AA5A2",
}
INK, MUTED = "#252827", "#5C6663"
NOT_SPEC = "Not specified"

FONT = 23          # node labels; everything else is a multiple of this
WRAP = 16          # characters per label line before it wraps

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def read_design_space(path):
    """[(title, [code labels in order])] for D1..D9, straight from designSpace.ts."""
    src = open(path).read()
    dims = []
    for block in re.split(r"\n  \{\n    id: '", src)[1:]:
        title = re.search(r"title: '([^']+)'", block)
        labels = re.findall(r"label: '([^']+)'", block)
        if title and labels:
            dims.append((title.group(1), labels))
    if len(dims) != 9:
        raise SystemExit('expected 9 dimensions, parsed %d' % len(dims))
    return dims


def read_concepts(path, dims):
    """One list of nine labels per concept. A missing code is Not specified."""
    entries = json.load(open(path))
    label_of = [{'D%d-P%d' % (i + 1, k + 1): lbl for k, lbl in enumerate(labels)}
                for i, (_, labels) in enumerate(dims)]
    people = []
    for e in entries:
        codes = e['codes']
        people.append([label_of[i].get(codes.get('D%d' % (i + 1)), NOT_SPEC)
                       for i in range(9)])
    return people


def stack_order(people, dims):
    """Slot index of every concept in every column.

    Column 0 is sorted by the whole nine-code tuple, so concepts that agree on
    the early dimensions start out adjacent. Every later column keeps the
    canonical node order and, inside a node, the order of the column before it:
    the standard one-sweep crossing-reduction rule, so no two ribbons entering
    the same node ever cross.
    """
    node_rank = [{c: i for i, c in enumerate(labels + [NOT_SPEC])}
                 for _, labels in dims]
    n = len(people)

    first = sorted(range(n), key=lambda p: tuple(
        node_rank[c].get(people[p][c], 99) for c in range(9)))
    slots = [{p: rank for rank, p in enumerate(first)}]

    for col in range(1, 9):
        prev, here = slots[col - 1], {}
        rank = 0
        for code in sorted({people[p][col] for p in range(n)},
                           key=lambda c: node_rank[col].get(c, 99)):
            for p in sorted((p for p in range(n) if people[p][col] == code),
                            key=lambda p: prev[p]):
                here[p] = rank
                rank += 1
        slots.append(here)
    return slots


def wrap(label, count):
    """Label plus its count, broken into lines short enough not to reach the
    next column. Long codes ("Subjective Personal Data") are the reason."""
    words, lines, line = ('%s %d' % (label, count)).split(), [], ''
    for w in words:
        if line and len(line) + 1 + len(w) > WRAP:
            lines.append(line)
            line = w
        else:
            line = (line + ' ' + w).strip()
    lines.append(line)
    return lines


def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def render(people, dims, width=2200, height=1560):
    n = len(people)
    pad = FONT * 2
    rpad = FONT * 10                      # room for the last column's labels
    node_w = 14
    line_h = FONT * 1.16
    slots = stack_order(people, dims)

    node_rank = [{c: i for i, c in enumerate(labels + [NOT_SPEC])}
                 for _, labels in dims]
    columns = []                          # per column: ordered [(code, count)]
    for col in range(9):
        counts = {}
        for p in range(n):
            counts[people[p][col]] = counts.get(people[p][col], 0) + 1
        columns.append(sorted(counts.items(),
                              key=lambda kv: node_rank[col].get(kv[0], 99)))

    # A node's label sits above it, so the gap between two nodes has to hold the
    # tallest label in that column.
    gap = max(len(wrap(code, cnt)) for col in columns for code, cnt in col) \
        * line_h + FONT * 1.1

    top = pad + FONT * 11.4
    bottom = pad + FONT * 1.6
    usable = height - top - bottom
    widest = max(len(c) for c in columns)
    unit = (usable - gap * (widest - 1)) / n
    step = (width - pad - rpad - node_w) / 8
    col_x = [pad + i * step for i in range(9)]

    # Vertical geometry: node tops, then the y of each concept's band.
    node_top, band_y = [], [dict() for _ in range(9)]
    for col in range(9):
        stack_h = n * unit + gap * (len(columns[col]) - 1)
        y = top + (usable - stack_h) / 2
        tops = {}
        for code, cnt in columns[col]:
            tops[code] = y
            y += cnt * unit + gap
        node_top.append(tops)
        base = dict(tops)
        for p in sorted(range(n), key=lambda p: slots[col][p]):
            code = people[p][col]
            band_y[col][p] = base[code]
            base[code] += unit

    out = ['<rect width="%d" height="%d" fill="#ffffff"/>' % (width, height)]
    out.append('<text x="%d" y="%.0f" font-family="Helvetica" font-size="%.0f"'
               ' font-weight="800" fill="%s">Every concept across the nine'
               ' dimensions</text>' % (pad, pad + FONT * 1.5, FONT * 1.6, INK))
    out.append('<text x="%d" y="%.0f" font-family="Helvetica" font-size="%.0f"'
               ' fill="%s">One band per concept in the library, followed from'
               ' the form it takes to the circle it is shared with.</text>'
               % (pad, pad + FONT * 3.2, FONT * 0.95, MUTED))
    out.append('<text x="%d" y="%.0f" font-family="Helvetica" font-size="%.0f"'
               ' fill="%s">Band colour is the Form code and never changes, so a'
               ' single concept can be followed the whole way across.</text>'
               % (pad, pad + FONT * 4.6, FONT * 0.95, MUTED))

    lx = pad
    for code in ('Intangible', 'Keepsake', 'Body'):
        out.append('<rect x="%.0f" y="%.0f" width="%.0f" height="%.0f" rx="3"'
                   ' fill="%s"/>' % (lx, pad + FONT * 5.4, FONT * 0.8,
                                     FONT * 0.8, FORM_COLOUR[code]))
        out.append('<text x="%.0f" y="%.0f" font-family="Helvetica"'
                   ' font-size="%.0f" fill="%s">%s</text>'
                   % (lx + FONT * 1.2, pad + FONT * 6.1, FONT * 0.95, INK, code))
        lx += FONT * 2.2 + len(code) * FONT * 0.55

    for col, (title, _) in enumerate(dims):
        out.append('<text x="%.1f" y="%.0f" font-family="Helvetica"'
                   ' font-size="%.0f" font-weight="700" fill="%s">%s</text>'
                   % (col_x[col], top - FONT * 2.4, FONT * 1.05, INK, esc(title)))

    # Bands. Drawn column pair by column pair; each concept keeps one path per
    # gap, at unit height, in one colour.
    for col in range(8):
        x0 = col_x[col] + node_w
        x1 = col_x[col + 1]
        mx = (x0 + x1) / 2
        for p in sorted(range(n), key=lambda p: slots[col][p]):
            y0, y1 = band_y[col][p], band_y[col + 1][p]
            h = unit + 0.35          # hairline overlap so a run reads as one ribbon
            c = FORM_COLOUR.get(people[p][0], FORM_COLOUR[NOT_SPEC])
            out.append('<path d="M %.1f %.2f C %.1f %.2f %.1f %.2f %.1f %.2f '
                       'L %.1f %.2f C %.1f %.2f %.1f %.2f %.1f %.2f Z"'
                       ' fill="%s" fill-opacity="0.62"/>'
                       % (x0, y0, mx, y0, mx, y1, x1, y1,
                          x1, y1 + h, mx, y1 + h, mx, y0 + h, x0, y0 + h, c))

    for col in range(9):
        for code, cnt in columns[col]:
            y = node_top[col][code]
            h = cnt * unit
            out.append('<rect x="%.1f" y="%.2f" width="%d" height="%.2f" rx="2"'
                       ' fill="%s"/>' % (col_x[col], y, node_w, h, INK))
            # Labels sit over the ribbons, so each gets a white plate first.
            lines = wrap(code, cnt)
            plate_w = max(len(l) for l in lines) * FONT * 0.58 + FONT * 0.5
            plate_h = len(lines) * line_h + FONT * 0.25
            plate_y = y - plate_h - FONT * 0.35
            out.append('<rect x="%.1f" y="%.2f" width="%.1f" height="%.1f"'
                       ' rx="4" fill="#ffffff" fill-opacity="0.88"/>'
                       % (col_x[col] - FONT * 0.2, plate_y, plate_w, plate_h))
            for i, line in enumerate(lines):
                head, _, tail = line.rpartition(' ')
                # only the final line carries the count, in the muted colour
                last = i == len(lines) - 1
                text = ('<tspan font-weight="600">%s</tspan>'
                        '<tspan fill="%s"> %s</tspan>' % (esc(head), MUTED, tail)
                        if last and head else
                        '<tspan font-weight="600">%s</tspan>' % esc(line))
                out.append('<text x="%.1f" y="%.2f" font-family="Helvetica"'
                           ' font-size="%.0f" fill="%s">%s</text>'
                           % (col_x[col], plate_y + (i + 1) * line_h, FONT,
                              INK, text))

    out.append('<text x="%d" y="%.0f" font-family="Helvetica" font-size="%.0f"'
               ' fill="%s">Not specified means that dimension was left'
               ' open.</text>' % (pad, height - FONT * 0.9, FONT * 0.8, MUTED))

    return ('<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d"'
            ' viewBox="0 0 %d %d">%s</svg>'
            % (width, height, width, height, '\n'.join(out)))


if __name__ == '__main__':
    out_path = (sys.argv[1] if len(sys.argv) > 1
                else os.path.join(ROOT, 'public', 'figures',
                                  'sankey-own-all-dimensions.svg'))
    dims = read_design_space(os.path.join(ROOT, 'lib', 'designSpace.ts'))
    people = read_concepts(os.path.join(ROOT, 'lib', 'surveyGallery.json'), dims)
    open(out_path, 'w').write(render(people, dims))

    # Assertions the picture must satisfy, printed so a reader can check them.
    for col, (title, _) in enumerate(dims):
        counts = {}
        for p in people:
            counts[p[col]] = counts.get(p[col], 0) + 1
        assert sum(counts.values()) == len(people), (title, counts)
        print('%-22s %3d  %s' % (title, sum(counts.values()),
                                 ', '.join('%s %d' % kv for kv in counts.items())))
    print('\n%d concepts, 9 columns, %d bands drawn -> %s'
          % (len(people), len(people) * 8, out_path))
