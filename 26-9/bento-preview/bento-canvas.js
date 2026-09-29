(() => {
	'use strict';
	const M = window.BentoModel;
	const $ = id => document.getElementById(id);
	const send = (type, extra = {}) => parent.postMessage({ type, ...extra }, location.origin);
	let state = null, selected = [], showGrid = false, maxWidth = false;
	let previewPreferences = { sidebarMinimized: false, theme: 'system' }, drag = null, scrollFrame = null, suppressClick = false;
	const pressedCards = new Set();
	const systemTheme = matchMedia('(prefers-color-scheme: dark)');
	function applyPreferences() {
		const small = innerWidth <= 640;
		const minimized = previewPreferences.sidebarMinimized && !small;
		$('SideBar').classList.toggle('saMinimized', minimized);
		$('SideBar').classList.toggle('saExpanded', !minimized);
		document.querySelector('.saSideBarOuter').classList.toggle('saBentoSidebarMinimized', minimized);
		const expander = document.querySelector('.saExpander');
		expander.setAttribute('aria-expanded', String(!minimized));
		expander.setAttribute('aria-label', minimized ? 'Expand sidebar' : 'Minimize sidebar');
		if (previewPreferences.theme === 'system') document.documentElement.removeAttribute('data-theme');
		else document.documentElement.dataset.theme = previewPreferences.theme;
		document.querySelectorAll('[data-theme-choice]').forEach(button => {
			button.setAttribute('aria-checked', String(button.dataset.themeChoice === previewPreferences.theme));
		});
		if (!small) setMobileMenu(false);
	}
	function setMobileMenu(open) {
		document.body.classList.toggle('saBentoMobileMenuOpen', open);
		document.querySelector('.saSideBarOuter').classList.toggle('saClosed', !open);
		$('SideBarSmallScreenOverlay').classList.toggle('saVisible', open);
		$('SideBarSmallScreenOverlay').style.display = open ? 'block' : 'none';
		document.querySelectorAll('.saNavigator').forEach(button => button.setAttribute('aria-expanded', String(open)));
	}
	function changePreference(field, value) {
		previewPreferences[field] = value;
		applyPreferences();
		send('BENTO_PREFERENCES', previewPreferences);
	}
	systemTheme.addEventListener('change', applyPreferences);
	function render() {
		if (!state) return;
		if (drag) finishDrag(false);
		applyPreferences();
		const bp = M.breakpoints.find(b => innerWidth >= b.min && innerWidth <= b.max)?.id || 'xs';
		for (const element of [document.body, $('body')]) {
			element.classList.toggle('saSmallScreen', bp === 'xs');
			element.classList.toggle('saLargeScreen', bp !== 'xs');
		}
		const columns = M.effective(state.grid, 'columns', bp).value;
		const focused = document.activeElement?.closest('[data-card]')?.dataset.card;
		// Use the exact utility classes from Bento.less; the iframe supplies the viewport.
		$('bento-grid').className = ['saBentoGroup', 'saBentoWrapper', ...(maxWidth ? ['saMaxWidth'] : []), ...M.classes(state.grid, { columns: 'GridCol' }), ...(showGrid ? ['saShowGridLines'] : [])].join(' ');
		$('bento-grid').innerHTML = state.cards.map((c, i) => {
			const col = M.effective(c.settings, 'col', bp).value, row = M.effective(c.settings, 'row', bp).value;
			const invalid = col > columns;
			const classes = ['saBento', ...M.cardStyleClasses(c), c.tone || '', c.solid ? 'saSolid' : '', ...M.classes(c.settings, { col: 'Col', row: 'Row' }), selected.includes(c.id) ? 'saBentoSelected' : '', invalid ? 'saBentoInvalid' : ''].join(' ');
			return `<li class="${classes}" data-card="${c.id}">${M.cardArticle(c, `${c.title}. ${col} columns, ${row} rows.${invalid ? ' Exceeds grid width.' : ''}`, selected.includes(c.id)).replace('role="button"', 'role="button" aria-describedby="reorder-help"')}</li>`;

		}).join('');
		document.querySelectorAll('.saBentoButton').forEach(button => button.setAttribute('aria-pressed', String(pressedCards.has(Number(button.closest('[data-card]').dataset.card)))));
		$('empty-state').hidden = state.cards.length > 0;
		$('bento-grid').classList.toggle('saEmpty', !state.cards.length);
		if (focused) document.querySelector(`[data-card="${focused}"] .saBentoInner`)?.focus({ preventScroll: true });
	}
	window.addEventListener('message', e => {
		if (e.origin !== location.origin || e.source !== parent || e.data?.type !== 'BENTO_RENDER') return;
		({ state, selected, showGrid, maxWidth, previewPreferences } = e.data);
		render();
	});
	document.addEventListener('click', e => {
		if (suppressClick) { e.preventDefault(); return; }
		const cardButton = e.target.closest('.saBentoButton');
		if (cardButton) {
			e.preventDefault();
			const id = Number(cardButton.closest('[data-card]').dataset.card);
			const pressed = cardButton.getAttribute('aria-pressed') !== 'true';
			cardButton.setAttribute('aria-pressed', String(pressed));
			if (pressed) pressedCards.add(id); else pressedCards.delete(id);
			return;
		}
		if (e.target.closest('.saExpander')) { e.preventDefault(); changePreference('sidebarMinimized', !previewPreferences.sidebarMinimized); return; }
		if (e.target.closest('.saAccountDropdown')) { e.preventDefault(); setAccountMenu(!$('saAccountMenu').classList.contains('saOpen')); return; }
		if (e.target.closest('#saThemeMenuTrigger')) { e.preventDefault(); setThemeMenu(!$('saThemeSubmenu').classList.contains('saOpen')); return; }
		const themeChoice = e.target.closest('[data-theme-choice]');
		if (themeChoice) {
			e.preventDefault(); changePreference('theme', themeChoice.dataset.themeChoice);
			setAccountMenu(false); document.querySelector('.saAccountDropdown').focus({ preventScroll: true }); return;
		}
		if (!e.target.closest('.saBentoPreviewMenu')) setAccountMenu(false);
		if (e.target.closest('.saNavigator')) { e.preventDefault(); setMobileMenu(!document.body.classList.contains('saBentoMobileMenuOpen')); return; }
		if (e.target.closest('#SideBarSmallScreenOverlay')) { e.preventDefault(); setMobileMenu(false); return; }
		const card = e.target.closest('[data-card]');
		if (card) { e.preventDefault(); send('BENTO_SELECT', { id: Number(card.dataset.card), additive: e.shiftKey }); }
		else if (e.target.closest('#empty-add')) { e.preventDefault(); send('BENTO_ADD'); }
		else { e.preventDefault(); send('BENTO_CLEAR'); }
	});
	document.addEventListener('submit', e => e.preventDefault());
	document.addEventListener('keydown', e => {
		if (e.target.closest('input, textarea, select') || e.target.isContentEditable) return;
		if (['Delete', 'Backspace'].includes(e.key) && !e.altKey && !e.ctrlKey && !e.metaKey && !e.isComposing && selected.length) {
			e.preventDefault();
			if (!e.repeat) {
				if (drag) finishDrag(false);
				send('BENTO_REMOVE');
			}
			return;
		}
		if (!e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.repeat && !e.isComposing && e.key.toLowerCase() === 'd') {
			e.preventDefault();
			const dark = previewPreferences.theme === 'dark' || (previewPreferences.theme === 'system' && systemTheme.matches);
			changePreference('theme', dark ? 'light' : 'dark'); return;
		}
		if (menuKey(e)) return;
		if (e.key === 'Escape') { e.preventDefault(); if (drag) { finishDrag(false); return; } setMobileMenu(false); send('BENTO_CLEAR'); }
		if (e.altKey && e.key.toLowerCase() === 'm') { e.preventDefault(); changePreference('sidebarMinimized', !previewPreferences.sidebarMinimized); return; }
		if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); send(e.shiftKey ? 'BENTO_REDO' : 'BENTO_UNDO'); return; }
		if (e.target.closest('.saBentoInner')) {
			const id = Number(e.target.closest('[data-card]').dataset.card);
			const index = state.cards.findIndex(c => c.id === id);
			const step = { ArrowUp: -1, ArrowLeft: -1, ArrowDown: 1, ArrowRight: 1 }[e.key];
			if (step) { e.preventDefault(); move(id, index + step); return; }
		}
		const card = e.target.closest('[data-card]');
		if (card && !e.target.closest('.saBentoButton') && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); send('BENTO_SELECT', { id: Number(card.dataset.card), additive: e.shiftKey }); }
	});
	function move(id, index) {
		if (index < 0 || index >= state.cards.length || state.cards[index]?.id === id) return;
		send('BENTO_MOVE', { id, index });
		$('reorder-status').textContent = `Moved ${state.cards.find(c => c.id === id).title} to position ${index + 1} of ${state.cards.length}.`;
	}
	function clearDropTarget() {
		document.querySelectorAll('.saBentoDropBefore, .saBentoDropAfter').forEach(el => el.classList.remove('saBentoDropBefore', 'saBentoDropAfter'));
	}
	function updateDropTarget() {
		if (!drag?.moved) return;
		clearDropTarget();
		const target = document.elementFromPoint(drag.x, drag.y)?.closest('[data-card]');
		drag.index = null;
		if (!target || Number(target.dataset.card) === drag.id) return;
		const rect = target.getBoundingClientRect();
		const after = drag.y > rect.top + rect.height / 2;
		const targetIndex = state.cards.findIndex(c => c.id === Number(target.dataset.card));
		const from = state.cards.findIndex(c => c.id === drag.id);
		drag.index = targetIndex + (after ? 1 : 0) - (from < targetIndex ? 1 : 0);
		target.classList.add(after ? 'saBentoDropAfter' : 'saBentoDropBefore');
	}
	function autoScroll() {
		if (!drag) return;
		const scroller = document.querySelector('.scrollcontent-inner'), rect = scroller.getBoundingClientRect();
		if (drag.moved) {
			const amount = drag.y > rect.bottom - 48 ? 12 : drag.y < rect.top + 48 ? -12 : 0;
			if (amount) { scroller.scrollTop += amount; updateDropTarget(); }
		}
		scrollFrame = requestAnimationFrame(autoScroll);
	}
	document.addEventListener('pointerdown', e => {
		const card = e.target.closest('[data-card]');
		if (!card || e.target.closest('.saBentoButton') || e.button !== 0 || drag) return;
		// Capture only after crossing the drag threshold, so ordinary clicks keep their target.
		drag = { id: Number(card.dataset.card), handle: card, pointer: e.pointerId, startX: e.clientX, startY: e.clientY, x: e.clientX, y: e.clientY, index: null, moved: false };
		autoScroll();
	});
	document.addEventListener('pointermove', e => {
		if (!drag || e.pointerId !== drag.pointer) return;
		drag.x = e.clientX; drag.y = e.clientY;
		if (!drag.moved && Math.hypot(drag.x - drag.startX, drag.y - drag.startY) > 6) {
			drag.moved = true;
			drag.handle.setPointerCapture(e.pointerId);
			drag.handle.querySelector('.saBentoInner').focus({ preventScroll: true });
		}
		drag.handle.closest('[data-card]').classList.toggle('saBentoDragging', drag.moved);
		updateDropTarget();
	});
	function finishDrag(commit) {
		if (!drag) return;
		const previous = drag; drag = null;
		if (previous.moved) { suppressClick = true; setTimeout(() => { suppressClick = false; }, 0); }
		cancelAnimationFrame(scrollFrame);
		clearDropTarget();
		previous.handle.closest('[data-card]')?.classList.remove('saBentoDragging');
		if (previous.handle.hasPointerCapture(previous.pointer)) previous.handle.releasePointerCapture(previous.pointer);
		if (commit && previous.moved && previous.index !== null) move(previous.id, previous.index);
	}
	document.addEventListener('dragstart', e => { if (e.target.closest('[data-card]')) e.preventDefault(); });
	document.addEventListener('pointerup', () => finishDrag(true));
	document.addEventListener('pointercancel', () => finishDrag(false));
	document.addEventListener('lostpointercapture', () => finishDrag(false));
	// Use the same account/Theme context-menu structure and theme choices as Softadmin.
	function positionMenu(menu, left, top) {
		menu.style.left = Math.max(8, Math.min(left, innerWidth - menu.offsetWidth - 8)) + 'px';
		menu.style.top = Math.max(8, Math.min(top, innerHeight - menu.offsetHeight - 8)) + 'px';
	}
	function setAccountMenu(open) {
		setThemeMenu(false);
		const trigger = document.querySelector('.saAccountDropdown'), menu = $('saAccountMenu');
		trigger.classList.toggle('saOpen', open);
		trigger.setAttribute('aria-expanded', String(open));
		menu.classList.toggle('saOpen', open);
		menu.setAttribute('aria-hidden', String(!open));
		if (open) {
			const anchor = trigger.getBoundingClientRect();
			positionMenu(menu, anchor.left, anchor.top - menu.offsetHeight - 8);
			$('saThemeMenuTrigger').focus({ preventScroll: true });
		}
	}
	function setThemeMenu(open) {
		const menu = $('saThemeSubmenu');
		$('saThemeMenuTrigger').setAttribute('aria-expanded', String(open));
		menu.classList.toggle('saOpen', open);
		menu.setAttribute('aria-hidden', String(!open));
		if (open) {
			const anchor = $('saAccountMenu').getBoundingClientRect();
			const right = anchor.right + menu.offsetWidth + 16 <= innerWidth;
			menu.classList.toggle('saEast', right); menu.classList.toggle('saWest', !right);
			positionMenu(menu, right ? anchor.right + 8 : anchor.left - menu.offsetWidth - 8, anchor.top);
			menu.querySelector('[aria-checked="true"]')?.focus({ preventScroll: true });
		}
	}
	function menuKey(e) {
		const inMenu = e.target.closest('.saBentoPreviewMenu');
		if (e.target.closest('.saAccountDropdown') && ['ArrowUp', 'ArrowDown'].includes(e.key)) {
			e.preventDefault(); setAccountMenu(true); return true;
		}
		if (e.key === 'Escape' && $('saAccountMenu').classList.contains('saOpen')) {
			e.preventDefault();
			if ($('saThemeSubmenu').classList.contains('saOpen')) { setThemeMenu(false); $('saThemeMenuTrigger').focus(); }
			else { setAccountMenu(false); document.querySelector('.saAccountDropdown').focus(); }
			return true;
		}
		if (!inMenu) return false;
		if (e.key === 'ArrowRight' && inMenu.id === 'saAccountMenu') { e.preventDefault(); setThemeMenu(true); return true; }
		if (e.key === 'ArrowLeft' && inMenu.id === 'saThemeSubmenu') { e.preventDefault(); setThemeMenu(false); $('saThemeMenuTrigger').focus(); return true; }
		const options = [...inMenu.querySelectorAll('button')], index = options.indexOf(e.target.closest('button'));
		const next = { ArrowDown: (index + 1) % options.length, ArrowUp: (index - 1 + options.length) % options.length, Home: 0, End: options.length - 1 }[e.key];
		if (next !== undefined) { e.preventDefault(); options[next].focus(); return true; }
		if (e.key === 'Tab') { setAccountMenu(false); document.querySelector('.saAccountDropdown').focus(); }
		return false;
	}
	window.addEventListener('resize', () => { setAccountMenu(false); render(); });
	send('BENTO_READY');
})();
