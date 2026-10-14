# Light and dark color lookup

This is the fixed starting table for choosing a dark value from an existing light value in `26-10`. It is a documented design recommendation, not a claim that every reference declaration uses this pair. It does not redefine palette variables or authorize a bulk replacement. Use the existing semantic variable directly when it already owns the theme values.

Each row reads as `light-dark(light-mode value, dark-mode value)`. Choose the row by the light value first. The component role exceptions below take precedence.

## Neutral colors

White defaults to a component surface. Black defaults to a light foreground. Gray50–300 describe neutral fills and borders; Gray400–900 describe foregrounds. Deliberately deep shades 1000–1300 keep their identity.

| Light mode | Dark mode |
|---|---|
| `var(--White)` | `var(--Gray1200)` |
| `var(--Black)` | `var(--White)` |
| `var(--Gray50)` | `var(--Gray1100)` |
| `var(--Gray100)` | `var(--Gray1000)` |
| `var(--Gray150)` | `var(--Gray900)` |
| `var(--Gray200)` | `var(--Gray800)` |
| `var(--Gray300)` | `var(--Gray700)` |
| `var(--Gray400)` | `var(--Gray400)` |
| `var(--Gray500)` | `var(--Gray400)` |
| `var(--Gray600)` | `var(--Gray400)` |
| `var(--Gray700)` | `var(--Gray300)` |
| `var(--Gray800)` | `var(--Gray200)` |
| `var(--Gray900)` | `var(--Gray200)` |
| `var(--Gray1000)` | `var(--Gray1000)` |
| `var(--Gray1100)` | `var(--Gray1100)` |
| `var(--Gray1200)` | `var(--Gray1200)` |
| `var(--Gray1300)` | `var(--Gray1300)` |

## Color families

For Blue, Red, Orange, Yellow, Green, Sky, Purple, and Pink: shades 50–300 default to colored fills or borders, shades 400–900 to visible accents or foregrounds, and shades 1000–1300 to deliberately deep colored fills. A shade used in another role needs the corresponding component exception. These defaults preserve the family; they do not require every status surface to become dark.

### Blue

| Light mode | Dark mode |
|---|---|
| `var(--Blue50)` | `var(--Blue1300)` |
| `var(--Blue100)` | `var(--Blue1200)` |
| `var(--Blue200)` | `var(--Blue1000)` |
| `var(--Blue300)` | `var(--Blue900)` |
| `var(--Blue400)` | `var(--Blue400)` |
| `var(--Blue500)` | `var(--Blue300)` |
| `var(--Blue600)` | `var(--Blue300)` |
| `var(--Blue700)` | `var(--Blue200)` |
| `var(--Blue800)` | `var(--Blue100)` |
| `var(--Blue900)` | `var(--Blue100)` |
| `var(--Blue1000)` | `var(--Blue1000)` |
| `var(--Blue1100)` | `var(--Blue1100)` |
| `var(--Blue1200)` | `var(--Blue1200)` |
| `var(--Blue1300)` | `var(--Blue1300)` |

### Red

| Light mode | Dark mode |
|---|---|
| `var(--Red50)` | `var(--Red1300)` |
| `var(--Red100)` | `var(--Red1200)` |
| `var(--Red200)` | `var(--Red1000)` |
| `var(--Red300)` | `var(--Red900)` |
| `var(--Red400)` | `var(--Red400)` |
| `var(--Red500)` | `var(--Red300)` |
| `var(--Red600)` | `var(--Red300)` |
| `var(--Red700)` | `var(--Red200)` |
| `var(--Red800)` | `var(--Red100)` |
| `var(--Red900)` | `var(--Red100)` |
| `var(--Red1000)` | `var(--Red1000)` |
| `var(--Red1100)` | `var(--Red1100)` |
| `var(--Red1200)` | `var(--Red1200)` |
| `var(--Red1300)` | `var(--Red1300)` |

### Orange

| Light mode | Dark mode |
|---|---|
| `var(--Orange50)` | `var(--Orange1300)` |
| `var(--Orange100)` | `var(--Orange1200)` |
| `var(--Orange200)` | `var(--Orange1000)` |
| `var(--Orange300)` | `var(--Orange900)` |
| `var(--Orange400)` | `var(--Orange400)` |
| `var(--Orange500)` | `var(--Orange300)` |
| `var(--Orange600)` | `var(--Orange300)` |
| `var(--Orange700)` | `var(--Orange200)` |
| `var(--Orange800)` | `var(--Orange100)` |
| `var(--Orange900)` | `var(--Orange100)` |
| `var(--Orange1000)` | `var(--Orange1000)` |
| `var(--Orange1100)` | `var(--Orange1100)` |
| `var(--Orange1200)` | `var(--Orange1200)` |
| `var(--Orange1300)` | `var(--Orange1300)` |

