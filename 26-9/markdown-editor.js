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

	const textColors = new Set(["muted", "info", "success", "warning", "danger"]);
	const isSafeUrl = value => /^(?:(?:https?):\/\/\S+|(?:mailto|tel):\S+|#\S+|(?:\.{0,2}\/)[^\s]+|(?:[a-z0-9_-]+\/)*[a-z0-9_.~-]+(?:[?#]\S*)?)$/i.test(value);
	const createTextColor = Mark => Mark.create({
		name: "textColor",
		excludes: "code",

		addAttributes() {
			return { color: { default: null } };
		},

		parseHTML() {
			return [{
				tag: "span[data-text-color]",
				getAttrs: element => {
					const color = element.getAttribute("data-text-color");
					return textColors.has(color) ? { color } : false;
				}
			}];
		},

		renderHTML({ HTMLAttributes }) {
			const color = textColors.has(HTMLAttributes.color) ? HTMLAttributes.color : null;
			return color ? ["span", { "data-text-color": color }, 0] : ["span", 0];
		},

		renderMarkdown(node, helpers) {
			const color = node.attrs?.color;
			const content = helpers.renderChildren(node);
			return textColors.has(color) ? `<span data-text-color="${color}">${content}</span>` : content;
		},

		addCommands() {
			return {
				setTextColor: color => ({ commands }) => textColors.has(color) && commands.setMark(this.name, { color }),
				unsetTextColor: () => ({ commands }) => commands.unsetMark(this.name)
			};
		}
	});
	const createUnderline = Mark => Mark.create({
		name: "underline",
		excludes: "code",

		parseHTML() {
			return [{ tag: "u" }];
		},

		renderHTML() {
			return ["u", 0];
		},

		renderMarkdown(node, helpers) {
			return `<u>${helpers.renderChildren(node)}</u>`;
		},

		addCommands() {
			return {
				toggleUnderline: () => ({ commands }) => commands.toggleMark(this.name)
			};
		},

		addKeyboardShortcuts() {
			return { "Mod-u": () => this.editor.commands.toggleUnderline() };
		}
	});

	class MarkdownEditor extends HTMLElement {
		async connectedCallback() {
			if (this.loading || this.editor) return;
			this.source = this.querySelector("textarea");
			if (!this.source) return;
			this.sourceMode = false;
			this.source.readOnly = false;
			this.loading = true;
			this.status = document.createElement("p");
			this.status.setAttribute("role", "status");
			this.status.textContent = "Loading editor…";
			this.append(this.status);

			try {
				const [{ Editor, Mark }, { StarterKit }, { Markdown }, { Image }, { TableKit }] = await loadEditor();
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
						createTextColor(Mark),
						createUnderline(Mark),
						Markdown
					],
					content: this.source.value,
					contentType: "markdown",
					injectCSS: false,
					editorProps: {
						attributes: {
							class: "saMarkdownEditorDocument",
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
			this.shell = document.createElement("div");
			this.shell.innerHTML = `
				<p id="${id}-label"><strong>Content</strong></p>
				<div role="group" class="saMarkdownEditorToolbar" aria-label="Formatting">
					<label class="saInputTextWrapper saLabeled">
						<div class="saLabeledLabel">Heading level</div>
						<select class="saInputText" data-heading-level>
							<option value="paragraph">Paragraph</option>
							<option value="1">Heading 1</option>
							<option value="2">Heading 2</option>
							<option value="3">Heading 3</option>
							<option value="4">Heading 4</option>
							<option value="5">Heading 5</option>
							<option value="6">Heading 6</option>
						</select>
						<div class="saTrailingIconsWrapper"><i class="saIcon far fa-angle-down"></i></div>
					</label>
					<label class="saInputTextWrapper saLabeled">
						<div class="saLabeledLabel">Color</div>
						<select class="saInputText" data-text-color>
							<option value="default">Default</option>
							<option value="muted">Muted</option>
							<option value="info">Info</option>
							<option value="success">Success</option>
							<option value="warning">Warning</option>
							<option value="danger">Danger</option>
						</select>
						<div class="saTrailingIconsWrapper"><i class="saIcon far fa-angle-down"></i></div>
					</label>
					<button type="button" data-command="bold" aria-keyshortcuts="Control+B Meta+B" aria-label="Bold"><i class="saIcon fas fa-bold"></i><i class="saIcon far fa-bold"></i></button>
					<button type="button" data-command="italic" aria-keyshortcuts="Control+I Meta+I" aria-label="Italic"><i class="saIcon fas fa-italic"></i><i class="saIcon far fa-italic"></i></button>
					<button type="button" data-command="underline" aria-keyshortcuts="Control+U Meta+U" aria-label="Underline"><i class="saIcon fas fa-underline"></i><i class="saIcon far fa-underline"></i></button>
					<button type="button" data-command="strike" aria-label="Strikethrough"><i class="saIcon fas fa-strikethrough"></i><i class="saIcon far fa-strikethrough"></i></button>
					<button type="button" data-command="link" aria-keyshortcuts="Control+K Meta+K" aria-haspopup="dialog" aria-label="Link"><i class="saIcon fas fa-link"></i><i class="saIcon far fa-link"></i></button>
					<button type="button" data-command="image" aria-haspopup="dialog" aria-label="Image"><i class="saIcon fas fa-image"></i><i class="saIcon far fa-image"></i></button>
					<button type="button" data-command="bullet" aria-label="Bulleted list"><i class="saIcon fas fa-list"></i><i class="saIcon far fa-list"></i></button>
					<button type="button" data-command="number" aria-label="Numbered list"><i class="saIcon fas fa-list-ol"></i><i class="saIcon far fa-list-ol"></i></button>
					<button type="button" data-command="quote" aria-label="Quote"><i class="saIcon fas fa-quote-right"></i><i class="saIcon far fa-quote-right"></i></button>
					<button type="button" data-command="code" aria-label="Inline code"><i class="saIcon fas fa-code"></i><i class="saIcon far fa-code"></i></button>
					<button type="button" data-command="codeblock" aria-label="Code block"><i class="saIcon fas fa-square-code"></i><i class="saIcon far fa-square-code"></i></button>
					<button type="button" data-command="horizontalRule" aria-label="Horizontal rule"><i class="saIcon fas fa-ruler"></i><i class="saIcon far fa-ruler"></i></button>
					<button type="button" data-command="markdown" aria-label="View as markdown" aria-controls="${id}-visual-view ${id}-source-view" aria-pressed="false"><i class="saIcon fab fa-markdown"></i></button>
					<details class="markdown-editor-table-menu">
						<summary>Table</summary>
						<div role="group" aria-label="Table actions">
							<button type="button" data-command="table" aria-haspopup="dialog" aria-label="Add table"><i class="saIcon fas fa-table"></i><i class="saIcon far fa-table"></i></button>
							<button type="button" data-command="addRowAfter" aria-label="Add row"><i class="saIcon far fa-plus"></i></button>
							<button type="button" data-command="deleteRow" aria-label="Delete row"<i class="saIcon far fa-minus"></i></button>
							<button type="button" data-command="addColumnAfter" aria-label="Add column"><i class="saIcon far fa-plus"></i></button>
							<button type="button" data-command="deleteColumn" aria-label="Delete column"><i class="saIcon far fa-minus"></i></button>
							<button type="button" data-command="deleteTable" aria-label="Delete table"><i class="saIcon far fa-trash-alt"></i></button>
						</div>
					</details>
					<button type="button" data-command="undo" aria-label="Undo"><i class="saIcon fas fa-undo"></i><i class="saIcon far fa-undo"></i></button>
					<button type="button" data-command="redo" aria-label="Redo"><i class="saIcon fas fa-redo"></i><i class="saIcon far fa-redo"></i></button>
				</div>
				<div id="${id}-visual-view" data-editor-surface></div>
				<div id="${id}-source-view" data-source-surface hidden></div>
				<p id="${id}-help">Write and format your content directly, or use the Markdown button to edit its source. Ctrl/Cmd + B: bold, I: italic, U: underline, K: link.</p>
				<dialog data-link-dialog aria-labelledby="${id}-link-dialog-title">
					<div class="saAlert">
					<div class="saAlertMessageWrapper">
						<h2 class="saAlertHeading" id="${id}-link-dialog-title">Edit link</h2>
						<div class="saAlertMessage">
							<label for="${id}-url">URL</label>
							<input id="${id}-url" type="text" inputmode="url" required placeholder="https://example.com" autofocus>
							<label for="${id}-link-title">Title <span>(optional)</span></label>
							<input id="${id}-link-title" type="text">
						</div>
						<div class="saButtons">
							<button class="saAlertButton saButtonPrimary" type="button" data-link-save>Apply link</button>
							<button class="saAlertButton saButtonSecondary saDestructive" type="button" data-link-remove>Remove link</button>
							<button class="saAlertButton saButtonSecondary" type="button" data-link-cancel>Cancel</button>
						</div>
					</div>
					</div>
				</dialog>
				<dialog data-image-dialog aria-labelledby="${id}-image-title">
					<div class="saAlert">
					<div class="saAlertMessageWrapper">
						<h2 class="saAlertHeading" id="${id}-image-title">Image</h2>
						<div class="saAlertMessage">
							<label for="${id}-image-url">Image URL</label>
							<input id="${id}-image-url" type="text" inputmode="url" required placeholder="https://example.com/image.jpg">
							<label for="${id}-image-alt">Alternative text</label>
							<input id="${id}-image-alt" type="text" aria-describedby="${id}-image-alt-help">
							<p id="${id}-image-alt-help">Describe the image. Leave blank only if it is decorative.</p>
						</div>
						<div class="saButtons">
							<button class="saAlertButton saButtonPrimary" type="button" data-image-save>Insert image</button>
							<button class="saAlertButton saButtonSecondary saDestructive" type="button" data-image-remove>Remove image</button>
							<button class="saAlertButton saButtonSecondary" type="button" data-image-cancel>Cancel</button>
						</div>
					</div>
					</div>
				</dialog>
				<dialog data-table-dialog aria-labelledby="${id}-table-title">
					<div class="saAlert">
					<div class="saAlertMessageWrapper">
						<h2 class="saAlertHeading" id="${id}-table-title">Insert table</h2>
						<div class="saAlertMessage">
							<label for="${id}-table-rows">Rows, including header</label>
							<input id="${id}-table-rows" type="number" min="2" max="20" value="3" required>
							<label for="${id}-table-columns">Columns</label>
							<input id="${id}-table-columns" type="number" min="1" max="10" value="3" required>
						</div>
						<div class="saButtons">
							<button class="saAlertButton saButtonPrimary" type="button" data-table-save>Insert table</button>
							<button class="saAlertButton saButtonSecondary" type="button" data-table-cancel>Cancel</button>
						</div>
					</div>
					</div>
				</dialog>`;
			this.sourceSurface = this.shell.querySelector("[data-source-surface]");
			this.sourceSurface.append(this.source);
			this.prepend(this.shell);
			this.surface = this.shell.querySelector("[data-editor-surface]");
			this.markdownButton = this.shell.querySelector('[data-command="markdown"]');
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
			this.shell.querySelector(".saMarkdownEditorToolbar").addEventListener("click", event => {
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
			this.colorSelect = this.shell.querySelector("[data-text-color]");
			this.colorSelect.addEventListener("change", () => {
				const color = this.colorSelect.value;
				const chain = this.editor.chain().focus();
				if (color === "default") chain.unsetTextColor().run();
				else chain.setTextColor(color).run();
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
			if (command === "markdown") return this.toggleMarkdown();
			if (command === "link") return this.openLink();
			if (command === "image") return this.openImage();
			if (command === "table") return this.tableDialog.showModal();
			const chain = this.editor.chain().focus();
			const actions = {
				bold: () => chain.toggleBold(), italic: () => chain.toggleItalic(), underline: () => chain.toggleUnderline(), strike: () => chain.toggleStrike(),
				bullet: () => chain.toggleBulletList(), number: () => chain.toggleOrderedList(),
				quote: () => chain.toggleBlockquote(), code: () => chain.toggleCode(),
				codeblock: () => chain.toggleCodeBlock(), horizontalRule: () => chain.setHorizontalRule(),
				addRowAfter: () => chain.addRowAfter(), deleteRow: () => chain.deleteRow(),
				addColumnAfter: () => chain.addColumnAfter(), deleteColumn: () => chain.deleteColumn(),
				deleteTable: () => chain.deleteTable(), undo: () => chain.undo(), redo: () => chain.redo()
			};
			actions[command]?.().run();
		}

		toggleMarkdown() {
			this.sourceMode = !this.sourceMode;
			if (this.sourceMode) {
				this.sync(false);
				this.surface.hidden = true;
				this.sourceSurface.hidden = false;
				this.markdownButton.setAttribute("aria-label", "View as rich text");
				this.source.focus();
			} else {
				this.editor.commands.setContent(this.source.value, { contentType: "markdown", emitUpdate: false });
				this.sync(false);
				this.sourceSurface.hidden = true;
				this.surface.hidden = false;
				this.markdownButton.setAttribute("aria-label", "View as markdown");
				this.editor.commands.focus();
			}
			this.updateButtons();
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
			const activeColor = this.editor.getAttributes("textColor").color;
			if (this.colorSelect) this.colorSelect.value = textColors.has(activeColor) ? activeColor : "default";
			if (this.headingSelect) this.headingSelect.disabled = Boolean(this.sourceMode);
			if (this.colorSelect) this.colorSelect.disabled = Boolean(this.sourceMode);
			const types = { bold: "bold", italic: "italic", underline: "underline", strike: "strike", link: "link", bullet: "bulletList", number: "orderedList", quote: "blockquote", code: "code", codeblock: "codeBlock" };
			const commands = {
				horizontalRule: "setHorizontalRule", table: "insertTable",
				addRowAfter: "addRowAfter", deleteRow: "deleteRow",
				addColumnAfter: "addColumnAfter", deleteColumn: "deleteColumn",
				deleteTable: "deleteTable", undo: "undo", redo: "redo"
			};
			this.shell.querySelectorAll("[data-command]").forEach(button => {
				const command = button.dataset.command;
				if (command === "markdown") {
					button.setAttribute("aria-pressed", String(Boolean(this.sourceMode)));
					button.disabled = false;
					return;
				}
				if (this.sourceMode) {
					button.disabled = true;
					return;
				}
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
