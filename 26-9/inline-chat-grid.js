// Native text selection for read-only grids; no editor or AI dependency.
(() => {
	for (const source of document.querySelectorAll("[data-chat-selection-source]")) {
		const toolbar = document.getElementById(source.dataset.chatToolbar);
		const chat = document.getElementById(source.dataset.chatTarget);
		const send = toolbar?.querySelector("[data-send-selection]");
		if (!send || !chat) continue;
		const scroll = source.closest(".scrollcontent") || source;
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
			selectedText = selection.toString().trim();
			if (!selectedText) return hide();
			savedRange = range.cloneRange();
			position();
		}

		function schedule() {
			if (!frame) frame = requestAnimationFrame(update);
		}

		document.addEventListener("selectionchange", schedule);
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
				if (toolbar.contains(document.activeElement)) {
					source.focus({ preventScroll: true });
					const selection = window.getSelection();
					selection.removeAllRanges();
					selection.addRange(savedRange);
				}
				dismissed = true;
				hide();
			}
		});
		// Keep the selected text highlighted while clicking its action.
		send.addEventListener("mousedown", event => event.preventDefault());
		send.addEventListener("click", () => {
			if (!savedRange || !selectedText || typeof chat.addSelection !== "function") return;
			dismissed = true;
			hide();
			chat.addSelection(selectedText, source);
		});
		document.addEventListener("scroll", () => { if (!toolbar.hidden) position(); }, true);
		window.addEventListener("resize", () => { if (!toolbar.hidden) position(); });
		new ResizeObserver(() => { if (!toolbar.hidden) position(); }).observe(source);
	}
})();
