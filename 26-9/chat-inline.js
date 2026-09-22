// Panel-specific behavior; messaging lives in chat.js.
(() => {
	class InlineChat extends window.SaChatComponent {
		get isInline() { return true; }

		renderHeader(titleId) {
			return `
				<div class="saChatInlineResize" role="separator" tabindex="0" aria-label="Resize document chat" aria-orientation="vertical" aria-describedby="${titleId}-resize-help"></div>
				<p id="${titleId}-resize-help" class="saScreenReaderOnly">Drag to resize. Left Arrow widens chat, Right Arrow narrows it. Hold Shift for larger steps. Home sets minimum width; End sets maximum width.</p>
				<header class="saChatInlineHeader">
					<h3 id="${titleId}">Document chat</h3>
					<button class="saCloseModal" type="button" data-chat-close aria-label="Close document chat" aria-keyshortcuts="Escape"><i class="saIcon far fa-xmark" aria-hidden="true"></i></button>
				</header>
`;
		}

		initializePanel() {
			this.setupResize();
			this.querySelector("[data-chat-close]").addEventListener("click", () => this.close());
		}

		setupResize() {
			this.resizeHandle = this.querySelector(".saChatInlineResize");
			this.resizeHandle.setAttribute("aria-controls", this.id);
			this.preferredWidth = 32 * parseFloat(getComputedStyle(document.documentElement).fontSize);
			this.resizeHandle.addEventListener("pointerdown", event => {
				if (event.button !== 0 || !event.isPrimary) return;
				event.preventDefault();
				this.resizeHandle.focus({ preventScroll: true });
				this.resizeDrag = { id: event.pointerId, x: event.clientX, width: this.getBoundingClientRect().width };
				this.resizeHandle.setPointerCapture(event.pointerId);
				this.classList.add("saChatInlineResizing");
			});
			this.resizeHandle.addEventListener("pointermove", event => {
				if (this.resizeDrag?.id !== event.pointerId) return;
				this.setWidth(this.resizeDrag.width + this.resizeDrag.x - event.clientX);
			});
			["pointerup", "pointercancel", "lostpointercapture"].forEach(type => {
				this.resizeHandle.addEventListener(type, () => this.endResize());
			});
			this.resizeHandle.addEventListener("keydown", event => {
				const { min, max } = this.widthBounds();
				const step = event.shiftKey ? 48 : 16;
				const width = this.getBoundingClientRect().width;
				const values = { ArrowLeft: width + step, ArrowRight: width - step, Home: min, End: max };
				if (!(event.key in values)) return;
				event.preventDefault();
				event.stopPropagation();
				this.setWidth(values[event.key]);
			});
			this.sizeObserver = new ResizeObserver(() => this.setWidth(this.preferredWidth, false));
			this.observeSize();
		}

		observeSize() {
			this.sizeObserver.observe(document.documentElement);
			if (this.parentElement) this.sizeObserver.observe(this.parentElement);
		}

		widthBounds() {
			const viewport = document.documentElement.clientWidth;
			const frame = this.parentElement?.querySelector(":scope > .saRightFrameRoot");
			// On desktop, leave at least 320px for the document. Small screens use an overlay.
			const available = viewport >= 1200 && frame ? viewport - frame.getBoundingClientRect().left - 320 : viewport;
			const max = Math.max(1, Math.min(800, available));
			return { min: Math.min(320, max), max };
		}

		setWidth(requested, remember = true) {
			const { min, max } = this.widthBounds();
			const width = Math.round(Math.min(max, Math.max(min, requested)));
			if (remember) this.preferredWidth = width;
			this.style.setProperty("--sa-chat-inline-width", `${width}px`);
			this.resizeHandle.setAttribute("aria-valuemin", String(Math.round(min)));
			this.resizeHandle.setAttribute("aria-valuemax", String(Math.round(max)));
			this.resizeHandle.setAttribute("aria-valuenow", String(width));
			this.resizeHandle.setAttribute("aria-valuetext", `${width} pixels wide`);
		}

		endResize() {
			const id = this.resizeDrag?.id;
			this.resizeDrag = null;
			this.classList.remove("saChatInlineResizing");
			if (id !== undefined && this.resizeHandle.hasPointerCapture(id)) this.resizeHandle.releasePointerCapture(id);
		}

		open(origin) {
			this.updatePageContext();
			this.origin = origin || this.origin;
			this.inert = false;
			this.removeAttribute("aria-hidden");
			this.hidden = false;
			this.updateOpenControls();
			this.setWidth(this.preferredWidth, false);
			this.composer.focus({ preventScroll: true });
		}

		close(origin = this.origin) {
			this.toggleContextMenu(false);
			this.endResize();
			if (origin?.isConnected) {
				if (origin.editor) origin.editor.commands.focus();
				else origin.focus({ preventScroll: true });
			}
			// The CSS exit transition remains visible briefly, but the closing
			// panel must leave keyboard navigation and the accessibility tree now.
			if (this.contains(document.activeElement)) document.activeElement.blur();
			this.inert = true;
			this.setAttribute("aria-hidden", "true");
			this.hidden = true;
			this.updateOpenControls();
		}

		updateOpenControls() {
			document.querySelectorAll(".saOpenChat[aria-controls]").forEach(button => {
				if (button.getAttribute("aria-controls") === this.id) {
					button.setAttribute("aria-expanded", String(!this.hidden));
				}
			});
		}

	}

	if (!customElements.get("chat-inline")) customElements.define("chat-inline", InlineChat);

	document.addEventListener("click", event => {
		const button = event.target.closest(".saOpenChat[aria-controls]");
		if (!button || button.disabled || button.getAttribute("aria-disabled") === "true") return;
		const chat = document.getElementById(button.getAttribute("aria-controls"));
		if (chat?.matches("chat-inline") && typeof chat.open === "function") {
			event.preventDefault();
			if (chat.hidden) chat.open(button);
			else chat.close(button);
		}
	});
})();
