(() => {
	let sequence = 0;
	let highlighter;
	class TextFileViewer extends HTMLElement {
		connectedCallback() {
			if (this.initialized) return;
			this.initialized = true;
			this.classList.add("saTextFileViewer", "saInlineContent");
			this.id ||= `text-file-viewer-${++sequence}`;
			this.setAttribute("role", "region");
			this.setAttribute("aria-labelledby", `${this.id}-title`);
			const header = window.SaInlinePanel.createHeader({ titleId: `${this.id}-title`, backLabel: "Back to chat", closeLabel: "Close file preview" });
			header.querySelector(".saInlineActions").insertAdjacentHTML("afterbegin", `
				<a class="saTextFileViewerAction" data-viewer-download download aria-label="Download file" data-tooltip="Download file"><i class="saIcon far fa-arrow-down" aria-hidden="true"></i></a>
				<button type="button" class="saCopyButton saTextFileViewerAction" data-viewer-copy disabled aria-label="Copy file contents" data-tooltip="Copy file contents"><i class="saIcon far fad fa-clone" aria-hidden="true"></i><i class="saIcon far fad fa-check" aria-hidden="true"></i></button>
				<button type="button" class="saTextFileViewerAction" data-viewer-wrap aria-label="Wrap lines" data-tooltip="Wrap lines" aria-pressed="true" aria-controls="${this.id}-source"><i class="saIcon far fa-arrow-turn-down-left" aria-hidden="true"></i></button>`);
			this.innerHTML = `${header.outerHTML}
			<p class="saScreenReaderOnly" role="status" aria-live="polite"></p>
			<div class="saTextFileViewerContent saMarkdownContent">
				<pre class="saTextFileViewerSource saWrapLines" id="${this.id}-source" tabindex="0" aria-label="Read-only file source"><code></code></pre>
			</div>`;
			this.titleElement = this.querySelector("h3");
			this.status = this.querySelector('[role="status"]');
			this.scrollContent = this.querySelector(".saTextFileViewerContent");
			this.source = this.querySelector("pre");
			this.code = this.querySelector("code");
			this.copyButton = this.querySelector("[data-viewer-copy]");
			this.querySelector("[data-inline-back]").addEventListener("click", () => this.dismiss());
			this.querySelector("[data-viewer-wrap]").addEventListener("click", event => {
				const pressed = event.currentTarget.getAttribute("aria-pressed") !== "true";
				event.currentTarget.setAttribute("aria-pressed", String(pressed));
				this.source.classList.toggle("saWrapLines", pressed);
			});
			this.copyButton.addEventListener("click", async () => {
				const version = this.version;
				try {
					await navigator.clipboard.writeText(this.text);
					if (version === this.version) {
						this.status.textContent = "File contents copied.";
						this.copyButton.classList.add("saCopied");
						this.copyButton.setAttribute("aria-label", "Copied");
						clearTimeout(this.copyFeedbackTimer);
						this.copyFeedbackTimer = setTimeout(() => this.resetCopyFeedback(), 2000);
					}
				} catch {
					if (version === this.version) this.status.textContent = "Could not copy automatically. Select the source text and copy it manually.";
				}
			});
		}

		async openFile(file, canGoBack) {
			this.release();
			const version = this.version;
			this.hidden = false;
			this.text = "";
			this.code.replaceChildren();
			this.source.hidden = true;
			this.scrollContent.scrollTop = 0;
			this.scrollContent.scrollLeft = 0;
			this.copyButton.disabled = true;
			this.titleElement.textContent = file.name;
			this.titleElement.focus({ preventScroll: true });
			this.querySelector("[data-inline-back]").hidden = !canGoBack;
			// Force downloads rather than navigating to active HTML/SVG content.
			this.downloadUrl = URL.createObjectURL(new Blob([file], { type: "application/octet-stream" }));
			const download = this.querySelector("[data-viewer-download]");
			download.href = this.downloadUrl; download.download = file.name;
			const extension = file.name.split(".").pop().toLowerCase();
			const extensions = "txt text md markdown html htm css less scss js mjs cjs jsx ts tsx json xml svg yaml yml py sql sh ps1 cs java c cpp h rb rs go log csv tsv ini toml".split(" ");
			if (file.size > 2 * 1024 * 1024) { this.status.textContent = "This file is too large to preview (2 MB limit). You can still download it."; return; }
			if (!extensions.includes(extension) && !file.type.startsWith("text/") && !/json|xml|javascript/.test(file.type) && file.type && file.type !== "application/octet-stream") {
				this.status.textContent = "Preview is available for text files only. You can still download this file."; return;
			}
			this.status.textContent = "Reading local file…";
			try {
				const text = await file.text();
				if (version !== this.version) return;
				if (/[\x00-\x08\x0e-\x1f]/.test(text)) { this.status.textContent = "This file is not readable text. You can still download it."; return; }
				this.text = text;
				this.code.textContent = text;
				this.source.hidden = false;
				this.copyButton.disabled = false;
				this.status.textContent = text ? "Read-only source · Local file" : "This file is empty.";
				// Highlight only small files, using the same library as the editor.
				if (text.length < 100000) this.highlight(text, extension, version);
			} catch {
				if (version === this.version) this.status.textContent = "This file could not be read. Try attaching it again.";
			}
		}

		async highlight(text, extension, version) {
			const languages = { js: "javascript", mjs: "javascript", jsx: "javascript", ts: "typescript", tsx: "typescript", html: "xml", htm: "xml", svg: "xml", md: "markdown", py: "python", cs: "csharp", sh: "bash", yml: "yaml" };
			try {
				highlighter ||= import("https://esm.sh/lowlight@3.3.0").then(({ createLowlight, common }) => createLowlight(common));
				const engine = await highlighter;
				if (version !== this.version || !engine.registered(languages[extension] || extension)) return;
				const tree = engine.highlight(languages[extension] || extension, text);
				const render = node => {
					if (node.type === "text") return document.createTextNode(node.value);
					const span = document.createElement("span");
					span.className = (node.properties?.className || []).filter(name => /^hljs-[\w-]+$/.test(name)).join(" ");
					span.append(...(node.children || []).map(render)); return span;
				};
				this.code.replaceChildren(...tree.children.map(render));
			} catch { /* Plain source remains available if highlighting cannot load. */ }
		}

		dismiss() { this.dispatchEvent(new CustomEvent("file-viewer-close", { bubbles: true })); }
		resetCopyFeedback() {
			clearTimeout(this.copyFeedbackTimer);
			this.copyButton?.classList.remove("saCopied");
			this.copyButton?.setAttribute("aria-label", "Copy file contents");
		}
		release() {
			this.resetCopyFeedback();
			this.version = (this.version || 0) + 1;
			if (this.downloadUrl) URL.revokeObjectURL(this.downloadUrl);
			this.downloadUrl = null;
		}
		disconnectedCallback() { this.release(); }
	}
	customElements.define("text-file-viewer", TextFileViewer);
})();
