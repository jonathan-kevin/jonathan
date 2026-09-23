# Shared inline panel

`inline-panel.js` exposes `SaInlinePanel`, a controller for an ordinary element or custom-element host. It has no chat or file-viewer dependency. `Inline.less` owns the panel's layout, reveal/dismiss animation, responsive offsets, and shared header styles.

The shell uses `.saInlinePanel`, `.saInlineHeader`, `.saInlineTitle`, `.saInlineActions`, `.saInlineClose`, `.saInlineBack`, `.saInlineContent`, and `.saInlineResize`. Width is stored in `--sa-inline-width`. `.saInlineFullWidth` makes the mobile overlay full width; `.saInlineResizing` is transient pointer-resize state.

Place the host beside `.saRightFrameRoot`. Create its header and content before constructing the controller:

```js
const header = SaInlinePanel.createHeader({
  titleId: "document-panel-title",
  title: "Document",
  closeLabel: "Close document"
});
const content = document.createElement("div");
content.className = "saInlineContent";
host.append(header, content);
const panel = new SaInlinePanel(host);
// A button outside the panel supplies focus return.
openButton.addEventListener("click", () => panel.open(openButton));
```

`open(origin, focusTarget)` and `close(origin)` manage focus, `hidden`, `inert`, and `aria-hidden`. Controls whose `aria-controls` includes the host ID have their existing `aria-expanded` state synchronized. The controller generates a keyboard-accessible resize separator. Arrow keys, Shift+Arrow, Home, and End change width. This is a nonmodal panel: it does not trap focus or claim `aria-modal`.

Optional constructor callbacks: `onDismiss` handles Close/Escape, `shouldDismiss(event)` can defer dismissal to an active editor, and `restoreFocus(target)` supports custom focus targets. Call `disconnect()` when removing the host and `connect()` if reusing it. Instantiate only one controller per host.

`createHeader()` optionally accepts `backLabel`. The consumer wires `[data-inline-back]` to its own navigation; `[data-inline-close]` is handled by the panel. Titles and labels are inserted as text. Add further header buttons to `.saInlineActions` as needed.

`chat-inline.js` is the chat adapter: it owns chat/file view switching and preserves the conversation, draft, and scroll position. Both views use the shared header factory; file contents remain in `.saMarkdownContent`. `.saChatInline` remains only as the chat-layout context for chat-specific styling. The regular chat does not receive `.saInlinePanel` or `.saInlineContent`.

Script order for the demos: `inline-panel.js`, `chat.js`, `text-file-viewer.js`, `chat-inline.js`, then the selection integration. `screen.template.less` imports `Inline.less`; no panel styling is duplicated in `Chat.less` or `TextFileViewer.less`.
