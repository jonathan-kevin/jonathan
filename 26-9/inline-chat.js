(() => {
	let sequence = 0;
	let responseSequence = 0;
	let sourceSequence = 0;

	class InlineChat extends HTMLElement {
		connectedCallback() {
			if (this.initialized) {
				this.observeSize();
				this.observeContextControls();
				return;
			}
			this.initialized = true;
			this.pendingSelection = null;
			this.pageContextEnabled = true;
			this.contextFiles = [];
			this.classList.add("saChatInline");
			this.setAttribute("role", "complementary");
			const titleId = `inline-chat-title-${++sequence}`;
			if (!this.id) this.id = `inline-chat-${sequence}`;
			this.setAttribute("aria-labelledby", titleId);
			this.innerHTML = `
				<div class="saChatInlineResize" role="separator" tabindex="0" aria-label="Resize document chat" aria-orientation="vertical" aria-describedby="${titleId}-resize-help"></div>
				<p id="${titleId}-resize-help" class="saScreenReaderOnly">Drag to resize. Left Arrow widens chat, Right Arrow narrows it. Hold Shift for larger steps. Home sets minimum width; End sets maximum width.</p>
				<header class="saChatInlineHeader">
					<h3 id="${titleId}">Document chat</h3>
					<button class="saCloseModal" type="button" data-chat-close aria-label="Close document chat" aria-keyshortcuts="Escape"><i class="saIcon far fa-xmark" aria-hidden="true"></i></button>
				</header>
				<div class="saChatWrapper">
					<div class="saChat" data-chat-scroll>
						<ol class="saChatLog" aria-label="Document chat messages">
							<li class="saChatMessage saChatSystem">
								<article class="saChatMessageInner">
									<div class="saChatMessageBody">
										<p>Ask about this page, or select text to focus the conversation.</p>
									</div>
								</article>
							</li>
						</ol>
						<form class="saChatComposerWrapper" aria-label="Compose a chat message">
							<section class="saChatInlineContext" aria-label="Selected text for your next message" hidden>
								<blockquote data-chat-context></blockquote>
								<button class="saDefaultIconButtonGhost" type="button" data-chat-dismiss-context aria-label="Remove selected text"><i class="saIcon far fa-xmark" aria-hidden="true"></i></button>
							</section>
							<div class="saChatComposer">
								<ul class="saChatContext" aria-label="Context for your next message" id="${titleId}-page-context" data-chat-pills></ul>
								<div class="saChatTextarea saEmpty" contenteditable="plaintext-only" role="textbox" aria-multiline="true" aria-label="Write a message" data-placeholder="Write a message…" enterkeyhint="enter" aria-disabled="false" aria-describedby="${titleId}-page-context ${titleId}-help"></div>
								<ul class="saChatComposerToolbar" aria-label="Chat controls" role="toolbar">
									<li class="saChatInlineAddContext">
<button class="saChatComposerToolbarButton" type="button" data-chat-add-context aria-label="Add context" aria-haspopup="menu" aria-expanded="false" aria-controls="${titleId}-context-menu"><i class="saIcon far fa-plus" aria-hidden="true"></i></button>
<ul class="saContextMenu saNorth" id="${titleId}-context-menu" data-chat-context-menu role="menu" aria-label="Add context" aria-hidden="true" hidden>
<li role="none"><button class="saOptionWrapper" type="button" role="menuitem" tabindex="-1" data-context-action="page"><span class="saOption"><i class="saIcon far fad fa-file-lines saOptionIcon" aria-hidden="true"></i><span class="saOptionText">Include current page</span></span></button></li>
<li role="none"><button class="saOptionWrapper" type="button" role="menuitem" tabindex="-1" data-context-action="file"><span class="saOption"><i class="saIcon far fad fa-paperclip saOptionIcon" aria-hidden="true"></i><span class="saOptionText">Add file…</span></span></button></li>
</ul></li>
									<li><button class="saChatButtonSend" type="submit" aria-label="Send message" disabled><i class="saIcon far fa-arrow-up" aria-hidden="true"></i></button></li>
								</ul>
							</div>
							<p id="${titleId}-help" class="saChatComposerInstruction">Demo chat. Responses are simulated.</p>
						</form>
					</div>
				</div>
<input type="file" data-chat-file-input multiple hidden>
<p class="saScreenReaderOnly" role="status" aria-atomic="true" data-chat-status></p>`;
			this.composer = this.querySelector(".saChatTextarea");
			this.sendButton = this.querySelector(".saChatButtonSend");
			this.log = this.querySelector(".saChatLog");
			this.emptyMessage = this.log.firstElementChild;
			this.context = this.querySelector(".saChatInlineContext");
			this.contextText = this.querySelector("[data-chat-context]");
			this.status = this.querySelector("[data-chat-status]");
			this.scroll = this.querySelector("[data-chat-scroll]");
			this.setupContextControls();
			this.updatePageContext();
			this.addEventListener("click", event => {
				const link = event.target.closest("[data-chat-page-link]");
				if (!link) return;
				event.preventDefault();
				const target = document.getElementById(link.hash.slice(1));
				if (!target) return;
				if (!target.hasAttribute("tabindex")) target.tabIndex = -1;
				if (window.matchMedia("(max-width: 1199px)").matches) this.close(target);
				target.focus({ preventScroll: true });
				target.querySelector(".scrollcontent")?.scrollTo({ top: 0, left: 0, behavior: "instant" });
			});
			this.setupResize();
			this.querySelector("[data-chat-close]").addEventListener("click", () => this.close());
			this.querySelector("[data-chat-dismiss-context]").addEventListener("click", () => {
				if (this.pendingSelection) this.releaseSelection(this.pendingSelection);
				this.pendingSelection = null;
				this.renderContext();
				this.composer.focus();
				this.status.textContent = "Selected text removed from your next message.";
			});
			this.composer.addEventListener("input", () => this.updateSendButton());
			this.sendButton.addEventListener("click", event => {
				if (!this.response) return;
				event.preventDefault();
				this.finishResponse(true);
				this.composer.focus();
			});
			this.addEventListener("keydown", event => {
				if (event.isComposing) return;
				if (event.key === "Escape") {
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
			this.querySelector("form").addEventListener("submit", event => {
				event.preventDefault();
				this.send();
			});
		}

		disconnectedCallback() {
			this.contextEvents?.abort();
			this.contextPillObserver?.disconnect();
			this.sizeObserver?.disconnect();
			this.endResize();
			if (this.response) this.finishResponse(true);
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
			this.style.setProperty("--sa-inline-chat-width", `${width}px`);
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

		setupContextControls() {
			this.contextPills = this.querySelector("[data-chat-pills]");
			this.contextPillObserver = new ResizeObserver(() => {
				this.querySelector(".saChatComposer").style.setProperty("--sa-chat-context-height", `${this.contextPills.offsetHeight}px`);
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
				let added = 0;
				for (const file of this.fileInput.files) {
					if (this.contextFiles.some(item => item.file.name === file.name && item.file.size === file.size && item.file.lastModified === file.lastModified)) continue;
					this.contextFiles.push({ id: ++sourceSequence, text: file.name, file });
					added++;
				}
				// Reset so a removed file can be selected again.
				this.fileInput.value = "";
				this.renderContextPills(); this.updateSendButton(); this.composer.focus();
				this.status.textContent = added ? `${added} file${added === 1 ? "" : "s"} attached locally. Nothing uploaded.` : "Files already attached.";
			});
			this.fileInput.addEventListener("cancel", () => this.addContextButton.focus());
		}

		observeContextControls() {
			this.contextPillObserver.observe(this.contextPills);
			this.contextEvents?.abort();
			this.contextEvents = new AbortController();
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

		renderContextPills(list = this.contextPills, items = this.getContextItems(), removable = true) {
			list.replaceChildren();
			for (const item of items) {
				const pill = document.createElement("li");
				pill.className = "saPill";
				const page = item.id === "page";
				const action = document.createElement(page ? "a" : "span");
				action.className = "saChatContextPillLabel";
				action.innerHTML = `<i class="saIcon far fad ${page ? "fa-file" : "fa-paperclip"}" aria-hidden="true"></i><span></span>`;
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

		updatePageContext() {
			const frame = this.parentElement?.querySelector(".saRightFrameRoot");
			const headings = Array.from(frame?.querySelectorAll("h1.saHeaderText") || []);
			const heading = headings.find(node => node.getClientRects().length) || headings[0];
			const title = heading?.textContent.trim() || document.title || "Current page";
			const target = frame?.querySelector("main") || frame;
			if (target && !target.id) target.id = `${this.id}-page`;
			this.pageContext = { title, url: location.href, target };
			this.renderContextPills();
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

		createSourceLink(item) {
			const link = document.createElement(item.source ? "a" : "span");
			link.className = "saChatInlineSourceLink";
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
			if (!inChat && window.matchMedia("(max-width: 1199px)").matches) this.close();
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
			document.dispatchEvent(new Event("inline-chat-source-jump"));
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
			this.sendButton.type = busy ? "button" : "submit";
			this.sendButton.setAttribute("aria-label", busy ? "Stop response" : "Send message");
			this.sendButton.querySelector("i").className = `saIcon far ${busy ? "fa-stop" : "fa-arrow-up"}`;
			this.sendButton.disabled = !busy && empty && !this.pendingSelection && !this.contextFiles.length;
		}

		send() {
			const text = this.composer.innerText.trim();
			if (this.response || (!text && !this.pendingSelection && !this.contextFiles.length)) return;
			const context = this.pendingSelection;
			this.pendingSelection = null;
			const contextItems = this.getContextItems();
			this.contextFiles = [];
			this.appendMessage(text, "You", context, contextItems);
			this.renderContextPills();
			if (context) this.releaseSelection(context);
			this.composer.replaceChildren();
			this.renderContext();
			this.startResponse(text.toLowerCase() === "think" ? 10 * 60 * 1000 : 5000);
			this.composer.focus();
		}

		appendMessage(text, label, context = null, contextItems = []) {
			const message = document.createElement("li");
			message.className = "saChatMessage saChatSender";
			message.innerHTML = `<article class="saChatMessageInner">
				<div class="saChatMessageBody" tabindex="0"><p class="saMarkdownContent"></p></div>
				<footer class="saChatMessageFooter">
					<span data-chat-source></span><time class="saChatMessageTime"></time>
					<ul class="saChatToolbar" aria-label="Message actions">
						<li><button class="saChatEditButton" type="button" aria-label="Edit" aria-expanded="false"><i class="saIcon far fa-pen" aria-hidden="true"></i></button></li>
						<li><button class="saCopyButton saChatCopyButton" type="button" aria-label="Copy" data-tooltip="Copy"><i class="saIcon far fa-clone" aria-hidden="true"></i><i class="saIcon far fa-check" aria-hidden="true"></i></button></li>
					</ul>
				</footer>
			</article>`;
			// Never interpret selected text or messages as HTML.
			message.querySelector("p").textContent = text;
			if (!text) message.querySelector("p").remove();
			// The attached quote stays intact; Edit changes the typed message only.
			message.querySelector(".saChatEditButton").disabled = !text;
			if (context) {
				const quote = document.createElement("blockquote");
				quote.className = "saChatInlineExcerpt";
				quote.append(this.createSourceLink(context));
				message.querySelector(".saChatMessageBody").prepend(quote);
			}
			if (contextItems.length) {
				const list = document.createElement("ul");
				list.className = "saChatContext saChatMessageContext";
				list.setAttribute("aria-label", "Context attached to this message");
				this.renderContextPills(list, contextItems, false);
				message.querySelector(".saChatMessageBody").prepend(list);
				// Keep the local File objects with their message; no reads or uploads.
				message.contextFiles = contextItems.filter(item => item.file).map(item => item.file);
			}
			message.querySelector("[data-chat-source]").textContent = label;
			const now = new Date();
			const time = message.querySelector("time");
			time.dateTime = now.toISOString();
			time.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
			if ((context || contextItems.length) && !text.trim()) message.querySelector("footer").remove();
			this.emptyMessage.remove();
			this.log.append(message);
			this.scroll.scrollTop = this.scroll.scrollHeight;
		}

		startResponse(thinkingDuration = 5000) {
			const historyId = `inline-chat-tool-history-${++responseSequence}`;
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
			this.followLatest(() => this.log.append(thinking));
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
		}
	}

	if (!customElements.get("inline-chat")) customElements.define("inline-chat", InlineChat);

	document.addEventListener("click", event => {
		const button = event.target.closest(".saOpenChat[aria-controls]");
		if (!button || button.disabled || button.getAttribute("aria-disabled") === "true") return;
		const chat = document.getElementById(button.getAttribute("aria-controls"));
		if (chat?.matches("inline-chat") && typeof chat.open === "function") {
			event.preventDefault();
			if (chat.hidden) chat.open(button);
			else chat.close(button);
		}
	});
})();