### Yellow

| Light mode | Dark mode |
|---|---|
| `var(--Yellow50)` | `var(--Yellow1300)` |
| `var(--Yellow100)` | `var(--Yellow1200)` |
| `var(--Yellow200)` | `var(--Yellow1000)` |
| `var(--Yellow300)` | `var(--Yellow900)` |
| `var(--Yellow400)` | `var(--Yellow400)` |
| `var(--Yellow500)` | `var(--Yellow300)` |
| `var(--Yellow600)` | `var(--Yellow300)` |
| `var(--Yellow700)` | `var(--Yellow200)` |
| `var(--Yellow800)` | `var(--Yellow100)` |
| `var(--Yellow900)` | `var(--Yellow100)` |
| `var(--Yellow1000)` | `var(--Yellow1000)` |
| `var(--Yellow1100)` | `var(--Yellow1100)` |
| `var(--Yellow1200)` | `var(--Yellow1200)` |
| `var(--Yellow1300)` | `var(--Yellow1300)` |

### Green

| Light mode | Dark mode |
|---|---|
| `var(--Green50)` | `var(--Green1300)` |
| `var(--Green100)` | `var(--Green1200)` |
| `var(--Green200)` | `var(--Green1000)` |
| `var(--Green300)` | `var(--Green900)` |
| `var(--Green400)` | `var(--Green400)` |
| `var(--Green500)` | `var(--Green300)` |
| `var(--Green600)` | `var(--Green300)` |
| `var(--Green700)` | `var(--Green200)` |
| `var(--Green800)` | `var(--Green100)` |
| `var(--Green900)` | `var(--Green100)` |
| `var(--Green1000)` | `var(--Green1000)` |
| `var(--Green1100)` | `var(--Green1100)` |
| `var(--Green1200)` | `var(--Green1200)` |
| `var(--Green1300)` | `var(--Green1300)` |

### Sky

| Light mode | Dark mode |
|---|---|
| `var(--Sky50)` | `var(--Sky1300)` |
| `var(--Sky100)` | `var(--Sky1200)` |
| `var(--Sky200)` | `var(--Sky1000)` |
| `var(--Sky300)` | `var(--Sky900)` |
| `var(--Sky400)` | `var(--Sky400)` |
| `var(--Sky500)` | `var(--Sky300)` |
| `var(--Sky600)` | `var(--Sky300)` |
| `var(--Sky700)` | `var(--Sky200)` |
| `var(--Sky800)` | `var(--Sky100)` |
| `var(--Sky900)` | `var(--Sky100)` |
| `var(--Sky1000)` | `var(--Sky1000)` |
| `var(--Sky1100)` | `var(--Sky1100)` |
| `var(--Sky1200)` | `var(--Sky1200)` |
| `var(--Sky1300)` | `var(--Sky1300)` |

### Purple

| Light mode | Dark mode |
|---|---|
| `var(--Purple50)` | `var(--Purple1300)` |
| `var(--Purple100)` | `var(--Purple1200)` |
| `var(--Purple200)` | `var(--Purple1000)` |
| `var(--Purple300)` | `var(--Purple900)` |
| `var(--Purple400)` | `var(--Purple400)` |
| `var(--Purple500)` | `var(--Purple300)` |
| `var(--Purple600)` | `var(--Purple300)` |
| `var(--Purple700)` | `var(--Purple200)` |
| `var(--Purple800)` | `var(--Purple100)` |
| `var(--Purple900)` | `var(--Purple100)` |
| `var(--Purple1000)` | `var(--Purple1000)` |
| `var(--Purple1100)` | `var(--Purple1100)` |
| `var(--Purple1200)` | `var(--Purple1200)` |
| `var(--Purple1300)` | `var(--Purple1300)` |

### Pink

