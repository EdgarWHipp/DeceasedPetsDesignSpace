"""Minimal Sankey renderer: stacked node columns with cubic ribbons between them.

No external libraries. Flows are given as (source, target, value) per stage; node
heights are proportional to the traffic through them, so the picture cannot
disagree with the numbers it was built from.

Every node is keyed by (column, label), not by label alone. That matters: an
earlier version of this file kept one flat dict per label, so a label appearing
in two columns silently inherited the other column's y and its ribbons were
drawn leaving the wrong node. Colours are likewise per column, and no two nodes
in one column may share one, because a ribbon takes its source node's colour.
"""

INK, MUTED = "#252827", "#5C6663"
FALLBACK = ["#009682", "#4664AA", "#8f6228", "#635488", "#7FCAC0",
            "#A2B0D6", "#C89A5C", "#A594C4", "#1B4A44", "#7A7A7A"]


def _order(stages):
    cols = []
    for i, st in enumerate(stages):
        if i == 0:
            cols.append(list(dict.fromkeys(s for s, _, _ in st)))
        cols.append(list(dict.fromkeys(t for _, t, _ in st)))
    return cols


def render(stages, width=1500, height=820, pad=54, node_w=20, gap=13,
           label_pad=180, colours=None, font=14,
           title=None, subtitle=None, col_titles=None, value_suffix=""):
    cols = _order(stages)

    totals = []
    for ci, names in enumerate(cols):
        t = {}
        for n in names:
            out_ = sum(v for s, _, v in stages[ci] if s == n) if ci < len(stages) else 0
            in_ = sum(v for _, tt, v in stages[ci - 1] if tt == n) if ci > 0 else 0
            t[n] = max(out_, in_)
        totals.append(t)

    # Colour per (column, node). Assigned within the column so a column can never
    # contain the same fill twice; callers may override any entry.
    colour = {}
    for ci, names in enumerate(cols):
        for k, n in enumerate(names):
            colour[(ci, n)] = FALLBACK[k % len(FALLBACK)]
    for key, hexval in (colours or {}).items():
        colour[key] = hexval
    for ci, names in enumerate(cols):
        used = [colour[(ci, n)] for n in names]
        if len(set(used)) != len(used):
            raise ValueError("column %d reuses a colour: %s" % (ci, used))

    # Type scales with `font`, and so does the header block it has to clear:
    # the figure is read at whatever size a page or a slide gives it.
    top = pad + (font * 8.2 if title else 0)
    usable = height - top - pad - font * 1.6
    scale = min((usable - gap * (len(c) - 1)) / max(sum(totals[i].values()), 1)
                for i, c in enumerate(cols))

    ci_x = lambda ci: pad + label_pad + ci * (
        (width - 2 * (pad + label_pad) - node_w) / (len(cols) - 1))
    geo = []
    for ci, names in enumerate(cols):
        y = top + (usable - (sum(totals[ci].values()) * scale
                             + gap * (len(names) - 1))) / 2
        d = {}
        for n in names:
            h = totals[ci][n] * scale
            d[n] = [ci_x(ci), y, h]
            y += h + gap
        geo.append(d)

    out = ['<rect width="%d" height="%d" fill="#ffffff"/>' % (width, height)]
    if title:
        out.append('<text x="%d" y="%.0f" font-family="Helvetica" font-size="%.0f"'
                   ' font-weight="800" fill="%s">%s</text>'
                   % (pad, pad + font * 1.5, font * 1.6, INK, title))
    if subtitle:
        for i, line in enumerate(subtitle if isinstance(subtitle, list) else [subtitle]):
            out.append('<text x="%d" y="%.0f" font-family="Helvetica"'
                       ' font-size="%.0f" fill="%s">%s</text>'
                       % (pad, pad + font * 3.2 + i * font * 1.4, font * 0.95,
                          MUTED, line))
    if col_titles:
        for ci, ct in enumerate(col_titles):
            anchor = 'start' if ci == 0 else ('end' if ci == len(cols) - 1 else 'middle')
            x = ci_x(ci) + (0 if ci == 0 else
                            (node_w if ci == len(cols) - 1 else node_w / 2))
            out.append('<text x="%d" y="%.0f" font-family="Helvetica"'
                       ' font-size="%.0f" font-weight="700" fill="%s"'
                       ' text-anchor="%s">%s</text>'
                       % (x, top - font, font * 1.05, MUTED, anchor, ct))

    # Ribbon stacking cursors, one per (column, node) face.
    cursor_out = {(ci, n): d[n][1] for ci, d in enumerate(geo) for n in d}
    cursor_in = dict(cursor_out)
    for ci, st in enumerate(stages):
        for s, t, v in sorted(st, key=lambda f: -f[2]):
            x0 = geo[ci][s][0] + node_w
            x1 = geo[ci + 1][t][0]
            h = v * scale
            y0, y1 = cursor_out[(ci, s)], cursor_in[(ci + 1, t)]
            mx = (x0 + x1) / 2
            out.append('<path d="M %.1f %.1f C %.1f %.1f %.1f %.1f %.1f %.1f '
                       'L %.1f %.1f C %.1f %.1f %.1f %.1f %.1f %.1f Z" fill="%s"'
                       ' fill-opacity="0.42"/>'
                       % (x0, y0, mx, y0, mx, y1, x1, y1,
                          x1, y1 + h, mx, y1 + h, mx, y0 + h, x0, y0 + h,
                          colour[(ci, s)]))
            cursor_out[(ci, s)] = y0 + h
            cursor_in[(ci + 1, t)] = y1 + h

    for ci, d in enumerate(geo):
        for n, (x, y, h) in d.items():
            out.append('<rect x="%.1f" y="%.1f" width="%d" height="%.1f" rx="3"'
                       ' fill="%s"/>' % (x, y, node_w, h, colour[(ci, n)]))
            lbl = '%s  %d%s' % (n, round(totals[ci][n]), value_suffix)
            if ci == len(geo) - 1:
                out.append('<text x="%.1f" y="%.1f" font-family="Helvetica"'
                           ' font-size="%.0f" fill="%s">%s</text>'
                           % (x + node_w + font * 0.6, y + h / 2 + font * 0.36,
                              font, INK, lbl))
            else:
                out.append('<text x="%.1f" y="%.1f" font-family="Helvetica"'
                           ' font-size="%.0f" fill="%s" text-anchor="end">%s</text>'
                           % (x - font * 0.6, y + h / 2 + font * 0.36, font,
                              INK, lbl))
    return ('<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" '
            'viewBox="0 0 %d %d">%s</svg>' % (width, height, width, height, "\n".join(out)))
