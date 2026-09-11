# Visual Markdown editor POC

Open `markdown.html` through the existing web server. Edit the rendered document directly; the **Markdown source** disclosure shows the generated, read-only Markdown.

`markdown-editor.js` enhances a labeled textarea with Tiptap's semantic HTML editor. Tiptap maintains the document, selection, clipboard handling, keyboard shortcuts, and undo history. Its Markdown extension parses the initial source and serializes document changes. Formatting does not rewrite the editable DOM on every keystroke.

```html
<markdown-editor>
  <label for="body">Markdown content</label>
  <textarea id="body" name="content" rows="14">## Hello</textarea>
</markdown-editor>
```

Use a unique textarea ID for each instance. Its `name` stays in the enclosing form, and its value is kept in sync with the visual editor. The textarea remains editable if the editor cannot load or JavaScript is unavailable.

```js
const editor = document.querySelector('markdown-editor');
console.log(editor.value); // Generated Markdown.
editor.value = '## Updated content'; // Parses Markdown into the visual editor.
editor.addEventListener('input', () => console.log(editor.value));
```

Setting `value` does not emit `input`. User edits, formatting, and undo/redo emit a bubbling `input` event after updating the textarea. Form reset restores the initial Markdown. Removing the component destroys its editor and listeners; reconnecting it initializes from the retained source.

The heading selector applies paragraph text or heading levels H1–H6 and follows the current cursor position. The remaining controls handle bold, italic, strikethrough, titled links, images with alternative text, lists, quotes, inline code, code blocks, horizontal rules, and tables. Table actions insert and delete rows or columns. Formatting controls reflect the current selection.

Ctrl/Cmd+B and I format text; Ctrl/Cmd+K opens the native link dialog. Ctrl/Cmd+Z undoes edits. Completed URLs are linked automatically, while link navigation is disabled during editing.

Styles live in `Presentation/CssTemplate/MarkdownEditor.less`, imported by `screen.template.less` and compiled into the existing `screen.template.css`. No separate CSS file or JavaScript-injected stylesheet is used.

Tiptap core, StarterKit, and Markdown are pinned to 3.31.3 and loaded from esm.sh. Internet access is required for visual editing; bundling these dependencies locally is a later deployment step. There is no persistence or backend.

Pasted formatting is constrained to the editor schema, and link and image URLs are checked. Markdown serialization normalizes whitespace and syntax, so the original Markdown spelling is not preserved byte for byte. Table support follows GitHub-flavored Markdown and always inserts a header row.