| Light mode | Dark mode |
|---|---|
| `var(--Pink50)` | `var(--Pink1300)` |
| `var(--Pink100)` | `var(--Pink1200)` |
| `var(--Pink200)` | `var(--Pink1000)` |
| `var(--Pink300)` | `var(--Pink900)` |
| `var(--Pink400)` | `var(--Pink400)` |
| `var(--Pink500)` | `var(--Pink300)` |
| `var(--Pink600)` | `var(--Pink300)` |
| `var(--Pink700)` | `var(--Pink200)` |
| `var(--Pink800)` | `var(--Pink100)` |
| `var(--Pink900)` | `var(--Pink100)` |
| `var(--Pink1000)` | `var(--Pink1000)` |
| `var(--Pink1100)` | `var(--Pink1100)` |
| `var(--Pink1200)` | `var(--Pink1200)` |
| `var(--Pink1300)` | `var(--Pink1300)` |

## Editable primary colors

Primary50–300 below describe ordinary interaction surfaces: they become neutral. Primary400–900 describe accents that remain primary. Deep Primary shades retain their identity. Selected controls, colored emphasis, and keyboard focus require their own accent pairing when the neutral default would remove meaning.

| Light mode | Dark mode |
|---|---|
| `var(--Sa-Color-Primary50)` | `var(--Gray1000)` |
| `var(--Sa-Color-Primary100)` | `var(--Gray900)` |
| `var(--Sa-Color-Primary200)` | `var(--Gray800)` |
| `var(--Sa-Color-Primary300)` | `var(--Gray700)` |
| `var(--Sa-Color-Primary400)` | `var(--Sa-Color-Primary400)` |
| `var(--Sa-Color-Primary500)` | `var(--Sa-Color-Primary300)` |
| `var(--Sa-Color-Primary600)` | `var(--Sa-Color-Primary300)` |
| `var(--Sa-Color-Primary700)` | `var(--Sa-Color-Primary200)` |
| `var(--Sa-Color-Primary800)` | `var(--Sa-Color-Primary100)` |
| `var(--Sa-Color-Primary900)` | `var(--Sa-Color-Primary100)` |
| `var(--Sa-Color-Primary1000)` | `var(--Sa-Color-Primary1000)` |
| `var(--Sa-Color-Primary1100)` | `var(--Sa-Color-Primary1100)` |
| `var(--Sa-Color-Primary1200)` | `var(--Sa-Color-Primary1200)` |
| `var(--Sa-Color-Primary1300)` | `var(--Sa-Color-Primary1300)` |

## Component role exceptions

- **Canvas and surfaces:** White used for the canvas becomes Gray1300; White used for a component surface becomes Gray1200. Prefer `--Sa-Color-Background` and `--Sa-Color-Surface` directly. Active tabs and signature containers use Surface when they belong to that layer.
- **Control parts and inverted foregrounds:** a toggle knob stays White. White text on a saturated primary button also stays White. Black in an intentional dark asset or shadow stays Black; it is not ordinary text. Chart outlines can use Surface.
- **State progression:** a Gray1200 surface can hover at Gray1000 and press at Gray900. A pill resting on Gray1000 instead hovers at Gray900 and presses at Gray800. A scrollbar thumb progresses Gray700 → Gray600 → Gray500 in dark mode.
- **Status and data colors:** vivid alert patterns and data swatches may retain their colors. Password strength uses Red600, Orange400, Yellow200, and Green400 in dark mode. A bright warning background needs a dark foreground, such as Yellow1300. Do not apply the pale-fill defaults to these indicators.
- **Error alerts:** the implemented error header pairs Red100 with Red700 and Red600 with Red200. Review foreground and background together rather than selecting either row in isolation.
- **Primary accents and focus:** use editable Primary shades throughout. The default table must not convert a selected control or focus indicator to neutral merely because its light shade is 50–300. Ordinary interactive labels often become White on hover and press.
- **Semantic variables:** retain existing role and state variables, including externally supplied brightness variants. Review a semantic-variable/palette pairing before bypassing an editable dark value. Shared enabled/disabled variables can need a local state override.
- **Transparency:** retain the role’s opacity. Dark shadows typically use Black at 80–90%; modal overlays use Black at 80%, with Gray900 at 20% in light mode. A resize handle can retain 6% opacity. Use `color-mix(in oklch, …, transparent)` for these roles.
- **Derived accents:** prefer a direct variable. Use a mix only where justified, such as 15% of an editable feature color mixed into Surface. Do not mix merely to approximate every old hex value.
- **Verification:** these rows do not guarantee contrast. Check actual foreground/background pairs, all interaction states, and externally supplied values in both themes. Preserve approved light values and keep DiffView outside this conversion scope.
