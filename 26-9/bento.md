# Bento Studio

Open `bento.html` through the existing site, for example `http://localhost/jonathan-git/26-9/bento.html`. No build step or external dependencies are required. The editor uses the bundled Geist fonts.

- Five responsive presets, a blank canvas, and editable card titles. A shared inspector shows presets when no card is selected and card controls when one is selected. Click the canvas/page background or press Escape to clear selection. Add card sits beside undo and redo inside the panel. The panel can be minimized to give the canvas more room and expanded with the remaining toggle; selection and edits are preserved.
- Independent desktop-first inheritance for columns, column span, and row span. Grid gap is fixed at 16px (1rem) on every screen.
- One shared toolbar for breakpoint selection and viewport width. Text is at least 0.625rem, including scaled preview labels, and uses colors with at least 4.5:1 contrast.
- A framed screen preview with a draggable right edge. Dragging crosses breakpoints automatically and preserves card selection. Arrow keys resize by 16px (Shift: 64px); Home selects 320px and End selects 3840px or the current larger width. Fit restores automatic zoom.
- Six breakpoint previews with an adjustable viewport width. Large previews scale to fit the workspace; the displayed pixel width remains the simulated viewport width.
- Per-property source labels, reset controls, and downstream impact descriptions.
- Overflow warnings and individual or bulk repair. Invalid spans are visually constrained in the canvas until repaired.
- Up to 100 undo steps and redo. Edits last for the current page session. Additions, removals, title edits, preset changes, and layout edits can all be undone during the session.

The base breakpoint is `2xl` at 1536px and above. Descending breakpoints start at 1280, 1024, 768, 640, and 320px. A property resolves to the nearest explicit value at the current or a larger breakpoint. An explicit equal value remains an override. Presets replace layout settings while preserving matching card IDs, titles, and order. Additional cards receive new IDs.

`bento-model.js` contains the inheritance and preset logic. `bento.js` owns editor interactions, history, and rendering. Styles are isolated in `bento.css`; existing demo pages and shared styles are unchanged.

Run the regression checks with:

```sh
node --test bento-model.test.js
```
