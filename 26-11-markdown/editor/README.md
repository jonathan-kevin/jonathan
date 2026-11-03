# Tiptap Markdown proof of concept

The existing `../index.html` embeds this editor inside `<markdown-editor>`. The
checked-in `../editor-dist/` folder is the ready-to-serve build: the page works
through the existing IIS site without starting Node or connecting to Tiptap Cloud.

Open http://localhost/jonathan-git/26-11-markdown/index.html on this machine.

## Development

From this directory:

```sh
npm ci
npm run build
```

Reload the original page after a build. For standalone development, `npm run dev`
starts Vite. `npm test` runs browser checks against the original page on local IIS
using installed Microsoft Edge in headless mode.

## Included

- Tiptap 3, StarterKit, and the official Markdown extension.
- Official MIT Simple Editor template and its formatting, link, image, search and
  replace, history, and light/dark controls.
- Task lists, tables, syntax-highlighted code with a language selector, images.
- Selection bubble menu, empty-paragraph floating menu, block drag handles, and
  keyboard-accessible move-up/down buttons.
- Placeholder, word/character counts, emoji and shortcode input, inline/block
  LaTeX formulas, collapsible sections, invisible characters, unique block IDs.
- File Handler for pasted/dropped images; local image picker uses the template's
  image upload UI. PNG, JPEG, GIF, WebP and AVIF are accepted, up to 5 MB each.
- Markdown source dialog with explicit Apply/Cancel, file import, Markdown
  download, and full-fidelity editor JSON import/download.
- Table of Contents is deliberately not installed or registered.

All processing happens in the browser. Images are embedded as data URLs, so an
image remains available when the Markdown or editor JSON is reopened. This makes
documents larger than linking to uploaded files. There is no backend or autosave;
download your work before reloading the page.

## Markdown scope

The official Markdown extension is beta. Normal Markdown, task lists, simple
tables and fenced code blocks round-trip through its parser/serializer. Formula
blocks use dollar-delimited LaTeX. Collapsible sections use Tiptap's `:::details`
directives, and emoji use shortcodes; support in other Markdown renderers varies.

Markdown cannot preserve every rich editor feature. Alignment, highlight colors,
underline, some table layouts/merged cells, and internal metadata can be simplified
when exporting or applying Markdown. Use **Download editor JSON** to preserve the
complete document. Source Cancel does not alter the document.

## Files and upstream source

- `src/components`, `src/hooks`, `src/lib`, `src/styles`: official Tiptap UI source
  installed with `npx @tiptap/cli@latest add simple-editor` on 2026-10-30.
- `src/components/tiptap-templates/simple/simple-editor.tsx`: template integration;
  uses real local image loading instead of the upstream simulated upload.
- `src/poc-extensions.ts`: extension configuration, matching emoji Markdown parser,
  and task-item DOM compatibility with the upstream template's checkbox styling.
- `src/poc-tools.tsx`: plain HTML extra controls and Tiptap contextual toolbars.
- `src/editor-files.ts`: browser file import and download helpers.
- `../editor-host.js`: iframe sizing/lifecycle within the existing page.

No custom visual theme is introduced. The Simple Editor SCSS is unchanged except
that its Google Fonts import is replaced with local Fontsource copies of the same
fonts. KaTeX and Highlight.js use their provided styles. `src/vendor/tiptap-demo.scss`
contains the table and placeholder rules from Tiptap's public MIT demos, without
visual customization. The iframe isolates these upstream styles from Softadmin.

Sources:

- https://github.com/ueberdosis/tiptap (MIT)
- https://github.com/ueberdosis/tiptap-ui-components (MIT)
- https://tiptap.dev/docs/ui-components/templates/simple-editor
- https://tiptap.dev/docs/editor/markdown

The template's MIT notice and dependency license notices are included in
`public/licenses/`, and copied into `../editor-dist/licenses/` on build.
