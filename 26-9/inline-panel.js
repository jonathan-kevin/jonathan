// Reusable nonmodal side-panel controller. No chat or file-viewer dependencies.
(() => {
	let sequence = 0;
	class InlinePanel {
		static createHeader({ titleId, title = "", backLabel, closeLabel = "Close panel" }) {
			const header = document.createElement("header");
			header.className = "saInlineHeader";
			if (backLabel) {
				const back = document.createElement("button");
				back.type = "button";
				back.className = "saInlineBack";
				back.dataset.inlineBack = "";
				back.textContent = backLabel;
				header.append(back);
			}
			const heading = document.createElement("h3");
			heading.className = "saInlineTitle";
			heading.id = titleId;
			heading.tabIndex = -1;
			heading.textContent = title;
			const actions = document.createElement("div");
			actions.className = "saInlineActions";
			const close = document.createElement("button");
			close.type = "button";
			close.className = "saInlineClose";
			close.dataset.inlineClose = "";
			close.setAttribute("aria-label", closeLabel);
			close.setAttribute("aria-keyshortcuts", "Escape");
			close.innerHTML = '<i class="saIcon far fa-xmark" aria-hidden="true"></i>';
			actions.append(close);
			header.append(heading, actions);
			return header;
		}

		constructor(host, { onDismiss, shouldDismiss, restoreFocus } = {}) {
			this.host = host;
			this.onDismiss = onDismiss || (() => this.close());
			this.shouldDismiss = shouldDismiss;
			this.restoreFocus = restoreFocus || (target => target.focus({ preventScroll: true }));
			host.classList.add("saInlinePanel");
			host.id ||= `inline-panel-${++sequence}`;
			if (!host.hasAttribute("role")) host.setAttribute("role", "complementary");
			const heading = host.querySelector(".saInlineTitle");
			if (heading && !host.hasAttribute("aria-labelledby")) host.setAttribute("aria-labelledby", heading.id);
			const resize = document.createElement("div");
			resize.className = "saInlineResize";
			resize.tabIndex = 0;
			resize.setAttribute("role", "separator");
			resize.setAttribute("aria-label", "Resize panel");
			resize.setAttribute("aria-orientation", "vertical");
			resize.setAttribute("aria-describedby", `${host.id}-resize-help`);
			const help = document.createElement("p");
			help.className = "saScreenReaderOnly";
			help.id = `${host.id}-resize-help`;
			help.textContent = "Drag to resize. Left Arrow widens the panel, Right Arrow narrows it. Hold Shift for larger steps. Home sets minimum width; End sets maximum width.";
			host.prepend(resize, help);
			this.setupResize();
			this.connect();
		}

		connect() {
			this.events?.abort();
			this.events = new AbortController();
			const options = { signal: this.events.signal };
			this.host.addEventListener("click", event => {
				if (event.target.closest("[data-inline-close]")?.closest(".saInlinePanel") === this.host) this.requestDismiss(event);
			}, options);
			this.host.addEventListener("keydown", event => {
				if (event.key === "Escape" && !event.isComposing && !event.defaultPrevented) this.requestDismiss(event);
			}, options);
			this.observeSize();
			this.host.inert = this.host.hidden;
			if (this.host.hidden) this.host.setAttribute("aria-hidden", "true");
			else this.host.removeAttribute("aria-hidden");
			this.updateOpenControls();
		}

		requestDismiss(event) {
			if (this.shouldDismiss?.(event) === false) return;
			event.preventDefault();
			event.stopPropagation();
			this.onDismiss();
		}

		disconnect() {
			this.events?.abort();
			this.sizeObserver.disconnect();
			this.endResize();
		}

		setupResize() {
			this.resizeHandle = this.host.querySelector(".saInlineResize");
			this.resizeHandle.setAttribute("aria-controls", this.host.id);
			this.preferredWidth = 32 * parseFloat(getComputedStyle(document.documentElement).fontSize);
			this.resizeHandle.addEventListener("pointerdown", event => {
				if (event.button !== 0 || !event.isPrimary) return;
				event.preventDefault();
				this.resizeHandle.focus({ preventScroll: true });
				this.resizeDrag = { id: event.pointerId, x: event.clientX, width: this.host.getBoundingClientRect().width };
				this.resizeHandle.setPointerCapture(event.pointerId);
				this.host.classList.add("saInlineResizing");
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
				const width = this.host.getBoundingClientRect().width;
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
			if (this.host.parentElement) this.sizeObserver.observe(this.host.parentElement);
		}

		widthBounds() {
			const viewport = document.documentElement.clientWidth;
			const frame = this.host.parentElement?.querySelector(":scope > .saRightFrameRoot");
			// On desktop, leave at least 320px for the document. Small screens use an overlay.
			const available = viewport >= 1200 && frame ? viewport - frame.getBoundingClientRect().left - 320 : viewport;
			const max = Math.max(1, Math.min(800, available));
			return { min: Math.min(320, max), max };
		}

		setWidth(requested, remember = true) {
			const { min, max } = this.widthBounds();
			const width = Math.round(Math.min(max, Math.max(min, requested)));
			if (remember) this.preferredWidth = width;
			this.host.style.setProperty("--sa-inline-width", `${width}px`);
			this.resizeHandle.setAttribute("aria-valuemin", String(Math.round(min)));
			this.resizeHandle.setAttribute("aria-valuemax", String(Math.round(max)));
			this.resizeHandle.setAttribute("aria-valuenow", String(width));
			this.resizeHandle.setAttribute("aria-valuetext", `${width} pixels wide`);
		}

		endResize() {
			const id = this.resizeDrag?.id;
			this.resizeDrag = null;
			this.host.classList.remove("saInlineResizing");
			if (id !== undefined && this.resizeHandle.hasPointerCapture(id)) this.resizeHandle.releasePointerCapture(id);
		}


		open(origin, focusTarget = this.host.querySelector(".saInlineTitle")) {
			this.origin = origin || this.origin;
			this.host.inert = false;
			this.host.removeAttribute("aria-hidden");
			this.host.hidden = false;
			this.updateOpenControls();
			this.setWidth(this.preferredWidth, false);
			focusTarget?.focus({ preventScroll: true });
		}

		close(origin = this.origin) {
			this.endResize();
			if (origin?.isConnected) this.restoreFocus(origin);
			// Remove focusability immediately while allowing the visual exit transition.
			if (this.host.contains(document.activeElement)) document.activeElement.blur();
			this.host.inert = true;
			this.host.setAttribute("aria-hidden", "true");
			this.host.hidden = true;
			this.updateOpenControls();
		}

		updateOpenControls() {
			document.querySelectorAll("[aria-controls][aria-expanded]").forEach(button => {
				if (button.getAttribute("aria-controls").split(/\s+/).includes(this.host.id)) {
					button.setAttribute("aria-expanded", String(!this.host.hidden));
				}
			});
		}
	}
	window.SaInlinePanel = InlinePanel;
})();

