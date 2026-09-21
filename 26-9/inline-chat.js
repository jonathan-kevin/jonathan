(() => {
	let sequence = 0;
	let responseSequence = 0;

	class InlineChat extends HTMLElement {
		connectedCallback() {
			if (this.initialized) {
				this.observeSize();
				return;
			}
			this.initialized = true;
			this.pendingSelection = null;
			this.classList.add("saInlineChat");
			this.setAttribute("role", "complementary");
			const titleId = `inline-chat-title-${++sequence}`;
			if (!this.id) this.id = `inline-chat-${sequence}`;
			this.setAttribute("aria-labelledby", titleId);
			this.innerHTML = `
				<div class="saInlineChatResize" role="separator" tabindex="0" aria-label="Resize document chat" aria-orientation="vertical" aria-describedby="${titleId}-resize-help"></div>
				<p id="${titleId}-resize-help" class="saScreenReaderOnly">Drag to resize. Left Arrow widens chat, Right Arrow narrows it. Hold Shift for larger steps. Home sets minimum width; End sets maximum width.</p>
				<header class="saInlineChatHeader">
					<h3 id="${titleId}">Document chat</h3>
					<button class="saCloseModal" type="button" data-chat-close aria-label="Close document chat" aria-keyshortcuts="Escape"><i class="saIcon far fa-xmark" aria-hidden="true"></i></button>
				</header>
				<div class="saChatWrapper">
					<div class="saChat" data-chat-scroll>
						<ol class="saChatLog" aria-label="Document chat messages">
							<li class="saChatMessage saChatSystem">
								<article class="saChatMessageInner">
									<div class="saChatMessageBody">
										<p>Add selected text or write a message to start a conversation.</p>
									</div>
								</article>
							</li>
						</ol>
					</div>
					<form class="saChatComposerWrapper" aria-label="Compose a chat message">
						<section class="saInlineChatContext" aria-label="Selected text for your next message" hidden>
							<i class="saIcon far fad fa-quote-left" aria-hidden="true"></i>
							<blockquote data-chat-context></blockquote>
							<button class="saDefaultIconButtonGhost" type="button" data-chat-dismiss-context aria-label="Remove selected text"><i class="saIcon far fa-xmark" aria-hidden="true"></i></button>
						</section>
						<div class="saChatComposer">
							<div class="saChatTextarea saEmpty" contenteditable="plaintext-only" role="textbox" aria-multiline="true" aria-label="Write a message" data-placeholder="Write a message…" enterkeyhint="enter" aria-disabled="false" aria-describedby="${titleId}-help"></div>
							<button class="saChatButtonSend" type="submit" aria-label="Send message" disabled><i class="saIcon far fa-arrow-up" aria-hidden="true"></i></button>
						</div>
						<p id="${titleId}-help" class="saChatComposerInstruction">AI can make mistakes. Check important info.</p>
					</form>
				</div>
				<p class="saScreenReaderOnly" role="status" aria-atomic="true" data-chat-status></p>`;
			this.composer = this.querySelector(".saChatTextarea");
			this.sendButton = this.querySelector(".saChatButtonSend");
			this.log = this.querySelector(".saChatLog");
			this.emptyMessage = this.log.firstElementChild;
			this.context = this.querySelector(".saInlineChatContext");
			this.contextText = this.querySelector("[data-chat-context]");
			this.status = this.querySelector("[data-chat-status]");
			this.scroll = this.querySelector("[data-chat-scroll]");
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
			this.sizeObserver?.disconnect();
			this.endResize();
			if (this.response) this.finishResponse(true);
		}

		setupResize() {
			this.resizeHandle = this.querySelector(".saInlineChatResize");
			this.resizeHandle.setAttribute("aria-controls", this.id);
			this.preferredWidth = 32 * parseFloat(getComputedStyle(document.documentElement).fontSize);
			this.resizeHandle.addEventListener("pointerdown", event => {
				if (event.button !== 0 || !event.isPrimary) return;
				event.preventDefault();
				this.resizeHandle.focus({ preventScroll: true });
				this.resizeDrag = { id: event.pointerId, x: event.clientX, width: this.getBoundingClientRect().width };
				this.resizeHandle.setPointerCapture(event.pointerId);
				this.classList.add("saInlineChatResizing");
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
			this.classList.remove("saInlineChatResizing");
			if (id !== undefined && this.resizeHandle.hasPointerCapture(id)) this.resizeHandle.releasePointerCapture(id);
		}

		open(origin) {
			this.origin = origin || this.origin;
			this.inert = false;
			this.removeAttribute("aria-hidden");
			this.hidden = false;
			this.updateOpenControls();
			this.setWidth(this.preferredWidth, false);
			this.composer.focus({ preventScroll: true });
		}

		close(origin = this.origin) {
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

		addSelection(text, origin) {
			if (!text.trim()) return;
			if (this.pendingSelection?.text !== text || this.pendingSelection?.origin !== origin) {
				const replacing = Boolean(this.pendingSelection);
				if (this.pendingSelection) this.releaseSelection(this.pendingSelection);
				this.pendingSelection = { text, origin };
				this.renderContext();
				this.status.textContent = `Selected text ${replacing ? "replaced" : "added"}. Write a message or press Send when ready.`;
			}
			this.open(origin);
		}

		renderContext() {
			this.contextText.textContent = this.pendingSelection?.text || "";
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
			this.sendButton.disabled = !busy && empty && !this.pendingSelection;
		}

		send() {
			const text = this.composer.innerText.trim();
			if (this.response || (!text && !this.pendingSelection)) return;
			const context = this.pendingSelection;
			this.pendingSelection = null;
			this.appendMessage(text, "You", context);
			if (context) this.releaseSelection(context);
			this.composer.replaceChildren();
			this.renderContext();
			this.startResponse(text.toLowerCase() === "think" ? 10 * 60 * 1000 : 5000);
			this.composer.focus();
		}

		appendMessage(text, label, context = null) {
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
				quote.className = "saInlineChatExcerpt";
				quote.innerHTML = `<i class="saIcon far fad fa-quote-left" aria-hidden="true"></i><span></span>`;
				quote.querySelector("span").textContent = context.text;
				message.querySelector(".saChatMessageBody").prepend(quote);
			}
			message.querySelector("[data-chat-source]").textContent = label;
			const now = new Date();
			const time = message.querySelector("time");
			time.dateTime = now.toISOString();
			time.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
			if (context && !text.trim()) message.querySelector("footer").remove();
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
				response.text += `${index ? " " : ""}${words[index++]}`;
				this.followLatest(() => { response.paragraph.textContent = response.text; });
				if (index < words.length) {
					// Start faster, then smoothly accelerate from 45ms to 10ms per word.
					const progress = (index - 1) / Math.max(1, words.length - 2);
					const delay = Math.round(45 - 35 * progress);
					this.responseTimer = setTimeout(nextWord, delay);
				} else this.finishResponse();
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
					note.className = "saInlineChatResponseStatus";
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
