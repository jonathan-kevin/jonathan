// Shared toast runtime used by every page and the toast creator demo.
(() => {
	const DEFAULT_DURATION = 5000;
	const CLOSED_ANIMATION_DURATION = 200;
	const LIVE_REGION_DELAY = 100;
	const TYPE_ICONS = {
		success: 'circle-check',
		warning: 'triangle-exclamation',
		error: 'octagon-xmark',
		info: 'circle-info'
	};
	const activeTimers = new Set();
	const activeToastGestures = new Set();
	let toastPointerHovered = false;
	let toastGroup = null;

	function getToastGroup() {
		if (toastGroup?.isConnected) return toastGroup;
		toastGroup = document.querySelector('.saToastGroup');
		if (!toastGroup) {
			toastGroup = document.createElement('div');
			toastGroup.className = 'saToastGroup';
			toastGroup.id = 'toastGroup';
			const content = document.querySelector('.saRootContentWrapper');
			if (content) content.after(toastGroup);
			else document.body.append(toastGroup);
		}
		toastGroup.addEventListener('pointerenter', event => {
			if (event.pointerType === 'touch') return;
			toastPointerHovered = true;
			syncTimerPauseState();
		});
		toastGroup.addEventListener('pointerleave', event => {
			if (event.pointerType === 'touch') return;
			toastPointerHovered = false;
			syncTimerPauseState();
		});
		toastGroup.addEventListener('focusin', syncTimerPauseState);
		toastGroup.addEventListener('focusout', syncTimerPauseState);

		return toastGroup;
	}

	function escapeHTML(value) {
		const characters = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
		return String(value).replace(/[&<>"']/g, character => characters[character]);
	}

	function getSafeLinkHref(value) {
		try {
			const url = new URL(value, document.baseURI);
			return ['http:', 'https:'].includes(url.protocol) ? value : null;
		} catch {
			return null;
		}
	}

	function renderInlineMarkdown(value, allowLinks = true) {
		const inlineTokens = [];
		const addToken = html => {
			const index = inlineTokens.push(html) - 1;
			return `\uE000${index}\uE001`;
		};
		let source = String(value).replace(/\s*[\r\n]+\s*/g, ' ');

		// Preserve Markdown-escaped punctuation before interpreting formatting.
		source = source.replace(/\\([!"#$%&'()*+,\-.\/:;<=>?@\[\\\]^_`{|}~])/g, (_, character) => addToken(escapeHTML(character)));
		source = source.replace(/`([^`]+)`/g, (_, code) => addToken(`<code>${escapeHTML(code)}</code>`));

		if (allowLinks) {
			source = source.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (markdown, label, href) => {
				const safeHref = getSafeLinkHref(href);
				return safeHref
					? addToken(`<a href="${escapeHTML(safeHref)}">${renderInlineMarkdown(label, false)}</a>`)
					: markdown;
			});
		}

		let html = escapeHTML(source);
		html = html
			.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>')
			.replace(/___([^_]+)___/g, '<strong><em>$1</em></strong>')
			.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
			.replace(/__([^_]+)__/g, '<strong>$1</strong>')
			.replace(/~~([^~]+)~~/g, '<del>$1</del>')
			.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1<em>$2</em>')
			.replace(/(^|[^_])_([^_]+)_(?!_)/g, '$1<em>$2</em>');

		return html.replace(/\uE000(\d+)\uE001/g, (token, index) => inlineTokens[Number(index)] ?? token);
	}

	function renderIcon({ icon, type }) {
		const overrideClasses = String(icon || '').trim().split(/\s+/);
		const overrideName = overrideClasses.filter(value => /^fa-[a-z0-9-]+$/i.test(value) && !/^fa-(solid|regular|brands)$/i.test(value)).pop();
		const name = String(overrideName || icon || TYPE_ICONS[type]).replace(/^fa-/, '').replace(/[^a-z0-9-]/gi, '') || TYPE_ICONS[type];
		return `<i class="fas fa-${name} saIcon saToastIcon" aria-hidden="true"></i>`;
	}

	function getAccessibleMessage(value) {
		const container = document.createElement('span');
		container.innerHTML = renderInlineMarkdown(value);
		return container.textContent.trim() || 'Notification';
	}

	function renderToast(message, options) {
		const urgent = options.type === 'error' || options.type === 'alert';
		const dismissLabel = `Dismiss notification: ${getAccessibleMessage(message)}`;
		return `
			${renderIcon(options)}
			<div class="saToastText saMarkdownContent" role="${urgent ? 'alert' : 'status'}"${urgent ? '' : ' aria-live="polite"'} aria-relevant="additions text" aria-atomic="true"></div>
			<button type="button" class="saCloseButton" aria-label="${escapeHTML(dismissLabel)}">
				<i class="far fa-xmark saIcon" aria-hidden="true"></i>
			</button>`;
	}

	function createToast(message, options = {}) {
		const div = document.createElement('div');
		let timer = null;
		let renderTimeout = null;
		let renderedMessage = null;
		let closed = false;
		let currentMessage = message;
		let currentOptions = options;
		const returnFocusTo = options.returnFocusTo;
		div.innerHTML = renderToast(message, options);
		const messageElement = div.querySelector('.saToastText');
		const dismissButton = div.querySelector('.saCloseButton');

		const close = () => {
			if (closed) return;
			const shouldRestoreFocus = div.contains(document.activeElement);
			closed = true;
			cancelSwipe();
			clearTimeout(renderTimeout);
			timer?.cancel();
			div.classList.add('saClosed');
			setTimeout(() => {
				div.remove();
				if (shouldRestoreFocus && returnFocusTo?.isConnected) returnFocusTo.focus();
			}, CLOSED_ANIMATION_DURATION);
		};

		const startAutoDismiss = () => {
			if (currentOptions.persistent || closed) return;
			timer = attachTimer(currentOptions.duration ?? DEFAULT_DURATION, close);
			syncTimerPauseState();
		};

		dismissButton.addEventListener('click', close);
		const cancelSwipe = attachSwipeToDismiss(div, close);

		div.updateToast = (nextMessage, nextOptions) => {
			if (closed) return;
			cancelSwipe();
			clearTimeout(renderTimeout);
			timer?.cancel();
			timer = null;
			currentMessage = nextMessage;
			currentOptions = nextOptions;

			const typeClass = {
				success: 'saSuccess',
				warning: 'saWarning',
				error: 'saError',
				info: 'saInfo'
			}[currentOptions.type] || currentOptions.type || '';

			div.className = `saToast ${typeClass}`.trim();
			div.querySelector('.saToastIcon').outerHTML = renderIcon(currentOptions);
			dismissButton.setAttribute('aria-label', `Dismiss notification: ${getAccessibleMessage(currentMessage)}`);
			const urgent = currentOptions.type === 'error' || currentOptions.type === 'alert';
			messageElement.setAttribute('role', urgent ? 'alert' : 'status');
			if (urgent) {
				messageElement.removeAttribute('aria-live');
			} else {
				messageElement.setAttribute('aria-live', 'polite');
			}

			// Let assistive technology register the empty live region before filling it.
			// Keep that same element for updates, and start the timer once text is visible.
			renderTimeout = setTimeout(() => {
				if (closed || !div.isConnected) return;
				const html = renderInlineMarkdown(currentMessage);
				if (html !== renderedMessage) {
					messageElement.innerHTML = html;
					renderedMessage = html;
				}
				startAutoDismiss();
			}, LIVE_REGION_DELAY);
		};

		div.updateToast(message, options);

		return div;
	}

	function attachSwipeToDismiss(toast, onDismiss) {
		let gesture = null;
		let suppressClickUntil = 0;

		function reset() {
			if (!gesture) return;
			const { pointerId, dragging } = gesture;
			gesture = null;
			if (dragging) suppressClickUntil = performance.now() + 400;
			toast.classList.remove('saDragging');
			toast.style.removeProperty('--toast-drag-y');
			if (toast.hasPointerCapture(pointerId)) toast.releasePointerCapture(pointerId);
			activeToastGestures.delete(toast);
			syncTimerPauseState();
		}

		function recordSample(event) {
			gesture.samples.push({ y: event.clientY, time: event.timeStamp });
			gesture.samples = gesture.samples.filter(sample => event.timeStamp - sample.time <= 120);
		}

		toast.addEventListener('pointerdown', event => {
			if (gesture || !event.isPrimary || event.button !== 0 || toast.classList.contains('saClosed')) return;
			if (event.target.closest('a, button, input, select, textarea, [contenteditable]')) return;
			if (event.pointerType === 'mouse') event.preventDefault();
			gesture = {
				pointerId: event.pointerId,
				startX: event.clientX,
				startY: event.clientY,
				distance: 0,
				dragging: false,
				samples: [{ y: event.clientY, time: event.timeStamp }]
			};
			toast.setPointerCapture(event.pointerId);
			activeToastGestures.add(toast);
			syncTimerPauseState();
		});

		toast.addEventListener('pointermove', event => {
			if (!gesture || gesture.pointerId !== event.pointerId) return;
			const dx = event.clientX - gesture.startX;
			const dy = event.clientY - gesture.startY;
			if (!gesture.dragging) {
				if (Math.hypot(dx, dy) < 8) return;
				// The browser keeps upward/horizontal panning; only downward intent starts a drag.
				if (dy <= 0 || Math.abs(dx) >= dy) {
					reset();
					return;
				}
				gesture.dragging = true;
				toast.classList.add('saDragging');
			}
			if (event.cancelable) event.preventDefault();
			gesture.distance = Math.max(0, dy);
			recordSample(event);
			toast.style.setProperty('--toast-drag-y', gesture.distance + 'px');
		});

		toast.addEventListener('pointerup', event => {
			if (!gesture || gesture.pointerId !== event.pointerId) return;
			recordSample(event);
			const first = gesture.samples[0];
			const velocity = (event.clientY - first.y) / Math.max(1, event.timeStamp - first.time);
			const distance = Math.max(0, event.clientY - gesture.startY);
			// Keep the bottom toast dismissible before the finger reaches the screen edge.
			const threshold = Math.max(24, Math.min(80, toast.offsetHeight * 0.6, (window.innerHeight - gesture.startY) * 0.75));
			const dismiss = gesture.dragging && (distance >= threshold || (distance >= 24 && velocity >= 0.65));
			if (dismiss) {
				const originalTop = toast.getBoundingClientRect().top - gesture.distance;
				const exitY = Math.max(distance + toast.offsetHeight, window.innerHeight - originalTop + 16);
				toast.style.setProperty('--toast-exit-y', exitY + 'px');
			}
			reset();
			if (dismiss) onDismiss();
		});

		for (const eventName of ['pointercancel', 'lostpointercapture']) {
			toast.addEventListener(eventName, event => {
				if (gesture?.pointerId === event.pointerId) reset();
			});
		}
		toast.addEventListener('click', event => {
			if (event.detail !== 0 && performance.now() < suppressClickUntil) {
				event.preventDefault();
				event.stopPropagation();
			}
		}, true);
		return reset;
	}

	function attachTimer(duration, onDone) {
		let endTime = performance.now() + duration;
		let remaining = duration;
		let timeout;
		let paused = false;
		let canceled = false;
		let controls;

		function finish() {
			if (paused || canceled) return;
			cancel();
			onDone();
		}

		function cancel() {
			canceled = true;
			clearTimeout(timeout);
			activeTimers.delete(controls);
		}

		function pause() {
			if (paused || canceled) return;
			paused = true;
			remaining = Math.max(0, endTime - performance.now());
			clearTimeout(timeout);
		}

		function resume() {
			if (!paused || canceled) return;
			paused = false;
			endTime = performance.now() + remaining;
			timeout = setTimeout(finish, remaining);
		}

		controls = { pause, resume, cancel };
		activeTimers.add(controls);
		timeout = setTimeout(finish, remaining);
		return controls;
	}

	function syncTimerPauseState() {
		const method = activeToastGestures.size > 0 || toastPointerHovered || toastGroup.matches(':focus-within') ? 'pause' : 'resume';
		activeTimers.forEach(timer => timer[method]());
	}


	window.saToast = {
		show(message, options = {}) {
			const group = getToastGroup();
			const toast = createToast(message, {
				type: 'info',
				duration: DEFAULT_DURATION,
				returnFocusTo: document.activeElement,
				...options
			});
			group.append(toast);
			return toast;
		}
	};
})();

$(document).ready(function () {
	const $fontToggle = $('#toggleFont');
	let activeFont = getComputedStyle(document.documentElement).getPropertyValue('--Font').includes('Geist') ? 'Geist' : 'Lexend';

	function setFont(font) {
		activeFont = font;
		document.documentElement.style.setProperty('--Font', `'${font}', sans-serif`);
		const nextFont = font === 'Lexend' ? 'Geist' : 'Lexend';
		$fontToggle.attr({
			'aria-label': `Switch to ${nextFont}`,
			'aria-pressed': String(font === 'Geist'),
			title: `Switch to ${nextFont}`
		});
	}

	$fontToggle.on('click', function () {
		setFont(activeFont === 'Lexend' ? 'Geist' : 'Lexend');
	});
	setFont(activeFont);

	function updateClasses() {
		const isSmall = $(window).width() <= 640;

		const $body = $('body');
		const $bodyAlt = $('#body');

		if (isSmall) {
			$body
				.removeClass('saLargeScreen saPc')
				.addClass('saSmallScreen saSmallscreensidebar saSmallScreenSidebarJs saMobile');

			$bodyAlt
				.removeClass('saLargeScreen saCompact saPc') // assuming this exists on large
				.addClass('smallscreen saSmallScreen saSmallScreenJs saMobile');
		} else {
			$body
				.removeClass('saSmallScreen saSmallscreensidebar saSmallScreenSidebarJs saMobile')
				.addClass('saLargeScreen saPc');

			$bodyAlt
				.removeClass('smallscreen saSmallScreen saSmallScreenJs saMobile')
				.addClass('saLargeScreen saCompact saPc');
		}
	}

	updateClasses();

	$(window).on('resize', function () {
		updateClasses();
	});

	const $sideBar = $('#SideBar');
	const $sideBarExpander = $('button.saExpander');

	function updateSidebarToggleState() {
		const isExpanded = $sideBar.hasClass('saExpanded');
		const action = isExpanded ? 'Minimize sidebar' : 'Expand sidebar';

		$sideBarExpander.attr({
			'aria-expanded': String(isExpanded),
			'aria-label': action,
			'aria-keyshortcuts': 'M',
			'title': `${action} (M)`
		});
	}

	function toggleSidebar() {
		const shouldMinimize = $sideBar.hasClass('saExpanded');
		$sideBar.toggleClass('saExpanded', !shouldMinimize);
		$sideBar.toggleClass('saMinimized', shouldMinimize);
		updateSidebarToggleState();
	}

	$sideBarExpander.on('click', toggleSidebar);

	$('.saEnvironmentTextInput').on('input', function () {
		// Escape the value as a CSS string for use by the stamp's content property.
		const text = this.value.replace(/["\\\u0000-\u001f\u007f]/g, character =>
			`\\${character.charCodeAt(0).toString(16)} `);
		document.documentElement.style.setProperty(this.dataset.cssVariable, `"${text}"`);
		const environment = this.closest('.saEnvironmentGroup').dataset.environment;
		document.getElementById(environment).click();
	}).on('keydown', function (event) {
		if (event.key === 'Enter') event.preventDefault();
	});

	$(document).on('click', '#dev', function () {
		$('.saRootBody').removeClass('saAdminInProd saStage').addClass('saDev');
		$('#toastWarning').hide();
		$('button').removeClass('saOpen')
		$(this).addClass('saOpen')
	});

	$(document).on('click', '#stage', function () {
		$('.saRootBody').removeClass('saAdminInProd saDev').addClass('saStage');
		$('#toastWarning').hide();
		$('button').removeClass('saOpen')
		$(this).addClass('saOpen')
	});

	$(document).on('click', '#admin', function () {
		$('.saRootBody').removeClass('saDev saStage').addClass('saAdminInProd');
		$('#toastWarning').show();
		$('button').removeClass('saOpen')
		$(this).addClass('saOpen')
	});

	$(document).on('click', '#toastWarning .saCloseButton', function () {
		$('#toastWarning').hide();
	});

	$(document).on('keydown', function (event) {
		const isEditable = event.target.isContentEditable
			|| $(event.target).closest('input, select, textarea, [role="textbox"], [role="searchbox"], [role="combobox"], [role="listbox"], [role="spinbutton"]').length > 0;
		const isSidebarShortcut =
			!event.altKey
			&& !event.ctrlKey
			&& !event.metaKey
			&& !event.shiftKey
			&& event.key.toLowerCase() === 'm';

		if (!isSidebarShortcut || isEditable || event.repeat || event.originalEvent?.isComposing
			|| event.isDefaultPrevented() || $('body').hasClass('saSmallScreen')) return;

		event.preventDefault();
		toggleSidebar();
	});

	updateSidebarToggleState();

	// Both mobile dialogs can be open at once; only the last one unlocks the page.
	const overlayScrollLocks = new Set();
	let originalBodyOverflow;
	function setOverlayScrollLock(owner, locked) {
		if (locked) {
			if (overlayScrollLocks.has(owner)) return;
			if (!overlayScrollLocks.size) originalBodyOverflow = document.body.style.overflow;
			overlayScrollLocks.add(owner);
			document.body.style.overflow = 'hidden';
		} else if (overlayScrollLocks.delete(owner) && !overlayScrollLocks.size) {
			document.body.style.overflow = originalBodyOverflow;
		}
	}

	const sidebarMobile = window.matchMedia('(max-width: 640px)');
	const $sidebarOuter = $('.saSideBarOuter').first();
	const sidebarDesktopPosition = document.createComment('Desktop sidebar position');
	if ($sidebarOuter.length) $sidebarOuter[0].before(sidebarDesktopPosition);
	const $sidebarDialog = $sidebarOuter.length ? $('<dialog>', {
		id: 'saMobileSidebarDialog',
		class: 'saSideBarSmallScreenOverlay',
		'aria-label': 'Main menu'
	}) : $();
	$('.saSideBarSmallScreenOverlay').remove();
	$sidebarDialog.prependTo(document.body);
	const $sidebarClosers = $sidebarOuter.find('button.saNavigator').attr('aria-label', 'Close menu');
	const $sidebarOpeners = $('button.saNavigator').not($sidebarClosers).attr({
		'aria-label': 'Open menu', 'aria-haspopup': 'dialog',
		'aria-controls': 'saMobileSidebarDialog', 'aria-expanded': 'false'
	});
	let sidebarReturnFocus;

	function setMobileSidebarOpen(isOpen, restoreFocus = true, closeAccount = true) {
		const dialog = $sidebarDialog[0];
		if (!dialog || (isOpen && !sidebarMobile.matches)) return;
		if (isOpen) {
			if (dialog.open) return;
			sidebarReturnFocus = document.activeElement;
			$sidebarOuter.removeClass('saClosed').appendTo($sidebarDialog);
			setOverlayScrollLock('sidebar', true);
			dialog.showModal();
			$sidebarDialog.addClass('saVisible');
			$sidebarClosers.first().trigger('focus');
		} else {
			if (closeAccount && document.querySelector('dialog.saBottomSheetOverlay[open]')) setAccountMenuOpen(false);
			$sidebarOuter.addClass('saClosed');
			if (dialog.open) dialog.close();
			$sidebarDialog.removeClass('saVisible');
			sidebarDesktopPosition.after($sidebarOuter[0]);
			setOverlayScrollLock('sidebar', false);
			if (restoreFocus && sidebarReturnFocus?.isConnected) sidebarReturnFocus.focus();
		}
		$sidebarOpeners.attr('aria-expanded', String(isOpen));
	}
	$sidebarOpeners.on('click', function () { setMobileSidebarOpen(true); });
	$sidebarClosers.on('click', function () { setMobileSidebarOpen(false); });
	$sidebarDialog.on('cancel', function (event) {
		event.preventDefault();
		setMobileSidebarOpen(false);
	}).on('click', function (event) {
		if (event.target === this) setMobileSidebarOpen(false);
	});
	$sidebarOuter.on('click', 'a[href]', function () {
		if ($sidebarDialog[0]?.open) setMobileSidebarOpen(false);
	});
	window.addEventListener('resize', function () {
		if (!sidebarMobile.matches && $sidebarDialog[0]?.open) setMobileSidebarOpen(false, false, false);
	});

	$(document).on('click', '.saInfoBoxHeadingButton', function () {
		const $headingButton = $(this);
		const $infoBox = $headingButton.closest('.saInfoBox');
		const shouldOpen = !$infoBox.hasClass('saOpen');

		$infoBox
			.toggleClass('saOpen', shouldOpen)
			.toggleClass('saClosed', !shouldOpen);
		$headingButton.attr('aria-expanded', String(shouldOpen));
	});

	const $InfoBoxButton = $('.saCopyButton');
	let $AriaLabelTooltip = null;
	let ariaLabelTooltipTarget = null;

	function removeAriaLabelTooltip() {
		if ($AriaLabelTooltip) $AriaLabelTooltip.remove();

		$AriaLabelTooltip = null;
		ariaLabelTooltipTarget = null;
	}

	function positionAriaLabelTooltip() {
		if (!$AriaLabelTooltip || !ariaLabelTooltipTarget) return;

		const targetRect = ariaLabelTooltipTarget.getBoundingClientRect();
		$AriaLabelTooltip.css({
			left: `${targetRect.left + targetRect.width / 2}px`,
			top: `${targetRect.top - 8}px`
		});
	}

	$(document).on('mouseenter', '[aria-label]', function () {
		if (!$('body').hasClass('saLargeScreen')) return;

		const label = $(this).attr('aria-label');
		if (!label) return;

		removeAriaLabelTooltip();
		ariaLabelTooltipTarget = this;
		$AriaLabelTooltip = $('<div>', {
			class: 'saTooltipRoot saAriaLabelTooltip',
			'aria-hidden': 'true',
			text: label
		}).css({
			position: 'fixed',
			transform: 'translate(-50%, -100%)'
		}).appendTo('body');

		positionAriaLabelTooltip();
	}).on('mouseleave', '[aria-label]', function () {
		if (ariaLabelTooltipTarget === this) removeAriaLabelTooltip();
	});

	$(window).on('resize scroll', function () {
		if (!$('body').hasClass('saLargeScreen')) {
			removeAriaLabelTooltip();
			return;
		}

		positionAriaLabelTooltip();
	});

	function getInfoBoxCopyText(button) {
		const $content = $(button).closest('.saInfoBoxContent');
		const table = $content.find('.saBoxTable').get(0);

		if (table) {
			return Array.from(table.rows, function (row) {
				return Array.from(row.cells, function (cell) {
					return cell.innerText.trim();
				}).join('\t');
			}).join('\n');
		}

		const textContent = $(button).closest('.saInfoBoxTextContent').get(0);
		const copySource = textContent || $content.get(0);
		return copySource?.innerText.trim() || '';
	}

	async function copyTextToClipboard(text) {
		if (navigator.clipboard?.writeText) {
			try {
				await navigator.clipboard.writeText(text);
				return;
			} catch (error) {
				// Fall back for browsers that expose the API but block clipboard access.
			}
		}

		const $textArea = $('<textarea>', {
			value: text,
			'aria-hidden': 'true'
		}).css({
			position: 'fixed',
			left: '-9999px'
		}).appendTo('body');

		$textArea.get(0).select();
		const didCopy = document.execCommand('copy');
		$textArea.remove();

		if (!didCopy) throw new Error('Unable to copy text to the clipboard.');
	}

	$InfoBoxButton.on('click', async function () {
		const $button = $(this);
		const copyLabel = $button.data('saCopyLabel') || $button.attr('aria-label');
		const copiedLabel = copyLabel.replace(/^Copy\b/, 'Copied');
		$button.data('saCopyLabel', copyLabel);

		try {
			await copyTextToClipboard(getInfoBoxCopyText(this));

			const previousTimeout = $button.data('saCopiedTimeout');
			if (previousTimeout) clearTimeout(previousTimeout);

			$button.addClass('saCopied').attr('aria-label', copiedLabel);
			if (ariaLabelTooltipTarget === this) $AriaLabelTooltip.text(copiedLabel);

			$button.data('saCopiedTimeout', setTimeout(function () {
				$button.removeClass('saCopied')
					.attr('aria-label', copyLabel)
					.removeData('saCopiedTimeout');

				if (ariaLabelTooltipTarget === $button.get(0)) {
					$AriaLabelTooltip.text(copyLabel);
				}
			}, 2000));
		} catch (error) {
			console.error('Failed to copy InfoSQL content.', error);
		}
	});

	function getChatBodyContent(body) {
		return body.querySelector(':scope > .saChatMessageBodyInner') || body;
	}

	function getChatMessageCopyText(button) {
		const assistantContent = button.closest('.saChatAiResponse article')?.querySelector('.saChatMessageContent');
		if (assistantContent) {
			return Array.from(assistantContent.children)
				.filter(element => !element.matches('[hidden], [data-chat-intro], [data-chat-tool-history], .saChatMessageAction'))
				.map(element => element.innerText.trim())
				.filter(Boolean)
				.join('\n\n');
		}

		const inlineBody = button.closest(':is(chat-inline, softadmin-chat[data-chat-interactive]) .saChatSender article')?.querySelector('.saChatMessageBody');
		if (inlineBody) {
			return Array.from(inlineBody.querySelectorAll(':scope > blockquote, :scope > p, :scope > .saChatMessageBodyInner > p'))
				.map(element => element.innerText.trim())
				.filter(Boolean)
				.join('\n\n');
		}

		const messageContent = $(button)
			.closest('article')
			.find('.saChatMessageContent, .saChatMessageBody > .saMarkdownContent, .saChatMessageBodyInner > .saMarkdownContent')
			.get(0);

		return messageContent?.innerText.trim() || '';
	}

	let chatEditorSequence = 0;

	function updateChatEditSaveState(editor) {
		const $editor = $(editor);
		const hasText = Boolean($editor.find('.saChatTextarea').get(0)?.innerText.trim());
		$editor.find('.saChatSaveEditButton').prop('disabled', !hasText);
	}

	function focusChatEditor(editable) {
		editable.focus();

		const selection = window.getSelection();
		if (!selection) return;

		const range = document.createRange();
		range.selectNodeContents(editable);
		range.collapse(false);
		selection.removeAllRanges();
		selection.addRange(range);
	}

	function beginChatMessageEdit(button) {
		const $button = $(button);
		const $messageBody = $button.closest('article').find('.saChatMessageBody').first();
		if (!$messageBody.length || $messageBody.hasClass('saChatEdit')) return;

		const editorId = `sa-chat-message-editor-${++chatEditorSequence}`;
		const messageText = $(getChatBodyContent($messageBody.get(0))).children('p').first().text();
		const $messageEdit = $('<div>', { class: 'saChatMessageEdit' });
		const $editable = $('<div>', {
			class: 'saChatTextarea',
			contenteditable: 'plaintext-only',
			role: 'textbox',
			'aria-label': 'Edit message',
			'aria-multiline': 'true',
			id: editorId,
			text: messageText
		});
		const $buttonGroup = $('<div>', { class: 'saChatButtonGroup' });

		$('<label>', {
			class: 'saScreenReaderOnly',
			for: editorId,
			text: 'Edit message'
		}).appendTo($messageEdit);

		$editable.appendTo($messageEdit);
		$('<button>', {
			class: 'saDefaultButtonPrimary saChatSaveEditButton',
			type: 'submit',
			text: 'Save'
		}).appendTo($buttonGroup);
		$('<button>', {
			class: 'saDefaultButtonSecondary saChatCancelEditButton',
			type: 'reset',
			text: 'Cancel'
		}).appendTo($buttonGroup);
		$buttonGroup.appendTo($messageEdit);

		$messageBody.addClass('saChatEdit').append($messageEdit);
		$button.attr({ 'aria-expanded': 'true', 'aria-controls': editorId });
		updateChatEditSaveState($messageEdit);
		focusChatEditor($editable.get(0));
	}

	function finishChatMessageEdit(button, shouldSave) {
		const $messageEdit = $(button).closest('.saChatMessageEdit');
		const $messageBody = $messageEdit.closest('.saChatMessageBody');
		const $editButton = $messageBody.closest('article').find('.saChatEditButton').first();

		if (shouldSave) {
			const messageText = $messageEdit.find('.saChatTextarea').get(0)?.innerText.trim() || '';
			if (!messageText) {
				focusChatEditor($messageEdit.find('.saChatTextarea').get(0));
				return;
			}

			$(getChatBodyContent($messageBody.get(0))).children('p').first().text(messageText);
		}

		$messageEdit.remove();
		$messageBody.removeClass('saChatEdit');
		$editButton.attr('aria-expanded', 'false').removeAttr('aria-controls').trigger('focus');
	}

	$(document).on('click', '.saChatEditButton', function () {
		beginChatMessageEdit(this);
	});

	$(document).on('input', '.saChatMessageEdit .saChatTextarea', function () {
		updateChatEditSaveState($(this).closest('.saChatMessageEdit'));
	});

	$(document).on('click', '.saChatSaveEditButton', function (event) {
		event.preventDefault();
		finishChatMessageEdit(this, true);
	});

	$(document).on('click', '.saChatCancelEditButton', function (event) {
		event.preventDefault();
		finishChatMessageEdit(this, false);
	});

	$(document).on('keydown', '.saChatMessageEdit .saChatTextarea', function (event) {
		if (event.key !== 'Escape') return;

		event.preventDefault();
		finishChatMessageEdit(this, false);
	});

	$('.saChatMessageEdit').each(function () {
		updateChatEditSaveState(this);
	});

	$(document).on('click', '.saChatCopyButton', async function () {
		const $button = $(this);
		const copyLabel = $button.data('saCopyLabel') || $button.attr('aria-label') || 'Copy';
		const copiedLabel = copyLabel.replace(/^Copy\b/, 'Copied');
		$button.data('saCopyLabel', copyLabel);

		try {
			await copyTextToClipboard(getChatMessageCopyText(this));

			const previousTimeout = $button.data('saCopiedTimeout');
			if (previousTimeout) clearTimeout(previousTimeout);

			$button
				.addClass('saCopied')
				.attr({ 'aria-label': copiedLabel, 'data-tooltip': copiedLabel });

			if (ariaLabelTooltipTarget === this) $AriaLabelTooltip.text(copiedLabel);

			$button.data('saCopiedTimeout', setTimeout(function () {
				$button
					.removeClass('saCopied')
					.attr({ 'aria-label': copyLabel, 'data-tooltip': copyLabel })
					.removeData('saCopiedTimeout');

				if (ariaLabelTooltipTarget === $button.get(0)) {
					$AriaLabelTooltip.text(copyLabel);
				}
			}, 2000));
		} catch (error) {
			console.error('Failed to copy chat message.', error);
		}
	});


	// Pages only need an account button; keep the shared menu in one place.
	function createAccountMenu($trigger) {
		if (!$trigger.length) return $();

		return $(`
			<ul class="saContextMenu saProfileMenu saNorth" id="saAccountMenu" role="menu" aria-label="Account" aria-hidden="true">
				<li role="none" data-theme-layout="options">
					<div class="saContextMenuHeading">Theme</div>
				</li>
				${[['system', 'System', 'desktop'], ['light', 'Light', 'sun-alt'], ['dark', 'Dark', 'moon'], ['contrast', 'High contrast', 'circle-half-stroke']].map(([value, label, icon]) => `
					<li role="none" data-theme-layout="options">
						<button class="saOptionWrapper" type="button" role="menuitemradio" aria-checked="false" data-theme-choice="${value}" tabindex="-1">
							<div class="saOption">
								<i class="far fad fa-${icon} saIcon saOptionIcon" aria-hidden="true"></i>
								<div class="saOptionText"><div class="saOptionTitle">${label}</div></div>
							</div>
						</button>
					</li>`).join('')}
				<li role="group" aria-label="Theme" class="saRow" data-theme-layout="buttons">
					<button class="saOptionWrapper" type="button" role="menuitemradio" aria-checked="true" data-theme-choice="system" tabindex="-1">
						<div class="saOption saOptionButton">
							<i class="far fad fa-desktop saIcon saOptionIcon" aria-hidden="true"></i>
							<div class="saOptionText">
								<div class="saOptionTitle">System</div>
							</div>
						</div>
					</button>
					<button class="saOptionWrapper" type="button" role="menuitemradio" aria-checked="false" data-theme-choice="light" tabindex="-1">
						<div class="saOption saOptionButton">
							<i class="far fad fa-sun-alt saIcon saOptionIcon" aria-hidden="true"></i>
							<div class="saOptionText">
								<div class="saOptionTitle">Light</div>
							</div>
						</div>
					</button>
					<button class="saOptionWrapper" type="button" role="menuitemradio" aria-checked="false" data-theme-choice="dark" tabindex="-1">
						<div class="saOption saOptionButton">
							<i class="far fad fa-moon saIcon saOptionIcon" aria-hidden="true"></i>
							<div class="saOptionText">
								<div class="saOptionTitle">Dark</div>
							</div>
						</div>
					</button>
					<button class="saOptionWrapper" type="button" role="menuitemradio" aria-checked="false" data-theme-choice="contrast" tabindex="-1">
						<div class="saOption saOptionButton">
							<i class="far fad fa-circle-half-stroke saIcon saOptionIcon" aria-hidden="true"></i>
							<div class="saOptionText">
								<div class="saOptionTitle">High contrast</div>
							</div>
						</div>
					</button>
				</li>
				<li>
					<hr>
				</li>
				<li>
					<label class="saOptionWrapper" for="saToggleCompact" tabindex="0">
						<div class="saOption">
							<div class="saOptionText">
								<div class="saOptionTitle">Compact mode</div>
								<div class="saOptionDescription">The page will reload.</div>
							</div>
							<input class="saToggle" type="checkbox" id="saToggleCompact"
								checked="true">
						</div>
					</label>
				</li>
				<li>
					<hr>
				</li>
				<li>
					<button class="saOptionWrapper" id="saThemeMenuTrigger" type="button" role="menuitem" aria-haspopup="menu" aria-expanded="false" aria-controls="saThemeSubmenu" tabindex="-1">
						<div class="saOption">
							<i class="far fad fa-brush icon saIcon saOptionIcon" aria-hidden="true"></i>
							<div class="saOptionText">Theme</div>
							<i class="far fa-angle-right icon saIcon saOptionIcon saTrailing" aria-hidden="true"></i>
						</div>
					</button>
				</li>
				<li>
					<a class="saOptionWrapper" tabindex="0">
						<div class="saOption">
							<i class="far fad fa-key-skeleton icon saIcon saOptionIcon" aria-hidden="true"></i>
							<div class="saOptionText">Change password</div>
						</div>
					</a>
				</li>
				<li>
					<a class="saOptionWrapper" tabindex="0">
						<div class="saOption">
							<i class="far fad fa-circle-exclamation icon saIcon saOptionIcon" aria-hidden="true"></i>
							<div class="saOptionText">Give feedback to Multisoft</div>
						</div>
					</a>
				</li>
				<li>
					<a class="saOptionWrapper" tabindex="0">
						<div class="saOption">
							<i class="far fad fa-mobile-notch icon saIcon saOptionIcon" aria-hidden="true"></i>
							<div class="saOptionText">App</div>
						</div>
					</a>
				</li>

				<li>
					<a class="saOptionWrapper" tabindex="0">
						<div class="saOption">
							<i class="far fad fa-pen icon saIcon saOptionIcon" aria-hidden="true"></i>
							<div class="saOptionText">Edit contact information</div>
						</div>
					</a>
				</li>
			</ul>
		`).css({ position: 'fixed', margin: 0, minWidth: '16rem', maxWidth: 'calc(100dvw - 16px)', maxHeight: 'min(28rem, calc(100dvh - 16px))', bottom: 'auto' }).prependTo(document.body);
	}

	const $accountDropdown = $('.saAccountDropdown').first();
	const $accountMenu = createAccountMenu($accountDropdown);
	const $accountMenuItems = $accountMenu.find('.saOptionWrapper');
	$accountMenuItems.attr('tabindex', '-1');
	const $themeMenuTrigger = $accountMenu.find('#saThemeMenuTrigger');
	// A separate floating menu avoids clipping by the account menu's scrolling area.
	const $themeSubmenu = $themeMenuTrigger.length ? $(`
		<ul class="saContextMenu saEast" id="saThemeSubmenu" role="menu" aria-labelledby="saThemeMenuTrigger" aria-hidden="true">
			${[['system', 'System', 'desktop'], ['light', 'Light', 'sun-alt'], ['dark', 'Dark', 'moon'], ['contrast', 'High contrast', 'circle-half-stroke']].map(([value, label, icon]) => `
				<li role="none">
					<button class="saOptionWrapper" type="button" role="menuitemradio" aria-checked="false" data-theme-choice="${value}" tabindex="-1">
						<div class="saOption">
							<i class="far fad fa-${icon} saIcon saOptionIcon" aria-hidden="true"></i>
							<div class="saOptionText"><div class="saOptionTitle">${label}</div></div>
						</div>
					</button>
				</li>`).join('')}
		</ul>
	`).css({ position: 'fixed', margin: 0, minWidth: '10rem', maxWidth: 'calc(100dvw - 16px)', maxHeight: 'calc(100dvh - 16px)', bottom: 'auto' }).insertAfter($accountMenu) : $();
	const $themeSubmenuItems = $themeSubmenu.find('.saOptionWrapper');
	const $accountMenus = $accountMenu.add($themeSubmenu);
	const accountMobile = window.matchMedia('(max-width: 640px)');
	const desktopMenuStyles = $accountMenus.map(function () { return this.getAttribute('style'); }).get();
	const $accountSheetOverlay = $accountDropdown.length ? $(`
		<dialog class="saPopupOverlay saBottomSheetOverlay" aria-label="Account menu">
			<div class="saBottomSheet saAccountSheet">
				<div class="saSheetHeader">
					<div class="saSheetDragHandle"><div class="saDraggableThumb"></div></div>
					<button class="saSheetButton saAccountSheetBack" type="button" aria-label="Back to account menu"><i class="far fa-angle-left saIcon" aria-hidden="true"></i></button>
					<button class="saSheetButton" type="button" aria-label="Close account menu"><i class="far fa-xmark saIcon" aria-hidden="true"></i></button>
				</div>
				<div class="saSheetContent"></div>
			</div>
		</dialog>
	`).prependTo(document.body) : $();
	const $accountSheet = $accountSheetOverlay.find('.saBottomSheet');
	const $sheetContent = $accountSheet.find('.saSheetContent');
	const $sheetBack = $accountSheet.find('.saAccountSheetBack');

	function updateAccountSheetView() {
		const inSubmenu = $themeSubmenu.hasClass('saOpen');
		$accountMenu.toggle(!inSubmenu).attr('aria-hidden', String(inSubmenu));
		$themeSubmenu.toggle(inSubmenu).attr('aria-hidden', String(!inSubmenu));
		$sheetBack.toggle(inSubmenu);
		$accountSheetOverlay.attr('aria-label', inSubmenu ? 'Theme' : 'Account menu');
	}

	function syncAccountSheet() {
		const dialog = $accountSheetOverlay[0];
		if (!dialog) return;
		const useSheet = accountMobile.matches && $accountMenu.hasClass('saOpen');
		if (useSheet && !dialog.open) {
			$accountMenus.removeAttr('style').addClass('saSmallScreenMenu').appendTo($sheetContent);
			$accountSheet.css('height', '');
			updateAccountSheetView();
			setOverlayScrollLock('account', true);
			dialog.showModal();
			$accountSheetOverlay.addClass('saVisible');
		} else if (!useSheet && dialog.open) {
			dialog.close();
			$accountSheetOverlay.removeClass('saVisible');
			$accountMenus.removeClass('saSmallScreenMenu').insertAfter($accountSheetOverlay).each(function (index) {
				this.setAttribute('style', desktopMenuStyles[index]);
			});
			$accountMenu.attr('aria-hidden', String(!$accountMenu.hasClass('saOpen')));
			setOverlayScrollLock('account', false);
		}
	}

	function closeAccountSheet() {
		setAccountMenuOpen(false);
		$accountDropdown.trigger('focus');
	}
	$accountSheet.find('[aria-label="Close account menu"]').on('click', closeAccountSheet);
	$sheetBack.on('click', function () {
		setThemeSubmenuOpen(false);
		$themeMenuTrigger.trigger('focus');
	});
	$accountSheetOverlay.on('click', function (event) {
		if (event.target === this) closeAccountSheet();
	}).on('cancel', function (event) {
		event.preventDefault();
		if ($themeSubmenu.hasClass('saOpen')) $sheetBack.trigger('click');
		else closeAccountSheet();
	});

	// Drag the header up to expand, or down to dismiss; menu content scrolls normally.
	let sheetDrag;
	$accountSheet.find('.saSheetDragHandle').on('pointerdown', function (event) {
		if (event.button !== 0) return;
		sheetDrag = { y: event.clientY, height: $accountSheet[0].getBoundingClientRect().height };
		this.setPointerCapture(event.pointerId);
	}).on('pointermove', function (event) {
		if (!sheetDrag) return;
		$accountSheet.css('height', Math.max(80, Math.min(window.innerHeight * 0.9, sheetDrag.height + sheetDrag.y - event.clientY)));
	}).on('pointerup pointercancel', function (event) {
		if (!sheetDrag) return;
		const distance = event.clientY - sheetDrag.y;
		sheetDrag = null;
		if (this.hasPointerCapture(event.pointerId)) this.releasePointerCapture(event.pointerId);
		if (event.type === 'pointerup' && distance > 100) closeAccountSheet();
		else $accountSheet.css('height', event.type === 'pointerup' && distance < -60 ? '90dvh' : '');
	});

	// Demo-only control: compare layouts, and share a specific version using its URL.
	const $menuDemo = $accountDropdown.length ? $(`
		<label class="saInputTextWrapper">
			<select aria-label="Theme menu demo" class="saInputText saDropdown" style="padding-left: 0.75rem; font-weight: 500;">
				<option value="options">1. Standard options</option>
				<option value="buttons">2. Buttons</option>
				<option value="submenu">3. Submenu</option>
			</select>
			<div class="saTrailingIconsWrapper"><i class="saIcon far fa-angle-down"></i></div>
		</label>
	`).appendTo($('.saTopButtons .saActionLinks').first()) : $();

	function setMenuDemoVariant(variant) {
		variant = ['options', 'buttons', 'submenu'].includes(variant) ? variant : 'buttons';
		setThemeSubmenuOpen(false);
		$accountMenu.find('[data-theme-layout="options"]').toggle(variant === 'options');
		const $buttonChoices = $accountMenu.find('[data-theme-layout="buttons"]');
		$buttonChoices.toggle(variant === 'buttons');
		$buttonChoices.next('li').toggle(variant !== 'submenu');
		$themeMenuTrigger.closest('li').toggle(variant === 'submenu');
		$menuDemo.find('select').val(variant);
		positionAccountMenu();
	}

	$menuDemo.find('select').on('change', function () {
		setMenuDemoVariant(this.value);
		const url = new URL(window.location.href);
		url.searchParams.set('themeMenu', this.value);
		history.replaceState(history.state, '', url);
		setAccountMenuOpen(true);
	});
	setMenuDemoVariant(new URL(window.location.href).searchParams.get('themeMenu'));

	function positionAccountMenu() {
		syncAccountSheet();
		if (!$accountMenu.hasClass('saOpen')) return;
		if (accountMobile.matches) return;
		const anchor = $accountDropdown[0].getBoundingClientRect();
		const width = $accountMenu[0].offsetWidth;
		const height = $accountMenu[0].offsetHeight;
		const opensAbove = anchor.top >= height + 16 || anchor.top > window.innerHeight - anchor.bottom;
		$accountMenu.toggleClass('saNorth', opensAbove).toggleClass('saSouth', !opensAbove).css({
			left: Math.max(8, Math.min(anchor.left, document.documentElement.clientWidth - width - 8)),
			top: Math.max(8, Math.min(opensAbove ? anchor.top - height - 8 : anchor.bottom + 8, window.innerHeight - height - 8))
		});
		positionThemeSubmenu();
	}

	function positionThemeSubmenu() {
		if (accountMobile.matches) return;
		if (!$themeSubmenu.hasClass('saOpen')) return;
		const anchor = $themeMenuTrigger.find('.saOption')[0].getBoundingClientRect();
		const parentMenu = $accountMenu[0].getBoundingClientRect();
		const firstOptionOffset = $themeSubmenuItems.first().find('.saOption')[0].getBoundingClientRect().top
			- $themeSubmenu[0].getBoundingClientRect().top;
		const width = $themeSubmenu[0].offsetWidth;
		const height = $themeSubmenu[0].offsetHeight;
		const gap = 8;
		const opensRight = parentMenu.right + gap + width + 8 <= document.documentElement.clientWidth;
		const left = opensRight ? parentMenu.right + gap : parentMenu.left - gap - width;
		$themeSubmenu.toggleClass('saEast', opensRight).toggleClass('saWest', !opensRight).css({
			left: Math.max(8, Math.min(left, document.documentElement.clientWidth - width - 8)),
			top: Math.max(8, Math.min(anchor.top - firstOptionOffset, window.innerHeight - height - 8))
		});
	}

	function setThemeSubmenuOpen(isOpen, focusOption = false) {
		$themeMenuTrigger.toggleClass('saOpen', isOpen).attr('aria-expanded', String(isOpen));
		$themeSubmenu.toggleClass('saOpen', isOpen).attr('aria-hidden', String(!isOpen));
		if ($accountSheetOverlay[0]?.open) updateAccountSheetView();
		if (isOpen) {
			positionThemeSubmenu();
			if (focusOption) $themeSubmenuItems.filter('[aria-checked="true"]').first().trigger('focus');
		}
	}

	$themeMenuTrigger.on('click', function () {
		setThemeSubmenuOpen(!$themeSubmenu.hasClass('saOpen'), true);
	});
	$accountMenuItems.on('focusin', function () {
		if (this !== $themeMenuTrigger[0]) setThemeSubmenuOpen(false);
	});
	window.addEventListener('resize', positionAccountMenu);
	document.addEventListener('scroll', positionAccountMenu, true);
	$accountMenu.on('animationend', positionThemeSubmenu);

	function setAccountMenuOpen(isOpen) {
		if (!isOpen) setThemeSubmenuOpen(false);
		$accountDropdown.toggleClass('saOpen', isOpen).attr('aria-expanded', String(isOpen));
		$accountMenu.toggleClass('saOpen', isOpen).attr('aria-hidden', String(!isOpen));
		positionAccountMenu();
	}

	$accountDropdown.on('click', function (event) {
		event.stopPropagation();
		const isOpen = !$accountDropdown.hasClass('saOpen');
		setAccountMenuOpen(isOpen);
		if (isOpen) {
			const $items = $accountMenuItems.filter(':visible');
			const $selected = $items.filter('[aria-checked="true"]');
			($selected.length ? $selected.first() : $items.first()).trigger('focus');
		}
	});

	$accountDropdown.on('keydown', function (event) {
		if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
		event.preventDefault();
		setAccountMenuOpen(true);
		const $items = $accountMenuItems.filter(':visible');
		(event.key === 'ArrowDown' ? $items.first() : $items.last()).trigger('focus');
	});

	$accountMenus.on('keydown', function (event) {
		const inSubmenu = this === $themeSubmenu[0];
		const $items = (inSubmenu ? $themeSubmenuItems : $accountMenuItems).filter(':visible');
		if (!inSubmenu && event.key === 'ArrowRight' && $(event.target).closest('#saThemeMenuTrigger').length) {
			event.preventDefault();
			setThemeSubmenuOpen(true, true);
			return;
		}
		if ((event.key === 'Escape' && $themeSubmenu.hasClass('saOpen')) || (inSubmenu && event.key === 'ArrowLeft')) {
			event.preventDefault();
			event.stopPropagation();
			setThemeSubmenuOpen(false);
			$themeMenuTrigger.trigger('focus');
			return;
		}
		const currentIndex = $items.index($(event.target).closest('.saOptionWrapper'));
		let nextIndex;
		if (event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % $items.length;
		if (event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + $items.length) % $items.length;
		if (event.key === 'Home') nextIndex = 0;
		if (event.key === 'End') nextIndex = $items.length - 1;
		if (nextIndex !== undefined) {
			event.preventDefault();
			$items.eq(nextIndex).trigger('focus');
		} else if (event.key === 'Tab') {
			if ($accountSheetOverlay[0]?.open) return;
			setAccountMenuOpen(false);
			$accountDropdown.trigger('focus');
		} else if ((event.key === 'Enter' || event.key === ' ') && $(event.target).is('label.saOptionWrapper')) {
			event.preventDefault();
			document.getElementById(event.target.htmlFor)?.click();
		}
	});

	$(document).on('click', function (event) {
		if ($accountDropdown[0]?.contains(event.target) || $accountMenu[0]?.contains(event.target)
			|| $themeSubmenu[0]?.contains(event.target) || $menuDemo[0]?.contains(event.target)
			|| $accountSheetOverlay[0]?.contains(event.target)) return;
		setAccountMenuOpen(false);
	});

	$(document).on('keydown', function (event) {
		if (event.key !== 'Escape' || !$accountDropdown.hasClass('saOpen')) return;

		event.preventDefault();
		setAccountMenuOpen(false);
		$accountDropdown.trigger('focus');
	});

	setAccountMenuOpen(false);


	const $themeOptions = $accountMenus.find('[data-theme-choice]');
	const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
	let savedTheme;
	try {
		savedTheme = localStorage.getItem('theme');
	} catch {
		// The theme still works for this page when storage is unavailable.
	}
	let currentTheme = normalizeTheme(savedTheme);

	applyTheme();

	function normalizeTheme(theme) {
		return theme === 'light' || theme === 'dark' ? theme : 'system';
	}

	function setThemePreference(theme) {
		currentTheme = normalizeTheme(theme);
		try {
			localStorage.setItem('theme', currentTheme);
		} catch {
			// Keep the selection in memory if browser storage is blocked.
		}
		applyTheme();
	}

	function toggleTheme() {
		const isDark = currentTheme === 'system' ? systemTheme.matches : currentTheme === 'dark';
		setThemePreference(isDark ? 'light' : 'dark');
	}

	$themeOptions.on('click', function () {
		setThemePreference(this.dataset.themeChoice);
	});

	systemTheme.addEventListener('change', applyTheme);
	window.addEventListener('storage', function (event) {
		if (event.key !== 'theme' && event.key !== null) return;
		currentTheme = normalizeTheme(event.newValue);
		applyTheme();
	});

	$(document).on('keydown', function (event) {
		const isEditable = $(event.target).closest('input, select, textarea').length > 0
			|| event.target.isContentEditable;
		const isThemeShortcut = !event.altKey
			&& !event.ctrlKey
			&& !event.metaKey
			&& !event.shiftKey
			&& event.key?.toLowerCase() === 'd';

		if (!isThemeShortcut || isEditable || event.repeat || event.originalEvent?.repeat
			|| event.originalEvent?.isComposing || event.isDefaultPrevented()) return;

		event.preventDefault();
		toggleTheme();
	});

	function applyTheme() {
		const root = document.documentElement;
		if (currentTheme === 'system') root.removeAttribute('data-theme');
		else root.setAttribute('data-theme', currentTheme);

		$themeOptions.each(function () {
			this.setAttribute('aria-checked', String(this.dataset.themeChoice === currentTheme));
		});
		$themeOptions.filter('[data-theme-choice="system"]').find('.saOptionDescription').text('Matches operating system');
	}

	const FAVORITE_COOLDOWN = 1500;
	const favoriteActions = new WeakMap();

	function getFavoritePageName(button) {
		return (button.closest('.saMenuItemWrapper')?.querySelector('.saMenuItemTextHeading')?.textContent
			|| document.querySelector('h1.saHeaderText')?.textContent
			|| document.title || 'Page').trim();
	}

	$('.saFavoriteToggle').each(function () {
		const isFavorite = this.getAttribute('aria-checked') === 'true';
		this.setAttribute('aria-pressed', String(isFavorite));
		this.setAttribute('aria-label', `${isFavorite ? 'Remove' : 'Add'} ${getFavoritePageName(this)} ${isFavorite ? 'from' : 'to'} favorites`);
	});

	$(document).on('click', '.saFavoriteToggle', function (event) {
		event.preventDefault();
		const previous = favoriteActions.get(this);
		const now = performance.now();
		if (this.disabled || this.getAttribute('aria-disabled') === 'true' || now < (previous?.readyAt ?? 0)) return;

		const isFavorite = this.getAttribute('aria-checked') !== 'true';
		const pageName = getFavoritePageName(this);
		this.setAttribute('aria-checked', String(isFavorite));
		this.setAttribute('aria-pressed', String(isFavorite));
		this.setAttribute('aria-label', `${isFavorite ? 'Remove' : 'Add'} ${pageName} ${isFavorite ? 'from' : 'to'} favorites`);
		this.setAttribute('aria-disabled', 'true');
		const record = { readyAt: now + FAVORITE_COOLDOWN, toast: previous?.toast };
		favoriteActions.set(this, record);
		setTimeout(() => this.removeAttribute('aria-disabled'), FAVORITE_COOLDOWN);

		// Page names are literal text, even if they contain Markdown punctuation.
		const name = pageName.replace(/([\\`*_\[\]~])/g, '\\$1');
		const message = `**${name}** ${isFavorite ? 'added to' : 'removed from'} favorites.`;
		const options = { type: 'success', duration: 10000, returnFocusTo: this };
		if (record.toast?.isConnected && !record.toast.classList.contains('saClosed')) {
			record.toast.updateToast(message, options);
		} else {
			record.toast = window.saToast.show(message, options);
		}
	});

	const $splitMenuButton = $('.saSplitButtonArrow[aria-controls="saSplitButtonMenu"]');
	const $splitMenu = $('#saSplitButtonMenu');
	const $splitMenuRoot = $splitMenuButton.closest('.saButtonSplit');

	function setSplitMenuOpen(isOpen) {
		$splitMenuButton.toggleClass('saOpen', isOpen).attr('aria-expanded', String(isOpen));
		$splitMenu.toggleClass('saOpen', isOpen);
	}

	$splitMenuButton.on('click', function (event) {
		event.stopPropagation();
		setSplitMenuOpen(!$splitMenuButton.hasClass('saOpen'));
	});

	$(document).on('click', function (event) {
		if ($(event.target).closest($splitMenuRoot).length) return;
		setSplitMenuOpen(false);
	});

	$(document).on('keydown', function (event) {
		if (event.key !== 'Escape' || !$splitMenuButton.hasClass('saOpen')) return;

		setSplitMenuOpen(false);
		$splitMenuButton.trigger('focus');
	});

	$('.saGrid tbody').on('mouseenter mouseleave', 'tr', function (event) {
		$(this).toggleClass('saSelected', event.type === 'mouseenter');
	});

	const $attachments = $('#project-attachments');

	function formatFileSize(bytes) {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} kB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}

	function renderAttachments(files) {
		const $fileGroup = $attachments.find('.saFileGroup').empty();

		Array.from(files).forEach(function (file) {
			const $fileItem = $('<li>', { class: 'saFileWrapper saFileVisible saDone' });
			const $iconWrapper = $('<div>', { class: 'saFileIconWrapper saDone' })
				.append($('<i>', { class: 'saFileIcon saIcon fas fa-file', 'aria-hidden': 'true' }));
			const $fileDetails = $('<div>', { class: 'saFile' }).append(
				$('<div>', { class: 'saFileNameWrapper' }).append(
					$('<span>', { class: 'saFileName', text: file.name })
				),
				$('<div>', { class: 'saFileSizeWrapper' }).append(
					$('<div>', { class: 'saFileSizeRow' }).append(
						$('<span>', { class: 'saFileSize', text: formatFileSize(file.size) }),
						$('<span>', { class: 'saFileUploadProgressText', text: '100%' })
					),
					$('<progress>', { class: 'saFileUploadProgress', max: 100, value: 100 })
				)
			);
			const $deleteButton = $('<button>', {
				class: 'saDeleteButton saDestructive',
				type: 'button',
				'aria-label': `Delete file ${file.name}`,
				'data-tooltip': 'Delete file'
			}).append($('<i>', { class: 'saIcon far fad fa-trash-alt', 'aria-hidden': 'true' }));

			$fileItem.append($iconWrapper, $fileDetails, $('<div>', { class: 'saFileButtonGroup' }).append($deleteButton));
			$fileGroup.append($fileItem);
		});

		$attachments.toggleClass('saHasFiles', $fileGroup.children().length > 0);
	}

	$attachments.find('input[type="file"]').on('change', function () {
		renderAttachments(this.files);
	});

	$attachments.on('keydown', '.saFileUploadArea', function (event) {
		if (event.key !== 'Enter' && event.key !== ' ') return;

		event.preventDefault();
		$(this).find('input[type="file"]').trigger('click');
	});

	$attachments.on('dragover', '.saFileUploadArea', function (event) {
		event.preventDefault();
		$attachments.addClass('saDragOver');
	});

	$attachments.on('dragleave drop', '.saFileUploadArea', function (event) {
		event.preventDefault();
		$attachments.removeClass('saDragOver');

		if (event.type === 'drop') {
			renderAttachments(event.originalEvent.dataTransfer.files);
		}
	});

	$attachments.on('click', '.saDeleteButton', function () {
		$(this).closest('.saFileWrapper').remove();
		const hasFiles = $attachments.find('.saFileWrapper').length > 0;
		$attachments.toggleClass('saHasFiles', hasFiles);

		if (!hasFiles) {
			$attachments.find('input[type="file"]').val('');
		}
	});

});
