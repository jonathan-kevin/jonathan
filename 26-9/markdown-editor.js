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
		import("https://esm.sh/lowlight@3.3.0"),
		import("https://esm.sh/@tiptap/extension-list@3.31.3"),
		import("https://esm.sh/@tiptap/pm@3.31.3/state"),
		import("https://esm.sh/@tiptap/pm@3.31.3/view"),
		import("https://esm.sh/@tiptap/pm@3.31.3/history"),
		import("./markdown-editor-paste.js?v=2")
	]);

	const isValidTextColor = value => {
		const color = String(value || "").trim();
		return color.length <= 128 && !/[\u0000-\u001f;]/.test(color) && CSS.supports("color", color);
	};
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
				languageLabel.className = "saMarkdownEditorCodeLanguage saInputTextWrapper";
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
				copyButton.innerHTML = '<i class="saIcon far fad fa-clone" aria-hidden="true"></i><i class="saIcon far fad fa-check" aria-hidden="true"></i>';
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
					return isValidTextColor(color) ? { color } : false;
				}
			}];
		},

		renderHTML({ HTMLAttributes }) {
			const color = isValidTextColor(HTMLAttributes.color) ? HTMLAttributes.color.trim() : null;
			return color ? ["span", { "data-text-color": color, style: `color: ${color}` }, 0] : ["span", 0];
		},

		renderMarkdown(node, helpers) {
			return helpers.renderChildren(node);
		},

		addCommands() {
			return {
				setTextColor: color => ({ commands }) => isValidTextColor(color) && commands.setMark(this.name, { color: color.trim() }),
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
			this.status.setAttribute("class", "saScreenReaderOnly");
			this.status.textContent = "Loading editor…";
			this.append(this.status);

			try {
				const [{ Editor, Mark, Extension }, { StarterKit }, { Markdown }, { Image }, { TableKit }, { CodeBlockLowlight }, { common, createLowlight }, { TaskList, TaskItem }, { Plugin, PluginKey, TextSelection }, { Decoration, DecorationSet }, { closeHistory }, { cleanPastedHTML }] = await loadEditor();
				if (!this.isConnected) return;
				this.buildControls();
				this.closeHistory = closeHistory;
				this.TextSelection = TextSelection;
				const owner = this;
				const searchHighlights = Extension.create({
					name: "searchHighlights",
					addProseMirrorPlugins() {
						return [new Plugin({
							key: new PluginKey("searchHighlights"),
							filterTransaction: transaction => owner.aiPreview?.phase !== "review" || !transaction.docChanged,
							props: {
								decorations: state => DecorationSet.create(state.doc, [...owner.getSearchMatches(state.doc).map(match => Decoration.inline(match.from, match.to, {
									nodeName: "mark",
									class: state.selection.from === match.from && state.selection.to === match.to ? "saFindMatch saFindCurrent" : "saFindMatch"
								})), ...(owner.aiPreview?.doc === state.doc ? [Decoration.inline(owner.aiPreview.range?.from ?? owner.aiPreview.from, owner.aiPreview.range?.to ?? owner.aiPreview.to, {
									class: owner.aiPreview.phase === "thinking" ? "saMarkdownEditorThinking" : "saMarkdownEditorSuggestionTarget",
									"aria-busy": String(owner.aiPreview.phase === "thinking")
								})] : [])])
							}
						})];
					}
				});
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
						TaskList,
						TaskItem.configure({ nested: true, a11y: { checkboxLabel: node => `Mark task ${node.firstChild?.textContent || "item"} as ${node.attrs.checked ? "incomplete" : "complete"}` } }),
						searchHighlights,
						createCodeBlock(CodeBlockLowlight, createLowlight(common)),
						createTextColor(Mark),
						createUnderline(Mark),
						Markdown
					],
					content: this.source.value,
					contentType: "markdown",
					injectCSS: false,
					editorProps: {
						transformPastedHTML: cleanPastedHTML,
						attributes: {
							class: "saMarkdownContent saMarkdownEditorDocument",
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
								if (event.clipboardData?.getData("text/html")) return false;
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
					onTransaction: ({ transaction }) => {
						if (transaction.docChanged) {
							for (const source of this.chatSourceRanges || []) {
								if (source.unavailable) continue;
								source.from = transaction.mapping.map(source.from, 1);
								source.to = transaction.mapping.map(source.to, -1);
								source.unavailable = source.to <= source.from;
							}
						}
						if (this.aiPreview && transaction.docChanged) this.cancelThinkingPreview(false);
						this.updateButtons(); this.updateFindStatus(); this.scheduleSelectionToolbar();
					}
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
			const colorGroups = ["Gray", "Blue", "Red", "Orange", "Yellow", "Green", "Sky", "Purple", "Pink", "Bluze"];
			const colorShades = [600, 700, 800, 900, 1000];
			const colorSwatches = colorShades.flatMap((shade, rowIndex) => colorGroups.map((group, columnIndex) => {
				const color = `var(--${group}${shade})`;
				const label = `${group} ${shade}`;
				return `<input type="radio" class="saColor" tabindex="-1" data-color-row="${rowIndex}" data-color-column="${columnIndex}" name="${id}-text-color" value="${color}" aria-label="${label}" title="${label}" style="background-color: ${color}; grid-column: ${columnIndex + 1}; grid-row: ${rowIndex + 1};">`;
			})).join("");
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
								<div class="saTrailingIconsWrapper"><i class="saIcon far fad fa-angle-down"></i></div>
							</label>
						</li>
						<li class="saMarkdownEditorColorControl">
							<div class="saMarkdownEditorColorButtons" role="group" aria-label="Text color">
								<button class="saButtonIconToolbar saTextColorApply" data-apply-text-color type="button" aria-label="Apply default text color" title="Apply default text color">
									<span class="saTextColorIndicator" data-text-color-indicator aria-hidden="true"></span>
								</button>
								<button class="saButtonIconToolbar saTextColorMenu" data-color-picker-button aria-label="Choose text color, current color default" aria-haspopup="dialog" aria-expanded="false" aria-controls="${id}-color-picker" type="button"><i class="saIcon far fad fa-angle-down" aria-hidden="true"></i></button>
							</div>
							<div class="saColorPicker saPicker saContextMenu saSouth" id="${id}-color-picker" data-color-picker role="dialog" aria-label="Text color picker" aria-describedby="${id}-color-help" hidden>
								<p id="${id}-color-help" class="saScreenReaderOnly">Arrow keys browse colors without applying them. Home and End move within a row. Enter or Space chooses a color. Tab reaches custom color. Escape closes the picker.</p>
								<div class="saColors">
									<fieldset class="saPalette">
										<legend class="saScreenReaderOnly">Softadmin color shades</legend>
										${colorSwatches}
									</fieldset>
									<fieldset class="saPalette saFooter">
										<legend class="saScreenReaderOnly">Custom and neutral colors</legend>
										<input type="radio" class="saColor saColorDefault" tabindex="0" data-color-row="5" data-color-column="0" name="${id}-text-color" value="" aria-label="Default text color" title="Default text color" checked>
										<input class="saColor saExtraColor saColorCustom" type="color" data-custom-text-color aria-label="Custom text color" value="#2d6ce1">
										<input type="radio" class="saColor saExtraColor saWhite" tabindex="-1" data-color-row="5" data-color-column="8" name="${id}-text-color" value="#ffffff" aria-label="White" style="background-color: #ffffff;">
										<input type="radio" class="saColor saExtraColor saBlack" tabindex="-1" data-color-row="5" data-color-column="9" name="${id}-text-color" value="#000000" aria-label="Black" style="background-color: #000000;">
									</fieldset>
								</div>
							</div>
						</li>
						<li><button class="saButtonIconToolbar" type="button" data-command="bold" aria-keyshortcuts="Control+B Meta+B" aria-label="Bold"><i class="saIcon fas fa-bold"></i><i class="saIcon far fad fa-bold"></i></button></li>
						<li><button class="saButtonIconToolbar" type="button" data-command="italic" aria-keyshortcuts="Control+I Meta+I" aria-label="Italic"><i class="saIcon fas fa-italic"></i><i class="saIcon far fad fa-italic"></i></button></li>
						<li hidden><button class="saButtonIconToolbar" type="button" data-command="underline" aria-keyshortcuts="Control+U Meta+U" aria-label="Underline"><i class="saIcon fas fa-underline"></i><i class="saIcon far fad fa-underline"></i></button></li>
						<li><button class="saButtonIconToolbar" type="button" data-command="strike" aria-label="Strikethrough"><i class="saIcon fas fa-strikethrough"></i><i class="saIcon far fad fa-strikethrough"></i></button></li>
						<li><button class="saButtonIconToolbar" type="button" data-command="clear" aria-label="Clear formatting"><i class="saIcon far fad fa-text-slash"></i></button></li>
						</ul>
					<ul aria-label="Links and media">
						<li><button class="saButtonIconToolbar" type="button" data-command="link" aria-keyshortcuts="Control+K Meta+K" aria-haspopup="dialog" aria-label="Link"><i class="saIcon fas fa-link"></i><i class="saIcon far fad fa-link"></i></button></li>
						<li><button class="saButtonIconToolbar" type="button" data-command="image" aria-haspopup="dialog" aria-label="Image"><i class="saIcon fas fa-image"></i><i class="saIcon far fad fa-image"></i></button></li>
					</ul>
					<ul aria-label="Block formatting">
						<li><button class="saButtonIconToolbar" type="button" data-command="bullet" aria-label="Bulleted list"><i class="saIcon fas fa-list"></i><i class="saIcon far fad fa-list"></i></button></li>
						<li><button class="saButtonIconToolbar" type="button" data-command="number" aria-label="Numbered list"><i class="saIcon fas fa-list-ol"></i><i class="saIcon far fad fa-list-ol"></i></button></li>
						<li><button class="saButtonIconToolbar" type="button" data-command="task" aria-label="Task list" aria-keyshortcuts="Control+Shift+9 Meta+Shift+9"><i class="saIcon fas fa-list-check" aria-hidden="true"></i><i class="saIcon far fa-list-check" aria-hidden="true"></i></button></li>
						<li><button class="saButtonIconToolbar" type="button" data-command="quote" aria-label="Quote"><i class="saIcon fas fa-quote-left"></i><i class="saIcon far fad fa-quote-left"></i></button></li>
						<li><button class="saButtonIconToolbar" type="button" data-command="code" aria-label="Inline code"><i class="saIcon fas fa-code"></i><i class="saIcon far fad fa-code"></i></button></li>
						<li><button class="saButtonIconToolbar" type="button" data-command="codeblock" aria-label="Code block"><i class="saIcon fas fa-square-code"></i><i class="saIcon far fad fa-square-code"></i></button></li>
						<li><button class="saButtonIconToolbar" type="button" data-command="horizontalRule" aria-label="Horizontal rule"><i class="saIcon far fad fa-horizontal-rule"></i></button></li>
					</ul>
					<ul aria-label="Tables">
						<li class="markdown-editor-table-menu">
							<button class="saButtonIconToolbar" type="button" data-table-picker-button aria-label="Insert table" aria-haspopup="grid" aria-expanded="false" aria-controls="${id}-table-picker"><i class="saIcon far fad fa-table" aria-hidden="true"></i></button>
							<div class="saContextMenu saSouth" hidden>
								<div class="saMarkdownEditorTablePicker" id="${id}-table-picker" role="grid" aria-label="Choose table size" aria-describedby="${id}-table-picker-status" data-table-picker>
									${tablePickerRows}
								</div>
								<p id="${id}-table-picker-status" class="saMarkdownEditorTablePickerStatus" aria-live="polite">3 columns × 3 rows</p>
							</div>
						</li>
					</ul>
					<ul aria-label="View and history">
						<li><button class="saButtonIconToolbar" type="button" data-command="find" aria-label="Find" aria-keyshortcuts="Control+f Meta+f" aria-expanded="false" aria-controls="${id}-find"><i class="saIcon far fa-magnifying-glass" aria-hidden="true"></i><i class="saIcon fas fa-magnifying-glass" aria-hidden="true"></i></button></li>
						<li><button class="saButtonIconToolbar" type="button" data-command="markdown" aria-label="View as markdown" aria-controls="${id}-visual-view ${id}-source-view" aria-pressed="false"><i class="saIcon fab fa-markdown"></i></button></li>
						<li><button class="saButtonIconToolbar" type="button" data-command="undo" aria-label="Undo"><i class="saIcon far fa-undo"></i></button></li>
						<li><button class="saButtonIconToolbar" type="button" data-command="redo" aria-label="Redo"><i class="saIcon far fa-redo"></i></button></li>
					</ul>
				</div>
				<div id="${id}-visual-view" class="saMarkdownEditorVisual" data-visual-surface>
				<section id="${id}-find" class="saMarkdownEditorFind" data-find-panel aria-label="Find and replace" hidden>
					<div class="saMarkdownEditorFindRow">
						<button class="saButtonIconToolbarDark" type="button" data-find-action="toggle-replace" aria-label="Show replace" title="Show replace" aria-expanded="false" aria-controls="${id}-replace"><i class="saIcon far fa-angle-right" aria-hidden="true"></i></button>
						<div class="saMarkdownEditorFindInput">
							<input class="saInputText" data-find-query type="search" aria-label="Find" placeholder="Find" autocomplete="off" spellcheck="false">
							<output class="saMarkdownEditorFindCount" data-find-status role="status" aria-live="polite" aria-atomic="true"><span data-find-count aria-hidden="true">0/0</span><span class="saScreenReaderOnly" data-find-announcement>No matches.</span></output>
						</div>
						<button class="saButtonIconToolbarDark saMarkdownEditorFindCase" data-find-case type="button" aria-label="Match case" aria-pressed="false" title="Match case"><span aria-hidden="true">Aa</span></button>
						<button class="saButtonIconToolbarDark" type="button" data-find-action="previous" aria-label="Previous match" title="Previous match (Shift+Enter)"><i class="saIcon far fa-angle-up" aria-hidden="true"></i></button>
						<button class="saButtonIconToolbarDark" type="button" data-find-action="next" aria-label="Next match" title="Next match (Enter)"><i class="saIcon far fa-angle-down" aria-hidden="true"></i></button>
						<button class="saButtonIconToolbarDark" type="button" data-find-action="close" aria-label="Close find" title="Close find (Escape)"><i class="saIcon far fa-xmark" aria-hidden="true"></i></button>
					</div>
					<div id="${id}-replace" class="saMarkdownEditorFindRow saMarkdownEditorReplaceRow" data-replace-row role="group" aria-label="Replace" hidden>
						<input class="saInputText" data-find-replacement type="text" aria-label="Replace with" placeholder="Replace with" autocomplete="off" spellcheck="false">
						<button class="saButtonToolbarDark" type="button" data-find-action="replace" title="Replace current match (Enter)">Replace</button>
						<button class="saButtonToolbarDark" type="button" data-find-action="all">Replace all</button>
					</div>
				</section>
					<div data-editor-surface></div>
					<div class="saMarkdownEditorFloatingToolbar saMarkdownEditorSelectionToolbar" role="toolbar" aria-label="Selected text actions" aria-keyshortcuts="Alt+Shift+A" data-selection-toolbar hidden>
						<ul>
							<li><button class="saButtonToolbarDark" type="button" data-selection-action="send-to-chat" tabindex="0"><span>Send to chat</span></button></li>
							<li><button class="saButtonToolbarDark" type="button" data-selection-action="improve" tabindex="-1"><span>Refine text</span></button></li>
						</ul>
						<p data-selection-feedback role="status" hidden></p>
					</div>
					<div class="saMarkdownEditorFloatingToolbar saMarkdownEditorTableToolbar" role="toolbar" aria-label="Table editing" aria-keyshortcuts="Alt+Shift+T" data-table-toolbar hidden>
						<ul aria-label="Row actions">
							<li><button class="saButtonIconToolbarDark" type="button" data-command="addRowBefore" aria-label="Add row above"><i class="saIcon far fad fa-arrow-up-to-line" aria-hidden="true"></i></button></li>
							<li><button class="saButtonIconToolbarDark" type="button" data-command="addRowAfter" aria-label="Add row below"><i class="saIcon far fad fa-arrow-down-to-line" aria-hidden="true"></i></button></li>
							<li><button class="saButtonIconToolbarDark saDestructive" type="button" data-command="deleteRow" aria-label="Delete row"><i class="saIcon far fad fa-xmark" aria-hidden="true"></i></button></li>
						</ul>
						<ul aria-label="Column actions">
							<li><button class="saButtonIconToolbarDark" type="button" data-command="addColumnBefore" aria-label="Add column left"><i class="saIcon far fad fa-arrow-left-to-line" aria-hidden="true"></i></button></li>
							<li><button class="saButtonIconToolbarDark" type="button" data-command="addColumnAfter" aria-label="Add column right"><i class="saIcon far fad fa-arrow-right-to-line" aria-hidden="true"></i></button></li>
							<li><button class="saButtonIconToolbarDark saDestructive" type="button" data-command="deleteColumn" aria-label="Delete column"><i class="saIcon far fad fa-xmark" aria-hidden="true"></i></button></li>
						</ul>
						<ul aria-label="Table actions">
							<li><button class="saButtonIconToolbarDark saDestructive" type="button" data-command="deleteTable" aria-label="Delete table"><i class="saIcon far fad fa-trash-alt" aria-hidden="true"></i></button></li>
						</ul>
					</div>
					<div class="saMarkdownEditorTablePreview" data-table-preview aria-hidden="true" hidden></div>
				</div>
				<div id="${id}-source-view" data-source-surface hidden></div>
				<p id="${id}-help" class="saScreenReaderOnly">Write and format your content directly, or use the Markdown button to edit its source. Ctrl/Cmd + B: bold, I: italic, U: underline, K: link, F: find and replace. Alt+Shift+A focuses actions for selected text. Ctrl/Cmd+Shift+9 toggles a task list; Tab and Shift+Tab nest and lift tasks. In a table, use Tab and Shift+Tab to move between cells, or Alt+Shift+T to open table editing controls.</p>
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
			this.selectionToolbar = this.shell.querySelector("[data-selection-toolbar]");
			this.selectionFeedback = this.shell.querySelector("[data-selection-feedback]");
			this.tablePreview = this.shell.querySelector("[data-table-preview]");
			this.colorControl = this.shell.querySelector(".saMarkdownEditorColorControl");
			this.colorApplyButton = this.shell.querySelector("[data-apply-text-color]");
			this.colorIndicator = this.shell.querySelector("[data-text-color-indicator]");
			this.colorPicker = this.shell.querySelector("[data-color-picker]");
			this.colorPickerButtons = this.shell.querySelectorAll("[data-color-picker-button]");
			this.customColorInput = this.shell.querySelector("[data-custom-text-color]");
			this.findPanel = this.shell.querySelector("[data-find-panel]");
			this.findQuery = this.shell.querySelector("[data-find-query]");
			this.findReplacement = this.shell.querySelector("[data-find-replacement]");
			this.findCase = this.shell.querySelector("[data-find-case]");
			this.findStatus = this.shell.querySelector("[data-find-status]");
			this.findCount = this.shell.querySelector("[data-find-count]");
			this.findAnnouncement = this.shell.querySelector("[data-find-announcement]");
			this.replaceRow = this.shell.querySelector("[data-replace-row]");
			this.replaceToggle = this.shell.querySelector('[data-find-action="toggle-replace"]');
			this.findButton = this.shell.querySelector('[data-command="find"]');
			this.selectedTextColor = "";
			this.updateColorControl();
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
			// Handle preview decisions before editor keymaps or button activation consume them.
			this.shell.addEventListener("keydown", event => {
				if (!this.aiPreview || event.isComposing || event.target.closest("dialog")) return;
				const apply = this.aiPreview.phase === "review" && event.key === "Enter" && (event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey;
				if (!apply && event.key !== "Escape") return;
				event.preventDefault();
				event.stopPropagation();
				if (apply) this.applyThinkingPreview();
				else {
					this.cancelThinkingPreview();
					this.editor.commands.focus();
				}
			}, { ...options, capture: true });
			this.shell.addEventListener("keydown", event => {
				if (!this.sourceMode && !event.isComposing && event.altKey && event.shiftKey && event.key.toLowerCase() === "a" && event.target === this.editor.view.dom) {
					event.preventDefault();
					this.dismissedTextSelection = null;
					this.updateSelectionToolbar();
					if (!this.selectionToolbar.hidden) this.selectionToolbar.querySelector('[tabindex="0"]').focus();
				}
				if (!this.sourceMode && !event.isComposing && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f" && !event.target.closest("dialog")) {
					event.preventDefault();
					this.openFind();
				}
			}, options);
			this.selectionToolbar.addEventListener("mousedown", event => event.preventDefault(), options);
			this.selectionToolbar.addEventListener("click", event => {
				const button = event.target.closest("[data-selection-action]");
				if (button) this.runSelectionAction(button.dataset.selectionAction);
			}, options);
			this.selectionToolbar.addEventListener("keydown", event => this.handleSelectionToolbarKeydown(event), options);
			this.editor.view.dom.addEventListener("pointerdown", () => {
				this.selectingText = true;
				this.selectionToolbar.hidden = true;
			}, options);
			document.addEventListener("pointerup", () => { this.selectingText = false; this.scheduleSelectionToolbar(); }, options);
			document.addEventListener("pointercancel", () => { this.selectingText = false; this.scheduleSelectionToolbar(); }, options);
			document.addEventListener("selectionchange", () => this.scheduleSelectionToolbar(), options);
			document.addEventListener("focusin", () => this.scheduleSelectionToolbar(), options);
			document.addEventListener("focusout", () => this.scheduleSelectionToolbar(), options);
			window.addEventListener("scroll", () => this.scheduleSelectionToolbar(), { ...options, capture: true });
			window.addEventListener("resize", () => this.scheduleSelectionToolbar(), options);
			this.findQuery.addEventListener("input", event => { event.stopPropagation(); this.refreshFind(); }, options);
			this.findReplacement.addEventListener("input", event => event.stopPropagation(), options);
			this.findCase.addEventListener("click", () => {
				this.findCase.setAttribute("aria-pressed", String(this.findCase.getAttribute("aria-pressed") !== "true"));
				this.refreshFind();
			}, options);
			this.findPanel.addEventListener("keydown", event => {
				if (event.isComposing) return;
				if (event.key === "Escape") { event.preventDefault(); this.closeFind(); }
				else if (event.key === "Enter" && (event.target === this.findQuery || event.target === this.findReplacement)) {
					event.preventDefault();
					if (event.target === this.findReplacement) this.replaceMatches(false);
					else this.moveFind(event.shiftKey ? -1 : 1);
				}
			}, options);
			this.findPanel.addEventListener("click", event => {
				const action = event.target.closest("[data-find-action]")?.dataset.findAction;
				if (action === "close") this.closeFind();
				if (action === "toggle-replace") this.setReplaceExpanded(this.replaceRow.hidden, true);
				if (action === "next" || action === "previous") this.moveFind(action === "next" ? 1 : -1);
				if (action === "replace" || action === "all") this.replaceMatches(action === "all");
			}, options);
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
			this.colorApplyButton.addEventListener("click", () => this.applyTextColor(this.selectedTextColor), options);
			this.colorPickerButtons.forEach(button => {
				button.addEventListener("pointerdown", () => this.captureColorSelection(), options);
				button.addEventListener("click", () => this.toggleColorPicker(true), options);
				button.addEventListener("keydown", event => {
					if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
					event.preventDefault();
					this.openColorPicker(true);
				}, options);
			});
			this.colorPicker.addEventListener("click", event => {
				const swatch = event.target.closest('input[type="radio"].saColor');
				if (swatch) this.chooseColorSwatch(swatch);
			}, options);
			this.customColorInput.addEventListener("input", () => {
				if (this.selectTextColor(this.customColorInput.value)) this.applyPendingTextColor();
			}, options);
			this.customColorInput.addEventListener("change", () => {
				const hadSelection = Boolean(this.pendingColorSelection);
				this.closeColorPicker(!hadSelection);
				if (hadSelection) this.restorePendingColorSelection();
			}, options);
			this.colorPicker.addEventListener("keydown", event => this.handleColorKeydown(event), options);
			this.colorPicker.addEventListener("focusin", event => {
				if (event.target.matches('input[type="radio"]')) this.setColorTabStop(event.target);
			}, options);
			this.colorControl.addEventListener("focusout", () => {
				setTimeout(() => {
					if (!this.colorControl.contains(document.activeElement)) this.closeColorPicker();
				}, 0);
			}, options);
			document.addEventListener("pointerdown", event => {
				if (!this.colorPicker.hidden && !this.colorControl.contains(event.target)) this.closeColorPicker();
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
			if (command === "find") return this.findPanel.hidden ? this.openFind() : this.closeFind();
			if (command === "link") return this.openLink();
			if (command === "image") return this.openImage();
			const chain = this.editor.chain().focus();
			const actions = {
				bold: () => chain.toggleBold(), italic: () => chain.toggleItalic(), underline: () => chain.toggleUnderline(), strike: () => chain.toggleStrike(),
				clear: () => chain.unsetAllMarks().clearNodes(),
				bullet: () => chain.toggleBulletList(), number: () => chain.toggleOrderedList(), task: () => chain.toggleTaskList(),
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

		openColorPicker(focusPicker = false) {
			if (this.colorApplyButton.disabled) return;
			this.closeTablePicker();
			if (!this.colorSelectionCaptured) this.captureColorSelection();
			this.colorSelectionCaptured = false;
			this.colorPicker.hidden = false;
			this.colorPicker.classList.add("saOpen");
			this.colorPickerButtons.forEach(button => button.setAttribute("aria-expanded", "true"));
			if (focusPicker) {
				const swatch = this.colorPicker.querySelector('input[type="radio"]:checked') || this.colorPicker.querySelector(".saColor");
				this.setColorTabStop(swatch);
				swatch?.focus();
			}
		}

		setColorTabStop(swatch) {
			this.colorPicker.querySelectorAll('input[type="radio"]').forEach(input => { input.tabIndex = input === swatch ? 0 : -1; });
		}

		chooseColorSwatch(swatch) {
			if (!this.selectTextColor(swatch.value)) return;
			const hadSelection = Boolean(this.pendingColorSelection);
			this.applyPendingTextColor();
			this.closeColorPicker(!hadSelection);
			if (hadSelection) this.restorePendingColorSelection();
		}

		handleColorKeydown(event) {
			if (event.key === "Escape") {
				event.preventDefault();
				this.closeColorPicker();
				this.colorPickerButtons[0].focus();
				return;
			}
			const swatch = event.target.closest('input[type="radio"]');
			if (!swatch) return;
			if (event.key === "Enter" || event.key === " ") {
				event.preventDefault(); this.chooseColorSwatch(swatch); return;
			}
			if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
			event.preventDefault();
			const swatches = Array.from(this.colorPicker.querySelectorAll('input[type="radio"]'));
			const row = Number(swatch.dataset.colorRow);
			const column = Number(swatch.dataset.colorColumn);
			const inRow = swatches.filter(input => Number(input.dataset.colorRow) === row);
			let target = swatch;
			if (event.key === "Home" || event.key === "End") {
				const candidates = event.ctrlKey || event.metaKey ? swatches : inRow;
				target = event.key === "Home" ? candidates[0] : candidates.at(-1);
			} else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
				const delta = event.key === "ArrowLeft" ? -1 : 1;
				target = inRow[(inRow.indexOf(swatch) + delta + inRow.length) % inRow.length];
			} else {
				const nextRow = (row + (event.key === "ArrowUp" ? -1 : 1) + 6) % 6;
				target = swatches.filter(input => Number(input.dataset.colorRow) === nextRow)
					.sort((a, b) => Math.abs(Number(a.dataset.colorColumn) - column) - Math.abs(Number(b.dataset.colorColumn) - column))[0];
			}
			this.setColorTabStop(target);
			target.focus();
		}

		closeColorPicker(returnFocus = false) {
			if (!this.colorPicker) return;
			this.colorSelectionCaptured = false;
			this.colorPicker.hidden = true;
			this.colorPicker.classList.remove("saOpen");
			this.colorPickerButtons.forEach(button => button.setAttribute("aria-expanded", "false"));
			if (returnFocus) this.colorApplyButton.focus();
		}

		toggleColorPicker(focusPicker = false) {
			if (this.colorPicker.hidden) this.openColorPicker(focusPicker);
			else this.closeColorPicker();
		}

		applyTextColor(value, focusEditor = true, selection = null) {
			const color = String(value || "").trim();
			if (color && !isValidTextColor(color)) return false;
			const chain = this.editor.chain();
			if (focusEditor) chain.focus();
			if (selection) chain.setTextSelection(selection);
			const changed = color ? chain.setTextColor(color).run() : chain.unsetTextColor().run();
			if (changed) this.status.textContent = color ? `Text color set to ${color}.` : "Text color removed.";
			return changed;
		}

		captureColorSelection() {
			const { from, to } = this.editor.state.selection;
			this.pendingColorSelection = from === to ? null : { from, to };
			this.colorSelectionCaptured = true;
		}

		applyPendingTextColor() {
			if (!this.pendingColorSelection) return false;
			return this.applyTextColor(this.selectedTextColor, false, this.pendingColorSelection);
		}

		restorePendingColorSelection() {
			if (!this.pendingColorSelection) return;
			this.editor.chain().focus().setTextSelection(this.pendingColorSelection).run();
		}

		selectTextColor(value) {
			const color = String(value || "").trim();
			if (color && !isValidTextColor(color)) return false;
			this.selectedTextColor = color;
			this.updateColorControl();
			this.status.textContent = color ? `${color} selected. Use Apply text color to apply it.` : "Default text color selected. Use Apply text color to remove the current text color.";
			return true;
		}

		updateColorControl() {
			const selectedColor = isValidTextColor(this.selectedTextColor) ? this.selectedTextColor.trim() : "";
			const colorName = selectedColor || "default";
			this.colorIndicator.style.backgroundColor = selectedColor || "var(--Sa-Color-Text)";
			this.colorApplyButton.setAttribute("aria-label", `Apply ${colorName} text color`);
			this.colorApplyButton.title = `Apply ${colorName} text color`;
			this.colorPickerButtons.forEach(button => {
				button.setAttribute("aria-label", `Choose text color, current color ${colorName}`);
			});
			this.colorPicker.querySelectorAll('input[type="radio"].saColor').forEach(swatch => {
				swatch.checked = swatch.value.toLowerCase() === selectedColor.toLowerCase();
			});
			if (/^#[0-9a-f]{6}$/i.test(selectedColor)) this.customColorInput.value = selectedColor;
		}

		scheduleSelectionToolbar() {
			cancelAnimationFrame(this.selectionToolbarFrame);
			this.selectionToolbarFrame = requestAnimationFrame(() => this.updateSelectionToolbar());
		}

		updateSelectionToolbar() {
			if (!this.editor || !this.selectionToolbar) return;
			const chat = this.getChatPanel();
			const chatButton = this.selectionToolbar.querySelector('[data-selection-action="send-to-chat"]');
			if (chat && !this.aiPreview) {
				chatButton.setAttribute("aria-controls", chat.id);
				chatButton.setAttribute("aria-expanded", String(!chat.hidden));
			} else {
				chatButton.removeAttribute("aria-controls");
				chatButton.removeAttribute("aria-expanded");
			}
			const { selection, doc } = this.editor.state;
			if (this.sentChatSelection && (this.sentChatSelection.doc !== doc || this.sentChatSelection.from !== selection.from || this.sentChatSelection.to !== selection.to)) {
				this.sentChatSelection = null;
				if (!this.aiPreview) this.setThinkingControls(false);
			}
			const { from, to } = this.aiPreview?.range || this.aiPreview || selection;
			const focused = document.activeElement === this.editor.view.dom || this.selectionToolbar.contains(document.activeElement);
			const dismissed = this.dismissedTextSelection;
			if (selection.empty || dismissed && (dismissed.from !== from || dismissed.to !== to || dismissed.doc !== doc)) this.dismissedTextSelection = null;
			if (this.sourceMode || (!this.aiPreview && (this.selectingText || !focused || !this.findPanel.hidden || this.dismissedTextSelection || !(selection instanceof this.TextSelection) || !doc.textBetween(from, to, "\n").trim()))) {
				this.selectionToolbar.hidden = true;
				return;
			}
			const key = `${from}:${to}`;
			if (this.selectionToolbarKey !== key || this.selectionToolbarDoc !== doc) {
				this.selectionToolbarKey = key;
				this.selectionToolbarDoc = doc;
				this.selectionFeedback.hidden = true;
				this.selectionFeedback.textContent = "";
			}
			const editorRect = this.editor.view.dom.getBoundingClientRect();
			const surfaceRect = this.visualSurface.getBoundingClientRect();
			const range = document.createRange();
			const start = this.editor.view.domAtPos(from);
			const end = this.editor.view.domAtPos(to);
			range.setStart(start.node, start.offset);
			range.setEnd(end.node, end.offset);
			const topEdge = Math.max(editorRect.top, 8);
			const bottomEdge = Math.min(editorRect.bottom, window.innerHeight - 8);
			const anchor = Array.from(range.getClientRects()).find(rect => rect.height && rect.bottom > topEdge && rect.top < bottomEdge);
			if (!anchor) { this.selectionToolbar.hidden = true; return; }
			this.selectionToolbar.hidden = false;
			const toolbarRect = this.selectionToolbar.getBoundingClientRect();
			const leftEdge = Math.max(editorRect.left + 4, 8);
			const rightEdge = Math.min(editorRect.right - 4, window.innerWidth - 8);
			const left = Math.max(leftEdge, Math.min((anchor.left + anchor.right - toolbarRect.width) / 2, rightEdge - toolbarRect.width));
			const above = anchor.top - toolbarRect.height - 8;
			const top = above >= topEdge ? above : Math.min(anchor.bottom + 8, bottomEdge - toolbarRect.height);
			Object.assign(this.selectionToolbar.style, { left: `${left - surfaceRect.left}px`, top: `${top - surfaceRect.top}px` });
		}

		handleSelectionToolbarKeydown(event) {
			const buttons = Array.from(this.selectionToolbar.querySelectorAll("button"));
			if (event.key === "Escape") {
				event.preventDefault();
				const { from, to } = this.editor.state.selection;
				this.dismissedTextSelection = { from, to, doc: this.editor.state.doc };
				this.selectionToolbar.hidden = true;
				this.editor.commands.focus();
				return;
			}
			if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
			event.preventDefault();
			const current = buttons.indexOf(document.activeElement);
			const index = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (current + (event.key === "ArrowLeft" ? -1 : 1) + buttons.length) % buttons.length;
			buttons.forEach((button, position) => { button.tabIndex = position === index ? 0 : -1; });
			buttons[index].focus();
		}

		runSelectionAction(action) {
			if (this.aiPreview) {
				if (action === "send-to-chat" && this.aiPreview.phase === "review") this.applyThinkingPreview();
				else if (action === "improve") {
					this.cancelThinkingPreview();
					this.editor.commands.focus();
				}
				return;
			}
			const { selection, doc } = this.editor.state;
			if (this.sourceMode || !(selection instanceof this.TextSelection) || selection.empty) return;
			const { from, to } = selection;
			const text = doc.textBetween(from, to, "\n");
			if (!text.trim()) return;
			if (action === "send-to-chat" && this.sentChatSelection?.doc === doc && this.sentChatSelection.from === from && this.sentChatSelection.to === to) {
				this.getChatPanel()?.addSelection(text, this);
				return;
			}
			// Tiptap defers focus; do not let it steal focus back from the chat composer.
			const chain = this.editor.chain().setTextSelection({ from, to });
			if (action !== "send-to-chat" || !this.getChatPanel()) chain.focus();
			chain.run();
			const unhandled = this.dispatchEvent(new CustomEvent("markdown-editor-action", {
				bubbles: true, composed: true, cancelable: true,
				detail: { action, text, from, to }
			}));
			if (unhandled) {
				if (action === "improve") {
					if (this.editor.state.doc === doc) this.startThinkingPreview(from, to);
					return;
				}
				if (action === "send-to-chat" && this.editor.state.doc === doc) {
					this.sentChatSelection = { doc, from, to };
					this.setThinkingControls(false);
					const chat = this.getChatPanel();
					if (chat) chat.addSelection(text, this);
					this.status.textContent = chat ? "Selected text attached to your next chat message. Nothing sent yet." : "Demo: selected text marked as sent to chat. No message was sent.";
				}
			}
		}

		getChatPanel() {
			const panel = document.getElementById(this.getAttribute("chat-target"));
			return typeof panel?.addSelection === "function" ? panel : null;
		}

		setThinkingControls(busy) {
			const reviewing = this.aiPreview?.phase === "review";
			const sent = !busy && Boolean(this.sentChatSelection);
			this.selectionToolbar.setAttribute("aria-label", busy ? (reviewing ? "Review suggestion" : "Preparing suggestion") : "Selected text actions");
			this.selectionToolbar.querySelectorAll("[data-selection-action]").forEach(button => {
				const primary = button.dataset.selectionAction === "send-to-chat";
				button.setAttribute("aria-disabled", String(primary && ((busy && !reviewing) || (sent && !this.getChatPanel()))));
				const shortcut = busy ? (primary ? (reviewing ? "Control+Enter Meta+Enter" : "") : "Escape") : "";
				if (shortcut) button.setAttribute("aria-keyshortcuts", shortcut);
				else button.removeAttribute("aria-keyshortcuts");
				button.querySelector("span").textContent = primary ? (busy ? (reviewing ? "Apply" : "Thinking…") : (sent ? (this.getChatPanel() ? "Added to chat" : "Sent to chat") : "Send to chat")) : (busy ? (reviewing ? "Revert" : "Cancel") : "Refine text");
				const checkmark = button.querySelector("[data-chat-sent]");
				if (primary && sent && !checkmark) {
					const icon = document.createElement("i");
					icon.className = "saIcon far fa-check";
					icon.setAttribute("data-chat-sent", "");
					icon.setAttribute("aria-hidden", "true");
					button.prepend(icon);
				} else if (!sent) checkmark?.remove();
				button.tabIndex = (busy && !reviewing ? !primary : primary) ? 0 : -1;
			});
			this.scheduleSelectionToolbar();
		}

		startThinkingPreview(from, to) {
			const preview = { from, to, doc: this.editor.state.doc, phase: "thinking" };
			this.aiPreview = preview;
			this.setThinkingControls(true);
			this.status.textContent = "Demo: refining selected text. Press Escape to cancel.";
			this.editor.view.dispatch(this.editor.state.tr.setMeta("addToHistory", false));
			this.thinkingTimer = setTimeout(() => this.finishThinkingPreview(preview), 6000);
		}

		cancelThinkingPreview(refresh = true) {
			if (!this.aiPreview) return;
			const originalState = this.aiPreview.originalState;
			clearTimeout(this.thinkingTimer);
			this.aiPreview = null;
			if (originalState) {
				this.editor.view.updateState(originalState);
				this.editor.setEditable(true, false);
				this.editor.view.dom.removeAttribute("aria-readonly");
			}
			this.setThinkingControls(false);
			this.updateButtons();
			this.status.textContent = "Demo replacement canceled.";
			if (refresh && this.editor) this.editor.view.dispatch(this.editor.state.tr.setMeta("addToHistory", false));
		}

		finishThinkingPreview(preview) {
			if (!this.editor || this.aiPreview !== preview) return;
			if (this.editor.state.doc !== preview.doc) return this.cancelThinkingPreview();
			// Replace words, not blocks: keep paragraphs, lists, cells, whitespace and inline atoms intact.
			const runs = [];
			preview.doc.nodesBetween(preview.from, preview.to, (node, position) => {
				if (!node.isText) return;
				const from = Math.max(position, preview.from);
				const to = Math.min(position + node.nodeSize, preview.to);
				const text = node.text.slice(from - position, to - position);
				const previous = runs[runs.length - 1];
				if (previous?.to === from) { previous.text += text; previous.to = to; }
				else runs.push({ from, to, text });
			});
			const lorem = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat".split(" ");
			const replacements = [];
			let sentenceStart = true;
			for (const run of runs) {
				for (const match of run.text.matchAll(/\S+/g)) {
					let word = lorem[replacements.length % lorem.length];
					if (sentenceStart) word = word[0].toUpperCase() + word.slice(1);
					const punctuation = match[0].match(/[.,!?;:]+$/)?.[0] || "";
					sentenceStart = /[.!?]/.test(punctuation);
					replacements.push({ from: run.from + match.index, to: run.from + match.index + match[0].length, text: word + punctuation });
				}
			}
			preview.replacements = replacements;
			const transaction = this.createSuggestionTransaction(preview);
			preview.originalState = this.editor.state;
			// Render a temporary editor state without publishing changes or touching saved history.
			const previewState = preview.originalState.apply(transaction.setMeta("addToHistory", false));
			preview.phase = "review";
			preview.doc = previewState.doc;
			preview.range = { from: previewState.selection.from, to: previewState.selection.to };
			const focusInFlow = document.activeElement === this.editor.view.dom || this.selectionToolbar.contains(document.activeElement);
			this.editor.view.updateState(previewState);
			this.editor.setEditable(false, false);
			this.editor.view.dom.setAttribute("aria-readonly", "true");
			this.setThinkingControls(true);
			this.updateButtons();
			this.status.textContent = "Demo suggestion shown in place. Press Ctrl+Enter (Cmd+Enter on Mac) to apply or Escape to revert. Editing is paused until you decide.";
			this.updateSelectionToolbar();
			if (focusInFlow && !this.selectionToolbar.hidden) this.selectionToolbar.querySelector('[tabindex="0"]').focus();
		}

		createSuggestionTransaction(preview) {
			const transaction = this.editor.state.tr;
			for (const replacement of [...preview.replacements].reverse()) transaction.insertText(replacement.text, replacement.from, replacement.to);
			transaction.setSelection(this.TextSelection.create(transaction.doc, transaction.mapping.map(preview.from, -1), transaction.mapping.map(preview.to, 1)));
			return transaction;
		}

		applyThinkingPreview() {
			const preview = this.aiPreview;
			if (!preview || preview.phase !== "review") return;
			if (this.sourceMode || this.editor.state.doc !== preview.doc) return this.cancelThinkingPreview();
			this.cancelThinkingPreview(false);
			const transaction = this.closeHistory(this.createSuggestionTransaction(preview));
			this.editor.view.dispatch(transaction);
			// Separate later typing from this single undoable replacement, too.
			this.editor.view.dispatch(this.closeHistory(this.editor.state.tr));
			this.editor.commands.focus();
			this.status.textContent = `Demo suggestion applied: replaced ${preview.replacements.length} words with lorem ipsum. Undo restores the original.`;
		}

		getSearchMatches(doc = this.editor?.state.doc) {
			if (!doc || !this.findPanel || this.findPanel.hidden || !this.findQuery.value) return [];
			const expression = new RegExp(this.findQuery.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), this.findCase.getAttribute("aria-pressed") === "true" ? "g" : "gi");
			const matches = [];
			doc.descendants((node, position) => {
				if (!node.isTextblock) return;
				// Leaf placeholders keep offsets correct around inline images and hard breaks.
				const text = node.textBetween(0, node.content.size, "", "\ufffc");
				expression.lastIndex = 0;
				for (const match of text.matchAll(expression)) {
					if (!match[0].includes("\ufffc")) matches.push({ from: position + 1 + match.index, to: position + 1 + match.index + match[0].length });
				}
				return false;
			});
			return matches;
		}

		openFind() {
			if (this.sourceMode || this.aiPreview?.phase === "review") return;
			this.closeColorPicker();
			this.closeTablePicker();
			const { from, to } = this.editor.state.selection;
			const selected = this.editor.state.doc.textBetween(from, to, "\n");
			if (selected && selected.length <= 200 && !selected.includes("\n")) this.findQuery.value = selected;
			this.findPanel.hidden = false;
			this.setReplaceExpanded(false);
			this.findButton.setAttribute("aria-expanded", "true");
			this.refreshFind();
			this.findQuery.focus();
			this.findQuery.select();
		}

		closeFind(focusEditor = true) {
			if (!this.findPanel || this.findPanel.hidden) return;
			this.findPanel.hidden = true;
			this.setReplaceExpanded(false);
			this.findButton.setAttribute("aria-expanded", "false");
			this.editor.view.dispatch(this.editor.state.tr.setMeta("search", true));
			if (focusEditor) this.editor.commands.focus();
		}

		setReplaceExpanded(expanded, moveFocus = false) {
			this.replaceRow.hidden = !expanded;
			this.replaceToggle.setAttribute("aria-expanded", String(expanded));
			this.replaceToggle.setAttribute("aria-label", expanded ? "Hide replace" : "Show replace");
			this.replaceToggle.title = expanded ? "Hide replace" : "Show replace";
			this.replaceToggle.querySelector("i").className = `saIcon far fa-angle-${expanded ? "down" : "right"}`;
			if (moveFocus) (expanded ? this.findReplacement : this.findQuery).focus();
		}

		refreshFind() {
			const first = this.getSearchMatches()[0];
			if (first) this.editor.chain().setTextSelection(first).scrollIntoView().run();
			else this.editor.view.dispatch(this.editor.state.tr.setMeta("search", true));
			this.updateFindStatus();
		}

		updateFindStatus() {
			if (!this.editor || !this.findPanel || this.findPanel.hidden) return;
			const matches = this.getSearchMatches();
			const { from, to } = this.editor.state.selection;
			const index = matches.findIndex(match => match.from === from && match.to === to);
			this.findCount.textContent = `${index + 1}/${matches.length}`;
			this.findQuery.parentElement.style.setProperty("--find-count-width", `${this.findCount.textContent.length}ch`);
			const announcement = !this.findQuery.value ? "Enter text to find." : !matches.length ? "No matches." : index < 0 ? `${matches.length} matches. No current match.` : `Match ${index + 1} of ${matches.length}.`;
			if (this.findAnnouncement.textContent !== announcement) this.findAnnouncement.textContent = announcement;
			this.findPanel.querySelectorAll("[data-find-action]").forEach(button => {
				const action = button.dataset.findAction;
				button.disabled = action === "replace" ? index < 0 : ["previous", "next", "all"].includes(action) && !matches.length;
			});
		}

		moveFind(direction) {
			const matches = this.getSearchMatches();
			if (!matches.length) return;
			const { from, to } = this.editor.state.selection;
			const current = matches.findIndex(match => match.from === from && match.to === to);
			let index;
			if (current >= 0) index = (current + direction + matches.length) % matches.length;
			else if (direction > 0) { index = matches.findIndex(match => match.from >= to); if (index < 0) index = 0; }
			else { index = matches.findLastIndex(match => match.to <= from); if (index < 0) index = matches.length - 1; }
			this.editor.chain().setTextSelection(matches[index]).scrollIntoView().run();
		}

		replaceMatches(all) {
			if (this.findPanel.hidden || this.replaceRow.hidden || this.aiPreview?.phase === "review") return;
			const matches = this.getSearchMatches();
			const { from, to } = this.editor.state.selection;
			const targets = all ? matches : matches.filter(match => match.from === from && match.to === to);
			if (!targets.length) return;
			const replacement = this.findReplacement.value;
			const transaction = this.closeHistory(this.editor.state.tr);
			for (const match of targets.slice().reverse()) transaction.insertText(replacement, match.from, match.to);
			this.editor.view.dispatch(transaction);
			if (!all) {
				const remaining = this.getSearchMatches();
				const next = remaining.find(match => match.from >= from + replacement.length) || remaining[0];
				if (next) this.editor.chain().setTextSelection(next).scrollIntoView().run();
			}
			this.status.textContent = `Replaced ${targets.length} ${targets.length === 1 ? "match" : "matches"}.`;
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
			this.cancelThinkingPreview();
			this.closeFind(false);
			this.sourceMode = !this.sourceMode;
			if (this.sourceMode) {
				this.sync(false);
				this.visualSurface.hidden = true;
				this.sourceSurface.hidden = false;
				this.markdownButton.setAttribute("aria-label", "View as rich text");
				this.source.focus();
			} else {
				// Preserve mapped quote ranges when only switching views.
				if (this.source.value !== this.editor.getMarkdown()) {
					this.editor.commands.setContent(this.source.value, { contentType: "markdown", emitUpdate: false });
				}
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
			const visible = Boolean(cell && !this.sourceMode && this.aiPreview?.phase !== "review");
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
			this.findButton?.setAttribute("aria-expanded", String(Boolean(this.findPanel && !this.findPanel.hidden)));
			const readOnly = this.sourceMode || this.aiPreview?.phase === "review";
			const activeHeading = [1, 2, 3, 4, 5, 6].find(level => this.editor.isActive("heading", { level }));
			if (this.headingSelect) this.headingSelect.value = activeHeading ? String(activeHeading) : "paragraph";
			const inTable = this.editor.isActive("table");
			if (this.headingSelect) this.headingSelect.disabled = Boolean(readOnly);
			if (this.colorApplyButton) this.colorApplyButton.disabled = Boolean(readOnly);
			this.colorPickerButtons?.forEach(button => { button.disabled = Boolean(readOnly); });
			if (readOnly) this.closeColorPicker();
			if (this.tablePickerButton) this.tablePickerButton.disabled = Boolean(readOnly || inTable);
			if (readOnly || inTable) this.closeTablePicker();
			const types = { bold: "bold", italic: "italic", underline: "underline", strike: "strike", link: "link", bullet: "bulletList", number: "orderedList", task: "taskList", quote: "blockquote", code: "code", codeblock: "codeBlock" };
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
				} else if (readOnly) {
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
			if (this.aiPreview?.phase === "review") return;
			this.source.value = this.editor.getMarkdown();
			this.updateButtons();
			if (emit) this.source.dispatchEvent(new Event("input", { bubbles: true }));
		}

		get value() {
			return (this.source || this.querySelector("textarea"))?.value ?? "";
		}

		set value(value) {
			this.cancelThinkingPreview();
			const source = this.source || this.querySelector("textarea");
			if (!source) return;
			source.value = String(value ?? "");
			if (this.editor) {
				this.editor.commands.setContent(source.value, { contentType: "markdown", emitUpdate: false });
				this.sync(false);
			}
		}

		teardown() {
			this.sentChatSelection = null;
			clearTimeout(this.thinkingTimer);
			this.aiPreview = null;
			cancelAnimationFrame(this.selectionToolbarFrame);
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
