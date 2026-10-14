# LESS conventions

## The styled component owns the rule

**Place a rule with the element it styles, not with the ancestor whose state triggers it.** The ancestor supplies the condition; the affected component owns the declarations.

- Keep a component's base styles, states, and context-dependent overrides together under that component's selector.
- When an ancestor's class, state, or layout changes a descendant component, nest the ancestor condition inside the affected component's block using `&`.
- Do not nest a separately named component's styling under its ancestor merely because that ancestor triggers the change.
- Use `.ancestor &` for ancestor conditions. For a component's own class selector, both `.modifier&` and `&.modifier` match a modifier class on the same element; prefer `.modifier&` here for consistency. There must be no space between `&` and the modifier for a same-element condition. The `&` is essential: omitting it changes which element the selector targets.
- This is a rule about ownership, not a ban on nesting. Component-internal structure may remain nested, but separately named components should own their own styles.
- Icons are an explicit exception: keep `.saIcon` styling and icon states nested under the parent component they belong to. Treat these icons as internal structure, not as standalone components; do not collect parent-specific icon rules in a separate `.saIcon` block.
- Preserve selector meaning, specificity, and cascade order when moving existing rules. Do not refactor unrelated styles unless requested.

Preferred:

```less
.saPillRemoveButton {
	transform: scale(0);

	.saChatContext li:is(:hover, :focus) & {
		transform: scale(1);
	}
}
```

Avoid:

```less
.saChatContext {
	li:is(:hover, :focus) .saPillRemoveButton {
		transform: scale(1);
	}
}
```

Before finishing a LESS change, ask: **If I want to understand this component's appearance and behavior, are its rules grouped under its own selector, or scattered through its ancestors?**

## Dark mode philosophy

Use [DARK_MODE_COLOR_LOOKUP.md](DARK_MODE_COLOR_LOOKUP.md) for the fixed light-first lookup covering every palette shade and editable Primary shade. Its component role exceptions take precedence; the table does not redefine the palette or replace checking the actual foreground/background pair.

Our dark mode philosophy is to preserve the existing light theme, build dark mode around neutral surfaces with clear visual separation, and use accent colors where they communicate meaning. Recreating it requires designing each component’s dark states, rather than reversing the palette.

For color-only work in `26-10`, use the implemented Softadmin LESS in `C:/inetpub/wwwroot/CssTemplate` as the current reference for color choices and state progression. The corresponding source is `//ms216/CssTemplate`; use the local copy when the share is unavailable. `../26-9/Presentation/CssTemplate` remains useful for the earlier conversion approach. Compare matching components and states in files present in both versions; exclude new components and unrelated version differences from color conclusions. Copy the color approach, not the file structure: do not add classes, move selectors, or change component hierarchy for a color-only update. Preserve existing light values unless a specific light-theme defect or palette substitution has been approved. Keep `DiffView.less` out of conversion work unless explicitly requested.

1. Extend the palette first.

   Replace the shade name `950` with `1000`, and introduce three additional shades—`1100`, `1200`, and `1300`—for every color family. The scale should progress smoothly toward darker colors while retaining each family’s character.

   The new shades provide room for dark backgrounds, layered surfaces, and colored status or selected-state backgrounds. They are not automatic counterparts of specific light shades.

   Preserve the existing light appearance during migration. Where the dark end is rebalanced, check existing uses of `950` individually rather than assuming that changing its name also preserves its appearance.

2. Move color values to CSS custom properties.

   Replace LESS color references such as `@ColorBlue600` with `var(--Blue600)`. Keep LESS for organizing component styles and mixins; let CSS handle theme-dependent colors through `light-dark()`.

   Set `color-scheme: light dark` at the root, with explicit `light` or `dark` overrides when the user selects a theme.

   Softadmin-specific variables such as `--Sa-Color-Primary600` and `--Sa-Color-WarningBackground` already belong to Softadmin’s color system. Their values come from an editable table through Softadmin’s processing, which is why they may be absent from `Colors.less`. Retain useful existing variables and avoid introducing another alias for every individual color declaration.

   A semantic variable for a particular role or state should own its light and dark values when its definition is under our control; components should then use it directly. Review `light-dark()` expressions that pair a non-primary semantic variable with a fixed palette shade: the dark branch bypasses that variable's editable value. Use an existing semantic dark or brightness variant when appropriate. A state-specific override can still be necessary when the same variable also styles other states, as with enabled and disabled button labels. Check every use before changing a shared definition, and do not infer missing dark support from definitions supplied externally.

3. Establish the neutral dark-mode hierarchy.

   Use these as the standard starting points:

   | Purpose | Dark color |
   |---|---|
   | Main page canvas | `--Gray1300` — `#111821` |
   | Controls, cards, and other surfaces | `--Gray1200` — `#171f2a` |
   | Additional surface separation | `--Gray1100` — `#1e2935` |
   | Typical hover on a dark surface | `--Gray1000` — `#263240` |
   | Typical press on a dark surface | `--Gray900` — `#313a44` |
   | Ordinary text | Light gray, typically `--Gray100` or `--Gray200` |
   | Ordinary text and icons on hover or press | `--White` |

   Choose interaction shades relative to the component's resting background. A `Gray1200` surface can progress to `Gray1000` on hover and `Gray900` on press. A pill already resting on `Gray1000` needs brighter steps, such as `Gray900` on hover and `Gray800` on press. Do not give resting and hover states the same background when the background is meant to show interaction. Scrollbar thumbs can similarly progress from `Gray700` to `Gray600` and `Gray500`. Verify separation from the surrounding surface and contrast with the foreground in every state.

