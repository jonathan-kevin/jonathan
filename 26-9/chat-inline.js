// Chat adapter for the shared inline panel; messaging lives in chat.js.
(() => {
	class InlineChat extends window.SaChatComponent {
		get isInline() { return true; }

		renderHeader(titleId) {
			return window.SaInlinePanel.createHeader({ titleId, title: "Document chat", closeLabel: "Close document chat" }).outerHTML;
		}

		initializePanel() {
			this.chatHeader = this.querySelector(".saInlineHeader");
			this.chatContent = this.querySelector(".saChatWrapper");
			this.chatContent.classList.add("saInlineContent");
			this.panel = new window.SaInlinePanel(this, {
				onDismiss: () => this.close(),
				shouldDismiss: event => !event.target.closest(".saChatMessageEdit"),
				restoreFocus: target => {
					if (target.editor) target.editor.commands.focus();
					else target.focus({ preventScroll: true });
				}
			});
		}

		reconnectPanel() { this.panel?.connect(); }
		disconnectPanel() { this.panel?.disconnect(); }

		open(origin) {
			if (this.filePreviewState) this.closeFilePreview({ keepOpen: true, focus: false });
			this.updatePageContext();
			this.panel.open(origin, this.composer);
		}

		close(origin = this.panel.origin) {
			if (this.filePreviewState) { this.closeFilePreview(); return; }
			this.toggleContextMenu(false);
			this.panel.close(origin);
		}

		openFile(file, origin) {
			if (!this.fileViewer) {
				this.fileViewer = document.createElement("text-file-viewer");
				this.fileViewer.hidden = true;
				this.append(this.fileViewer);
				this.fileViewer.addEventListener("file-viewer-close", () => this.closeFilePreview());
			}
			if (!this.filePreviewState) {
				const state = { wasOpen: !this.hidden, scrollTop: this.scroll.scrollTop, previousOrigin: this.panel.origin, label: this.getAttribute("aria-labelledby") };
				this.open(origin);
				this.filePreviewState = state;
			}
			this.filePreviewState.origin?.setAttribute("aria-expanded", "false");
			this.filePreviewState.origin = origin;
			origin?.setAttribute("aria-controls", this.fileViewer.id);
			origin?.setAttribute("aria-expanded", "true");
			this.toggleContextMenu(false);
			this.classList.add("saInlineFullWidth");
			this.chatHeader.hidden = true;
			this.chatContent.hidden = true;
			this.chatContent.inert = true;
			this.setAttribute("aria-labelledby", `${this.fileViewer.id}-title`);
			this.fileViewer.openFile(file, this.filePreviewState.wasOpen);
		}

		closeFilePreview({ keepOpen = false, focus = true } = {}) {
			const state = this.filePreviewState;
			if (!state) return;
			this.filePreviewState = null;
			state.origin?.setAttribute("aria-expanded", "false");
			this.fileViewer.hidden = true;
			this.fileViewer.release();
			this.classList.remove("saInlineFullWidth");
			this.chatHeader.hidden = false;
			this.chatContent.hidden = false;
			this.chatContent.inert = false;
			this.setAttribute("aria-labelledby", state.label);
			this.scroll.scrollTop = state.scrollTop;
			this.panel.origin = state.previousOrigin;
			if (!state.wasOpen && !keepOpen) this.close(state.origin);
			else if (focus) {
				const target = state.origin?.isConnected ? state.origin : this.composer;
				target.focus({ preventScroll: true });
			}
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
