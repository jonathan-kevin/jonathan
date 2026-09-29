# Authoring Bento layouts

The HTML is the layout configuration. Load `Presentation/CssTemplate/screen.template.css`; no editor or layout JavaScript is required. `bento.html` demonstrates this with the real card components.

## Class contract

| Setting | Base class | Override example |
| --- | --- | --- |
| Container columns | `saGridCol8` | `saMdGridCol2` |
| Card column span | `saCol4` | `saMdCol2` |
| Card row span | `saRow2` | `saXsRow1` |

Values run from 1–16. Use one class per property at each breakpoint. Unprefixed classes apply at every width; the generated CSS then applies overrides in this order:

| Prefix | Applies at |
| --- | --- |
| Base (unprefixed) | Every width |
| `saXl` | 1535px and narrower |
| `saLg` | 1279px and narrower |
| `saMd` | 1023px and narrower |
| `saSm` | 767px and narrower |
| `saXs` | 640px and narrower |

Only declare changes. An omitted setting inherits from the nearest larger breakpoint, independently for columns, column span, and row span. Class order in HTML does not control precedence. Viewports below 320px are unsupported.

Every card's column span must fit the container at every breakpoint. Reducing the container's columns does not automatically shrink its cards. Row spans count content-sized grid tracks; they are not fixed pixel heights. Gap is always 1rem.

Keep appearance separate: `saSmall`, `saWrapped`, `saSolid`, and color classes do not define responsive spans. The wrapper currently uses dense placement to fill gaps, so visual placement can differ from source order.

## Card markup

Use this content structure inside each card in the examples below:

```html
<li class="saBento saCol2 saRow1 saXsCol1">
  <article>
    <a class="saBentoInner" href="/your-destination">
      <div class="saBentoBody">
        <h2 class="saBentoHeading">Card title</h2>
        <p class="saBentoDescription">Card content.</p>
      </div>
    </a>
  </article>
</li>
```

## Featured composition

An eight-column desktop layout becomes six, four, then two columns. Both `sm` and `xs` inherit the two-column grid from `md`.

```html
<ul class="saBentoWrapper saGridCol8 saXlGridCol6 saLgGridCol4 saMdGridCol2">
  <li class="saBento saCol4 saRow2 saMdCol2 saXsCol1 saXsRow1">...</li>
  <li class="saBento saCol2 saRow1 saXsCol1">...</li>
  <li class="saBento saCol2 saRow1 saXsCol1">...</li>
  <li class="saBento saCol2 saRow2 saXsCol1 saXsRow1">...</li>
</ul>
```

## Balanced tiles

The cards always span one column. Only the container needs responsive classes.

```html
<ul class="saBentoWrapper saGridCol4 saMdGridCol2">
  <li class="saBento saCol1 saRow1">...</li>
  <li class="saBento saCol1 saRow1">...</li>
  <li class="saBento saCol1 saRow1">...</li>
  <li class="saBento saCol1 saRow1">...</li>
</ul>
```

## Editorial composition

Mix wide and tall cards, simplify at `md`, then use one-column cards within the two-column grid at `xs`.

```html
<ul class="saBentoWrapper saGridCol6 saLgGridCol4 saMdGridCol2">
  <li class="saBento saCol4 saRow2 saMdCol2 saXsCol1 saXsRow1">...</li>
  <li class="saBento saCol2 saRow1 saXsCol1">...</li>
  <li class="saBento saCol2 saRow2 saXsCol1 saXsRow1">...</li>
  <li class="saBento saCol2 saRow1 saXsCol1">...</li>
</ul>
```

## Preview workflow

1. Write the container and card classes into the page or its rendering template.
2. Resize the browser through each breakpoint and check card fit and content.
3. Add `saShowGridLines` to inspect the columns. The guides follow the column classes without JavaScript.
4. On `bento`, the column selector temporarily changes the active breakpoint's class. Its inherit option removes that override. Commit chosen values to the HTML; these preview changes are not saved and reload restores the authored layout.

`bento.js` is only for preview controls. Add card appends a card with valid default spans; when a preset is selected, new cards continue its pattern. The preset dropdown preserves content and card order, repeating the composition for additional cards. Default restores the original layout classes, with one-by-one defaults for added cards. The disabled indicator shows the current breakpoint. Reload restores the authored HTML. CSS still positions every card.

Run `node --test bento.test.js` to check the authored demo and these compositions for overflowing spans and redundant overrides.

The visual editor is at `/bento-preview/`; its styles live at the bottom of `Presentation/CssTemplate/Bento.less`. The start-page example is `/bento`. Both share `bento-layouts.js`.
