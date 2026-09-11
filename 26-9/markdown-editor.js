(() => {
	"use strict";

	let nextId = 0;
	let dependencies;
	const loadEditor = () => dependencies ||= Promise.all([
		import("https://esm.sh/@tiptap/core@3.31.3"),
		import("https://esm.sh/@tiptap/starter-kit@3.31.3"),
		import("https://esm.sh/@tiptap/markdown@3.31.3"),
		import("https://esm.sh/@tiptap/extension-image@3.31.3"),
		import("https://esm.sh/@tiptap/extension-table@3.31.3")
	]);

	const isSafeUrl = value => /^(?:(?:https?):\/\/\S+|(?:mailto|tel):\S+|#\S+|(?:\.{0,2}\/)[^\s]+|(?:[a-z0-9_-]+\/)*[a-z0-9_.~-]+(?:[?#]\S*)?)$/i.test(value);

	class MarkdownEditor extends HTMLElement {
		async connectedCallback() {
			if (this.loading || this.editor) return;
			this.source = this.querySelector("textarea");
			if (!this.source) return;
			this.loading = true;
			this.status = document.createElement("p");
			this.status.setAttribute("role", "status");
			this.status.textContent = "Loading editor…";
			this.append(this.status);

			try {
				const [{ Editor }, { StarterKit }, { Markdown }, { Image }, { TableKit }] = await loadEditor();
				if (!this.isConnected) return;
				this.buildControls();
				this.editor = new Editor({
					element: this.surface,
					extensions: [
						StarterKit.configure({
							// Keep the document within the Markdown features this POC exposes.
							underline: false,
							link: {
								openOnClick: false,
								autolink: true,
								linkOnPaste: true,
								defaultProtocol: "https",
								HTMLAttributes: { target: null }
							}
						}),
						Image.configure({ allowBase64: false }),
						TableKit.configure({ table: { resizable: false } }),
						Markdown
					],
					content: this.source.value,
					contentType: "markdown",
					injectCSS: false,
					editorProps: {
						attributes: {
							class: "markdown-editor-document",
							role: "textbox",
							"aria-multiline": "true",
							"aria-labelledby": `${this.controlId}-label`,
							"aria-describedby": `${this.controlId}-help`,
							spellcheck: "true"
						},
						handleDOMEvents: {
							// Emit input only after Markdown has caught up with the document.
							input: (_view, event) => { event.stopPropagation(); return false; }
						},
						handleKeyDown: (_view, event) => {
							if (!event.isComposing && !event.altKey && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
								event.preventDefault();
								this.openLink();
								return true;
							}
							return false;
						}
					},
					onUpdate: () => this.sync(true),
					onTransaction: () => this.updateButtons()
				});
				this.source.readOnly = true;
				this.bindControls();
				this.sync(false);
				this.status.textContent = "";
			} catch (error) {
				this.teardown();
				this.status.textContent = "The visual editor could not load. You can still edit the Markdown below; reload to try again.";
				this.prepend(this.status);
				console.error("Markdown editor initialization failed", error);
			} finally {
				this.loading = false;
				if (!this.isConnected) this.status.remove();
			}
		}

		buildControls() {
			this.controlId = `markdown-editor-${++nextId}`;
			const id = this.controlId;
			this.sourceLabel = Array.from(this.source.labels || []).find(label => this.contains(label));
			this.shell = document.createElement("div");
			this.shell.innerHTML = `
				<p id="${id}-label"><strong>Content</strong></p>
				<fieldset class="markdown-editor-actions">
					<legend>Formatting</legend>
					<label>Heading level
						<select data-heading-level>
							<option value="paragraph">Paragraph</option>
							<option value="1">Heading 1</option>
							<option value="2">Heading 2</option>
							<option value="3">Heading 3</option>
							<option value="4">Heading 4</option>
							<option value="5">Heading 5</option>
							<option value="6">Heading 6</option>
						</select>
					</label>
					<button type="button" data-command="bold" aria-keyshortcuts="Control+B Meta+B">Bold</button>
					<button type="button" data-command="italic" aria-keyshortcuts="Control+I Meta+I">Italic</button>
					<button type="button" data-command="strike">Strikethrough</button>
					<button type="button" data-command="link" aria-keyshortcuts="Control+K Meta+K" aria-haspopup="dialog">Link</button>
					<button type="button" data-command="image" aria-haspopup="dialog">Image</button>
					<button type="button" data-command="bullet">Bulleted list</button>
					<button type="button" data-command="number">Numbered list</button>
					<button type="button" data-command="quote">Quote</button>
					<button type="button" data-command="code">Inline code</button>
					<button type="button" data-command="codeblock">Code block</button>
					<button type="button" data-command="horizontalRule">Horizontal rule</button>
					<details class="markdown-editor-table-menu">
						<summary>Table</summary>
						<div role="group" aria-label="Table actions">
							<button type="button" data-command="table" aria-haspopup="dialog">Insert table</button>
							<button type="button" data-command="addRowAfter">Add row</button>
							<button type="button" data-command="deleteRow">Delete row</button>
							<button type="button" data-command="addColumnAfter">Add column</button>
							<button type="button" data-command="deleteColumn">Delete column</button>
							<button type="button" data-command="deleteTable">Delete table</button>
						</div>
					</details>
					<button type="button" data-command="undo">Undo</button>
					<button type="button" data-command="redo">Redo</button>
				</fieldset>
				<div data-editor-surface></div>
				<p id="${id}-help">Write and format your content directly. Ctrl/Cmd + B: bold, I: italic, K: link.</p>
				<details data-source-details>
					<summary>Markdown source</summary>
					<p>Generated automatically from your content.</p>
				</details>
				<dialog data-link-dialog aria-labelledby="${id}-link-dialog-title">
					<h2 id="${id}-link-dialog-title">Edit link</h2>
					<p><label for="${id}-url">URL</label></p>
					<input id="${id}-url" type="text" inputmode="url" required placeholder="https://example.com" autofocus>
					<p><label for="${id}-link-title">Title <span>(optional)</span></label></p>
					<input id="${id}-link-title" type="text">
					<p>
						<button type="button" data-link-save>Apply link</button>
						<button type="button" data-link-remove>Remove link</button>
						<button type="button" data-link-cancel>Cancel</button>
					</p>
				</dialog>
				<dialog data-image-dialog aria-labelledby="${id}-image-title">
					<h2 id="${id}-image-title">Image</h2>
					<p><label for="${id}-image-url">Image URL</label></p>
					<input id="${id}-image-url" type="text" inputmode="url" required placeholder="https://example.com/image.jpg">
					<p><label for="${id}-image-alt">Alternative text</label></p>
					<input id="${id}-image-alt" type="text" aria-describedby="${id}-image-alt-help">
					<p id="${id}-image-alt-help">Describe the image. Leave blank only if it is decorative.</p>
					<p>
						<button type="button" data-image-save>Insert image</button>
						<button type="button" data-image-remove>Remove image</button>
						<button type="button" data-image-cancel>Cancel</button>
					</p>
				</dialog>
				<dialog data-table-dialog aria-labelledby="${id}-table-title">
					<h2 id="${id}-table-title">Insert table</h2>
					<p><label for="${id}-table-rows">Rows, including header</label></p>
					<input id="${id}-table-rows" type="number" min="2" max="20" value="3" required>
					<p><label for="${id}-table-columns">Columns</label></p>
					<input id="${id}-table-columns" type="number" min="1" max="10" value="3" required>
					<p>
						<button type="button" data-table-save>Insert table</button>
						<button type="button" data-table-cancel>Cancel</button>
					</p>
				</dialog>`;
			const details = this.shell.querySelector("[data-source-details]");
			if (this.sourceLabel) details.append(this.sourceLabel);
			details.append(this.source);
			this.prepend(this.shell);
			this.surface = this.shell.querySelector("[data-editor-surface]");
			this.linkDialog = this.shell.querySelector("[data-link-dialog]");
			this.urlInput = this.linkDialog.querySelector(`#${id}-url`);
			this.linkTitleInput = this.linkDialog.querySelector(`#${id}-link-title`);
			this.imageDialog = this.shell.querySelector("[data-image-dialog]");
			this.imageUrlInput = this.imageDialog.querySelector(`#${id}-image-url`);
			this.imageAltInput = this.imageDialog.querySelector(`#${id}-image-alt`);
			this.tableDialog = this.shell.querySelector("[data-table-dialog]");
			this.tableRowsInput = this.tableDialog.querySelector(`#${id}-table-rows`);
			this.tableColumnsInput = this.tableDialog.querySelector(`#${id}-table-columns`);
		}

		bindControls() {
			this.events = new AbortController();
			const options = { signal: this.events.signal };
			this.shell.querySelector("fieldset").addEventListener("click", event => {
				const button = event.target.closest("button[data-command]");
				if (button) {
					button.closest("details")?.removeAttribute("open");
					this.format(button.dataset.command);
				}
			}, options);
			this.headingSelect = this.shell.querySelector("[data-heading-level]");
			this.headingSelect.addEventListener("change", () => {
				const value = this.headingSelect.value;
				const chain = this.editor.chain().focus();
				if (value === "paragraph") chain.setParagraph().run();
				else chain.setHeading({ level: Number(value) }).run();
			}, options);
			this.linkDialog.querySelector("[data-link-save]").addEventListener("click", () => this.applyLink(), options);
			this.linkDialog.querySelector("[data-link-remove]").addEventListener("click", () => {
				this.linkDialog.close();
				this.editor.chain().focus().setTextSelection(this.linkSelection).extendMarkRange("link").unsetLink().run();
			}, options);
			this.linkDialog.querySelector("[data-link-cancel]").addEventListener("click", () => this.linkDialog.close(), options);
			this.urlInput.addEventListener("keydown", event => {
				if (event.key === "Enter") { event.preventDefault(); this.applyLink(); }
			}, options);

			this.imageDialog.querySelector("[data-image-save]").addEventListener("click", () => this.applyImage(), options);
			this.imageDialog.querySelector("[data-image-remove]").addEventListener("click", () => {
				this.imageDialog.close();
				this.editor.chain().focus().setNodeSelection(this.imageSelection.from).deleteSelection().run();
			}, options);
			this.imageDialog.querySelector("[data-image-cancel]").addEventListener("click", () => this.imageDialog.close(), options);
			this.imageUrlInput.addEventListener("keydown", event => {
				if (event.key === "Enter") { event.preventDefault(); this.applyImage(); }
			}, options);
			this.imageAltInput.addEventListener("keydown", event => {
				if (event.key === "Enter") { event.preventDefault(); this.applyImage(); }
			}, options);

			this.tableDialog.querySelector("[data-table-save]").addEventListener("click", () => this.applyTable(), options);
			this.tableDialog.querySelector("[data-table-cancel]").addEventListener("click", () => this.tableDialog.close(), options);
			this.tableDialog.addEventListener("keydown", event => {
				if (event.key === "Enter" && event.target.matches("input")) { event.preventDefault(); this.applyTable(); }
			}, options);

			this.shell.querySelectorAll("dialog input").forEach(input => {
				input.addEventListener("input", event => {
					event.stopPropagation();
					input.setCustomValidity("");
				}, options);
			});
			this.source.form?.addEventListener("reset", event => {
				queueMicrotask(() => { if (!event.defaultPrevented && this.editor) this.value = this.source.value; });
			}, options);
		}

		format(command) {
			if (command === "link") return this.openLink();
			if (command === "image") return this.openImage();
			if (command === "table") return this.tableDialog.showModal();
			const chain = this.editor.chain().focus();
			const actions = {
				bold: () => chain.toggleBold(), italic: () => chain.toggleItalic(), strike: () => chain.toggleStrike(),
				bullet: () => chain.toggleBulletList(), number: () => chain.toggleOrderedList(),
				quote: () => chain.toggleBlockquote(), code: () => chain.toggleCode(),
				codeblock: () => chain.toggleCodeBlock(), horizontalRule: () => chain.setHorizontalRule(),
				addRowAfter: () => chain.addRowAfter(), deleteRow: () => chain.deleteRow(),
				addColumnAfter: () => chain.addColumnAfter(), deleteColumn: () => chain.deleteColumn(),
				deleteTable: () => chain.deleteTable(), undo: () => chain.undo(), redo: () => chain.redo()
			};
			actions[command]?.().run();
		}

		openLink() {
			const { from, to } = this.editor.state.selection;
			this.linkSelection = { from, to };
			const attributes = this.editor.getAttributes("link");
			this.urlInput.value = attributes.href || "";
			this.linkTitleInput.value = attributes.title || "";
			this.urlInput.setCustomValidity("");
			this.linkDialog.querySelector("[data-link-remove]").hidden = !this.editor.isActive("link");
			this.linkDialog.showModal();
			this.urlInput.select();
		}

		applyLink() {
			const href = this.urlInput.value.trim();
			const title = this.linkTitleInput.value.trim() || null;
			this.urlInput.setCustomValidity(isSafeUrl(href) ? "" : "Enter a web, email, telephone, relative, or fragment URL.");
			if (!this.urlInput.reportValidity()) return;
			this.linkDialog.close();
			const chain = this.editor.chain().focus().setTextSelection(this.linkSelection);
			if (this.linkSelection.from === this.linkSelection.to && !this.editor.isActive("link")) {
				chain.insertContent({ type: "text", text: href, marks: [{ type: "link", attrs: { href, title } }] }).run();
			} else {
				chain.extendMarkRange("link").setLink({ href, title }).run();
			}
		}

		openImage() {
			const { from, to } = this.editor.state.selection;
			this.imageSelection = { from, to };
			this.editingImage = this.editor.isActive("image");
			const attributes = this.editingImage ? this.editor.getAttributes("image") : {};
			this.imageUrlInput.value = attributes.src || "";
			this.imageAltInput.value = attributes.alt || "";
			this.imageUrlInput.setCustomValidity("");
			this.imageDialog.querySelector("[data-image-save]").textContent = this.editingImage ? "Update image" : "Insert image";
			this.imageDialog.querySelector("[data-image-remove]").hidden = !this.editingImage;
			this.imageDialog.showModal();
			this.imageUrlInput.focus();
		}

		applyImage() {
			const src = this.imageUrlInput.value.trim();
			const alt = this.imageAltInput.value.trim();
			this.imageUrlInput.setCustomValidity(isSafeUrl(src) && !/^(?:mailto|tel):/i.test(src) ? "" : "Enter a web or relative image URL.");
			if (!this.imageUrlInput.reportValidity()) return;
			this.imageDialog.close();
			const chain = this.editor.chain().focus();
			if (this.editingImage) chain.setNodeSelection(this.imageSelection.from).updateAttributes("image", { src, alt }).run();
			else chain.setImage({ src, alt }).run();
		}

		applyTable() {
			if (!this.tableRowsInput.reportValidity() || !this.tableColumnsInput.reportValidity()) return;
			this.tableDialog.close();
			this.editor.chain().focus().insertTable({
				rows: Number(this.tableRowsInput.value),
				cols: Number(this.tableColumnsInput.value),
				withHeaderRow: true
			}).run();
		}

		updateButtons() {
			if (!this.editor) return;
			const activeHeading = [1, 2, 3, 4, 5, 6].find(level => this.editor.isActive("heading", { level }));
			if (this.headingSelect) this.headingSelect.value = activeHeading ? String(activeHeading) : "paragraph";
			const types = { bold: "bold", italic: "italic", strike: "strike", link: "link", bullet: "bulletList", number: "orderedList", quote: "blockquote", code: "code", codeblock: "codeBlock" };
			const commands = {
				horizontalRule: "setHorizontalRule", table: "insertTable",
				addRowAfter: "addRowAfter", deleteRow: "deleteRow",
				addColumnAfter: "addColumnAfter", deleteColumn: "deleteColumn",
				deleteTable: "deleteTable", undo: "undo", redo: "redo"
			};
			this.shell.querySelectorAll("[data-command]").forEach(button => {
				const command = button.dataset.command;
				if (types[command]) {
					button.setAttribute("aria-pressed", String(this.editor.isActive(types[command])));
					button.disabled = false;
				} else if (commands[command]) {
					button.disabled = !this.editor.can()[commands[command]]();
				} else {
					button.disabled = false;
				}
			});
		}

		sync(emit) {
			if (!this.editor) return;
			this.source.value = this.editor.getMarkdown();
			this.updateButtons();
			if (emit) this.source.dispatchEvent(new Event("input", { bubbles: true }));
		}

		get value() {
			return (this.source || this.querySelector("textarea"))?.value ?? "";
		}

		set value(value) {
			const source = this.source || this.querySelector("textarea");
			if (!source) return;
			source.value = String(value ?? "");
			if (this.editor) {
				this.editor.commands.setContent(source.value, { contentType: "markdown", emitUpdate: false });
				this.sync(false);
			}
		}

		teardown() {
			this.events?.abort();
			this.shell?.querySelectorAll("dialog[open]").forEach(dialog => dialog.close());
			this.editor?.destroy();
			this.editor = null;
			if (this.sourceLabel) this.append(this.sourceLabel);
			if (this.source) { this.source.readOnly = false; this.append(this.source); }
			this.shell?.remove();
		}

		disconnectedCallback() {
			// Moving the component within the document should preserve its editor state.
			queueMicrotask(() => {
				if (this.isConnected) return;
				this.teardown();
				this.status?.remove();
			});
		}
	}

	if (!customElements.get("markdown-editor")) customElements.define("markdown-editor", MarkdownEditor);
})();
