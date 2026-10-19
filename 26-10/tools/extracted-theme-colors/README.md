The supplied light and dark tables contain 104 paired variables. `theme-colors.css`
maps hex values to close real palette variables using OKLab distance.
The supplied semantic aliases remain direct references. The stylesheet requires
the fixed palette to be loaded and is not wired into the demo.
When both themes resolve to the same value, the output uses that value directly;
`light-dark()` is used only when the two resolved values differ.

`theme-color-matches.csv` lists the nearest palette variable for both themes,
including exactness, ties and Euclidean OKLab distance on a 0–1 scale. Approximate
matches are applied in the CSS by default; original values are retained in this
audit CSV. `OutputValue` records the generated expression, and `SemanticAlias`
identifies a supplied alias that takes precedence over the captured colors.
The reporting threshold is 0.02, configurable with `--max-delta`.
Distant recommendations are applied automatically and reported in chat,
without asking for approval. The CSV records the nearest candidate separately
from the applied variable. Successful conversions exit with code 0.
The accepted favorite-state choices are Yellow300 for FavoriteActive and
FavoriteCheckedHover (`#f2c253`), and Yellow400 for FavoriteCheckedActive
(`#e4b751`), keeping interaction states distinct.

To repeat the extraction from saved table HTML or pasted text, run from `26-10`:

```powershell
python tools/extract_theme_colors.py --light light.txt --dark dark.txt --output tools/extracted-theme-colors/theme-colors.css
```

The script uses only the Python standard library and defaults to
`tools/color-extractor-palette.css`, containing the user's palette and aliases.
It also accepts a CSS/LESS palette or the supplied
`ColorsLessColor` CSV as `--palette`, matching its `ColorsLessHex` column. It pairs
rows by variable name and rejects missing pairs, conflicting duplicates, invalid
colors and mismatched variable IDs. Use `--keep-hex` when exact color preservation
is requested, or `--hex '#111a25'` to match a standalone color.

The output contains only color variables. Theme selection and image filters
are handled by the application. Load the extraction after existing theme
variable definitions when you want to apply the captured values.
