# Visual Markdown editor POC

Open `markdown.html` through the existing web server. Edit the rendered document directly, or use the Markdown toolbar button to switch to the editable source view.

`markdown-editor.js` enhances a labeled textarea with Tiptap's semantic HTML editor. Tiptap maintains the document, selection, clipboard handling, keyboard shortcuts, and undo history. Its Markdown extension parses the initial source and serializes document changes. Formatting does not rewrite the editable DOM on every keystroke.

```html
<markdown-editor>
  <label for="body">Markdown content</label>
  <textarea id="body" name="content" rows="14">## Hello</textarea>
</markdown-editor>
```

Use a unique textarea ID for each instance. Its `name` stays in the enclosing form, and its value is kept in sync with the visual editor. The textarea sits beside the visual surface and is shown by the Markdown toggle. Source edits are parsed into rich text when switching back. The textarea also remains editable if the editor cannot load or JavaScript is unavailable.

```js
const editor = document.querySelector('markdown-editor');
console.log(editor.value); // Generated Markdown.
editor.value = '## Updated content'; // Parses Markdown into the visual editor.
editor.addEventListener('input', () => console.log(editor.value));
```

Setting `value` does not emit `input`. User edits, formatting, and undo/redo emit a bubbling `input` event after updating the textarea. Form reset restores the initial Markdown. Removing the component destroys its editor and listeners; reconnecting it initializes from the retained source.

The heading selector applies paragraph text or heading levels H1–H6 and follows the current cursor position. The remaining controls handle bold, italic, underline, strikethrough, titled links, images with alternative text, lists, quotes, inline code, code blocks, horizontal rules, tables, and switching between rich text and Markdown. Table actions insert and delete rows or columns. Formatting controls reflect the current selection.

PNG, JPEG, GIF, WebP, AVIF, and BMP files can be dragged onto the visual editor. Files up to 10 MB are embedded as base64 data URLs so the generated Markdown remains self-contained; the filename without its extension becomes the initial alternative text and can be edited with the image dialog.

Text color supports Softadmin shades 600–1000, default text color, white, black, and a custom color chooser. Colors remain in the rich document but are deliberately stripped from Markdown. Switching through Markdown therefore removes visual colors. The main color button applies the remembered color; choosing from the popup applies immediately if text was selected before it opened and keeps that text selected.

Selecting text shows a floating toolbar with **Send to chat** and **Refine text**. It follows the visible selection during scrolling and preserves the selection when activated. Alt+Shift+A focuses the toolbar; Left/Right and Home/End navigate its buttons. Escape dismisses it and returns to editing. It is hidden for a caret, whitespace-only selections, source mode, and while focus is in other controls.

With `chat-target` pointing to an `<chat-inline>` panel, **Send to chat** instead attaches one removable passage above the composer and focuses the message box; it does not post immediately. A new selection replaces the pending passage. The button shows **Added to chat**. Only Send/Enter posts the draft and passage, followed by a local thinking spinner and word-streamed demo reply. See `chat-inline.md` for details. The feedback-only fallback below applies when no panel is configured.

These actions are integration hooks; no chat or AI service is connected. Both dispatch a bubbling, cancelable `markdown-editor-action` event with `{ action, text, from, to }`. `action` is `send-to-chat` or `improve`; positions refer to the current Tiptap document. A listener should call `event.preventDefault()` when it handles the request. Without a listener, Send to chat shows a checkmark and “Sent to chat” as local demo feedback only; no message is transmitted. The success state stays with the selection, prevents duplicate activation, and resets when the selection or document changes. Refine text runs a local demo: the selected passage shimmers during a short simulated delay with **Thinking… / Cancel** in the floating toolbar. Then lorem ipsum of the same whitespace-delimited word count appears directly in the document, and the toolbar becomes **Apply / Revert**. There is no separate comparison panel. This is a temporary editor state: Markdown and saved undo history remain unchanged until Apply. Revert restores the original state, including text, formatting, selection, and history. Apply commits one undoable edit. Paragraphs, lists, table cells, and inline atoms remain intact; replacement words inherit formatting at their start. Editing and formatting pause during review to protect the original; Cancel during thinking, Escape, switching to Markdown, or assigning a new value dismisses the preview. Edits during thinking cancel the delay. Moving the selection does not change the captured target. Reduced motion shows a static underline instead of shimmer; ready suggestions use a dotted underline. Decorations never enter Markdown, and no text is sent anywhere.

