(() => {
	"use strict";

	let nextId = 0;
	let dependencies;
	const loadEditor = () => dependencies ||= Promise.all([
		import("https://esm.sh/@tiptap/core@3.31.3"),
		import("https://esm.sh/@tiptap/starter-kit@3.31.3"),
		import("https://esm.sh/@tiptap/markdown@3.31.3"),
		import("https://esm.sh/@tiptap/extension-image@3.31.3"),
		import("https://esm.sh/@tiptap/extension-table@3.31.3"),
		import("https://esm.sh/@tiptap/extension-code-block-lowlight@3.31.3"),
		import("https://esm.sh/lowlight@3.3.0")
	]);

	const textColors = new Set(["muted", "info", "success", "warning", "danger"]);
	const droppedImageTypes = new Set(["image/png", "image/jpeg", "image/gif", "image/webp", "image/avif", "image/bmp"]);
	const maxDroppedImageBytes = 10 * 1024 * 1024;
	const isSafeUrl = value => /^(?:(?:https?):\/\/\S+|(?:mailto|tel):\S+|#\S+|(?:\.{0,2}\/)[^\s]+|(?:[a-z0-9_-]+\/)*[a-z0-9_.~-]+(?:[?#]\S*)?)$/i.test(value);
	const isSafeImageUrl = value =>
		(isSafeUrl(value) && !/^(?:mailto|tel):/i.test(value)) ||
		/^data:image\/(?:png|jpeg|gif|webp|avif|bmp);base64,[a-z0-9+/]+=*$/i.test(value);
	const readFileAsDataUrl = file => new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.addEventListener("load", () => resolve(reader.result), { once: true });
		reader.addEventListener("error", () => reject(reader.error || new Error("Could not read image.")), { once: true });
		reader.readAsDataURL(file);
	});
	const copyText = async value => {
		try {
			if (!navigator.clipboard?.writeText) throw new Error("The Clipboard API is unavailable.");
			await new Promise((resolve, reject) => {
				const timeout = setTimeout(() => reject(new Error("Clipboard access timed out.")), 500);
				navigator.clipboard.writeText(value).then(
					() => { clearTimeout(timeout); resolve(); },
					error => { clearTimeout(timeout); reject(error); }
				);
			});
			return;
		} catch {
			const textarea = document.createElement("textarea");
			textarea.value = value;
			textarea.setAttribute("readonly", "");
			textarea.style.position = "fixed";
			textarea.style.opacity = "0";
			document.body.append(textarea);
			textarea.select();
			const copied = document.execCommand("copy");
			textarea.remove();
			if (!copied) throw new Error("The browser did not allow copying.");
		}
	};
	const createCodeBlock = (CodeBlockLowlight, lowlight) => CodeBlockLowlight.extend({
		addNodeView() {
			return ({ node }) => {
				let currentNode = node;
				let resetLabel;
				const wrapper = document.createElement("div");
				const pre = document.createElement("pre");
				const code = document.createElement("code");
				const copyButton = document.createElement("button");
				wrapper.className = "saMarkdownEditorCodeBlock";
				copyButton.type = "button";
				copyButton.className = "saCopyButton";
				copyButton.setAttribute("aria-label", "Copy");
				copyButton.contentEditable = "false";
				pre.append(code);
				copyButton.innerHTML = '<i class="saIcon far fa-clone" aria-hidden="true"></i><i class="saIcon far fa-check" aria-hidden="true"></i>';
				wrapper.append(pre, copyButton);

				const updateLanguage = () => {
					code.className = currentNode.attrs.language ? `language-${currentNode.attrs.language}` : "";
				};
				updateLanguage();
				const copyCode = async () => {
					clearTimeout(resetLabel);
					try {
						await copyText(currentNode.textContent);
						copyButton.classList.add("saCopied");
						copyButton.setAttribute("aria-label", "Copied");
					} catch {
						copyButton.setAttribute("aria-label", "Could not copy code");
					}
					resetLabel = setTimeout(() => {
						copyButton.classList.remove("saCopied");
						copyButton.setAttribute("aria-label", "Copy");
					}, 2000);
				};
				copyButton.addEventListener("mousedown", event => event.preventDefault());
				copyButton.addEventListener("click", copyCode);
				copyButton.addEventListener("keydown", event => {
					if (event.key !== "Enter" && event.key !== " ") return;
					event.preventDefault();
					copyCode();
				});

				return {
					dom: wrapper,
					contentDOM: code,
					update(updatedNode) {
						if (updatedNode.type !== currentNode.type) return false;
						currentNode = updatedNode;
						updateLanguage();
						return true;
					},
					stopEvent: event => copyButton.contains(event.target),
					ignoreMutation: mutation => copyButton.contains(mutation.target),
					destroy: () => clearTimeout(resetLabel)
				};
			};
		}
	}).configure({ lowlight });
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
				const [{ Editor, Mark }, { StarterKit }, { Markdown }, { Image }, { TableKit }, { CodeBlockLowlight }, { common, createLowlight }] = await loadEditor();
				if (!this.isConnected) return;
				this.buildControls();
				this.editor = new Editor({
					element: this.surface,
					extensions: [
						StarterKit.configure({
							// Keep the document within the Markdown features this POC exposes.
							underline: false,
							codeBlock: false,
							link: {
								openOnClick: false,
								autolink: true,
								linkOnPaste: true,
								defaultProtocol: "https",
								HTMLAttributes: { target: null }
							}
						}),
						Image.configure({ allowBase64: true }),
						TableKit.configure({ table: { resizable: false } }),
						createCodeBlock(CodeBlockLowlight, createLowlight(common)),
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
								input: (_view, event) => { event.stopPropagation(); return false; },
								dragover: (_view, event) => {
									if (!Array.from(event.dataTransfer?.items || []).some(item => item.kind === "file")) return false;
									event.preventDefault();
									event.dataTransfer.dropEffect = "copy";
									return true;
								}
							},
							handleDrop: (view, event, _slice, moved) => {
								if (moved) return false;
								const droppedFiles = Array.from(event.dataTransfer?.files || []);
								if (!droppedFiles.length) return false;
								event.preventDefault();
								const files = droppedFiles.filter(file => file.type.startsWith("image/"));
								if (!files.length) {
									this.status.textContent = "Only image files can be dropped into the editor.";
									return true;
								}
								const position = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos ?? view.state.selection.from;
								this.insertDroppedImages(files, position);
								return true;
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
				<p id="${id}-label" class="saScreenReaderOnly"><strong>Content</strong></p>
				<div role="group" class="saMarkdownEditorToolbar" aria-label="Formatting">
					<ul aria-label="Text style">
						<li>
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
						</li>
						<li hidden>
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
						</li>
						<li><button class="saButtonToolbar" type="button" data-command="bold" aria-keyshortcuts="Control+B Meta+B" aria-label="Bold"><i class="saIcon fas fa-bold"></i><i class="saIcon far fa-bold"></i></button></li>
						<li><button class="saButtonToolbar" type="button" data-command="italic" aria-keyshortcuts="Control+I Meta+I" aria-label="Italic"><i class="saIcon fas fa-italic"></i><i class="saIcon far fa-italic"></i></button></li>
						<li hidden><button class="saButtonToolbar" type="button" data-command="underline" aria-keyshortcuts="Control+U Meta+U" aria-label="Underline"><i class="saIcon fas fa-underline"></i><i class="saIcon far fa-underline"></i></button></li>
						<li><button class="saButtonToolbar" type="button" data-command="strike" aria-label="Strikethrough"><i class="saIcon fas fa-strikethrough"></i><i class="saIcon far fa-strikethrough"></i></button></li>
						<li><button class="saButtonToolbar" type="button" data-command="clear" aria-label="Clear formatting"><i class="saIcon far fa-text-slash"></i></button></li>
						</ul>
					<ul aria-label="Links and media">
						<li><button class="saButtonToolbar" type="button" data-command="link" aria-keyshortcuts="Control+K Meta+K" aria-haspopup="dialog" aria-label="Link"><i class="saIcon fas fa-link"></i><i class="saIcon far fa-link"></i></button></li>
						<li><button class="saButtonToolbar" type="button" data-command="image" aria-haspopup="dialog" aria-label="Image"><i class="saIcon fas fa-image"></i><i class="saIcon far fa-image"></i></button></li>
					</ul>
					<ul aria-label="Block formatting">
						<li><button class="saButtonToolbar" type="button" data-command="bullet" aria-label="Bulleted list"><i class="saIcon fas fa-list"></i><i class="saIcon far fa-list"></i></button></li>
						<li><button class="saButtonToolbar" type="button" data-command="number" aria-label="Numbered list"><i class="saIcon fas fa-list-ol"></i><i class="saIcon far fa-list-ol"></i></button></li>
						<li><button class="saButtonToolbar" type="button" data-command="quote" aria-label="Quote"><i class="saIcon fas fa-quote-right"></i><i class="saIcon far fa-quote-right"></i></button></li>
						<li><button class="saButtonToolbar" type="button" data-command="code" aria-label="Inline code"><i class="saIcon fas fa-code"></i><i class="saIcon far fa-code"></i></button></li>
						<li><button class="saButtonToolbar" type="button" data-command="codeblock" aria-label="Code block"><i class="saIcon fas fa-square-code"></i><i class="saIcon far fa-square-code"></i></button></li>
						<li><button class="saButtonToolbar" type="button" data-command="horizontalRule" aria-label="Horizontal rule"><i class="saIcon far fa-horizontal-rule"></i></button></li>
					</ul>
					<ul aria-label="Tables">
						<li class="markdown-editor-table-menu">
							<button  class="saButtonToolbar" type="button" data-table-menu aria-haspopup="menu" aria-expanded="false" aria-controls="${id}-table-menu"><i class="saIcon far fa-table" aria-hidden="true"></i></button>
							<div class="saContextMenu saSouth" hidden>
								<ul class="saActionLinkList" id="${id}-table-menu" role="menu" aria-label="Table actions">
									<li role="none"><button class="saOptionWrapper" type="button" role="menuitem" tabindex="0" data-command="table" aria-haspopup="dialog"><span class="saOption"><span class="saIconHolder saOptionIcon" aria-hidden="true"><i class="saIcon far fa-table"></i></span><span class="saButtonText saOptionText">Insert table</span></span></button></li>
									<li role="none"><button class="saOptionWrapper" type="button" role="menuitem" tabindex="-1" data-command="addRowAfter"><span class="saOption"><span class="saIconHolder saOptionIcon" aria-hidden="true"><i class="saIcon far fa-grid-2-plus"></i></span><span class="saButtonText saOptionText">Add row</span></span></button></li>
									<li role="none"><button class="saOptionWrapper" type="button" role="menuitem" tabindex="-1" data-command="deleteRow"><span class="saOption"><span class="saIconHolder saOptionIcon" aria-hidden="true"><i class="saIcon far fa-xmark"></i></span><span class="saButtonText saOptionText">Delete row</span></span></button></li>
									<li role="none"><button class="saOptionWrapper" type="button" role="menuitem" tabindex="-1" data-command="addColumnAfter"><span class="saOption"><span class="saIconHolder saOptionIcon" aria-hidden="true"><i class="saIcon far fa-columns-3"></i></span><span class="saButtonText saOptionText">Add column</span></span></button></li>
									<li role="none"><button class="saOptionWrapper" type="button" role="menuitem" tabindex="-1" data-command="deleteColumn"><span class="saOption"><span class="saIconHolder saOptionIcon" aria-hidden="true"><i class="saIcon far fa-xmark"></i></span><span class="saButtonText saOptionText">Delete column</span></span></button></li>
									<li role="none"><button class="saOptionWrapper saDestructive" type="button" role="menuitem" tabindex="-1" data-command="deleteTable"><span class="saOption"><span class="saIconHolder saOptionIcon" aria-hidden="true"><i class="saIcon far fa-trash-alt"></i></span><span class="saButtonText saOptionText">Delete table</span></span></button></li>
								</ul>
							</div>
						</li>
					</ul>
					<ul aria-label="View and history">
						<li><button class="saButtonToolbar" type="button" data-command="markdown" aria-label="View as markdown" aria-controls="${id}-visual-view ${id}-source-view" aria-pressed="false"><i class="saIcon fab fa-markdown"></i></button></li>
						<li><button class="saButtonToolbar" type="button" data-command="undo" aria-label="Undo"><i class="saIcon fas fa-undo"></i><i class="saIcon far fa-undo"></i></button></li>
						<li><button class="saButtonToolbar" type="button" data-command="redo" aria-label="Redo"><i class="saIcon fas fa-redo"></i><i class="saIcon far fa-redo"></i></button></li>
					</ul>
				</div>
				<div id="${id}-visual-view" data-editor-surface></div>
				<div id="${id}-source-view" data-source-surface hidden></div>
				<p id="${id}-help" class="saScreenReaderOnly">Write and format your content directly, or use the Markdown button to edit its source. Ctrl/Cmd + B: bold, I: italic, U: underline, K: link.</p>
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
			this.tableMenuButton = this.shell.querySelector("[data-table-menu]");
			this.tableMenu = this.shell.querySelector(`#${id}-table-menu`).closest(".saContextMenu");
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
				const menuButton = event.target.closest("button[data-table-menu]");
				if (menuButton) {
					this.toggleTableMenu();
					return;
				}
				const button = event.target.closest("button[data-command]");
				if (button) {
					if (button.closest('[role="menu"]')) this.closeTableMenu();
					this.format(button.dataset.command);
				}
			}, options);
			this.tableMenuButton.addEventListener("keydown", event => {
				if (event.key === "Escape" && !this.tableMenu.hidden) {
					event.preventDefault();
					this.closeTableMenu(true);
					return;
				}
				if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
				event.preventDefault();
				this.openTableMenu(event.key === "ArrowUp" ? "last" : "first");
			}, options);
			this.tableMenu.addEventListener("keydown", event => this.handleTableMenuKeydown(event), options);
			this.tableMenu.parentElement.addEventListener("focusout", () => {
				setTimeout(() => {
					if (!this.tableMenu.parentElement.contains(document.activeElement)) this.closeTableMenu();
				}, 0);
			}, options);
			document.addEventListener("pointerdown", event => {
				if (!this.tableMenu.hidden && !this.tableMenu.parentElement.contains(event.target)) this.closeTableMenu();
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
				clear: () => chain.unsetAllMarks().clearNodes(),
				bullet: () => chain.toggleBulletList(), number: () => chain.toggleOrderedList(),
				quote: () => chain.toggleBlockquote(), code: () => chain.toggleCode(),
				codeblock: () => chain.toggleCodeBlock(), horizontalRule: () => chain.setHorizontalRule(),
				addRowAfter: () => chain.addRowAfter(), deleteRow: () => chain.deleteRow(),
				addColumnAfter: () => chain.addColumnAfter(), deleteColumn: () => chain.deleteColumn(),
				deleteTable: () => chain.deleteTable(), undo: () => chain.undo(), redo: () => chain.redo()
			};
			actions[command]?.().run();
		}

		getTableMenuItems() {
			return Array.from(this.tableMenu.querySelectorAll('[role="menuitem"]:not(:disabled)'));
		}

		focusTableMenuItem(item) {
			this.tableMenu.querySelectorAll('[role="menuitem"]').forEach(menuItem => { menuItem.tabIndex = menuItem === item ? 0 : -1; });
			item?.focus();
		}

		openTableMenu(focusItem) {
			if (this.tableMenuButton.disabled) return;
			this.tableMenu.hidden = false;
			this.tableMenu.classList.add("saOpen");
			this.tableMenuButton.setAttribute("aria-expanded", "true");
			if (focusItem) {
				const items = this.getTableMenuItems();
				this.focusTableMenuItem(items[focusItem === "last" ? items.length - 1 : 0]);
			}
		}

		closeTableMenu(returnFocus = false) {
			if (!this.tableMenu) return;
			this.tableMenu.hidden = true;
			this.tableMenu.classList.remove("saOpen");
			this.tableMenuButton.setAttribute("aria-expanded", "false");
			if (returnFocus) this.tableMenuButton.focus();
		}

		toggleTableMenu() {
			if (this.tableMenu.hidden) this.openTableMenu("first");
			else this.closeTableMenu(true);
		}

		handleTableMenuKeydown(event) {
			if (event.key === "Escape") {
				event.preventDefault();
				this.closeTableMenu(true);
				return;
			}
			if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
			const items = this.getTableMenuItems();
			if (!items.length) return;
			event.preventDefault();
			const current = items.indexOf(document.activeElement);
			let next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : current;
			if (event.key === "ArrowDown") next = (current + 1) % items.length;
			if (event.key === "ArrowUp") next = (current - 1 + items.length) % items.length;
			this.focusTableMenuItem(items[next]);
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
			this.imageUrlInput.setCustomValidity(isSafeImageUrl(src) ? "" : "Enter a web or relative image URL.");
			if (!this.imageUrlInput.reportValidity()) return;
			this.imageDialog.close();
			const chain = this.editor.chain().focus();
			if (this.editingImage) chain.setNodeSelection(this.imageSelection.from).updateAttributes("image", { src, alt }).run();
			else chain.setImage({ src, alt }).run();
		}

		async insertDroppedImages(files, position) {
			const accepted = files.filter(file => droppedImageTypes.has(file.type) && file.size <= maxDroppedImageBytes);
			const rejected = files.length - accepted.length;
			if (!accepted.length) {
				this.status.textContent = "Drop PNG, JPEG, GIF, WebP, AVIF, or BMP images up to 10 MB each.";
				return;
			}
			try {
				const content = await Promise.all(accepted.map(async file => ({
					type: "image",
					attrs: {
						src: await readFileAsDataUrl(file),
						alt: file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ")
					}
				})));
				const insertAt = Math.min(position, this.editor.state.doc.content.size);
				this.editor.chain().focus().insertContentAt(insertAt, content).run();
				this.status.textContent = `${accepted.length} image${accepted.length === 1 ? "" : "s"} inserted${rejected ? `; ${rejected} unsupported or oversized file${rejected === 1 ? "" : "s"} skipped` : ""}.`;
			} catch (error) {
				this.status.textContent = "The dropped image could not be read.";
				console.error("Dropped image could not be read", error);
			}
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
			if (this.tableMenuButton) this.tableMenuButton.disabled = Boolean(this.sourceMode);
			if (this.sourceMode) this.closeTableMenu();
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
				} else if (this.sourceMode) {
					button.disabled = true;
				} else if (types[command]) {
					button.setAttribute("aria-pressed", String(this.editor.isActive(types[command])));
					button.disabled = false;
				} else if (commands[command]) {
					button.disabled = !this.editor.can()[commands[command]]();
				} else {
					button.disabled = false;
				}
				if (button.matches('[role="menuitem"]')) button.classList.toggle("saInactive", button.disabled);
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