4. Review colors by their role within each component.

   For every declaration, identify whether it represents a surface, text, border, hover, press, selection, focus, status, or accent. Choose the dark value for that role while retaining the existing light value.

   Keep the definitions of `--Sa-Color-Primary…` in the primary family. A light-theme declaration that uses a primary color does not require a primary dark counterpart: ordinary interaction surfaces often become neutral in dark mode. Express that choice at the declaration, as in `26-9`:

   ```less
   .saMenuItem {
       color: light-dark(var(--Gray900), var(--Gray100));
       background-color: light-dark(var(--White), var(--Gray1200));

       &:hover {
           color: light-dark(var(--Sa-Color-Primary600), var(--White));
           background-color: light-dark(
               var(--Sa-Color-Primary50),
               var(--Gray1000)
           );
       }

       &:active {
           color: light-dark(var(--Sa-Color-Primary700), var(--White));
           background-color: light-dark(
               var(--Sa-Color-Primary100),
               var(--Gray900)
           );
       }
   }
   ```

   Apply this approach to ordinary menu items, options, rows, tabs, navigation, and secondary buttons. Ordinary icons should follow the label color. Do not globally redefine `Primary50` as gray: another component may need it to remain an accent. When the dark color is meant to remain an accent, use a `--Sa-Color-Primary…` shade rather than a fixed `--Blue…` shade so an editable primary palette stays consistent.

   Use `--Sa-Color-Background` for the page canvas and `--Sa-Color-Surface` for component surfaces, including active tabs where they connect to a surface. Review each white value by role before replacing it: a toggle knob may need to stay white to remain distinct from its track, while a chart outline or signature container can use Surface. Adapt drawings and images separately from their containers; use the established WordmarkFilter or InvertFilter where appropriate, or the supplied dark asset.

5. Make meaningful color an explicit exception.

   Primary buttons, links, keyboard focus, selected controls, and meaningful emphasis can retain primary colors. Warning, error, success, and information states should preserve their meaning through recognizable colors. A status progression may deliberately use different families, such as red, orange, yellow, and green for password strength.

   Choose their backgrounds, borders, icons, and text together. A dark colored background may need a much lighter foreground from the same family.

   Prominent status indicators do not automatically need darker backgrounds. Password-strength bars may need brighter colors in dark mode, and alert stripes can retain vivid colors. Choose a readable foreground for the resulting background: a bright warning surface may need dark text or icons. Check the complete pair rather than applying a darker shade solely because the theme is dark.

   Treat hover, press, focus, and selection as separate states. `:active` describes a temporary press; selection persists, and keyboard focus needs its own visible indicator.

6. Use mixing sparingly; adapt transparency, shadows, and overlays.

   Prefer an existing semantic color variable or a direct palette shade. Use `color-mix()` as a last resort for a shade the palette cannot reasonably supply, or when the role requires transparency or a color derived from an editable accent. Do not mix colors merely to approximate every old hex value. Review noticeable light-theme substitutions individually.

   A justified accent derivation is a featured menu background made from 15% of its editable feature color mixed into `--Sa-Color-Surface`. This preserves the chosen accent across palette edits without requiring a fixed blue or purple background. Use `in oklch` for these mixes.

   Replace LESS `fade()` with CSS `color-mix(in oklch, …)`, preserving the original light-mode opacity. Set shadow opacity separately for dark mode, following the shared mixins in `26-9`:

   ```less
   box-shadow: 0 0 2rem light-dark(
       color-mix(in oklch, var(--Gray900) 7%, transparent),
       color-mix(in oklch, var(--Black) 80%, transparent)
   );
   ```

   Dark shadows need substantially stronger black opacity to remain visible—typically around 80–90% where appropriate—while retaining the existing light-mode shadow.

   Review modal and lightbox overlays separately from shadows. The implemented starting point is 20% `Gray900` in light mode and 80% black in dark mode; changing only the color to black while retaining 20% opacity can leave the page insufficiently separated. Keep low opacity when it serves a different role, such as a resize handle at 6%. Mix with `transparent` to retain that transparency.

   The implemented styles also supply preceding light-mode fallbacks for `light-dark()` and `color-mix()` declarations. Preserve those fallbacks when working in the implementation; their presence is not a different dark color choice. Add them to the prototype only when its browser support requirements call for them.

7. Keep the implementation local and verify the result.

   Compile the LESS and check for remaining `@Color…`, `fade()`, and `color-mix(in srgb, …)` references. Compare representative components in both themes, including keyboard focus, selected states, and validation messages. Verify WCAG AA against actual foreground/background pairs, and check the browser console. Shade numbers alone do not guarantee sufficient contrast.

   Include controls with distinct parts, status indicators, overlays, and components whose resting surface is brighter than `Gray1200`. Verify externally supplied semantic values in the running application; source inspection alone cannot establish their resolved colors or contrast. Distinguish intended design differences from conversion defects before applying reference colors.
