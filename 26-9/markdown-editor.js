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
	const parseDelimitedData = (value, delimiter) => {
		const rows = [];
		let row = [];
		let cell = "";
		let quoted = false;
		const text = value.replace(/\r\n?/g, "\n");
		for (let index = 0; index < text.length; index++) {
			const character = text[index];
			if (quoted) {
				if (character === '"' && text[index + 1] === '"') { cell += '"'; index++; }
				else if (character === '"') quoted = false;
				else cell += character;
			} else if (character === '"' && cell === "") quoted = true;
			else if (character === delimiter) { row.push(cell); cell = ""; }
			else if (character === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
			else cell += character;
		}
		row.push(cell);
		if (row.length > 1 || row[0] || !rows.length) rows.push(row);
		return rows;
	};
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
	const codeLanguageLabels = new Map([
		["bash", "Bash"], ["c", "C"], ["cpp", "C++"], ["csharp", "C#"], ["css", "CSS"],
		["graphql", "GraphQL"], ["html", "HTML"], ["ini", "INI"], ["java", "Java"],
		["javascript", "JavaScript"], ["json", "JSON"], ["jsx", "JSX"], ["less", "Less"],
		["markdown", "Markdown"], ["objectivec", "Objective-C"], ["php", "PHP"], ["plaintext", "Plain text"],
		["python", "Python"], ["r", "R"], ["scss", "SCSS"], ["sql", "SQL"], ["swift", "Swift"],
		["typescript", "TypeScript"], ["vbnet", "VB.NET"], ["wasm", "WebAssembly"], ["xml", "HTML / XML"], ["yaml", "YAML"]
	]);
	const getCodeLanguageLabel = language => codeLanguageLabels.get(language) || language
		.split(/[-_]/)
		.map(part => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
	const createCodeBlock = (CodeBlockLowlight, lowlight) => CodeBlockLowlight.extend({
		addNodeView() {
			return ({ node, editor, getPos }) => {
				let currentNode = node;
				let resetLabel;
				const wrapper = document.createElement("div");
				const header = document.createElement("header");
				const languageLabel = document.createElement("label");
				const languageSelect = document.createElement("select");
				const pre = document.createElement("pre");
				const code = document.createElement("code");
				const copyButton = document.createElement("button");
				wrapper.className = "saMarkdownEditorCodeBlock";
				header.className = "saMarkdownEditorCodeBlockHeader";
				header.contentEditable = "false";
				languageLabel.className = "saMarkdownEditorCodeLanguage";
				languageSelect.className = "saInputText";
				languageSelect.setAttribute("aria-label", "Code language");
				languageSelect.append(new Option("Automatic", ""));
				lowlight.listLanguages()
					.map(language => ({ language, label: getCodeLanguageLabel(language) }))
					.sort((left, right) => left.label.localeCompare(right.label))
					.forEach(({ language, label }) => languageSelect.append(new Option(label, language)));
				copyButton.type = "button";
				copyButton.className = "saCopyButton";
				copyButton.setAttribute("aria-label", "Copy");
				copyButton.contentEditable = "false";
				pre.append(code);
				languageLabel.append(languageSelect);
				copyButton.innerHTML = '<i class="saIcon far fa-clone" aria-hidden="true"></i><i class="saIcon far fa-check" aria-hidden="true"></i>';
				header.append(languageLabel, copyButton);
				wrapper.append(header, pre);

				const updateLanguage = () => {
					const language = currentNode.attrs.language || "";
					code.className = language ? `language-${language}` : "";
					if (language && !Array.from(languageSelect.options).some(option => option.value === language)) {
						languageSelect.append(new Option(`${getCodeLanguageLabel(language)} (unavailable)`, language));
					}
					languageSelect.value = language;
				};
				updateLanguage();
				languageSelect.addEventListener("change", () => {
					const position = getPos();
					if (typeof position !== "number") return;
					const language = languageSelect.value || null;
					editor.view.dispatch(editor.state.tr.setNodeMarkup(position, undefined, { ...currentNode.attrs, language }));
				});
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
					stopEvent: event => header.contains(event.target),
					ignoreMutation: mutation => header.contains(mutation.target),
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
							handlePaste: (_view, event) => {
								if (!this.editor.isActive("table")) return false;
								const text = event.clipboardData?.getData("text/plain") || "";
								const delimiter = text.includes("\t") ? "\t" : (text.includes(",") && /\r?\n/.test(text) ? "," : null);
								if (!delimiter) return false;
								event.preventDefault();
								this.pasteTableData(text, delimiter);
								return true;
							},
							handleKeyDown: (_view, event) => {
								if (!event.isComposing && event.altKey && event.shiftKey && event.key.toLowerCase() === "t" && this.editor.isActive("table")) {
									event.preventDefault();
									this.focusTableToolbarButton(this.tableToolbar.querySelector("button:not(:disabled)"));
									return true;
								}
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
			const tablePickerRows = Array.from({ length: 6 }, (_, rowIndex) => {
				const rows = rowIndex + 2;
				const cells = Array.from({ length: 6 }, (_, columnIndex) => {
					const columns = columnIndex + 1;
					const initial = rows === 3 && columns === 3;
					return `<button type="button" role="gridcell" tabindex="${initial ? "0" : "-1"}" data-table-rows="${rows}" data-table-columns="${columns}" aria-label="${columns} column${columns === 1 ? "" : "s"} by ${rows} rows, including header"></button>`;
				}).join("");
				return `<div role="row">${cells}</div>`;
			}).join("");
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
							<button class="saButtonToolbar" type="button" data-table-picker-button aria-label="Insert table" aria-haspopup="grid" aria-expanded="false" aria-controls="${id}-table-picker"><i class="saIcon far fa-table" aria-hidden="true"></i></button>
							<div class="saContextMenu saSouth" hidden>
								<div class="saMarkdownEditorTablePicker" id="${id}-table-picker" role="grid" aria-label="Choose table size" aria-describedby="${id}-table-picker-status" data-table-picker>
									${tablePickerRows}
								</div>
								<p id="${id}-table-picker-status" class="saMarkdownEditorTablePickerStatus" aria-live="polite">3 columns × 3 rows</p>
							</div>
						</li>
					</ul>
					<ul aria-label="View and history">
						<li><button class="saButtonToolbar" type="button" data-command="markdown" aria-label="View as markdown" aria-controls="${id}-visual-view ${id}-source-view" aria-pressed="false"><i class="saIcon fab fa-markdown"></i></button></li>
						<li><button class="saButtonToolbar" type="button" data-command="undo" aria-label="Undo"><i class="saIcon fas fa-undo"></i><i class="saIcon far fa-undo"></i></button></li>
						<li><button class="saButtonToolbar" type="button" data-command="redo" aria-label="Redo"><i class="saIcon fas fa-redo"></i><i class="saIcon far fa-redo"></i></button></li>
					</ul>
				</div>
				<div id="${id}-visual-view" class="saMarkdownEditorVisual" data-visual-surface>
					<div data-editor-surface></div>
					<div class="saMarkdownEditorToolbar saMarkdownEditorTableToolbar" role="toolbar" aria-label="Table editing" aria-keyshortcuts="Alt+Shift+T" data-table-toolbar hidden>
						<ul aria-label="Row actions">
							<li><button class="saButtonToolbar" type="button" data-command="addRowBefore" aria-label="Add row above"><i class="saIcon far fa-arrow-up-to-line" aria-hidden="true"></i></button></li>
							<li><button class="saButtonToolbar" type="button" data-command="addRowAfter" aria-label="Add row below"><i class="saIcon far fa-arrow-down-to-line" aria-hidden="true"></i></button></li>
							<li><button class="saButtonToolbar saDestructive" type="button" data-command="deleteRow" aria-label="Delete row"><i class="saIcon far fa-xmark" aria-hidden="true"></i></button></li>
						</ul>
						<ul aria-label="Column actions">
							<li><button class="saButtonToolbar" type="button" data-command="addColumnBefore" aria-label="Add column left"><i class="saIcon far fa-arrow-left-to-line" aria-hidden="true"></i></button></li>
							<li><button class="saButtonToolbar" type="button" data-command="addColumnAfter" aria-label="Add column right"><i class="saIcon far fa-arrow-right-to-line" aria-hidden="true"></i></button></li>
							<li><button class="saButtonToolbar saDestructive" type="button" data-command="deleteColumn" aria-label="Delete column"><i class="saIcon far fa-xmark" aria-hidden="true"></i></button></li>
						</ul>
						<ul aria-label="Table actions">
							<li><button class="saButtonToolbar saDestructive" type="button" data-command="deleteTable" aria-label="Delete table"><i class="saIcon far fa-trash-alt" aria-hidden="true"></i></button></li>
						</ul>
					</div>
					<div class="saMarkdownEditorTablePreview" data-table-preview aria-hidden="true" hidden></div>
				</div>
				<div id="${id}-source-view" data-source-surface hidden></div>
				<p id="${id}-help" class="saScreenReaderOnly">Write and format your content directly, or use the Markdown button to edit its source. Ctrl/Cmd + B: bold, I: italic, U: underline, K: link. In a table, use Tab and Shift+Tab to move between cells, or Alt+Shift+T to open table editing controls.</p>
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
				</dialog>`;
			this.sourceSurface = this.shell.querySelector("[data-source-surface]");
			this.sourceSurface.append(this.source);
			this.prepend(this.shell);
			this.visualSurface = this.shell.querySelector("[data-visual-surface]");
			this.surface = this.shell.querySelector("[data-editor-surface]");
			this.markdownButton = this.shell.querySelector('[data-command="markdown"]');
			this.tablePickerButton = this.shell.querySelector("[data-table-picker-button]");
			this.tablePicker = this.shell.querySelector("[data-table-picker]");
			this.tablePickerPopup = this.tablePicker.closest(".saContextMenu");
			this.tablePickerStatus = this.shell.querySelector(`#${id}-table-picker-status`);
			this.tableToolbar = this.shell.querySelector("[data-table-toolbar]");
			this.tablePreview = this.shell.querySelector("[data-table-preview]");
			this.linkDialog = this.shell.querySelector("[data-link-dialog]");
			this.urlInput = this.linkDialog.querySelector(`#${id}-url`);
			this.linkTitleInput = this.linkDialog.querySelector(`#${id}-link-title`);
			this.imageDialog = this.shell.querySelector("[data-image-dialog]");
			this.imageUrlInput = this.imageDialog.querySelector(`#${id}-image-url`);
			this.imageAltInput = this.imageDialog.querySelector(`#${id}-image-alt`);
		}

		bindControls() {
			this.events = new AbortController();
			const options = { signal: this.events.signal };
			this.shell.querySelector(".saMarkdownEditorToolbar").addEventListener("click", event => {
				const menuButton = event.target.closest("button[data-table-picker-button]");
				if (menuButton) {
					this.toggleTablePicker();
					return;
				}
				const button = event.target.closest("button[data-command]");
				if (button) this.format(button.dataset.command);
			}, options);
			this.tablePickerButton.addEventListener("keydown", event => {
				if (event.key === "Escape" && !this.tablePickerPopup.hidden) {
					event.preventDefault();
					this.closeTablePicker(true);
					return;
				}
				if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
				event.preventDefault();
				this.openTablePicker();
			}, options);
			this.tablePicker.addEventListener("keydown", event => this.handleTablePickerKeydown(event), options);
			this.tablePicker.addEventListener("click", event => {
				const cell = event.target.closest("[data-table-rows][data-table-columns]");
				if (!cell) return;
				this.insertTable(Number(cell.dataset.tableRows), Number(cell.dataset.tableColumns));
			}, options);
			this.tablePicker.addEventListener("pointerover", event => {
				const cell = event.target.closest("[data-table-rows][data-table-columns]");
				if (cell) this.previewTableSize(cell);
			}, options);
			this.tablePicker.addEventListener("focusin", event => {
				const cell = event.target.closest("[data-table-rows][data-table-columns]");
				if (cell) this.previewTableSize(cell);
			}, options);
			this.tablePickerPopup.parentElement.addEventListener("focusout", () => {
				setTimeout(() => {
					if (!this.tablePickerPopup.parentElement.contains(document.activeElement)) this.closeTablePicker();
				}, 0);
			}, options);
			document.addEventListener("pointerdown", event => {
				if (!this.tablePickerPopup.hidden && !this.tablePickerPopup.parentElement.contains(event.target)) this.closeTablePicker();
			}, options);
			this.tableToolbar.addEventListener("mousedown", event => event.preventDefault(), options);
			this.tableToolbar.addEventListener("click", event => {
				const button = event.target.closest("button[data-command]");
				if (button) this.format(button.dataset.command);
			}, options);
			this.tableToolbar.addEventListener("pointerover", event => this.previewTableAction(event.target.closest("button[data-command]")?.dataset.command), options);
			this.tableToolbar.addEventListener("pointerleave", () => this.clearTableActionPreview(), options);
			this.tableToolbar.addEventListener("focusin", event => this.previewTableAction(event.target.closest("button[data-command]")?.dataset.command), options);
			this.tableToolbar.addEventListener("focusout", event => {
				if (!this.tableToolbar.contains(event.relatedTarget)) this.clearTableActionPreview();
			}, options);
			this.tableToolbar.addEventListener("keydown", event => this.handleTableToolbarKeydown(event), options);
			this.editor.view.dom.addEventListener("scroll", () => {
				this.positionTableToolbar();
				if (this.tablePreviewCommand) this.previewTableAction(this.tablePreviewCommand);
			}, options);
			window.addEventListener("resize", () => {
				this.positionTableToolbar();
				if (this.tablePreviewCommand) this.previewTableAction(this.tablePreviewCommand);
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
			const chain = this.editor.chain().focus();
			const actions = {
				bold: () => chain.toggleBold(), italic: () => chain.toggleItalic(), underline: () => chain.toggleUnderline(), strike: () => chain.toggleStrike(),
				clear: () => chain.unsetAllMarks().clearNodes(),
				bullet: () => chain.toggleBulletList(), number: () => chain.toggleOrderedList(),
				quote: () => chain.toggleBlockquote(), code: () => chain.toggleCode(),
				codeblock: () => chain.toggleCodeBlock(), horizontalRule: () => chain.setHorizontalRule(),
				addRowBefore: () => chain.addRowBefore(), addRowAfter: () => chain.addRowAfter(), deleteRow: () => chain.deleteRow(),
				addColumnBefore: () => chain.addColumnBefore(), addColumnAfter: () => chain.addColumnAfter(), deleteColumn: () => chain.deleteColumn(),
				deleteTable: () => chain.deleteTable(), undo: () => chain.undo(), redo: () => chain.redo()
			};
			const changed = actions[command]?.().run();
			if (changed) {
				const messages = {
					addRowBefore: "Row added above.", addRowAfter: "Row added below.", deleteRow: "Row deleted.",
					addColumnBefore: "Column added to the left.", addColumnAfter: "Column added to the right.", deleteColumn: "Column deleted.",
					deleteTable: "Table deleted."
				};
				if (messages[command]) this.status.textContent = messages[command];
			}
		}

		getTablePickerCells() {
			return Array.from(this.tablePicker.querySelectorAll('[role="gridcell"]'));
		}

		focusTablePickerCell(cell) {
			this.getTablePickerCells().forEach(item => { item.tabIndex = item === cell ? 0 : -1; });
			cell?.focus();
		}

		openTablePicker() {
			if (this.tablePickerButton.disabled) return;
			this.tablePickerPopup.hidden = false;
			this.tablePickerPopup.classList.add("saOpen");
			this.tablePickerButton.setAttribute("aria-expanded", "true");
			const cell = this.tablePicker.querySelector('[data-table-rows="3"][data-table-columns="3"]');
			this.previewTableSize(cell);
			this.focusTablePickerCell(cell);
		}

		closeTablePicker(returnFocus = false) {
			if (!this.tablePickerPopup) return;
			this.tablePickerPopup.hidden = true;
			this.tablePickerPopup.classList.remove("saOpen");
			this.tablePickerButton.setAttribute("aria-expanded", "false");
			if (returnFocus) this.tablePickerButton.focus();
		}

		toggleTablePicker() {
			if (this.tablePickerPopup.hidden) this.openTablePicker();
			else this.closeTablePicker(true);
		}

		previewTableSize(cell) {
			if (!cell) return;
			const rows = Number(cell.dataset.tableRows);
			const columns = Number(cell.dataset.tableColumns);
			this.getTablePickerCells().forEach(item => {
				const selected = Number(item.dataset.tableRows) <= rows && Number(item.dataset.tableColumns) <= columns;
				item.classList.toggle("saSelected", selected);
				item.setAttribute("aria-selected", String(selected));
			});
			this.tablePickerStatus.textContent = `${columns} column${columns === 1 ? "" : "s"} × ${rows} rows`;
		}

		handleTablePickerKeydown(event) {
			if (event.key === "Escape") {
				event.preventDefault();
				this.closeTablePicker(true);
				return;
			}
			if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
			const current = event.target.closest('[role="gridcell"]');
			if (!current) return;
			event.preventDefault();
			let rows = Number(current.dataset.tableRows);
			let columns = Number(current.dataset.tableColumns);
			if (event.key === "ArrowDown") rows = Math.min(7, rows + 1);
			if (event.key === "ArrowUp") rows = Math.max(2, rows - 1);
			if (event.key === "ArrowRight") columns = Math.min(6, columns + 1);
			if (event.key === "ArrowLeft") columns = Math.max(1, columns - 1);
			if (event.key === "Home") columns = 1;
			if (event.key === "End") columns = 6;
			const next = this.tablePicker.querySelector(`[data-table-rows="${rows}"][data-table-columns="${columns}"]`);
			this.previewTableSize(next);
			this.focusTablePickerCell(next);
		}

		focusTableToolbarButton(button) {
			this.tableToolbar.querySelectorAll("button").forEach(item => { item.tabIndex = item === button ? 0 : -1; });
			button?.focus();
		}

		handleTableToolbarKeydown(event) {
			if (event.key === "Escape") {
				event.preventDefault();
				this.editor.commands.focus();
				return;
			}
			if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
			const buttons = Array.from(this.tableToolbar.querySelectorAll("button:not(:disabled)"));
			if (!buttons.length) return;
			event.preventDefault();
			const current = buttons.indexOf(document.activeElement);
			let next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : current;
			if (event.key === "ArrowRight") next = (current + 1) % buttons.length;
			if (event.key === "ArrowLeft") next = (current - 1 + buttons.length) % buttons.length;
			this.focusTableToolbarButton(buttons[next]);
		}

		toggleMarkdown() {
			this.sourceMode = !this.sourceMode;
			if (this.sourceMode) {
				this.sync(false);
				this.visualSurface.hidden = true;
				this.sourceSurface.hidden = false;
				this.markdownButton.setAttribute("aria-label", "View as rich text");
				this.source.focus();
			} else {
				this.editor.commands.setContent(this.source.value, { contentType: "markdown", emitUpdate: false });
				this.sync(false);
				this.sourceSurface.hidden = true;
				this.visualSurface.hidden = false;
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

		insertTable(rows, columns) {
			this.closeTablePicker();
			this.editor.chain().focus().insertTable({
				rows,
				cols: columns,
				withHeaderRow: true
			}).run();
			this.status.textContent = `${columns} column${columns === 1 ? "" : "s"} by ${rows} rows table inserted.`;
		}

		pasteTableData(value, delimiter) {
			const matrix = parseDelimitedData(value, delimiter);
			const columnCount = Math.max(...matrix.map(row => row.length));
			if (!matrix.length || !columnCount || matrix.length > 100 || columnCount > 20) {
				this.status.textContent = "Paste up to 100 rows and 20 columns at a time.";
				return;
			}
			const { state, view } = this.editor;
			const { $from } = state.selection;
			let tableDepth = -1;
			for (let depth = $from.depth; depth > 0; depth--) {
				if ($from.node(depth).type.name === "table") { tableDepth = depth; break; }
			}
			if (tableDepth < 0) return;
			const tableNode = $from.node(tableDepth);
			const startRow = $from.index(tableDepth);
			const startColumn = $from.index(tableDepth + 1);
			const originalRows = [];
			tableNode.forEach(row => originalRows.push(row));
			const existingColumns = Math.max(...originalRows.map(row => row.childCount));
			const requiredRows = Math.max(originalRows.length, startRow + matrix.length);
			const requiredColumns = Math.max(existingColumns, startColumn + columnCount);
			const paragraphType = state.schema.nodes.paragraph;
			const rowType = state.schema.nodes.tableRow;
			const cellType = state.schema.nodes.tableCell;
			const headerType = state.schema.nodes.tableHeader;
			const makeCell = (rowIndex, text, prototype) => {
				const type = prototype?.type || (rowIndex === 0 ? headerType : cellType);
				const content = paragraphType.create(null, text ? state.schema.text(text) : null);
				return type.create(prototype?.attrs || null, content, prototype?.marks);
			};
			const rows = Array.from({ length: requiredRows }, (_, rowIndex) => {
				const originalRow = originalRows[rowIndex];
				const originalCells = [];
				originalRow?.forEach(cell => originalCells.push(cell));
				const cells = Array.from({ length: requiredColumns }, (_, columnIndex) => {
					const pastedRow = matrix[rowIndex - startRow];
					const pasted = pastedRow && columnIndex >= startColumn && columnIndex < startColumn + pastedRow.length;
					return pasted ? makeCell(rowIndex, pastedRow[columnIndex - startColumn], originalCells[columnIndex]) :
						(originalCells[columnIndex] || makeCell(rowIndex, "", originalCells[0]));
				});
				return rowType.create(originalRow?.attrs || null, cells, originalRow?.marks);
			});
			const replacement = tableNode.type.create(tableNode.attrs, rows, tableNode.marks);
			const tableStart = $from.before(tableDepth);
			view.dispatch(state.tr.replaceWith(tableStart, tableStart + tableNode.nodeSize, replacement));
			this.editor.commands.focus();
			this.status.textContent = `${matrix.length} row${matrix.length === 1 ? "" : "s"} and ${columnCount} column${columnCount === 1 ? "" : "s"} pasted into the table.`;
		}

		getActiveTableCell() {
			if (!this.editor?.isActive("table")) return null;
			const { $head } = this.editor.state.selection;
			for (let depth = $head.depth; depth > 0; depth--) {
				if (!["tableCell", "tableHeader"].includes($head.node(depth).type.name)) continue;
				const dom = this.editor.view.nodeDOM($head.before(depth));
				return dom instanceof HTMLElement ? dom : null;
			}
			return null;
		}

		updateTableToolbar() {
			if (!this.tableToolbar || !this.editor) return;
			const cell = this.getActiveTableCell();
			const visible = Boolean(cell && !this.sourceMode);
			this.tableToolbar.hidden = !visible;
			if (!visible) {
				this.tableToolbar.removeAttribute("style");
				this.clearTableActionPreview();
			} else {
				this.positionTableToolbar(cell);
			}
			if (visible && !this.tableToolbar.contains(document.activeElement)) {
				const first = this.tableToolbar.querySelector("button:not(:disabled)");
				this.tableToolbar.querySelectorAll("button").forEach(button => { button.tabIndex = button === first ? 0 : -1; });
			}
		}

		positionTableToolbar(cell = this.getActiveTableCell()) {
			if (!this.tableToolbar || !cell || this.sourceMode) return;
			const table = cell.closest("table");
			if (!table) return;
			const surfaceRect = this.visualSurface.getBoundingClientRect();
			const editorRect = this.editor.view.dom.getBoundingClientRect();
			const tableRect = table.getBoundingClientRect();
			const gap = 4;
			this.tableToolbar.hidden = false;
			const toolbarRect = this.tableToolbar.getBoundingClientRect();
			if (tableRect.top >= editorRect.bottom || tableRect.bottom <= editorRect.top + toolbarRect.height + gap) {
				this.tableToolbar.hidden = true;
				this.clearTableActionPreview();
				return;
			}
			const minimumLeft = editorRect.left + gap;
			const maximumLeft = Math.max(minimumLeft, editorRect.right - toolbarRect.width - gap);
			const left = Math.min(Math.max(tableRect.left, minimumLeft), maximumLeft);
			const top = Math.max(tableRect.top - toolbarRect.height - gap, editorRect.top + gap);
			Object.assign(this.tableToolbar.style, {
				left: `${left - surfaceRect.left}px`,
				top: `${top - surfaceRect.top}px`
			});
		}

		clearTableActionPreview() {
			if (!this.tablePreview) return;
			this.tablePreview.hidden = true;
			this.tablePreview.classList.remove("saInsertionPreview", "saDeletionPreview");
			this.tablePreview.removeAttribute("style");
			this.tablePreviewCommand = null;
		}

		previewTableAction(command) {
			this.clearTableActionPreview();
			if (!command) return;
			const cell = this.getActiveTableCell();
			if (!cell) return;
			this.tablePreviewCommand = command;
			const table = cell.closest("table");
			const surfaceRect = this.visualSurface.getBoundingClientRect();
			const tableRect = table.getBoundingClientRect();
			const rowRect = cell.parentElement.getBoundingClientRect();
			const cellRect = cell.getBoundingClientRect();
			const thickness = 4;
			let rect;
			if (command === "addRowBefore" || command === "addRowAfter") {
				rect = { left: tableRect.left, top: (command === "addRowBefore" ? rowRect.top : rowRect.bottom) - thickness / 2, width: tableRect.width, height: thickness };
			} else if (command === "addColumnBefore" || command === "addColumnAfter") {
				rect = { left: (command === "addColumnBefore" ? cellRect.left : cellRect.right) - thickness / 2, top: tableRect.top, width: thickness, height: tableRect.height };
			} else if (command === "deleteRow") rect = rowRect;
			else if (command === "deleteColumn") rect = { left: cellRect.left, top: tableRect.top, width: cellRect.width, height: tableRect.height };
			else if (command === "deleteTable") rect = tableRect;
			if (!rect) return;
			this.tablePreview.classList.add(command.startsWith("add") ? "saInsertionPreview" : "saDeletionPreview");
			Object.assign(this.tablePreview.style, {
				left: `${rect.left - surfaceRect.left}px`,
				top: `${rect.top - surfaceRect.top}px`,
				width: `${rect.width}px`,
				height: `${rect.height}px`
			});
			this.tablePreview.hidden = false;
		}

		updateButtons() {
			if (!this.editor) return;
			const activeHeading = [1, 2, 3, 4, 5, 6].find(level => this.editor.isActive("heading", { level }));
			if (this.headingSelect) this.headingSelect.value = activeHeading ? String(activeHeading) : "paragraph";
			const activeColor = this.editor.getAttributes("textColor").color;
			const inTable = this.editor.isActive("table");
			if (this.colorSelect) this.colorSelect.value = textColors.has(activeColor) ? activeColor : "default";
			if (this.headingSelect) this.headingSelect.disabled = Boolean(this.sourceMode);
			if (this.colorSelect) this.colorSelect.disabled = Boolean(this.sourceMode);
			if (this.tablePickerButton) this.tablePickerButton.disabled = Boolean(this.sourceMode || inTable);
			if (this.sourceMode || inTable) this.closeTablePicker();
			const types = { bold: "bold", italic: "italic", underline: "underline", strike: "strike", link: "link", bullet: "bulletList", number: "orderedList", quote: "blockquote", code: "code", codeblock: "codeBlock" };
			const commands = {
				horizontalRule: "setHorizontalRule",
				addRowBefore: "addRowBefore", addRowAfter: "addRowAfter", deleteRow: "deleteRow",
				addColumnBefore: "addColumnBefore", addColumnAfter: "addColumnAfter", deleteColumn: "deleteColumn",
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
			});
			this.updateTableToolbar();
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
