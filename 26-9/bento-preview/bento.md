# Softadmin Bento preview

Open `/jonathan-git/26-9/bento-preview/` for the editor and `/jonathan-git/26-9/bento` for the start-page example.

The editor and iframe use the shared Softadmin stylesheet, components, colors, and Font Awesome assets. Editor LESS lives at the bottom of `Presentation/CssTemplate/Bento.less`. The iframe renders actual `saBentoGroup saBentoWrapper` / `saBento` markup with the shared responsive utility classes. There is no simulated zoom: wide previews overflow horizontally, while content scrolls in the iframe's `.scrollcontent-inner`.

## Layout editing

- Desktop-first ranges: 2xl >=1536; xl 1280–1535; lg 1024–1279; md 768–1023; sm 641–767; xs 320–640. Gap is always 1rem.
- Columns and card spans inherit independently toward smaller screens. Explicit overrides have a subtle blue field background and border; Reset to inherited removes an override.
- Select a card to edit spans, title, description, icon name and color. Background clicks or Escape clear selection.
- Drag anywhere on a card to reorder it; a normal click still selects it. On a focused card, arrow keys move it one position. Drop above or below a card's midpoint to place it before or after that card; dragging near the content edges scrolls the preview. Escape cancels a drag. Order is shared across all breakpoints.
- Duplicate copies all card content, appearance and breakpoint settings, inserts the copy immediately after its source and selects it.
- Add, remove, duplicate, reorder, appearance edits and preset changes support Undo/Redo (Ctrl/Cmd Z and Ctrl/Cmd Shift Z). Undo history lasts for the page session.
- Spotlight is the initial layout. Presets apply immediately, preserve existing content where possible, and are undoable. Start from scratch clears cards, shared settings and breakpoint overrides.

## Appearance and preview

The initially collapsed All card settings section is shown without a selection. It controls Small icon/Medium icon/Large icon/Image/Nothing styles, solid backgrounds, inset visuals, image fit, tags, footers, heart favorites and bottom actions for existing and future cards. Titles, descriptions, icon names, colors and spans remain individual. Images use per-card Unsplash photos; tags, author/avatar/date and action labels use per-card sample content. Appearance is independent of breakpoints.

The toolbar provides breakpoint buttons, a pixel-width input, Fit, grid lines and dashed breakpoint guides. Drag the preview edge or use its arrow keys to resize continuously. The inspector can be minimized. Inside the preview, the Softadmin sidebar can be minimized with its expander (Alt+M); mobile has a menu toggle. Press D to switch the preview between light and dark mode, or open the existing account menu and choose Theme → System/Light/Dark. The shortcut ignores typing fields. The preview theme is independent of the outer editor.

## Remembering work

The editor automatically stores the layout, selected card, active breakpoint, widths, guides, inspector state, expanded sections and preview sidebar/theme preferences in this browser's local storage under `softadmin-bento-preview:v1`. Refresh restores them. Invalid or incompatible saved data is ignored; if storage is unavailable, editing still works for the current session. This is local browser storage, not a server save. Clearing browser site data removes the saved work.

Run checks from 26-9: `node --test bento.test.js bento-preview/bento-model.test.js`.



Clear memory is at the bottom of the inspector. A native confirmation dialog explains that it resets the layout and preferences and reloads the editor. Cancel leaves everything intact. Confirm removes only this editor's storage key; other Softadmin settings are untouched. The reset cannot be undone.


Shift-click adds or removes cards from the selection; a plain click selects one card, and clicking the only selected card clears selection. Shift+Enter/Space is also supported. Selection survives breakpoint changes, Undo/Redo, and refresh. With multiple cards selected, Across breakpoints, title, description, and icon name are disabled. Span and color controls apply to all selected cards; different values display as mixed. Stepper buttons adjust each selected span by one, typed values set the same span for all, and Reset removes each selected override. Duplicate/remove apply to the selected cards together and can be undone.

The Max width toolbar toggle adds/removes `saMaxWidth` on the preview’s `saBentoWrapper`, using the existing 100rem limit. Its state is remembered with the other preview preferences.

Card styles use Softadmin radio buttons. Small icon adds `saSmall`, Medium icon adds `saMedium`, and Large icon uses the default styling without a size class. Image settings (Inset image and Cover/Contain) appear directly beneath the Image radio when selected. Legacy saved tiny/icon styles migrate to small/large without losing the saved layout.
