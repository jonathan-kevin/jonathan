"""Extract separate Softadmin light/dark HTML tables as paired CSS variables.

Uses only the Python standard library. Hex values become real palette
var() references by OKLab distance. Distant matches are applied and reported.
Supplied semantic aliases stay aliases.
"""
import argparse
import csv
import io
import math
import re
import sys
from html.parser import HTMLParser
from pathlib import Path


# Accepted recommendations for these specific captured favorite-state colors.
# Do not force them onto unrelated future values or palettes missing the shade.
STATE_RECOMMENDATIONS = {
    "FavoriteActive": ("#f2c253", "Yellow300"),
    "FavoriteCheckedHover": ("#f2c253", "Yellow300"),
    "FavoriteCheckedActive": ("#e4b751", "Yellow400"),
}


def hex_color(value):
    value = value.strip().lower()
    if re.fullmatch(r"#[0-9a-f]{3}", value):
        return "#" + "".join(c * 2 for c in value[1:])
    if re.fullmatch(r"#[0-9a-f]{6}", value):
        return value
    raise ValueError(f"Expected an opaque hex color: {value!r}")


class ThemeTable(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.rows = {}
        self.group = ""
        self.kind = None
        self.cells = []
        self.cell = None
        self.header_text = []
        self.variable_id = ""

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        classes = attrs.get("class", "").split()
        if tag == "tr":
            self.kind = "header" if "saGridGroupedRowsHeader" in classes else "row" if "saGridRow" in classes else None
            self.cells, self.header_text, self.variable_id = [], [], ""
        if self.kind == "row":
            if tag == "td":
                self.cell = None if "saGridRowControls" in classes else []
            match = re.search(r"\bCssVariableId=(\d+)", attrs.get("data-tooltip", ""))
            if match:
                self.variable_id = match[1]

    def handle_data(self, text):
        if self.kind == "header":
            self.header_text.append(text)
        elif self.kind == "row" and self.cell is not None:
            self.cell.append(text)

    def handle_endtag(self, tag):
        if tag == "td" and self.cell is not None:
            self.cells.append("".join(self.cell).strip())
            self.cell = None
        if tag != "tr":
            return
        if self.kind == "header":
            self.group = "".join(self.header_text).strip()
        elif self.kind == "row":
            if len(self.cells) < 2:
                raise ValueError("Theme row has fewer than two value cells.")
            name = re.sub(r"^--Sa-Color-", "", self.cells[0])
            if not re.fullmatch(r"[A-Za-z][\w-]*", name):
                raise ValueError(f"Invalid variable name: {name!r}")
            row = {"hex": hex_color(self.cells[1]), "group": self.group, "id": self.variable_id}
            if name in self.rows and self.rows[name] != row:
                raise ValueError(f"Conflicting duplicate variable: {name}")
            self.rows[name] = row
        self.kind = None


def read_theme(path):
    parser = ThemeTable()
    parser.feed(path.read_text(encoding="utf-8-sig"))
    parser.close()
    if not parser.rows:
        raise ValueError(f"No saGridRow theme rows found in {path}")
    return parser.rows


def read_palette(path):
    text = path.read_text(encoding="utf-8-sig")
    if text.lstrip().startswith("ColorsLessColor"):
        palette = {row["ColorsLessColor"]: hex_color(row["ColorsLessHex"])
                   for row in csv.DictReader(io.StringIO(text))}
        palette.setdefault("White", "#ffffff")
        palette.setdefault("Black", "#000000")
    else:
        # Restrict to fixed palette shades; semantic variables are theme-dependent.
        palette = {name: hex_color(value) for name, value in re.findall(
            r"(?:--|@Color)([A-Za-z][\w-]*)\s*:\s*(#[\da-f]{6}|#[\da-f]{3})\s*;", text, re.I)
            if re.fullmatch(r"(?:White|Black|(?:Gray|Blue|Red|Orange|Yellow|Green|Sky|Purple|Pink)\d+)", name)}
    if not palette:
        raise ValueError(f"No fixed palette shades found in {path}")
    return palette


def oklab(hex_value):
    rgb = [int(hex_value[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    r, g, b = [s / 12.92 if s <= 0.04045 else ((s + 0.055) / 1.055) ** 2.4 for s in rgb]
    l = (0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b) ** (1 / 3)
    m = (0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b) ** (1 / 3)
    s = (0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b) ** (1 / 3)
    return (0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
            1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
            0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s)


def nearest(value, palette, max_delta=0.02):
    if not math.isfinite(max_delta) or not 0 <= max_delta <= 1:
        raise ValueError("Maximum OKLab distance must be finite and between 0 and 1.")
    value = hex_color(value)
    target = oklab(value)
    ranked = sorted((math.dist(target, oklab(color)), name, color) for name, color in palette.items())
    distance, name, color = ranked[0]
    ties = [n for d, n, _ in ranked if abs(d - distance) < 1e-10]
    # Alphabetical tie-breaking is deterministic; list all ties in the report.
    close = distance <= max_delta
    css = f"var(--{name})"
    return {"name": name, "hex": color, "distance": distance, "exact": color == value, "ties": ties, "css": css, "close": close}


def extract(light_path, dark_path, palette_path, output_path, keep_hex=False, max_delta=0.02):
    light, dark, palette = read_theme(light_path), read_theme(dark_path), read_palette(palette_path)
    aliases = dict(re.findall(r"(--Sa-Color-[\w-]+)\s*:\s*(var\(--Sa-Color-[\w-]+\))\s*;",
                              palette_path.read_text(encoding="utf-8-sig")))
    if light.keys() != dark.keys():
        raise ValueError(f"Unpaired variables. Missing dark: {sorted(light.keys() - dark.keys())}; missing light: {sorted(dark.keys() - light.keys())}")
    lines = ["/* Extracted theme colors. Requires the supplied fixed palette to be loaded.",
             " * " + ("Exact, unambiguous matches use palette variables; other values retain their original hex."
                       if keep_hex else f"Recommended palette matches are applied; distances over {max_delta:g} are reported."),
             " * Supplied semantic aliases take precedence over captured values.",
             " * Original hex values, closest shades and distances are in theme-color-matches.csv.",
             " * Load after existing theme variable definitions to apply these captured values.",
             " */", ":root {"]
    if aliases:
        lines.extend(["", "\t/* Supplied semantic aliases */"])
        lines.extend(f"\t{name}: {value};" for name, value in aliases.items())
    records = []
    group = None
    for name, l in light.items():
        d = dark[name]
        if l["id"] and d["id"] and l["id"] != d["id"]:
            raise ValueError(f"Variable ID differs between themes: {name}")
        if l["group"] != group:
            group = l["group"]
            lines.extend(["", f"\t/* {group.replace('*/', '* /')} */"])
        lm, dm = nearest(l["hex"], palette, max_delta), nearest(d["hex"], palette, max_delta)
        for row, match in [(l, lm), (d, dm)]:
            selected = match["name"]
            recommendation = STATE_RECOMMENDATIONS.get(name)
            if not keep_hex and recommendation and row["hex"] == recommendation[0] and recommendation[1] in palette:
                selected = recommendation[1]
                match["css"] = f"var(--{selected})"
            match["selectedName"] = selected
            match["selectedHex"] = palette[selected]
        if keep_hex:
            for row, match in [(l, lm), (d, dm)]:
                if not match["exact"] or len(match["ties"]) > 1:
                    match["css"] = row["hex"]
        variable = f"--Sa-Color-{name}"
        paired_value = lm["css"] if lm["css"] == dm["css"] else f"light-dark({lm['css']}, {dm['css']})"
        expression = aliases.get(variable, paired_value)
        if variable not in aliases:
            lines.append(f"\t{variable}: {expression};")
        record = {"Variable": f"--Sa-Color-{name}", "Group": group}
        for theme, row, match in [("Light", l, lm), ("Dark", d, dm)]:
            record.update({f"{theme}Hex": row["hex"], f"{theme}ClosestVariable": f"--{match['name']}",
                           f"{theme}ClosestHex": match["hex"], f"{theme}Exact": match["exact"],
                           f"{theme}OklabDeltaE": f"{match['distance']:.6f}", f"{theme}Ties": " | ".join(match["ties"]),
                           f"{theme}MatchStatus": "Semantic alias" if variable in aliases else "Hex retained" if match["css"].startswith("#") else "State recommendation applied" if match["selectedName"] != match["name"] else "Distant match applied" if not match["close"] else "Exact" if match["exact"] else "Close",
                           f"{theme}AppliedVariable": "" if variable in aliases or match["css"].startswith("#") else "--" + match["selectedName"],
                           f"{theme}AppliedHex": "" if variable in aliases else row["hex"] if match["css"].startswith("#") else match["selectedHex"],
                           f"{theme}AppliedOklabDeltaE": "" if variable in aliases else "0.000000" if match["css"].startswith("#") else f"{math.dist(oklab(row['hex']), oklab(match['selectedHex'])):.6f}"})
        record.update({"OutputValue": expression, "SemanticAlias": variable in aliases})
        records.append(record)
    lines.extend(["}", ""])
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text("\n".join(lines), encoding="utf-8")
    csv_path = output_path.with_name("theme-color-matches.csv")
    with csv_path.open("w", encoding="utf-8-sig", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=list(records[0]))
        writer.writeheader()
        writer.writerows(records)
    return records


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--light", type=Path, help="Light theme table HTML or pasted text")
    parser.add_argument("--dark", type=Path, help="Dark theme table HTML or pasted text")
    bundled = Path(__file__).resolve().parent.parent / "references" / "palette.css"
    default_palette = bundled if bundled.exists() else Path(__file__).resolve().with_name("color-extractor-palette.css")
    parser.add_argument("--palette", type=Path, default=default_palette, help="Fixed palette CSS, Colors.less or ColorsLessColor CSV")
    parser.add_argument("--hex", action="append", help="Print the closest real variable for a hex; repeat for multiple colors")
    parser.add_argument("--keep-hex", action="store_true", help="Retain approximate hex values instead of substituting nearest shades")
    parser.add_argument("--max-delta", type=float, default=0.02, help="OKLab distance above which an applied match is reported (default: 0.02)")
    parser.add_argument("--output", type=Path, default=Path("theme-colors.css"))
    args = parser.parse_args()
    try:
        if not math.isfinite(args.max_delta) or not 0 <= args.max_delta <= 1:
            raise ValueError("Maximum OKLab distance must be finite and between 0 and 1.")
        if args.hex:
            palette = read_palette(args.palette)
            for value in args.hex:
                match = nearest(value, palette, args.max_delta)
                if match["close"]:
                    print(f"{hex_color(value)} -> {match['css']} ({match['hex']}; OKLab delta E {match['distance']:.6f})")
                else:
                    print(f"NO CLOSE MATCH: {hex_color(value)}. Applied recommended match: var(--{match['name']}) = {match['hex']}; delta E {match['distance']:.6f} exceeds {args.max_delta:g}.", file=sys.stderr)
                    print(match['css'])
        if not args.light and not args.dark and args.hex:
            parser.exit(0)
        if not args.light or not args.dark:
            parser.error("Provide both --light and --dark, or use --hex.")
        records = extract(args.light, args.dark, args.palette, args.output, keep_hex=args.keep_hex, max_delta=args.max_delta)
    except (ValueError, OSError) as error:
        parser.exit(1, f"Error: {error}\n")
    print(f"Extracted {len(records)} paired CSS variables to {args.output}")
    print(f"Nearest palette matches: {args.output.with_name('theme-color-matches.csv')}")
    reviews = {}
    for record in records:
        for theme in ["Light", "Dark"]:
            if record[theme + "MatchStatus"] in ["Distant match applied", "State recommendation applied"]:
                key = (record[theme + 'Hex'], record[theme + 'AppliedVariable'], record[theme + 'AppliedHex'], record[theme + 'AppliedOklabDeltaE'])
                reviews.setdefault(key, []).append(f"{record['Variable']} ({theme.lower()})")
    for (original, variable, matched, delta), uses in reviews.items():
        print(f"RECOMMENDED MATCH APPLIED: {original} -> var({variable}) = {matched}; applied delta E {delta}. Used by: {', '.join(uses)}.", file=sys.stderr)
