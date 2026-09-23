(() => {
	let sequence = 0;
	let responseSequence = 0;
	let sourceSequence = 0;
	let messageSequence = 0;
	let pasteSequence = 0;

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
				this.reconnectPanel?.();
				this.observeContextControls();
				this.startFileLoading();
				this.observeLatest();
				this.observeMessageExpansion();
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
			this.messageExpanders = new Map();
			this.observeMessageExpansion();
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
			this.composer.addEventListener("paste", event => this.handleLongPaste(event));
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
				if (event.target === this.composer && event.key === "Enter" && !event.shiftKey) {
					event.preventDefault();
					this.send();
				}
			});
			this.querySelector("[data-chat-compose]").addEventListener("submit", event => {
				event.preventDefault();
				this.send();
			});
			if (!this.isInline) this.seedDemoHistory();
		}

		seedDemoHistory() {
			// Fictional, local demo data. No requests or simulated live work on startup.
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);
			yesterday.setHours(14, 20, 0, 0);
			const recent = new Date(Date.now() - 2 * 60 * 1000);
			const turns = [
				{
					date: yesterday,
					prompt: "Can you give me a quick status update on the customer portal rollout? I’ve attached the handover notes. What needs attention before launch?",
					files: [{
						name: "portal-handover.txt", type: "text/plain",
						content: [
							"Customer portal — launch handover",
							"Fictional project notes for the chat demo.", "",
							"Status: 9 of 12 launch tasks complete; 2 in progress; 1 blocked.", "",
							"Completed: sign-in, account settings, and the main support flows.",
							"In progress: help articles and final keyboard/accessibility checks.",
							"Blocked: production email domain DNS verification.", "",
							"Platform team: confirm the DNS records and complete email verification.",
							"QA: rerun the password-reset flow after verification succeeds.",
							"Content and design: finish help articles and accessibility checks.", "",
							"Launch date remains provisional until the end-to-end email test passes.", "",
							"Customer portal — launch handover",
							"Fictional project notes for the chat demo.", "",
							"Status: 9 of 12 launch tasks complete; 2 in progress; 1 blocked.", "",
							"Completed: sign-in, account settings, and the main support flows.",
							"In progress: help articles and final keyboard/accessibility checks.",
							"Blocked: production email domain DNS verification.", "",
							"Platform team: confirm the DNS records and complete email verification.",
							"QA: rerun the password-reset flow after verification succeeds.",
							"Content and design: finish help articles and accessibility checks.", "",
							"Launch date remains provisional until the end-to-end email test passes.", "",
							"Customer portal — launch handover",
							"Fictional project notes for the chat demo.", "",
							"Status: 9 of 12 launch tasks complete; 2 in progress; 1 blocked.", "",
							"Completed: sign-in, account settings, and the main support flows.",
							"In progress: help articles and final keyboard/accessibility checks.",
							"Blocked: production email domain DNS verification.", "",
							"Platform team: confirm the DNS records and complete email verification.",
							"QA: rerun the password-reset flow after verification succeeds.",
							"Content and design: finish help articles and accessibility checks.", "",
							"Launch date remains provisional until the end-to-end email test passes.", "",
							"Customer portal — launch handover",
							"Fictional project notes for the chat demo.", "",
							"Status: 9 of 12 launch tasks complete; 2 in progress; 1 blocked.", "",
							"Completed: sign-in, account settings, and the main support flows.",
							"In progress: help articles and final keyboard/accessibility checks.",
							"Blocked: production email domain DNS verification.", "",
							"Platform team: confirm the DNS records and complete email verification.",
							"QA: rerun the password-reset flow after verification succeeds.",
							"Content and design: finish help articles and accessibility checks.", "",
							"Launch date remains provisional until the end-to-end email test passes.", "",
							"Customer portal — launch handover",
							"Fictional project notes for the chat demo.", "",
							"Status: 9 of 12 launch tasks complete; 2 in progress; 1 blocked.", "",
							"Completed: sign-in, account settings, and the main support flows.",
							"In progress: help articles and final keyboard/accessibility checks.",
							"Blocked: production email domain DNS verification.", "",
							"Platform team: confirm the DNS records and complete email verification.",
							"QA: rerun the password-reset flow after verification succeeds.",
							"Content and design: finish help articles and accessibility checks.", "",
							"Launch date remains provisional until the end-to-end email test passes.", "",
							"Customer portal — launch handover",
							"Fictional project notes for the chat demo.", "",
							"Status: 9 of 12 launch tasks complete; 2 in progress; 1 blocked.", "",
							"Completed: sign-in, account settings, and the main support flows.",
							"In progress: help articles and final keyboard/accessibility checks.",
							"Blocked: production email domain DNS verification.", "",
							"Platform team: confirm the DNS records and complete email verification.",
							"QA: rerun the password-reset flow after verification succeeds.",
							"Content and design: finish help articles and accessibility checks.", "",
							"Launch date remains provisional until the end-to-end email test passes.", ""
						].join("\n")
					}],
					paragraphs: ["The rollout is close to ready: 9 of the 12 launch tasks are complete, 2 are in progress, and 1 is blocked."],
					bullets: ["Completed: sign-in, account settings, and the main support flows have passed testing.", "In progress: the help articles and final accessibility checks.", "Blocked: the production email domain still needs DNS verification. Password-reset emails cannot be signed off until that is resolved."],
					closing: "I’d prioritize the email verification, then rerun the password-reset test. The remaining content work can continue in parallel.",
					activity: [
						{ label: "Reviewed launch tasks", detail: "Checked the 12 tasks in the customer portal launch checklist.", call: 'get_project_tasks(project: "Customer portal")' },
						{ label: "Checked project notes", detail: "Found the outstanding email verification dependency in the latest handover notes.", call: 'search_project_notes(query: "launch blockers")' }
					]
				},
				{
					date: new Date(yesterday.getTime() + 6 * 60 * 1000),
					prompt: "Turn that into a short update I can send to the project team. Keep it practical.",
					paragraphs: ["Here’s a draft you can share:", "The customer portal is nearly ready for launch. Nine of twelve tasks are complete; help content and accessibility checks are still in progress. The main blocker is production email domain verification."],
					bullets: ["Platform team: confirm the DNS records and complete email verification.", "QA: rerun the password-reset flow once verification is complete.", "Content and design: finish the help articles and remaining accessibility checks."],
					closing: "We’ll confirm the launch date once the email test passes. No message has been sent on your behalf."
				},
				{
					date: recent,
					prompt: "The email domain is verified now. Here’s the updated launch checklist. What should we check before giving the go-ahead?",
					files: [{
						name: "launch-checklist.md", type: "text/markdown",
						content: [
							"# Customer portal — launch checklist", "",
							"Fictional checklist for the chat demo.", "",
							"## Completed",
							"- [x] Verify production email domain and DNS records.",
							"- [x] Test sign-in, account settings, and support flows.", "",
							"## Before launch",
							"- [ ] Request a password reset with a test account and confirm delivery.",
							"- [ ] Check the link opens the production portal, works once, and expires.",
							"- [ ] Complete keyboard navigation and screen-reader checks.",
							"- [ ] Publish and proofread the remaining help articles.",
							"- [ ] Record QA results and obtain the launch owner’s approval.", "",
							"- [ ] Request a password reset with a test account and confirm delivery.",
							"- [ ] Check the link opens the production portal, works once, and expires.",
							"- [ ] Complete keyboard navigation and screen-reader checks.",
							"- [ ] Publish and proofread the remaining help articles.",
							"- [ ] Record QA results and obtain the launch owner’s approval.", "",
							"- [ ] Request a password reset with a test account and confirm delivery.",
							"- [ ] Check the link opens the production portal, works once, and expires.",
							"- [ ] Complete keyboard navigation and screen-reader checks.",
							"- [ ] Publish and proofread the remaining help articles.",
							"- [ ] Record QA results and obtain the launch owner’s approval.", "",
							"- [ ] Request a password reset with a test account and confirm delivery.",
							"- [ ] Check the link opens the production portal, works once, and expires.",
							"- [ ] Complete keyboard navigation and screen-reader checks.",
							"- [ ] Publish and proofread the remaining help articles.",
							"- [ ] Record QA results and obtain the launch owner’s approval.", "",
							"- [ ] Request a password reset with a test account and confirm delivery.",
							"- [ ] Check the link opens the production portal, works once, and expires.",
							"- [ ] Complete keyboard navigation and screen-reader checks.",
							"- [ ] Publish and proofread the remaining help articles.",
							"- [ ] Record QA results and obtain the launch owner’s approval.", "",
							"- [ ] Request a password reset with a test account and confirm delivery.",
							"- [ ] Check the link opens the production portal, works once, and expires.",
							"- [ ] Complete keyboard navigation and screen-reader checks.",
							"- [ ] Publish and proofread the remaining help articles.",
							"- [ ] Record QA results and obtain the launch owner’s approval.", "",
							"- [ ] Request a password reset with a test account and confirm delivery.",
							"- [ ] Check the link opens the production portal, works once, and expires.",
							"- [ ] Complete keyboard navigation and screen-reader checks.",
							"- [ ] Publish and proofread the remaining help articles.",
							"- [ ] Record QA results and obtain the launch owner’s approval.", "",
							"- [ ] Request a password reset with a test account and confirm delivery.",
							"- [ ] Check the link opens the production portal, works once, and expires.",
							"- [ ] Complete keyboard navigation and screen-reader checks.",
							"- [ ] Publish and proofread the remaining help articles.",
							"- [ ] Record QA results and obtain the launch owner’s approval.", "",
							"- [ ] Request a password reset with a test account and confirm delivery.",
							"- [ ] Check the link opens the production portal, works once, and expires.",
							"- [ ] Complete keyboard navigation and screen-reader checks.",
							"- [ ] Publish and proofread the remaining help articles.",
							"- [ ] Record QA results and obtain the launch owner’s approval.", "",
							"- [ ] Request a password reset with a test account and confirm delivery.",
							"- [ ] Check the link opens the production portal, works once, and expires.",
							"- [ ] Complete keyboard navigation and screen-reader checks.",
							"- [ ] Publish and proofread the remaining help articles.",
							"- [ ] Record QA results and obtain the launch owner’s approval.", "",
							"- [ ] Request a password reset with a test account and confirm delivery.",
							"- [ ] Check the link opens the production portal, works once, and expires.",
							"- [ ] Complete keyboard navigation and screen-reader checks.",
							"- [ ] Publish and proofread the remaining help articles.",
							"- [ ] Record QA results and obtain the launch owner’s approval.", "",
							"- [ ] Request a password reset with a test account and confirm delivery.",
							"- [ ] Check the link opens the production portal, works once, and expires.",
							"- [ ] Complete keyboard navigation and screen-reader checks.",
							"- [ ] Publish and proofread the remaining help articles.",
							"- [ ] Record QA results and obtain the launch owner’s approval.", "",
							"- [ ] Request a password reset with a test account and confirm delivery.",
							"- [ ] Check the link opens the production portal, works once, and expires.",
							"- [ ] Complete keyboard navigation and screen-reader checks.",
							"- [ ] Publish and proofread the remaining help articles.",
							"- [ ] Record QA results and obtain the launch owner’s approval.", "",
							"- [ ] Request a password reset with a test account and confirm delivery.",
							"- [ ] Check the link opens the production portal, works once, and expires.",
							"- [ ] Complete keyboard navigation and screen-reader checks.",
							"- [ ] Publish and proofread the remaining help articles.",
							"- [ ] Record QA results and obtain the launch owner’s approval.", "",
							"- [ ] Request a password reset with a test account and confirm delivery.",
							"- [ ] Check the link opens the production portal, works once, and expires.",
							"- [ ] Complete keyboard navigation and screen-reader checks.",
							"- [ ] Publish and proofread the remaining help articles.",
							"- [ ] Record QA results and obtain the launch owner’s approval.", "",
							"- [ ] Request a password reset with a test account and confirm delivery.",
							"- [ ] Check the link opens the production portal, works once, and expires.",
							"- [ ] Complete keyboard navigation and screen-reader checks.",
							"- [ ] Publish and proofread the remaining help articles.",
							"- [ ] Record QA results and obtain the launch owner’s approval.", "",
							"- [ ] Request a password reset with a test account and confirm delivery.",
							"- [ ] Check the link opens the production portal, works once, and expires.",
							"- [ ] Complete keyboard navigation and screen-reader checks.",
							"- [ ] Publish and proofread the remaining help articles.",
							"- [ ] Record QA results and obtain the launch owner’s approval.", "",
							"- [ ] Request a password reset with a test account and confirm delivery.",
							"- [ ] Check the link opens the production portal, works once, and expires.",
							"- [ ] Complete keyboard navigation and screen-reader checks.",
							"- [ ] Publish and proofread the remaining help articles.",
							"- [ ] Record QA results and obtain the launch owner’s approval.", "",
							"- [ ] Request a password reset with a test account and confirm delivery.",
							"- [ ] Check the link opens the production portal, works once, and expires.",
							"- [ ] Complete keyboard navigation and screen-reader checks.",
							"- [ ] Publish and proofread the remaining help articles.",
							"- [ ] Record QA results and obtain the launch owner’s approval.", "",
							"- [ ] Request a password reset with a test account and confirm delivery.",
							"- [ ] Check the link opens the production portal, works once, and expires.",
							"- [ ] Complete keyboard navigation and screen-reader checks.",
							"- [ ] Publish and proofread the remaining help articles.",
							"- [ ] Record QA results and obtain the launch owner’s approval.", "",
							"- [ ] Request a password reset with a test account and confirm delivery.",
							"- [ ] Check the link opens the production portal, works once, and expires.",
							"- [ ] Complete keyboard navigation and screen-reader checks.",
							"- [ ] Publish and proofread the remaining help articles.",
							"- [ ] Record QA results and obtain the launch owner’s approval.", "",
							"- [ ] Request a password reset with a test account and confirm delivery.",
							"- [ ] Check the link opens the production portal, works once, and expires.",
							"- [ ] Complete keyboard navigation and screen-reader checks.",
							"- [ ] Publish and proofread the remaining help articles.",
							"- [ ] Record QA results and obtain the launch owner’s approval.", "",
							"- [ ] Request a password reset with a test account and confirm delivery.",
							"- [ ] Check the link opens the production portal, works once, and expires.",
							"- [ ] Complete keyboard navigation and screen-reader checks.",
							"- [ ] Publish and proofread the remaining help articles.",
							"- [ ] Record QA results and obtain the launch owner’s approval.", "",
							"- [ ] Request a password reset with a test account and confirm delivery.",
							"- [ ] Check the link opens the production portal, works once, and expires.",
							"- [ ] Complete keyboard navigation and screen-reader checks.",
							"- [ ] Publish and proofread the remaining help articles.",
							"- [ ] Record QA results and obtain the launch owner’s approval.", "",
							"- [ ] Request a password reset with a test account and confirm delivery.",
							"- [ ] Check the link opens the production portal, works once, and expires.",
							"- [ ] Complete keyboard navigation and screen-reader checks.",
							"- [ ] Publish and proofread the remaining help articles.",
							"- [ ] Record QA results and obtain the launch owner’s approval.", "",
							"**Decision:** keep launch on hold until the remaining checks pass.", ""
						].join("\n")
					}],
					paragraphs: ["That removes the configuration blocker. I checked the launch checklist; the end-to-end email test still needs a recorded result."],
					bullets: ["Request a password reset using a test account and confirm the email arrives.", "Check that the reset link works once, expires correctly, and opens the production portal.", "Finish the remaining accessibility checks and confirm the help articles are published.", "Record the test results and ask the launch owner for final approval."],
					closing: "If those checks pass, the team can make the go/no-go decision. I haven’t changed any task statuses.",
					activity: [{ label: "Checked remaining launch checks", detail: "Reviewed the open QA and content sign-off items in the sample checklist.", call: 'get_launch_checklist(project: "Customer portal")' }]
				}
			];
			this.emptyMessage.remove();
			this.log.querySelectorAll(":scope > .saChatDate").forEach(separator => separator.remove());
			for (const turn of turns) {
				const attachments = (turn.files || []).map(({ name, type, content }) => ({
					id: ++sourceSequence,
					text: name,
					file: new File([content], name, { type, lastModified: turn.date.getTime() }),
					progress: 100
				}));
				this.appendMessage(turn.prompt, null, attachments, turn.date);
				this.appendHistoryResponse(turn, new Date(turn.date.getTime() + 60 * 1000));
			}
			this.scroll.scrollTop = this.scroll.scrollHeight;
			this.updateLatest();
		}

		appendHistoryResponse(turn, date) {
			const message = document.createElement("li");
			message.className = "saChatAiResponse";
			message.setAttribute("aria-label", "Demo assistant response");
			message.innerHTML = `<article class="saChatMessageInner">
				<div class="saChatAiMessageBody" tabindex="0"><div class="saChatMessageContent saMarkdownContent"></div></div>
				<footer class="saChatMessageFooter"><time class="saChatMessageTime"></time>
					<ul class="saChatToolbar" aria-label="Response actions">
						<li><button type="button" aria-label="Branch (not available in this demo)" disabled><i class="saIcon far fa-code-branch" aria-hidden="true"></i></button></li>
						<li><button class="saCopyButton saChatCopyButton" type="button" aria-label="Copy" data-tooltip="Copy"><i class="saIcon far fa-clone" aria-hidden="true"></i><i class="saIcon far fa-check" aria-hidden="true"></i></button></li>
					</ul>
				</footer></article>`;
			const answer = message.querySelector(".saChatMessageContent");
			for (const text of turn.paragraphs) {
				const paragraph = document.createElement("p");
				paragraph.textContent = text; answer.append(paragraph);
			}
			const list = document.createElement("ul");
			for (const text of turn.bullets) {
				const item = document.createElement("li");
				item.textContent = text; list.append(item);
			}
			answer.append(list);
			const closing = document.createElement("p");
			closing.textContent = turn.closing; answer.append(closing);
			if (turn.activity?.length) {
				const history = document.createElement("div");
				history.id = `chat-inline-tool-history-${++responseSequence}`;
				history.dataset.chatToolHistory = "";
				const toggle = document.createElement("button");
				toggle.type = "button";
				toggle.className = "saChatMessageAction";
				toggle.dataset.chatToolToggle = "";
				toggle.setAttribute("aria-expanded", "true");
				toggle.setAttribute("aria-controls", history.id);
				toggle.innerHTML = '<i class="saIcon far fa-square-terminal" aria-hidden="true"></i><span data-chat-tool-count></span><i class="saIcon far fa-angle-down" aria-hidden="true"></i>';
				toggle.querySelector("[data-chat-tool-count]").textContent = `Performed tool calls (${turn.activity.length})`;
				for (const activity of turn.activity) {
					const entry = document.createElement("div");
					entry.className = "saChatMessageAction";
					entry.innerHTML = '<i class="saIcon far fa-square-terminal" aria-hidden="true"></i><span>Performed tool call <code></code></span>';
					entry.querySelector("code").textContent = activity.call;
					history.append(entry);
				}
				toggle.addEventListener("click", () => {
					const expanded = toggle.getAttribute("aria-expanded") !== "true";
					toggle.setAttribute("aria-expanded", String(expanded)); history.hidden = !expanded;
				});
				answer.prepend(toggle, history);
			}
			const time = message.querySelector("time");
			time.dateTime = date.toISOString();
			time.textContent = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
			this.appendToLog(message, date);
		}

		disconnectedCallback() {
			if (!this.initialized) return;
			this.contextEvents?.abort();
			this.latestEvents?.abort();
			this.latestObserver?.disconnect();
			this.messageResizeObserver?.disconnect();
			this.messageMutationObserver?.disconnect();
			cancelAnimationFrame(this.messageExpansionFrame);
			clearInterval(this.fileLoadingTimer);
			this.fileLoadingTimer = null;
			this.setFileDragActive(false);
			this.disconnectPanel?.();
			if (this.response) this.finishResponse(true);
		}

		setupContextControls() {
			this.contextPills = this.querySelector("[data-chat-pills]");
			this.fileList = this.querySelector("[data-chat-files]");
			this.fileList.addEventListener("click", event => {
				const restore = event.target.closest("[data-chat-restore-paste]");
				if (restore) {
					this.restorePastedText(restore.dataset.chatRestorePaste);
					return;
				}
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

		isLongPaste(text) {
			const characterLimit = Number(this.getAttribute("paste-character-limit")) || 2000;
			const lineLimit = Number(this.getAttribute("paste-line-limit")) || 20;
			return Boolean(text.trim()) && (text.length > characterLimit || text.split(/\r\n|\r|\n/).length > lineLimit);
		}

		detectPastedFormat(text) {
			const source = text.trim();
			// Inspect plain text, not the HTML clipboard flavour added to rich copies.
			if (/^(?:```|~~~)[\s\S]*\n(?:```|~~~)\s*$/m.test(source)) return { extension: "md", type: "text/markdown" };
			if (/^[\[{]/.test(source)) {
				try { JSON.parse(source); return { extension: "json", type: "application/json" }; } catch { /* Not JSON. */ }
			}
			if (/^<!doctype\s+html\b/i.test(source) || (/^<(?:html|head|body|div|section|article|main|p|table|ul|ol|form|style|script)\b/i.test(source) && /<\/[a-z][\w-]*\s*>/i.test(source))) return { extension: "html", type: "text/html" };
			if (/^(?:export\s+)?(?:interface\s+\w+\s*\{|type\s+\w+\s*=)/m.test(source)) return { extension: "ts", type: "text/typescript" };
			if (/^(?:\/\*[\s\S]*?\*\/\s*)?(?:[.#:@\w*][^{};]*\{)/.test(source) && /\{[^{}]*[\w-]+\s*:\s*[^{};]+;[^{}]*\}/.test(source) && !/\b(?:const|let|function|return)\b/.test(source)) return { extension: "css", type: "text/css" };
			if (/^(?:export\s+(?:default\s+)?)?(?:async\s+)?function\s+\w+\s*\([^)]*\)\s*\{/m.test(source)
				|| /^import\s+.+\s+from\s+['"][^'"]+['"]/m.test(source)
				|| (/^(?:export\s+)?(?:const|let|var)\s+\w+\s*=/m.test(source) && /=>|\breturn\b|\bconsole\.\w+\(/.test(source))) return { extension: "js", type: "text/javascript" };
			if (/^(?:async\s+)?def\s+\w+\([^\n]*\):\s*\n[ \t]+\S/m.test(source)) return { extension: "py", type: "text/x-python" };
			if (/^(?:SELECT\b[\s\S]+\bFROM\s+[\w"[\]`.]|CREATE\s+TABLE\s+[\w"[\]`.]+\s*\()/i.test(source)) return { extension: "sql", type: "application/sql" };
			const markdownSignals = [ /^#{1,6}\s+\S/m, /^\s*[-*+]\s+(?:\[[ xX]\]\s+)?\S/m, /\[[^\]\n]+\]\(https?:\/\/[^\s)]+\)/, /\*\*[^*\n]+\*\*/, /^>\s+\S/m, /^\|?\s*:?-{3,}:?\s*\|/m ];
			if (markdownSignals.filter(pattern => pattern.test(source)).length >= 2) return { extension: "md", type: "text/markdown" };
			return { extension: "txt", type: "text/plain" };
		}

		handleLongPaste(event) {
			const text = event.clipboardData?.getData("text/plain") || "";
			if (!this.isLongPaste(text)) return;
			const format = this.detectPastedFormat(text);
			const file = new File([text], `pasted-text-${++pasteSequence}.${format.extension}`, { type: format.type });
			const selection = window.getSelection();
			let range = null;
			if (selection?.rangeCount && this.composer.contains(selection.getRangeAt(0).startContainer)) {
				range = selection.getRangeAt(0).cloneRange();
				range.collapse(true);
			}
			// Do not delete a selection or alter anything already in the draft.
			event.preventDefault();
			this.attachFiles([file], { text, range, anchor: range?.startContainer });
			this.status.textContent = `Long paste attached as ${file.name}. Existing draft preserved. Use Restore as text to put it back. Nothing was sent.`;
		}

		restorePastedText(id) {
			const item = this.contextFiles.find(item => String(item.id) === id);
			if (!item?.paste) return;
			const { text, range, anchor } = item.paste;
			const valid = range && this.composer.contains(anchor) && this.composer.contains(range.startContainer);
			const insertion = valid ? range.cloneRange() : document.createRange();
			if (!valid) {
				insertion.selectNodeContents(this.composer);
				insertion.collapse(false);
			}
			insertion.collapse(true);
			this.composer.focus({ preventScroll: true });
			const selection = window.getSelection();
			selection.removeAllRanges(); selection.addRange(insertion);
			// A text node preserves the paste's exact line breaks and never executes markup.
			const node = document.createTextNode(text);
			insertion.insertNode(node); insertion.setStartAfter(node); insertion.collapse(true);
			selection.removeAllRanges(); selection.addRange(insertion);
			this.contextFiles = this.contextFiles.filter(candidate => candidate !== item);
			this.startFileLoading(); this.renderFiles(); this.updateSendButton();
			this.status.textContent = "Pasted content restored as text. Nothing was sent.";
		}

		attachFiles(files, paste = null) {
			let added = 0;
			for (const file of files) {
				if (this.contextFiles.some(item => item.file.name === file.name && item.file.size === file.size && item.file.lastModified === file.lastModified)) continue;
				this.contextFiles.push({ id: ++sourceSequence, text: file.name, file, paste, progress: paste ? 100 : 0, loadingStarted: Date.now(), loadingDuration: 3000 + (sourceSequence % 3) * 500 });
				added++;
			}
			this.renderFiles(); this.updateSendButton(); this.composer.focus();
			this.startFileLoading();
			this.status.textContent = added
				? paste ? "Pasted text attached and ready. Nothing is uploaded." : `Simulating loading for ${added} file${added === 1 ? "" : "s"}. Nothing is uploaded.`
				: "Files already attached.";
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
				action.innerHTML = '<span></span>';
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
				row.className = `saFileWrapper saFileVisible${!removable || item.paste ? " saExistingFile" : ""}`;
				// Reuse the icon names supported by the upload component's colour mixin.
				const fileIcon = this.getFileIcon(item.file);
				const icon = { "fa-file-image": "fa-image", "fa-file-audio": "fa-music", "fa-file-video": "fa-video", "fa-file-code": "fa-code" }[fileIcon] || fileIcon;
				row.innerHTML = `<div class="saFileIconWrapper"><i class="saFileIcon saIcon fas ${icon}" aria-hidden="true"></i>
						<div class="saLoadingWrapper saLoadingDark" aria-hidden="true">
							<svg class="saLoading" viewBox="0 0 24 24"><circle class="saLoadingCircle" cx="12" cy="12" r="12" fill="none"></circle><path class="saLoadingCheck" d="M6.29,12.58l3.14,3.19c.15,.15,.39,.15,.53,0l7.75-7.8" fill="none"></path></svg>
							<div class="saLoadingSpinner"></div>
						</div></div>
					<div class="saFile">
						<div class="saFileNameWrapper"><button type="button" class="saFileName saFilePreviewLink" aria-expanded="false"></button></div>
						<div class="saFileSizeWrapper"><div class="saFileSizeRow"><span class="saFileSize"></span><span class="saFileUploadProgressText" aria-hidden="true"></span></div><progress class="saFileUploadProgress" max="100" value="0"></progress></div>
					</div>`;
				row.querySelector(".saFileName").textContent = item.file.name;
				row.querySelector(".saFileName").title = item.file.name;
				const preview = row.querySelector(".saFilePreviewLink");
				preview.setAttribute("aria-label", `View ${item.file.name}`);
				preview.addEventListener("click", () => this.openFilePreview(item.file, preview));
				row.querySelector(".saFileSize").textContent = this.formatFileSize(item.file.size);
				row.title = `${item.file.name} — ${item.file.size.toLocaleString()} bytes — local attachment`;
				row.querySelector("progress").setAttribute("aria-label", `Simulated loading: ${item.file.name}`);
				this.updateFileLoading(row, item);
				if (removable) {
					if (item.paste) {
						row.classList.add("saPastedText");
						const restore = document.createElement("button");
						restore.type = "button";
						restore.className = "saChatMessageAction saChatRestorePaste";
						restore.textContent = "Restore as text";
						restore.setAttribute("aria-label", `Restore ${item.file.name} as text`);
						restore.dataset.chatRestorePaste = String(item.id);
						row.querySelector(".saFile").append(restore);
					}
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

		openFilePreview(file, origin) {
			const panel = this.isInline ? this : this.closest(".saRightFrameRoot")?.parentElement.querySelector(":scope > chat-inline");
			if (panel?.openFile) panel.openFile(file, origin);
			else this.status.textContent = "The file viewer is not available on this page.";
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
			for (const [text, state] of this.messageExpanders) {
				if (source.target.contains(text)) {
					state.expanded = true;
					this.updateMessageExpansion(text, state);
				}
			}
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

		appendMessage(text, context = null, contextItems = [], date = new Date()) {
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
			const time = message.querySelector("time");
			time.dateTime = date.toISOString();
			time.textContent = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
			if ((context || contextItems.length) && !text.trim()) message.querySelector("footer").remove();
			this.emptyMessage.remove();
			this.appendToLog(message, date);
			this.addMessageExpansion(message);
			this.scroll.scrollTop = this.scroll.scrollHeight;
		}

		observeMessageExpansion() {
			this.messageResizeObserver?.disconnect();
			this.messageMutationObserver?.disconnect();
			const refresh = () => {
				cancelAnimationFrame(this.messageExpansionFrame);
				this.messageExpansionFrame = requestAnimationFrame(() => {
					for (const [text, state] of this.messageExpanders) {
						if (!this.log.contains(text)) {
							this.messageResizeObserver.unobserve(text);
							this.messageExpanders.delete(text);
						} else this.updateMessageExpansion(text, state);
					}
				});
			};
			this.messageResizeObserver = new ResizeObserver(refresh);
			for (const text of this.messageExpanders.keys()) this.messageResizeObserver.observe(text);
			this.messageMutationObserver = new MutationObserver(refresh);
			this.messageMutationObserver.observe(this.log, { childList: true, subtree: true, characterData: true });
			refresh();
		}

		addMessageExpansion(message) {
			const text = message.querySelector(".saChatMessageBodyInner > p");
			if (!text) return;
			text.classList.add("saChatMessageText");
			text.id = `chat-message-text-${++messageSequence}`;
			const button = document.createElement("button");
			button.type = "button";
			button.className = "saChatMessageExpand";
			button.hidden = true;
			button.setAttribute("aria-controls", text.id);
			button.setAttribute("aria-expanded", "false");
			button.textContent = "Show more";
			const state = { button, expanded: false };
			button.addEventListener("click", () => {
				state.expanded = !state.expanded;
				this.updateMessageExpansion(text, state);
			});
			message.querySelector(".saChatMessageBodyInner").append(button);
			this.messageExpanders.set(text, state);
			this.messageResizeObserver.observe(text);
			this.updateMessageExpansion(text, state);
		}

		updateMessageExpansion(text, state) {
			if (!text.getClientRects().length) return;
			const configured = Number(this.getAttribute("message-line-limit"));
			const lines = Number.isInteger(configured) && configured > 0 ? configured : 6;
			text.style.setProperty("--sa-chat-message-lines", String(lines));
			const lineHeight = parseFloat(getComputedStyle(text).lineHeight);
			const overflowing = text.scrollHeight > lineHeight * lines + 1;
			if (!overflowing) state.expanded = false;
			text.classList.toggle("saCollapsed", overflowing && !state.expanded);
			state.button.hidden = !overflowing;
			state.button.setAttribute("aria-expanded", String(state.expanded));
			const label = state.expanded ? "Show less" : "Show more";
			if (state.button.textContent !== label) state.button.textContent = label;
			this.updateLatest();
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
			const paragraph = document.createElement("p");
			paragraph.hidden = true;
			message.querySelector(".saChatMessageContent").append(paragraph);
			const response = {
				message, thinking, paragraph, text: "",
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
