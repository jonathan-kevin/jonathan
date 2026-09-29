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

Our dark mode philosophy is to preserve the existing light theme, build dark mode around neutral surfaces with clear visual separation, and use accent colors where they communicate meaning. Recreating it requires designing each component’s dark states, rather than reversing the palette.

For color-only work in `26-10`, use the matching LESS files in `../26-9/Presentation/CssTemplate` as the reference for color choices and state progression. Compare only files present in both versions; ignore files unique to `26-9`. Copy the color approach, not the file structure: do not add classes, move selectors, or change component hierarchy for a color-only update. Preserve the existing light values unless a specific light-theme defect is being fixed.

1. Extend the palette first.

   Replace the shade name `950` with `1000`, and introduce three additional shades—`1100`, `1200`, and `1300`—for every color family. The scale should progress smoothly toward darker colors while retaining each family’s character.

   The new shades provide room for dark backgrounds, layered surfaces, and colored status or selected-state backgrounds. They are not automatic counterparts of specific light shades.

   Preserve the existing light appearance during migration. Where the dark end is rebalanced, check existing uses of `950` individually rather than assuming that changing its name also preserves its appearance.

2. Move color values to CSS custom properties.

   Replace LESS color references such as `@ColorBlue600` with `var(--Blue600)`. Keep LESS for organizing component styles and mixins; let CSS handle theme-dependent colors through `light-dark()`.

   Set `color-scheme: light dark` at the root, with explicit `light` or `dark` overrides when the user selects a theme.

   Softadmin-specific variables such as `--Sa-Color-Primary600` and `--Sa-Color-WarningBackground` already belong to Softadmin’s color system. Their values come from an editable table through Softadmin’s processing, which is why they may be absent from `Colors.less`. Retain useful existing variables and avoid introducing another alias for every individual color declaration.

3. Establish the neutral dark-mode hierarchy.

   Use these as the standard starting points:

   | Purpose | Dark color |
   |---|---|
   | Main page canvas | `--Gray1300` — `#111821` |
   | Controls, cards, and other surfaces | `--Gray1200` — `#171f2a` |
   | Additional surface separation | `--Gray1100` — `#1e2935` |
   | Hover background | `--Gray1000` — `#263240` |
   | Pressed background | `--Gray900` — `#313a44` |
   | Ordinary text | Light gray, typically `--Gray100` or `--Gray200` |
   | Ordinary text and icons on hover or press | `--White` |

   Interaction changes must be easy to see against both the canvas and component surfaces. Hover therefore moves to `Gray1000`; pressing moves another step to `Gray900`.

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

5. Make meaningful color an explicit exception.

   Primary buttons, links, keyboard focus, selected controls, and meaningful emphasis can retain primary colors. Warning, error, success, and information states retain their respective color families.

   Choose their backgrounds, borders, icons, and text together. A dark colored background may need a much lighter foreground from the same family.

   Treat hover, press, focus, and selection as separate states. `:active` describes a temporary press; selection persists, and keyboard focus needs its own visible indicator.

6. Adapt transparency and shadows.

   Replace LESS `fade()` with CSS `color-mix(in oklch, …)`, preserving the original light-mode opacity. Set shadow opacity separately for dark mode, following the shared mixins in `26-9`:

   ```less
   box-shadow: 0 0 2rem light-dark(
       color-mix(in oklch, var(--Gray900) 7%, transparent),
       color-mix(in oklch, var(--Black) 80%, transparent)
   );
   ```

   Dark shadows need substantially stronger black opacity to remain visible—typically around 80–90% where appropriate—while retaining the existing light-mode shadow.

7. Keep the implementation local and verify the result.

   Compile the LESS and check for remaining `@Color…`, `fade()`, and `color-mix(in srgb, …)` references. Compare representative components in both themes, including keyboard focus, selected states, and validation messages. Verify WCAG AA against actual foreground/background pairs, and check the browser console. Shade numbers alone do not guarantee sufficient contrast.