The floating toolbar stays anchored to the preview range, even if the selection collapses. State changes are announced, and Apply receives focus when ready if focus was still in the editor or toolbar. Arrow keys and Home/End navigate its buttons. Ctrl+Enter (Cmd+Enter on Mac) applies the ready suggestion; Escape reverts it or cancels thinking. These shortcuts work from the editor and floating toolbar, restore editor focus, and are exposed with `aria-keyshortcuts`. There is no focus trap.

Local demo regression checklist: verify Cancel during the delay, Revert after completion, keyboard navigation/Escape, Apply followed by one Undo and Redo, read-only review, Markdown switching during both phases, and selection changes. Test selections across headings and paragraphs, formatting marks, lists, code, and table cells. Previewing or reverting must not change the source or create an undo entry; applying must preserve word count and block structure.

```js
document.querySelector('markdown-editor').addEventListener('markdown-editor-action', event => {
  event.preventDefault();
  const { action, text, from, to } = event.detail;
  // Route the selected text to your chat composer or AI editing workflow.
});
```

The color popup uses a single tab stop for its swatches. Arrow keys move horizontally and vertically without changing the document. Home/End move to the ends of the current row; Ctrl/Cmd+Home/End move to the first/last swatch. Enter or Space commits the focused swatch, Tab reaches custom color, and Escape returns to the popup trigger. Swatches have color/shade names and a visible keyboard focus outline.

Task lists use GitHub-flavored `- [ ]` and `- [x]` Markdown. Toggle them with the Task list button or Ctrl/Cmd+Shift+9. Checkboxes have labels derived from their task text. Enter adds an item; Tab and Shift+Tab nest and lift items.

Find opens from the toolbar or Ctrl/Cmd+F while focus is inside the rich editor. The compact bar shows a current/total counter (`0/0` for no hits), angle-up/down buttons for previous/next, Match case, and Close. Replace is collapsed on every open; explicitly activate **Show replace** to reveal its input and Replace / Replace all buttons. The disclosure exposes `aria-expanded` and `aria-controls`, and collapsed controls are removed from the tab order. Enter/Shift+Enter in Find navigate hits; Enter in the expanded replacement input replaces the current hit. Escape closes the bar and returns to editing. The counter has a full-text screen-reader announcement.

Search is literal, including text split across formatting marks, within each paragraph, heading, code block, or table cell. It does not search HTML attributes, link destinations, image alternatives, or across block boundaries. Hits render as semantic `<mark>` elements via temporary decorations, with a distinct current-hit style; they never enter Markdown. Replace changes the active match, while Replace all changes every match in a single undo step. Replacement text is literal, including `$` and other punctuation, and takes the formatting at the start of the replaced range. The bar closes in source mode, where the browser's own find remains available.

Underline follows the same progressive-enhancement rule: Markdown has no underline syntax, so it is stored as `<u>underlined text</u>`. Removing inline HTML preserves the text.

Ctrl/Cmd+B, I, and U format text; Ctrl/Cmd+K opens the native link dialog. Ctrl/Cmd+Z undoes edits. Completed URLs are linked automatically, while link navigation is disabled during editing.

The rendered document has both `.saMarkdownContent` and `.saMarkdownEditorDocument`. Shared typography, nested lists, task lists, links, images, tables, code and syntax highlighting live in `Presentation/CssTemplate/Markdown.less`. `MarkdownEditor.less` contains editor layout, toolbar/dialog controls, search/selection decorations, editable-table sizing and code-header spacing. Both are imported by `screen.template.less` and compiled into the existing `screen.template.css`. No separate CSS file or JavaScript-injected stylesheet is used.

Tiptap core, StarterKit, and Markdown are pinned to 3.31.3 and loaded from esm.sh. Internet access is required for visual editing; bundling these dependencies locally is a later deployment step. There is no persistence or backend. Embedded images increase the submitted Markdown size by roughly one third compared with the original files.

`markdown-editor-paste.js` rebuilds clipboard HTML before schema parsing. It preserves headings, lists (including common Word/Outlook `mso-list` paragraphs and nesting), safe links and titles, images, tables, bold, italic, underline, strikethrough, code, and task checkboxes. Inline colors and colors defined by simple embedded stylesheet rules become text-color marks; inherited colors are carried onto text. Fonts, sizes, backgrounds, event handlers, and unsupported styling are discarded. Generic block wrappers become paragraphs and redundant spans disappear when Tiptap normalizes the document. External stylesheets and styling absent from the clipboard cannot be recovered. Complex Office layouts and merged cells remain subject to the Markdown schema's limitations.

HTML pastes use that cleanup path, including inside tables; plain tab/newline-delimited clipboard text still fills table cells through the existing table paste behavior. Markdown serialization normalizes whitespace and syntax, so the original Markdown spelling is not preserved byte for byte. Table support follows GitHub-flavored Markdown and always inserts a header row.
