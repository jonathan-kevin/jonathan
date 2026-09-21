# Inline chat POC

## Grid demo

`inline-chat.html` uses the bird grid from `table.html`, including its grid navigation, row controls, records, and checkbox selection counter, and hosts the same chat beside `.saRightFrameRoot`. It loads `inline-chat-grid.js`, not the markdown editor. Select text within one or several cells to show the shared dark floating toolbar. Send to chat stages the selection above the composer and focuses it; a new selection replaces the pending context without sending anything.

With text selected, Alt+Shift+A focuses the toolbar, Enter activates its button, and Escape dismisses it and restores selection when leaving toolbar focus. Ordinary text-selection/caret-browsing behavior stays native. Selecting outside the grid does not show the toolbar. The controller uses `data-chat-selection-source`, `data-chat-target`, and `data-chat-toolbar` to associate a table, chat, and toolbar.

## Shared component

Pending context and sent excerpts link back to their source. Native selections retain the original cell/message element plus a live range and exact character offsets (also surviving streamed-word flattening). Editor selections map their positions through transactions. Clicking focuses and reveals the passage with a brief highlight; on small screens it closes an overlapping chat when the source is outside chat. Deleted or replaced sources become unavailable on activation instead of searching for another matching quotation. Quote text stays readable, and the pending-context dismiss button is separate from the link. Source references are in-memory POC state, not persistent deep links across reloads.

Both demo pages load `inline-chat-grid.js` after `inline-chat.js` to enable selection actions within chat message bodies as well. Selecting sent or assistant text shows a separate floating Send to chat toolbar above the panel. It replaces pending context and focuses the composer without sending or clearing the draft. Composer/edit fields and message controls are excluded. Alt+Shift+A focuses the action; Escape dismisses it without closing chat. Quoting a chat message preserves the panel's original external focus-return target.

Opening and closing use a 200 ms eased slide with a subtle fade, matching the notification/mobile-menu motion. Desktop animates the panel's occupied space while keeping its contents at their chosen width; smaller screens slide the fixed panel from the right. `@starting-style` and a discrete `display` transition allow both directions without JavaScript timers. Unsupported browsers fall back to immediate visibility changes, and reduced-motion preference disables transitions. Closing immediately makes the panel inert and hides it from assistive technology, while restoring focus; reopening during dismissal reverses the transition and restores interaction.

`inline-chat.js` defines a light-DOM `<inline-chat>` component. Shared chat styles and their nested `.saInlineChat &` variants live together in `Chat.less`. `InlineChat.less` contains the panel layout, resize handle, and panel-only content. Same-element modifiers use the `.modifier&` form; ancestor contexts use `.ancestor &`.

The composer uses the shared `.saChatTextarea` on a `contenteditable="plaintext-only"` div with textbox semantics, not a textarea. The `.saEmpty` class shows its `data-placeholder`; pasted content stays plain text. The composer remains enabled while the demo replies so the next message can be drafted.

Streaming accelerates throughout each reply: the delay between words decreases from 20ms to 5ms. The thinking delay is unchanged.

After thinking, the reply shows a short introduction and three simulated tool calls, each taking 1.2 seconds. The active call uses `.saChatMessageAction` and `.saChatThinkingTextLight`. Completed calls accumulate in a collapsible “Performed tool calls” history with a unique ID and synchronized `aria-expanded`/`aria-controls`. Only after all three calls finish does the final answer stream. Stop also cancels this tool phase, keeps completed history, and removes the active animation. No tools or services are actually called. Reply Copy copies the final answer, excluding the introduction and tool history.

For testing the animation, sending only `think` (case-insensitive, ignoring surrounding whitespace) runs the thinking phase for 10 minutes before streaming the demo reply. Other messages retain the 5-second delay. Stop cancels either duration normally; attached context does not change this typed-message trigger.

Completed or stopped replies have the shared `.saChatMessageFooter` with a timestamp and `.saChatToolbar`. Copy reuses the delegated `.saChatCopyButton` handler in `script.js`, including checkmark feedback. Branch is visibly disabled until branching is implemented. The footer is hidden during streaming; Copy is disabled if stopped before any reply text arrived.

Sent messages with typed text have `.saChatToolbar` with Edit and Copy. Excerpt-only messages have no footer. Copy includes the attached quote and typed message. Edit reuses the shared local Save/Cancel controls and changes only the typed message, without regenerating replies or modifying the attached quote. Escape cancels an edit without closing the panel.

Place it beside `.saRightFrameRoot`, outside the page form, with a unique ID:

```html
<div class="saRightFrameRoot">
  <markdown-editor chat-target="document-chat">…</markdown-editor>
</div>
<inline-chat id="document-chat" hidden></inline-chat>
```

A standalone `<button type="button" class="saOpenChat" aria-label="Open document chat" aria-controls="document-chat" aria-expanded="false">…</button>` opens that panel without attaching text. The component synchronizes `aria-expanded`, focuses the composer on open, and returns focus to the button on close. Existing drafts and context are preserved.

Load `inline-chat.js` alongside `markdown-editor.js`. Send to chat opens the named panel, attaches one selected passage above its composer, and focuses the message box. Nothing is posted yet. A new selection replaces the pending passage without changing the typed draft or previously sent messages. The single context block contains a blockquote and a Remove button, with no list markup. The editor shows a checkmark and “Added to chat”, with `aria-controls` and `aria-expanded`. Handling the existing `markdown-editor-action` event with `preventDefault()` bypasses this default integration.

Send or Enter posts the draft and its attached passage locally; the passage can also be sent without a typed prompt. Shift+Enter inserts a newline. With no draft or passage, Send is disabled. Each submission shows the shared thinking shimmer for 5 seconds, then streams a fixed demo/lorem ipsum response word by word. Stop cancels either phase and preserves partial output. Enter cannot queue duplicate messages while a response is running, but the next draft and context remain editable. Screen readers receive phase announcements and the completed reply once, not every word. Streaming follows the bottom only while the reader is already near it.

Close or Escape hides the panel and restores editor focus. Messages, the pending passage and an unsent draft survive closing, but not a page reload. A response continues while the panel is closed; removing the component stops its timer. The panel is nonmodal and does not trap focus. At 1200px and wider it shares the layout with the right frame; below that it overlays the right edge.

Methods: `open(originEditor?)`, `close()`, and `addSelection(text, originEditor?)`. The optional origin is used to return focus. Messages and snippets are plain text, never interpreted as HTML. Replies are a local simulation: no AI, network request, persistence, or document modification is performed.

Drag the panel's left edge to resize its width. The focusable separator supports Left/Right arrows (16px), Shift+Arrow (48px), Home (minimum), and End (maximum), with an announced width. Width stays between 320px and 800px where space allows, leaves at least 320px for the desktop document, and fits smaller viewports. The chosen width survives closing and reopening during the current page session.
