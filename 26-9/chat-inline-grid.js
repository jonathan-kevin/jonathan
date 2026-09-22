// Native text selection for grids and chat-inline messages; no editor dependency.
(() => {
	const sources = document.querySelectorAll("[data-chat-selection-source], chat-inline .saChatLog, softadmin-chat[data-chat-interactive] .saChatLog");
	for (const source of sources) {
		const sourceChat = source.closest("chat-inline, softadmin-chat[data-chat-interactive]");
		const chat = sourceChat || document.getElementById(source.dataset.chatTarget);
		let toolbar = document.getElementById(source.dataset.chatToolbar);
		if (sourceChat) {
			source.tabIndex = -1;
			toolbar = document.createElement("div");
			toolbar.className = "saFloatingToolbar saChatInlineSelectionToolbar";
			toolbar.setAttribute("role", "toolbar");
			toolbar.setAttribute("aria-label", "Selected chat text actions");
			toolbar.setAttribute("aria-keyshortcuts", "Alt+Shift+A");
			toolbar.hidden = true;
			toolbar.innerHTML = '<ul><li><button class="saButtonToolbarDark" type="button" data-send-selection>Send to chat</button></li></ul>';
			toolbar.querySelector("button").setAttribute("aria-controls", chat.id);
			document.body.append(toolbar);
		}
		const send = toolbar?.querySelector("[data-send-selection]");
		if (!send || !chat) continue;
		const scroll = source.closest("[data-chat-scroll], .scrollcontent") || source;
		let savedRange = null;
		let selectedText = "";
		let selecting = false;
		let dismissed = false;
		let frame = 0;

		function hide() {
			toolbar.hidden = true;
		}

		function position() {
			if (!savedRange || dismissed) return hide();
			const bounds = scroll.getBoundingClientRect();
			const left = Math.max(0, bounds.left);
			const right = Math.min(window.innerWidth, bounds.right);
			const top = Math.max(0, bounds.top);
			const bottom = Math.min(window.innerHeight, bounds.bottom);
			const rect = Array.from(savedRange.getClientRects()).find(rect =>
				rect.width > 0 && rect.height > 0 && rect.bottom > top && rect.top < bottom && rect.right > left && rect.left < right);
			if (!rect) return hide();
			toolbar.hidden = false;
			const width = toolbar.offsetWidth;
			const height = toolbar.offsetHeight;
			const x = Math.max(8, Math.min(Math.max(rect.left, left), window.innerWidth - width - 8));
			let y = rect.top - height - 8;
			if (y < top) y = Math.min(rect.bottom, bottom) + 8;
			y = Math.max(8, Math.min(y, window.innerHeight - height - 8));
			toolbar.style.left = `${x}px`;
			toolbar.style.top = `${y}px`;
		}

		function update() {
			frame = 0;
			if (dismissed || selecting) return hide();
			// Keyboard focus in the toolbar may collapse the browser selection.
			if (toolbar.contains(document.activeElement)) return position();
			const selection = window.getSelection();
			if (!selection?.rangeCount || selection.isCollapsed) {
				savedRange = null;
				return hide();
			}
			const range = selection.getRangeAt(0);
			if (!source.contains(range.startContainer) || !source.contains(range.endContainer)) {
				savedRange = null;
				return hide();
			}
			if (sourceChat) {
				const element = node => node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
				const start = element(range.startContainer);
				const end = element(range.endContainer);
				const body = start.closest(".saChatMessageBody, .saChatMessageContent");
				// Message text only: leave the composer, edit fields and controls alone.
				if (!body || !body.contains(end) || [start, end].some(node => node.closest("button, [contenteditable], .saScreenReaderOnly"))) {
					savedRange = null;
					return hide();
				}
			}
			selectedText = selection.toString().trim();
			if (!selectedText) return hide();
			savedRange = range.cloneRange();
			position();
		}

		function schedule() {
			if (!frame) frame = requestAnimationFrame(update);
		}

		document.addEventListener("selectionchange", schedule);
		document.addEventListener("chat-inline-source-jump", () => { dismissed = true; hide(); });
		document.addEventListener("pointerdown", event => {
			if (toolbar.contains(event.target)) return;
			dismissed = !source.contains(event.target);
			selecting = !dismissed;
			hide();
		});
		for (const type of ["pointerup", "pointercancel"]) {
			document.addEventListener(type, () => {
				selecting = false;
				schedule();
			});
		}
		document.addEventListener("focusin", event => {
			if (toolbar.contains(event.target) || source.contains(event.target)) return;
			dismissed = true;
			hide();
		});
		source.addEventListener("keydown", event => {
			if (event.shiftKey && event.key.startsWith("Arrow")) dismissed = false;
		});
		document.addEventListener("keydown", event => {
			if (event.isComposing) return;
			if (event.altKey && event.shiftKey && event.code === "KeyA") {
				update();
				if (!toolbar.hidden) {
					event.preventDefault();
					send.focus({ preventScroll: true });
				}
			} else if (event.key === "Escape" && !toolbar.hidden) {
				event.preventDefault();
				event.stopPropagation();
				if (toolbar.contains(document.activeElement)) {
					source.focus({ preventScroll: true });
					const selection = window.getSelection();
					selection.removeAllRanges();
					selection.addRange(savedRange);
				}
				dismissed = true;
				hide();
			}
		}, true);
		// Keep the selected text highlighted while clicking its action.
		send.addEventListener("mousedown", event => event.preventDefault());
		send.addEventListener("click", () => {
			if (!savedRange || !selectedText || typeof chat.addSelection !== "function") return;
			dismissed = true;
			hide();
			// Chat excerpts must not replace the external focus-return target.
			chat.addSelection(selectedText, sourceChat ? chat.origin : source, { range: savedRange.cloneRange(), root: source });
		});
		document.addEventListener("scroll", () => { if (!toolbar.hidden) position(); }, true);
		window.addEventListener("resize", () => { if (!toolbar.hidden) position(); });
		new ResizeObserver(() => { if (!toolbar.hidden) position(); }).observe(source);
	}
})();
