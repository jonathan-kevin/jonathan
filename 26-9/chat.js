(() => {
	let sequence = 0;
	let responseSequence = 0;
	let sourceSequence = 0;

	class ChatComponent extends HTMLElement {
		get isInline() { return false; }

		renderHeader(titleId) {
			return `<h2 class="saScreenReaderOnly" id="${titleId}">Chat</h2>`;
		}

		initializePanel() {}

		open() {
			this.composer.focus({ preventScroll: true });
		}

		connectedCallback() {
			if (!this.isInline && !this.hasAttribute("data-chat-interactive")) return;
			if (this.initialized) {
				this.observeSize?.();
				this.observeContextControls();
				this.startFileLoading();
				this.observeLatest();
				return;
			}
			this.initialized = true;
			this.pendingSelection = null;
			this.pageContextEnabled = this.isInline;
			this.contextFiles = [];
			this.classList.add(this.isInline ? "saChatInline" : "saChatFullPage");
			this.setAttribute("role", this.isInline ? "complementary" : "region");
			const titleId = `chat-inline-title-${++sequence}`;
			if (!this.id) this.id = `chat-inline-${sequence}`;
			this.setAttribute("aria-labelledby", titleId);
			const composerTag = this.isInline ? "form" : "div";
			this.innerHTML = `
				${this.renderHeader(titleId)}
				<div class="saChatWrapper">
					<div class="saChat" data-chat-scroll>
						<ol class="saChatLog" id="${titleId}-log" aria-label="${this.isInline ? 'Document chat messages' : 'Chat messages'}">
							<li class="saChatMessage saChatSystem">
								<article class="saChatMessageInner">
									<div class="saChatMessageBody">
										<div class="saChatMessageBodyInner">
										<p>Ask about this page, or select text to focus the conversation.</p>
										</div>
									</div>
								</article>
							</li>
							<li id="${titleId}-help" class="saChatComposerInstruction" role="presentation"><span>AI can make mistakes. Check important info.</span></li>
						</ol>
						<${composerTag} class="saChatComposerWrapper" data-chat-compose role="group" aria-label="Compose a chat message">

							<button class="saChatLatest saReached" type="button" data-chat-latest aria-label="Go to latest message" aria-controls="${titleId}-log" aria-hidden="true" tabindex="-1"><i class="saIcon far fa-arrow-down" aria-hidden="true"></i></button>
							<div class="saChatComposer">
								<section class="saChatInlineContext" aria-label="Selected text for your next message" hidden>
									<blockquote data-chat-context></blockquote>
									<button class="saDefaultIconButtonGhost" type="button" data-chat-dismiss-context aria-label="Remove selected text"><i class="saIcon far fa-xmark" aria-hidden="true"></i></button>
								</section>
								<ul class="saChatContext" aria-label="Context for your next message" id="${titleId}-page-context" data-chat-pills></ul>
								<ul class="saFileGroup" data-chat-files aria-label="Files attached to your next message" hidden></ul>
								<div class="saChatTextarea saEmpty" contenteditable="plaintext-only" role="textbox" aria-multiline="true" aria-label="Write a message" data-placeholder="Write a message…" enterkeyhint="enter" aria-disabled="false" aria-describedby="${titleId}-page-context ${titleId}-help"></div>
								<ul class="saChatComposerToolbar" aria-label="Chat controls" role="toolbar">
									<li class="saChatInlineAddContext">
										<button class="saChatComposerToolbarButton" type="button" data-chat-add-context aria-label="Add context" aria-haspopup="menu" aria-expanded="false" aria-controls="${titleId}-context-menu"><i class="saIcon far fa-plus" aria-hidden="true"></i></button>
										<ul class="saContextMenu saNorth" id="${titleId}-context-menu" data-chat-context-menu role="menu" aria-label="Add context" aria-hidden="true" hidden>
											<li role="none"><button class="saOptionWrapper" type="button" role="menuitem" tabindex="-1" data-context-action="page"><span class="saOption"><i class="saIcon far fad fa-file-lines saOptionIcon" aria-hidden="true"></i><span class="saOptionText">Include current page</span></span></button></li>
											<li role="none"><button class="saOptionWrapper" type="button" role="menuitem" tabindex="-1" data-context-action="file"><span class="saOption"><i class="saIcon far fad fa-paperclip saOptionIcon" aria-hidden="true"></i><span class="saOptionText">Add file…</span></span></button></li>
										</ul>
									</li>
									<li><button class="saChatButtonSend" type="submit" aria-label="Send message" disabled><i class="saIcon far fa-arrow-up" aria-hidden="true"></i></button></li>
								</ul>
							</div>
						</${composerTag}>
					</div>
					<div class="saFileUploadAreaWrapper saMultipleFilesArea" data-chat-drop-area hidden>
									<label class="saFileUploadArea">
										<input type="file" data-chat-drop-input multiple aria-label="Attach files to your next message">
										<div class="saFileUploadAreaInner" aria-hidden="true">
											<div class="saFolderWrapper">
												<div class="saFolder">
													<div class="saFolderBack"></div>
													<div class="saPaper"></div>
													<div class="saPaper"></div>
													<div class="saPaper"></div>
													<div class="saFolderFront"><i class="saEnabledIcon saIcon far fa-arrow-up"></i><i class="saDisabledIcon saIcon far fa-xmark"></i></div>
												</div>
											</div>
											<div class="saFileUploadAreaText">
												<span class="saFileUploadAreaHeading">Drop your files here</span>
												<span class="saFileUploadAreaDescription">Attach to your next message. Nothing is uploaded.</span>
											</div>
										</div>
									</label>
								</div>
				</div>
<input type="file" data-chat-file-input multiple hidden>
<p class="saScreenReaderOnly saChatStatus" role="status" aria-atomic="true" data-chat-status></p>`;
			if (!this.isInline) {
				// The regular chat keeps its original sibling composer and page scroll.
				// Only the inline panel puts the composer inside its own scroll area.
				this.querySelector(".saChatWrapper").append(this.querySelector("[data-chat-compose]"));
				this.querySelector(".saChat").removeAttribute("data-chat-scroll");
			}
			this.composer = this.querySelector(".saChatTextarea");
			this.sendButton = this.querySelector(".saChatButtonSend");
			this.log = this.querySelector(".saChatLog");
			this.emptyMessage = this.log.firstElementChild;
			this.ensureDateSeparator(new Date(), this.emptyMessage);
			this.context = this.querySelector(".saChatInlineContext");
			this.contextText = this.querySelector("[data-chat-context]");
			this.status = this.querySelector("[data-chat-status]");
			this.scroll = this.isInline
				? this.querySelector("[data-chat-scroll]")
				: this.closest(".scrollcontent") || document.scrollingElement;
			this.latestButton = this.querySelector("[data-chat-latest]");
			this.latestButton.addEventListener("click", () => {
				this.scroll.scrollTop = this.scroll.scrollHeight;
				this.composer.focus({ preventScroll: true });
				this.updateLatest();
			});
			this.observeLatest();
			this.setupContextControls();
			this.setupFileDrop();
			this.updatePageContext();
			this.addEventListener("click", event => {
				const link = event.target.closest("[data-chat-page-link]");
				if (!link) return;
				event.preventDefault();
				const target = document.getElementById(link.hash.slice(1));
				if (!target) return;
				if (!target.hasAttribute("tabindex")) target.tabIndex = -1;
				if (this.isInline && window.matchMedia("(max-width: 1199px)").matches) this.close(target);
				target.focus({ preventScroll: true });
				target.querySelector(".scrollcontent")?.scrollTo({ top: 0, left: 0, behavior: "instant" });
			});
			this.initializePanel();
			this.querySelector("[data-chat-dismiss-context]").addEventListener("click", () => {
				if (this.pendingSelection) this.releaseSelection(this.pendingSelection);
				this.pendingSelection = null;
				this.renderContext();
				this.composer.focus();
				this.status.textContent = "Selected text removed from your next message.";
			});
			this.composer.addEventListener("input", () => this.updateSendButton());
			this.sendButton.addEventListener("click", event => {
				if (!this.response) {
					if (!this.isInline) { event.preventDefault(); this.send(); }
					return;
				}
				event.preventDefault();
				this.finishResponse(true);
				this.composer.focus();
			});
			this.addEventListener("keydown", event => {
				if (event.isComposing) return;
				if (event.key === "Escape" && this.isInline) {
					// Let the shared message editor cancel its own edit before closing chat.
					if (event.target.closest(".saChatMessageEdit")) return;
					event.preventDefault();
					event.stopPropagation();
					this.close();
				} else if (event.target === this.composer && event.key === "Enter" && !event.shiftKey) {
					event.preventDefault();
					this.send();
				}
			});
			this.querySelector("[data-chat-compose]").addEventListener("submit", event => {
				event.preventDefault();
				this.send();
			});
		}

		disconnectedCallback() {
			if (!this.initialized) return;
			this.contextEvents?.abort();
			this.latestEvents?.abort();
			this.latestObserver?.disconnect();
			clearInterval(this.fileLoadingTimer);
			this.fileLoadingTimer = null;
			this.setFileDragActive(false);
			this.sizeObserver?.disconnect();
			this.endResize?.();
			if (this.response) this.finishResponse(true);
		}

		setupContextControls() {
			this.contextPills = this.querySelector("[data-chat-pills]");
			this.fileList = this.querySelector("[data-chat-files]");
			this.fileList.addEventListener("click", event => {
				const remove = event.target.closest("[data-chat-remove-file]");
				if (!remove) return;
				this.contextFiles = this.contextFiles.filter(item => String(item.id) !== remove.dataset.chatRemoveFile);
				this.startFileLoading();
				this.renderFiles(); this.updateSendButton(); this.composer.focus();
				this.status.textContent = "File removed from your next message.";
			});
			this.addContextButton = this.querySelector("[data-chat-add-context]");
			this.contextMenu = this.querySelector("[data-chat-context-menu]");
			this.fileInput = this.querySelector("[data-chat-file-input]");
			this.addContextButton.addEventListener("click", () => this.toggleContextMenu(this.contextMenu.hidden));
			this.addContextButton.addEventListener("keydown", event => {
				if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); this.toggleContextMenu(true); }
			});
			this.contextMenu.addEventListener("keydown", event => {
				const buttons = Array.from(this.contextMenu.querySelectorAll("button:not(:disabled)"));
				const index = buttons.indexOf(document.activeElement);
				if (event.key === "Escape") {
					event.preventDefault(); event.stopPropagation(); this.toggleContextMenu(false, true);
				} else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
					event.preventDefault();
					const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length;
					buttons[next]?.focus();
				} else if (event.key === "Tab") this.toggleContextMenu(false, true);
			});
			this.contextMenu.addEventListener("click", event => {
				const action = event.target.closest("[data-context-action]")?.dataset.contextAction;
				if (!action) return;
				this.toggleContextMenu(false);
				if (action === "page") {
					this.pageContextEnabled = true;
					this.updatePageContext(); this.composer.focus();
					this.status.textContent = "Current page included as the main reference.";
				} else if (action === "file") this.fileInput.click();
			});
			this.observeContextControls();
			this.contextPills.addEventListener("click", event => {
				const remove = event.target.closest("[data-context-remove]");
				if (remove) {
					if (remove.dataset.contextRemove === "page") this.pageContextEnabled = false;
					else this.contextFiles = this.contextFiles.filter(item => String(item.id) !== remove.dataset.contextRemove);
					this.renderContextPills(); this.updateSendButton(); this.composer.focus();
					this.status.textContent = "Context removed from your next message.";
				}
			});
			this.fileInput.addEventListener("change", () => {
				this.attachFiles(this.fileInput.files);
				// Reset so a removed file can be selected again.
				this.fileInput.value = "";
			});
			this.fileInput.addEventListener("cancel", () => this.addContextButton.focus());
		}

		attachFiles(files) {
			let added = 0;
			for (const file of files) {
				if (this.contextFiles.some(item => item.file.name === file.name && item.file.size === file.size && item.file.lastModified === file.lastModified)) continue;
				this.contextFiles.push({ id: ++sourceSequence, text: file.name, file, progress: 0, loadingStarted: Date.now(), loadingDuration: 3000 + (sourceSequence % 3) * 500 });
				added++;
			}
			this.renderFiles(); this.updateSendButton(); this.composer.focus();
			this.startFileLoading();
			this.status.textContent = added ? `Simulating loading for ${added} file${added === 1 ? "" : "s"}. Nothing is uploaded.` : "Files already attached.";
		}

		startFileLoading() {
			clearInterval(this.fileLoadingTimer);
			this.fileLoadingTimer = null;
			if (!this.contextFiles.some(item => item.progress < 100)) return;
			this.fileLoadingTimer = setInterval(() => {
				for (const item of this.contextFiles) {
					if (item.progress >= 100) continue;
					item.progress = Math.min(100, Math.floor((Date.now() - item.loadingStarted) / item.loadingDuration * 100));
					const row = Array.from(this.fileList.children).find(row => row.dataset.chatFileId === String(item.id));
					if (row) this.updateFileLoading(row, item);
				}
				this.updateSendButton();
				if (!this.contextFiles.some(item => item.progress < 100)) {
					clearInterval(this.fileLoadingTimer);
					this.fileLoadingTimer = null;
					this.status.textContent = "Files ready. Loading was simulated; nothing was uploaded.";
				}
			}, 120);
		}

		updateFileLoading(row, item) {
			const progress = item.progress ?? 100;
			row.classList.toggle("saLoading", progress < 100);
			row.classList.toggle("saDone", progress === 100);
			row.setAttribute("aria-busy", String(progress < 100));
			row.querySelector(".saFileUploadProgress").value = progress;
			row.querySelector(".saFileUploadProgressText").textContent = `${progress}%`;
		}

		isFileDrag(event) {
			return Array.from(event.dataTransfer?.types || []).includes("Files");
		}

		setFileDragActive(active) {
			if (!this.dropArea) return;
			this.dropArea.hidden = !active;
			// Nested LESS compiles to .saDragOver.saFileUploadAreaWrapper .saFolder, etc.
			this.dropArea.classList.toggle("saDragOver", active);
			if (!active) this.fileDragDepth = 0;
		}

		setupFileDrop() {
			this.dropArea = this.querySelector("[data-chat-drop-area]");
			this.fileDragDepth = 0;
			this.addEventListener("dragenter", event => {
				if (!this.isFileDrag(event)) return;
				event.preventDefault();
				this.fileDragDepth++;
				this.setFileDragActive(true);
			});
			this.addEventListener("dragover", event => {
				if (!this.isFileDrag(event)) return;
				event.preventDefault();
				event.dataTransfer.dropEffect = "copy";
				this.setFileDragActive(true);
			});
			this.addEventListener("dragleave", () => {
				if (this.dropArea.hidden) return;
				this.fileDragDepth = Math.max(0, this.fileDragDepth - 1);
				if (!this.fileDragDepth) this.setFileDragActive(false);
			});
			this.addEventListener("drop", event => {
				if (!this.isFileDrag(event)) return;
				// Prevent navigation to the file or insertion into contenteditable.
				event.preventDefault();
				this.setFileDragActive(false);
				if (event.dataTransfer.files.length) this.attachFiles(event.dataTransfer.files);
			});
			this.querySelector("[data-chat-drop-input]").addEventListener("change", event => {
				this.setFileDragActive(false);
				this.attachFiles(event.target.files);
				event.target.value = "";
			});
		}

		observeContextControls() {
			this.contextEvents?.abort();
			this.contextEvents = new AbortController();
			const options = { signal: this.contextEvents.signal };
			for (const type of ["drop", "dragend"]) {
				document.addEventListener(type, () => this.setFileDragActive(false), options);
			}
			window.addEventListener("blur", () => this.setFileDragActive(false), options);
			document.addEventListener("dragleave", event => {
				if (!event.relatedTarget && (event.clientX <= 0 || event.clientY <= 0 || event.clientX >= window.innerWidth || event.clientY >= window.innerHeight)) this.setFileDragActive(false);
			}, options);
			document.addEventListener("keydown", event => {
				if (event.key === "Escape" && this.dropArea && !this.dropArea.hidden) {
					event.preventDefault(); event.stopPropagation();
					this.setFileDragActive(false);
				}
			}, { ...options, capture: true });
			for (const type of ["pointerdown", "focusin"]) {
				document.addEventListener(type, event => {
					if (!this.contextMenu.contains(event.target) && !this.addContextButton.contains(event.target)) this.toggleContextMenu(false);
				}, { signal: this.contextEvents.signal });
			}
		}

		toggleContextMenu(open, restoreFocus = false) {
			this.contextMenu.hidden = !open;
			this.contextMenu.classList.toggle("saOpen", open);
			this.contextMenu.setAttribute("aria-hidden", String(!open));
			this.addContextButton.setAttribute("aria-expanded", String(open));
			this.contextMenu.querySelector('[data-context-action="page"]').disabled = this.pageContextEnabled;
			if (open) this.contextMenu.querySelector("button:not(:disabled)")?.focus();
			else if (restoreFocus) this.addContextButton.focus();
		}


		getContextItems() {
			const files = this.contextFiles.map(item => ({ ...item }));
			return this.pageContextEnabled
				? [{ id: "page", text: `Page: ${this.pageContext.title}`, targetId: this.pageContext.target?.id }, ...files]
				: files;
		}

		getFileIcon(file) {
			// Browsers may leave MIME types empty or report a generic binary type.
			const extension = file.name.split(".").pop().toLowerCase();
			const type = (file.type || "").toLowerCase();
			const formats = [
				["pdf", ["pdf"], /^application\/pdf$/],
				["word", ["doc", "docx", "docm", "dot", "dotx", "odt", "rtf"], /word|opendocument\.text|rtf/],
				["excel", ["xls", "xlsx", "xlsm", "xlsb", "ods", "csv", "tsv"], /excel|spreadsheet|csv|tab-separated/],
				["powerpoint", ["ppt", "pptx", "pptm", "pps", "ppsx", "odp"], /powerpoint|presentation/],
				["image", ["png", "jpg", "jpeg", "gif", "webp", "svg", "avif", "bmp", "ico", "tif", "tiff", "heic", "heif"], /^image\//],
				["audio", ["mp3", "wav", "ogg", "flac", "aac", "m4a", "opus", "aiff"], /^audio\//],
				["video", ["mp4", "webm", "mov", "avi", "mkv", "m4v", "mpeg", "mpg"], /^video\//],
				["zipper", ["zip", "rar", "7z", "tar", "gz", "bz2", "xz", "tgz"], /zip|compressed|archive|x-tar/],
				["code", ["html", "htm", "css", "less", "scss", "js", "jsx", "ts", "tsx", "json", "xml", "yaml", "yml", "py", "cs", "java", "sql", "sh", "ps1"], /json|xml|javascript|typescript|html|css/],
				["lines", ["txt", "md", "markdown", "log"], /^text\//]
			];
			const format = formats.find(([, extensions]) => file.name.includes(".") && extensions.includes(extension))
				|| formats.find(([, , mime]) => mime.test(type));
			return format ? `fa-file-${format[0]}` : "fa-file";
		}

		renderContextPills(list = this.contextPills, items = this.getContextItems(), removable = true) {
			items = items.filter(item => !item.file);
			list.replaceChildren();
			for (const item of items) {
				const pill = document.createElement("li");
				pill.className = "saPill";
				const page = item.id === "page";
				const action = document.createElement(page ? "a" : "span");
				action.className = "saChatContextPillLabel";
				action.innerHTML = `<i class="saIcon far fad ${page ? "fa-file" : this.getFileIcon(item.file)}" aria-hidden="true"></i><span></span>`;
				action.querySelector("span").textContent = item.text;
				action.title = page ? "Current page — main reference. Go to page." : `${item.text} (${item.file.size.toLocaleString()} bytes) — local attachment`;
				if (page) {
					action.dataset.chatPageLink = "";
					if (item.targetId) action.href = `#${item.targetId}`;
				}
				pill.append(action);
				if (removable) {
					const remove = document.createElement("button");
					remove.type = "button"; remove.className = "saPillRemoveButton";
					remove.dataset.contextRemove = String(item.id);
					remove.setAttribute("aria-label", page ? "Remove current page context" : `Remove file: ${item.text}`);
					remove.innerHTML = '<i class="saIcon far fa-xmark" aria-hidden="true"></i>';
					pill.append(remove);
				}
				list.append(pill);
			}
			list.hidden = !items.length;
		}

		renderFiles(list = this.fileList, items = this.contextFiles, removable = true) {
			// Keep existing rows so adding/removing a file never restarts other animations.
			for (const row of Array.from(list.children)) {
				if (!items.some(item => String(item.id) === row.dataset.chatFileId)) row.remove();
			}
			for (const item of items) {
				if (Array.from(list.children).some(row => row.dataset.chatFileId === String(item.id))) continue;
				const row = document.createElement("li");
				row.dataset.chatFileId = String(item.id);
				row.className = `saFileWrapper saFileVisible${removable ? "" : " saExistingFile"}`;
				// Reuse the icon names supported by the upload component's colour mixin.
				const fileIcon = this.getFileIcon(item.file);
				const icon = { "fa-file-image": "fa-image", "fa-file-audio": "fa-music", "fa-file-video": "fa-video", "fa-file-code": "fa-code" }[fileIcon] || fileIcon;
				row.innerHTML = `<div class="saFileIconWrapper"><i class="saFileIcon saIcon fas ${icon}" aria-hidden="true"></i>
						<div class="saLoadingWrapper saLoadingDark" aria-hidden="true">
							<svg class="saLoading" viewBox="0 0 24 24"><circle class="saLoadingCircle" cx="12" cy="12" r="12" fill="none"></circle><path class="saLoadingCheck" d="M6.29,12.58l3.14,3.19c.15,.15,.39,.15,.53,0l7.75-7.8" fill="none"></path></svg>
							<div class="saLoadingSpinner"></div>
						</div></div>
					<div class="saFile">
						<div class="saFileNameWrapper"><span class="saFileName"></span></div>
						<div class="saFileSizeWrapper"><div class="saFileSizeRow"><span class="saFileSize"></span><span class="saFileUploadProgressText" aria-hidden="true"></span></div><progress class="saFileUploadProgress" max="100" value="0"></progress></div>
					</div>`;
				row.querySelector(".saFileName").textContent = item.file.name;
				row.querySelector(".saFileName").title = item.file.name;
				row.querySelector(".saFileSize").textContent = this.formatFileSize(item.file.size);
				row.title = `${item.file.name} — ${item.file.size.toLocaleString()} bytes — local attachment`;
				row.querySelector("progress").setAttribute("aria-label", `Simulated loading: ${item.file.name}`);
				this.updateFileLoading(row, item);
				if (removable) {
					const controls = document.createElement("div");
					controls.className = "saFileButtonGroup";
					const remove = document.createElement("button");
					remove.className = "saDeleteButton saDestructive";
					remove.type = "button";
					remove.dataset.chatRemoveFile = String(item.id);
					remove.dataset.tooltip = "Remove file";
					remove.setAttribute("aria-label", `Remove file: ${item.file.name}`);
					remove.innerHTML = '<i class="saIcon far fa-trash-alt" aria-hidden="true"></i>';
					controls.append(remove); row.append(controls);
				}
				list.append(row);
			}
			list.hidden = !items.length;
		}

		formatFileSize(bytes) {
			const units = ["B", "kB", "MB", "GB", "TB"];
			const unit = bytes > 0 ? Math.min(Math.floor(Math.log10(bytes) / 3), units.length - 1) : 0;
			return `${(bytes / 1000 ** unit).toLocaleString(undefined, { maximumFractionDigits: unit ? 1 : 0 })} ${units[unit]}`;
		}

		updatePageContext() {
			const frame = this.closest(".saRightFrameRoot") || this.parentElement?.querySelector(".saRightFrameRoot");
			const headings = Array.from(frame?.querySelectorAll("h1.saHeaderText") || []);
			const heading = headings.find(node => node.getClientRects().length) || headings[0];
			const title = heading?.textContent.trim() || document.title || "Current page";
			const target = frame?.querySelector("main") || frame;
			if (target && !target.id) target.id = `${this.id}-page`;
			this.pageContext = { title, url: location.href, target };
			this.renderContextPills();
		}

		addSelection(text, origin, location) {
			if (!text.trim()) return;
			// Identical text can come from different cells or messages.
			const source = this.captureSource(origin, location);
			if (source || this.pendingSelection?.text !== text || this.pendingSelection?.origin !== origin) {
				const replacing = Boolean(this.pendingSelection);
				if (this.pendingSelection) this.releaseSelection(this.pendingSelection);
				this.pendingSelection = { text, origin, source };
				this.renderContext();
				this.status.textContent = `Selected text ${replacing ? "replaced" : "added"}. Write a message or press Send when ready.`;
			}
			this.open(origin);
		}

		captureSource(origin, location) {
			let source;
			if (location?.range) {
				const range = location.range;
				let target = range.commonAncestorContainer;
				if (target.nodeType !== Node.ELEMENT_NODE) target = target.parentElement;
				target = target.closest("td, th, .saChatMessageBody, .saChatMessageContent, tr, tbody") || location.root;
				if (!target?.contains(range.endContainer)) target = location.root;
				const prefix = document.createRange();
				prefix.selectNodeContents(target);
				prefix.setEnd(range.startContainer, range.startOffset);
				source = { target, range: range.cloneRange(), start: prefix.toString().length, text: range.toString() };
			} else if (origin?.editor && !origin.editor.isDestroyed) {
				const { from, to } = origin.editor.state.selection;
				if (from === to) return null;
				source = { target: origin, editor: origin, from, to };
				(origin.chatSourceRanges ||= new Set()).add(source);
			}
			if (source && !source.target.id) {
				let id;
				do { id = `chat-source-${++sourceSequence}`; } while (document.getElementById(id));
				source.target.id = id;
			}
			return source;
		}

		createSourceLink(item, sent = false) {
			const link = document.createElement(item.source ? "a" : "span");
			link.className = sent ? "saChatInlineMessageSourceLink" : "saChatInlineSourceLink";
			link.innerHTML = '<i class="saIcon far fad fa-quote-left" aria-hidden="true"></i><span></span>';
			link.querySelector("span").textContent = item.text;
			if (item.source) {
				link.href = `#${item.source.target.id}`;
				link.title = "Jump to quoted text";
				link.addEventListener("click", event => {
					event.preventDefault();
					this.jumpToSource(item.source, link);
				});
			}
			return link;
		}

		resolveSourceRange(source) {
			if (!source.target.isConnected || source.unavailable) return null;
			if (source.editor) {
				const owner = source.editor;
				if (!owner.editor || owner.editor.isDestroyed) return null;
				if (owner.sourceMode) {
					owner.toggleMarkdown();
					if (source.unavailable) return null;
				}
				if (source.to > owner.editor.state.doc.content.size) return null;
				const start = owner.editor.view.domAtPos(source.from);
				const end = owner.editor.view.domAtPos(source.to);
				const range = document.createRange();
				range.setStart(start.node, start.offset);
				range.setEnd(end.node, end.offset);
				return range;
			}
			if (source.target.contains(source.range.startContainer) && source.target.contains(source.range.endContainer) && source.range.toString() === source.text) return source.range.cloneRange();
			// Streaming and message edits can replace text nodes. Recover the same
			// exact offsets, never a different occurrence of a repeated quotation.
			const end = source.start + source.text.length;
			if (source.target.textContent.slice(source.start, end) !== source.text) return null;
			const walker = document.createTreeWalker(source.target, NodeFilter.SHOW_TEXT);
			const range = document.createRange();
			let offset = 0, started = false;
			while (walker.nextNode()) {
				const node = walker.currentNode, next = offset + node.length;
				if (!started && source.start <= next) { range.setStart(node, source.start - offset); started = true; }
				if (started && end <= next) { range.setEnd(node, end - offset); return range; }
				offset = next;
			}
			return null;
		}

		jumpToSource(source, link) {
			const range = this.resolveSourceRange(source);
			if (!range || range.collapsed) {
				link.removeAttribute("href");
				link.setAttribute("aria-disabled", "true");
				link.title = "Source unavailable: the original text was removed or changed.";
				this.status.textContent = link.title;
				return;
			}
			const inChat = this.contains(source.target);
			if (this.isInline && !inChat && window.matchMedia("(max-width: 1199px)").matches) this.close();
			if (source.editor) {
				const owner = source.editor;
				owner.editor.commands.setTextSelection({ from: source.from, to: source.to });
				owner.dismissedTextSelection = { from: source.from, to: source.to, doc: owner.editor.state.doc };
				owner.editor.view.focus();
			} else {
				if (!source.target.hasAttribute("tabindex")) source.target.tabIndex = -1;
				source.target.focus({ preventScroll: true });
			}
			let passage = range.startContainer;
			if (passage.nodeType !== Node.ELEMENT_NODE) passage = passage.parentElement;
			passage.scrollIntoView({ block: "center", inline: "nearest", behavior: "instant" });
			clearTimeout(this.sourceHighlightTimer);
			this.highlightedSource?.classList.remove("saChatInlineSourceHighlight");
			this.highlightedSource = passage;
			passage.classList.add("saChatInlineSourceHighlight");
			if (window.CSS?.highlights && window.Highlight) CSS.highlights.set("sa-chat-source", new Highlight(range));
			this.sourceHighlightTimer = setTimeout(() => {
				passage.classList.remove("saChatInlineSourceHighlight");
				window.CSS?.highlights?.delete("sa-chat-source");
			}, 1800);
			document.dispatchEvent(new Event("chat-inline-source-jump"));
		}

		renderContext() {
			this.contextText.replaceChildren();
			if (this.pendingSelection) this.contextText.append(this.createSourceLink(this.pendingSelection));
			this.context.hidden = !this.pendingSelection;
			this.updateSendButton();
		}

		releaseSelection(item) {
			const origin = item.origin;
			const selection = origin?.sentChatSelection;
			if (selection?.doc.textBetween(selection.from, selection.to, "\n") === item.text) {
				origin.sentChatSelection = null;
				if (!origin.aiPreview) origin.setThinkingControls(false);
			}
		}

		updateSendButton() {
			const busy = Boolean(this.response);
			const empty = !this.composer.innerText.trim();
			this.composer.classList.toggle("saEmpty", empty);
			this.sendButton.className = busy ? "saChatButtonStop" : "saChatButtonSend";
			this.sendButton.type = busy || !this.isInline ? "button" : "submit";
			this.sendButton.setAttribute("aria-label", busy ? "Stop response" : "Send message");
			this.sendButton.querySelector("i").className = `saIcon far ${busy ? "fa-stop" : "fa-arrow-up"}`;
			this.sendButton.disabled = !busy && (this.contextFiles.some(item => item.progress < 100) || (empty && !this.pendingSelection && !this.contextFiles.length));
		}

		send() {
			const text = this.composer.innerText.trim();
			if (this.response || this.contextFiles.some(item => item.progress < 100) || (!text && !this.pendingSelection && !this.contextFiles.length)) return;
			const context = this.pendingSelection;
			this.pendingSelection = null;
			const contextItems = this.getContextItems();
			this.contextFiles = [];
			this.appendMessage(text, context, contextItems);
			this.renderContextPills();
			this.renderFiles();
			if (context) this.releaseSelection(context);
			this.composer.replaceChildren();
			this.renderContext();
			this.startResponse(text.toLowerCase() === "think" ? 10 * 60 * 1000 : 5000);
			this.composer.focus();
		}

		appendMessage(text, context = null, contextItems = []) {
			const message = document.createElement("li");
			message.className = "saChatMessage saChatSender";
			message.innerHTML = `<article class="saChatMessageInner">
				<div class="saChatMessageBody" tabindex="0"><div class="saChatMessageBodyInner"><p class="saMarkdownContent"></p></div></div>
				<footer class="saChatMessageFooter">
					<time class="saChatMessageTime"></time>
					<ul class="saChatToolbar" aria-label="Message actions">
						<li><button class="saChatEditButton" type="button" aria-label="Edit" aria-expanded="false"><i class="saIcon far fa-pen" aria-hidden="true"></i></button></li>
						<li><button class="saCopyButton saChatCopyButton" type="button" aria-label="Copy" data-tooltip="Copy"><i class="saIcon far fa-clone" aria-hidden="true"></i><i class="saIcon far fa-check" aria-hidden="true"></i></button></li>
					</ul>
				</footer>
			</article>`;
			// Never interpret selected text or messages as HTML.
			message.querySelector("p").textContent = text;
			if (!text.trim()) message.querySelector(".saChatMessageBodyInner").remove();
			// The attached quote stays intact; Edit changes the typed message only.
			message.querySelector(".saChatEditButton").disabled = !text;
			if (context) {
				const quote = document.createElement("blockquote");
				quote.className = "saChatInlineExcerpt";
				quote.append(this.createSourceLink(context, true));
				message.querySelector(".saChatMessageBody").prepend(quote);
			}
			if (contextItems.length) {
				const files = contextItems.filter(item => item.file);
				if (files.length) {
					const fileList = document.createElement("ul");
					fileList.className = "saFileGroup";
					fileList.setAttribute("aria-label", "Files attached to this message");
					this.renderFiles(fileList, files, false);
					message.querySelector(".saChatMessageBody").prepend(fileList);
				}
				const list = document.createElement("ul");
				list.className = "saChatContext saChatMessageContext";
				list.setAttribute("aria-label", "Context attached to this message");
				this.renderContextPills(list, contextItems, false);
				message.querySelector(".saChatMessageBody").prepend(list);
				// Keep the local File objects with their message; no reads or uploads.
				message.contextFiles = contextItems.filter(item => item.file).map(item => item.file);
			}
			const now = new Date();
			const time = message.querySelector("time");
			time.dateTime = now.toISOString();
			time.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
			if ((context || contextItems.length) && !text.trim()) message.querySelector("footer").remove();
			this.emptyMessage.remove();
			this.appendToLog(message);
			this.scroll.scrollTop = this.scroll.scrollHeight;
		}

		dateKey(date) {
			return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
		}

		ensureDateSeparator(date, before = this.log.querySelector(":scope > .saChatComposerInstruction")) {
			const key = this.dateKey(date);
			const separators = Array.from(this.log.querySelectorAll(":scope > .saChatDate time"));
			if (separators.at(-1)?.dateTime !== key) {
				const separator = document.createElement("li");
				separator.className = "saChatDate";
				const time = document.createElement("time");
				time.dateTime = key;
				separator.append(time);
				this.log.insertBefore(separator, before);
			}
			this.updateDateLabels();
		}

		updateDateLabels() {
			const today = new Date();
			const yesterday = new Date(today);
			yesterday.setDate(yesterday.getDate() - 1);
			for (const time of this.log.querySelectorAll(":scope > .saChatDate time")) {
				const date = new Date(`${time.dateTime}T12:00:00`);
				time.textContent = time.dateTime === this.dateKey(today) ? "Today"
					: time.dateTime === this.dateKey(yesterday) ? "Yesterday"
					: date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
				time.title = date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
			}
		}

		observeLatest() {
			this.latestEvents?.abort();
			this.latestObserver?.disconnect();
			this.latestEvents = new AbortController();
			const options = { signal: this.latestEvents.signal };
			const scrollTarget = this.scroll === document.scrollingElement ? document : this.scroll;
			scrollTarget.addEventListener("scroll", () => this.updateLatest(), options);
			window.addEventListener("focus", () => { this.updateDateLabels(); this.updateLatest(); }, options);
			this.latestObserver = new ResizeObserver(() => this.updateLatest());
			for (const element of [this.scroll, this.log, this.querySelector("[data-chat-compose]")]) this.latestObserver.observe(element);
			this.updateLatest();
		}

		updateLatest() {
			const reached = this.scroll.scrollHeight - this.scroll.scrollTop - this.scroll.clientHeight < 48;
			this.latestButton.classList.toggle("saReached", reached);
			this.latestButton.tabIndex = reached ? -1 : 0;
			this.latestButton.setAttribute("aria-hidden", String(reached));
		}

		appendToLog(message, date = new Date()) {
			this.ensureDateSeparator(date);
			// Keep the instruction last; response updates replace their existing node.
			this.log.insertBefore(message, this.log.querySelector(":scope > .saChatComposerInstruction"));
		}

		startResponse(thinkingDuration = 5000) {
			const historyId = `chat-inline-tool-history-${++responseSequence}`;
			const thinking = document.createElement("li");
			thinking.className = "saChatMessage saChatSystem saChatSpinner";
			thinking.innerHTML = `<div class="saChatThinkingWrapper"><div class="saChatThinkingText"><div>Thinking...</div></div></div>`;
			const message = document.createElement("li");
			message.className = "saChatAiResponse saChatStreaming";
			message.setAttribute("aria-label", "Demo assistant response");
			message.setAttribute("aria-busy", "true");
			message.innerHTML = `<article class="saChatMessageInner">
				<div class="saChatAiMessageBody" tabindex="0">
					<div class="saChatMessageContent saMarkdownContent">
						<p data-chat-intro hidden>I’ll review the context and check a few notes before answering. These tool calls are simulated.</p>
						<button type="button" class="saChatMessageAction" data-chat-tool-toggle aria-expanded="false" aria-controls="${historyId}" hidden>
							<i class="saIcon far fa-square-terminal" aria-hidden="true"></i>
							<span data-chat-tool-count>Performed tool calls</span>
							<i class="saIcon far fa-angle-down" aria-hidden="true"></i>
						</button>
						<div id="${historyId}" data-chat-tool-history hidden></div>
						<div class="saChatMessageAction" data-chat-tool-active hidden>
							<i class="saIcon far fa-square-terminal" aria-hidden="true"></i>
							<span class="saChatThinkingTextLight"></span>
						</div>
						<p data-chat-answer hidden></p>
					</div>
				</div>
				<footer class="saChatMessageFooter" hidden>
					<time class="saChatMessageTime"></time>
					<ul class="saChatToolbar" aria-label="Response actions">
						<li><button type="button" aria-label="Branch (not available in this demo)" data-tooltip="Branch (not available in this demo)" disabled><i class="saIcon far fa-code-branch" aria-hidden="true"></i></button></li>
						<li><button class="saCopyButton saChatCopyButton" type="button" aria-label="Copy" data-tooltip="Copy"><i class="saIcon far fa-clone" aria-hidden="true"></i><i class="saIcon far fa-check" aria-hidden="true"></i></button></li>
					</ul>
				</footer>
			</article>`;
			const response = {
				message, thinking, paragraph: message.querySelector("[data-chat-answer]"), text: "",
				history: message.querySelector("[data-chat-tool-history]"),
				toggle: message.querySelector("[data-chat-tool-toggle]"),
				active: message.querySelector("[data-chat-tool-active]")
			};
			response.toggle.addEventListener("click", () => {
				const expanded = response.toggle.getAttribute("aria-expanded") !== "true";
				response.toggle.setAttribute("aria-expanded", String(expanded));
				response.history.hidden = !expanded;
			});
			this.response = response;
			this.followLatest(() => this.appendToLog(thinking));
			this.status.textContent = "Message sent. Demo assistant is thinking.";
			this.updateSendButton();
			// Deliberately local: no model, service, or network request.
			this.responseTimer = setTimeout(() => {
				if (this.response !== response) return;
				this.followLatest(() => {
					thinking.replaceWith(message);
					message.querySelector("[data-chat-intro]").hidden = false;
				});
				this.runDemoToolCalls(response);
			}, thinkingDuration);
		}

		runDemoToolCalls(response) {
			const calls = ["read_context()", 'search_notes(query: "document context")', "summarize_matches()"];
			let index = 0;
			const nextCall = () => {
				if (this.response !== response) return;
				const call = calls[index];
				this.followLatest(() => {
					response.active.hidden = false;
					response.active.querySelector("span").textContent = `Performing tool call ${index + 1}/${calls.length}: ${call}`;
				});
				this.status.textContent = `Demo tool call ${index + 1} of ${calls.length}: ${call}`;
				this.responseTimer = setTimeout(() => {
					if (this.response !== response) return;
					this.followLatest(() => {
						const entry = document.createElement("div");
						entry.className = "saChatMessageAction";
						entry.innerHTML = `<i class="saIcon far fa-square-terminal" aria-hidden="true"></i><span>Performed tool call <code></code></span>`;
						entry.querySelector("code").textContent = call;
						response.history.append(entry);
						response.toggle.hidden = false;
						response.toggle.querySelector("[data-chat-tool-count]").textContent = `Performed tool calls (${++index})`;
					});
					if (index < calls.length) nextCall();
					else {
						this.followLatest(() => { response.active.hidden = true; });
						this.streamDemoAnswer(response);
					}
				}, 1200);
			};
			nextCall();
		}

		streamDemoAnswer(response) {
			this.status.textContent = "Demo assistant is writing.";
			response.paragraph.hidden = false;
			const words = "This is a demo reply. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.".split(" ");
			let index = 0;
			const nextWord = () => {
				if (this.response !== response) return;
				const text = `${index ? " " : ""}${words[index++]}`;
				response.text += text;
				const word = document.createElement("span");
				word.className = "saChatWord";
				word.textContent = text;
				this.followLatest(() => { response.paragraph.append(word); });
				if (index < words.length) {
					// Smoothly accelerate from 20ms to 5ms per word.
					const progress = (index - 1) / Math.max(1, words.length - 2);
					const delay = Math.round(20 - 15 * progress);
					this.responseTimer = setTimeout(nextWord, delay);
				} else {
					// Let the last word finish revealing before flattening the answer.
					Promise.allSettled(word.getAnimations().map(animation => animation.finished)).then(() => {
						if (this.response === response) this.finishResponse();
					});
				}
			};
			nextWord();
		}

		finishResponse(stopped = false) {
			clearTimeout(this.responseTimer);
			const response = this.response;
			if (!response) return;
			this.followLatest(() => {
				if (response.thinking.parentNode) response.thinking.replaceWith(response.message);
				response.active.hidden = true;
				response.paragraph.hidden = false;
				response.paragraph.textContent = response.text || "Response stopped.";
				if (stopped && response.text) {
					const note = document.createElement("p");
					note.className = "saChatInlineResponseStatus";
					note.textContent = "Response stopped.";
					response.paragraph.after(note);
				}
				response.message.classList.remove("saChatStreaming");
				response.message.setAttribute("aria-busy", "false");
				const time = response.message.querySelector("time");
				const now = new Date();
				time.dateTime = now.toISOString();
				time.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
				response.message.querySelector(".saChatCopyButton").disabled = !response.text;
				response.message.querySelector("footer").hidden = false;
			});
			this.response = null;
			this.updateSendButton();
			// Announce once, rather than reading every streamed word to screen readers.
			this.status.textContent = stopped ? "Response stopped." : `Demo assistant: ${response.text}`;
		}

		followLatest(update) {
			const nearBottom = this.scroll.scrollHeight - this.scroll.scrollTop - this.scroll.clientHeight < 48;
			update();
			if (nearBottom) this.scroll.scrollTop = this.scroll.scrollHeight;
			this.updateLatest();
		}
	}

	window.SaChatComponent = ChatComponent;
	if (!customElements.get("softadmin-chat")) customElements.define("softadmin-chat", ChatComponent);
})();
