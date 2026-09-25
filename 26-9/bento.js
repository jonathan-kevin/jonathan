(() => {
	'use strict';
	const M = window.BentoModel;
	const $ = id => document.getElementById(id);
	const esc = M.escapeHtml;
	const icons = {
		plus: 'M12 5v14M5 12h14', minimize: 'M5 12h14', expand: 'M3 4h18v16H3zM15 4v16',
		undo: 'M4 10h10a6 6 0 0 1 0 12M4 10l5-5M4 10l5 5', redo: 'M20 10H10a6 6 0 0 0 0 12m10-12-5-5m5 5-5 5',
		grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
		layers: 'm12 3 10 5-10 5L2 8zm-10 9 10 5 10-5M2 16l10 5 10-5',
		pointer: 'm5 3 14 10-7 1-3 7z', card: 'M3 4h18v16H3zM3 9h18', trash: 'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7'
	};
	const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${icons[name] || icons.grid}"/></svg>`;
	document.querySelectorAll('[data-icon]').forEach(el => el.innerHTML = icon(el.dataset.icon));
	let state = M.applyPreset(M.presets[0]);
	let active = '2xl';
	let selected = null;
	const widths = Object.fromEntries(M.breakpoints.map(b => [b.id, b.width]));
	const undoStack = [], redoStack = [];
	let pendingPreset = null, toastTimer;
	let canvasZoom = null, screenDrag = null, currentScale = 1;
	const activeBreakpoint = () => M.breakpoints.find(b => b.id === active);
	const currentCard = () => state.cards.find(c => c.id === selected);
	function snapshot() { return { state: structuredClone(state), selected }; }
	function commit(change, message) {
		undoStack.push(snapshot());
		if (undoStack.length > 100) undoStack.shift();
		redoStack.length = 0;
		change(); render();
		if (message) toast(message, true);
	}
	function history(from, to) {
		if (!from.length) return;
		to.push(snapshot());
		const previous = from.pop(); state = previous.state; selected = previous.selected;
		render(); toast(from === undoStack ? 'Change undone.' : 'Change restored.');
	}
	function toast(message, withUndo = false) {
		clearTimeout(toastTimer);
		$('toast').innerHTML = `${esc(message)}${withUndo ? '<button id="toast-undo">Undo</button>' : ''}`;
		$('toast').hidden = false;
		if (withUndo) $('toast-undo').onclick = () => history(undoStack, redoStack);
		toastTimer = setTimeout(() => $('toast').hidden = true, 4500);
	}
	function thumbnail(p) {
		return `<div class="preset-thumbnail" style="grid-template-columns:repeat(${p.columns},1fr)" aria-hidden="true">${p.spans.map(([col, row]) => `<span class="preset-tile" style="grid-column:span ${col};grid-row:span ${row}"></span>`).join('')}</div>`;
	}
	function renderGallery() {
		$('preset-gallery').innerHTML = M.presets.map(p => `<button class="preset-button ${state.preset === p.id ? 'active' : ''}" data-preset="${p.id}" aria-label="Apply ${esc(p.name)} preset, ${p.spans.length} cards" aria-pressed="${state.preset === p.id}">${thumbnail(p)}<span class="preset-caption">${p.name}${state.preset === p.id ? '<span class="preset-check" aria-hidden="true">✓</span>' : p.tag ? `<span class="preset-tag">${p.tag}</span>` : ''}</span></button>`).join('');
	}
	function renderBreakpoints() {
		$('breakpoint-bar').innerHTML = M.breakpoints.map((b, i) => `<button class="breakpoint-button ${b.id === active ? 'active' : ''}" data-breakpoint="${b.id}" aria-pressed="${b.id === active}" title="${b.label}: ${b.min}${b.max === Infinity ? '+' : '–' + b.max}px"><span>${b.id}</span>${i === 0 ? '<span class="base-label">base</span>' : ''}</button>`).join('');
		const bp = activeBreakpoint();
		$('viewport-description').textContent = `${bp.label} · ${bp.min}${bp.max === Infinity ? 'px and up' : '–' + bp.max + 'px'}`;
		$('preview-width').min = bp.min;
		if (Number.isFinite(bp.max)) $('preview-width').max = bp.max; else $('preview-width').removeAttribute('max');
		$('preview-width').value = widths[active];
		$('preview-slider').min = bp.min; $('preview-slider').max = Number.isFinite(bp.max) ? bp.max : Math.max(2560, widths[active]);
		$('preview-slider').value = widths[active];
		document.querySelectorAll('.inheritance-chain b').forEach((el, i) => el.classList.toggle('current', M.breakpoints[i].id === active));
	}
	function renderCards() {
		const columns = M.effective(state.grid, 'columns', active).value;
		$('bento-grid').style.gridTemplateColumns = `repeat(${columns},minmax(0,1fr))`;
		$('bento-grid').style.gridAutoRows = Math.max(150, Math.min(350, widths[active] * .225)) + 'px';
		$('bento-grid').innerHTML = state.cards.map((c, i) => {
			const col = M.effective(c.settings, 'col', active).value, row = M.effective(c.settings, 'row', active).value;
			const invalid = col > columns;
			const art = c.tone === 0 ? '<div class="art-orbit"><i></i><i></i><i></i></div>' : c.tone === 1 ? '<div class="art-steps"><i></i><i></i><i></i></div>' : c.tone === 2 ? '<div class="art-sun"></div>' : '<div class="art-squares"></div>';
			return `<li class="saBento tone-${c.tone} ${c.id === selected ? 'selected' : ''} ${invalid ? 'invalid' : ''}" data-card="${c.id}" style="grid-column:span ${Math.min(col, columns)};grid-row:span ${row}" tabindex="0" aria-label="Card ${i + 1}: ${esc(c.title)}. ${col} columns, ${row} rows.${invalid ? ' Exceeds grid width; preview constrained to fit.' : ''}${c.id === selected ? ' Selected.' : ''}"><span class="card-eyebrow">${String(i + 1).padStart(2, '0')} / ${['THE BIG PICTURE', 'EXPLORE MORE', 'SOMETHING GOOD', 'YOUR NEXT CHAPTER', 'A NEW ANGLE', 'BETTER TOGETHER'][c.tone]}</span><div class="card-art" aria-hidden="true">${art}</div><div class="card-bottom"><h3 class="card-title">${esc(c.title)}</h3><span class="card-span">${invalid ? '⚠ ' : ''}${col} × ${row}</span></div></li>`;
		}).join('');
		$('empty-state').hidden = state.cards.length > 0;
		$('preview-frame').hidden = state.cards.length === 0;
		resizePreview();
	}
	function resizePreview() {
		const width = widths[active];
		const area = $('canvas-area');
		const style = getComputedStyle(area);
		const available = Math.max(1, area.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - 32);
		const scale = Math.min(canvasZoom ?? 1, available / width);
		currentScale = scale;
		$('preview-frame').style.setProperty('--preview-min-font', (0.625 / scale) + 'rem');
		$('preview-frame').style.width = width + 'px';
		$('preview-frame').style.transform = `scale(${scale})`;
		$('preview-holder').style.width = width * scale + 'px';
		$('preview-holder').style.height = 32 + (state.cards.length ? $('preview-frame').offsetHeight * scale : 280) + 'px';
		$('canvas-scale').textContent = `Screen ${width}px · Preview at ${Math.round(scale * 100)}%`;
		$('screen-size').textContent = `${width}px`;
		$('preview-holder').setAttribute('aria-label', `${width}px screen, ${active} breakpoint, preview at ${Math.round(scale * 100)}%`);
		$('screen-resizer').setAttribute('aria-valuenow', width);
		$('screen-resizer').setAttribute('aria-valuemax', Math.max(3840, width));
		$('screen-resizer').setAttribute('aria-valuetext', `${width} pixels, ${active} breakpoint`);
	}
	function property(settings, prop, label, scope, min, max, unit = '') {
		const { value, source } = M.effective(settings, prop, active);
		const own = source === active, base = active === '2xl';
		const targets = M.affected(settings, prop, active);
		const id = `${scope}-${prop}`;
		return `<div class="property"><div class="property-head"><label for="${id}">${label}${unit ? ' (' + unit + ')' : ''}</label><span class="source-badge ${own ? '' : 'inherited'}">${base ? 'Base value' : own ? 'Override' : 'Inherited from ' + source}</span></div><div class="stepper"><button data-step="-1" data-target="${id}" aria-label="Decrease ${label.toLowerCase()}" ${value <= min ? 'disabled' : ''}>−</button><input type="number" id="${id}" min="${min}" max="${max}" value="${value}" data-scope="${scope}" data-property="${prop}" aria-describedby="${id}-impact"><button data-step="1" data-target="${id}" aria-label="Increase ${label.toLowerCase()}" ${value >= max ? 'disabled' : ''}>+</button></div><div class="property-foot"><small id="${id}-impact">${targets.length ? 'Edits also affect ' + targets.join(', ') : 'Edits affect only ' + active}.</small>${own && !base ? `<button class="reset-button" data-reset="${prop}" data-scope="${scope}" aria-label="Reset ${label.toLowerCase()} to inherited">Reset to inherited</button>` : ''}</div></div>`;
	}
	function renderInspector() {
		const columns = M.effective(state.grid, 'columns', active).value;
		const invalid = state.cards.filter(c => M.effective(c.settings, 'col', active).value > columns);
		$('grid-controls').innerHTML = property(state.grid, 'columns', 'Columns', 'grid', 1, 12) + (invalid.length ? `<div class="validation" role="status">${invalid.length} ${invalid.length === 1 ? 'card exceeds' : 'cards exceed'} ${columns} columns. Outlined cards are constrained in this preview.<button id="fit-all">Fit ${invalid.length === 1 ? 'card' : 'all cards'} to this grid</button></div>` : '');
		const c = currentCard();
		$('preset-panel').hidden = !!c;
		$('card-inspector').hidden = !c;
		$('inspector-heading').textContent = c ? 'Card settings' : 'Layout settings';
		$('card-inspector').innerHTML = c ? `<div class="section-label">${icon('card')}<h3>Card ${String(state.cards.indexOf(c) + 1).padStart(2, '0')}</h3><span class="selected-label">SELECTED</span></div><label class="title-field">Card title · all screens<input id="card-title" maxlength="120" value="${esc(c.title)}"></label>${property(c.settings, 'col', 'Column span', 'card', 1, 12)}${property(c.settings, 'row', 'Row span', 'card', 1, 6)}${M.effective(c.settings, 'col', active).value > columns ? '<div class="validation">This card is wider than the grid.<button id="fit-card">Fit to ' + columns + ' columns</button></div>' : ''}<button class="remove-button" id="remove-card">${icon('trash')}Remove card</button><p class="global-note">Adds and removals apply to every screen.</p>` : `<div class="section-label">${icon('card')}<h3>Card settings</h3></div><p class="panel-description">Select a card on the canvas to customize it.</p>`;
	}
	function render() {
		renderGallery(); renderBreakpoints(); renderCards(); renderInspector();
		$('undo').disabled = !undoStack.length; $('redo').disabled = !redoStack.length;
	}
	function edit(scope, prop, value) {
		const settings = scope === 'grid' ? state.grid : currentCard()?.settings;
		if (!settings || settings[active]?.[prop] === value) return;
		commit(() => { (settings[active] ||= {})[prop] = value; state.preset = null; });
	}
	function addCard() {
		commit(() => { const c = M.card(state.cards.length, state.nextId++); c.title = `Card ${c.id}`; state.cards.push(c); selected = c.id; state.preset = null; }, 'Card added at every breakpoint.');
	}
	function proposePreset(p) {
		pendingPreset = p;
		const desired = p?.spans.length || 0, count = state.cards.length, kept = Math.min(desired, count);
		$('preset-dialog-title').textContent = p ? `Make room for ${p.name.toLowerCase()}.` : 'A clean canvas. A new idea.';
		$('preset-dialog-thumb').innerHTML = p ? thumbnail(p) : '';
		$('preset-dialog-description').textContent = p ? `${p.description} This layout uses ${desired} cards. ${kept ? `Keep the content of your first ${kept} ${kept === 1 ? 'card' : 'cards'}. ` : ''}${desired > count ? `Add ${desired - count} new ${desired - count === 1 ? 'card' : 'cards'}.` : desired < count ? `Remove the last ${count - desired} ${count - desired === 1 ? 'card' : 'cards'} and their content.` : 'Your card count stays the same.'} All card spans and grid settings will use this preset.` : `Remove all ${count} cards and begin with a responsive, empty grid. Your current layout can be restored with Undo.`;
		if (!count) { applyPendingPreset(); return; }
		$('preset-dialog').showModal();
	}
	function applyPendingPreset() {
		commit(() => {
			state = pendingPreset ? M.applyPreset(pendingPreset, state) : { name: 'Your own thing', preset: null, nextId: state.nextId, cards: [], grid: { '2xl': { columns: 4 }, md: { columns: 2 }, smallscreen: { columns: 1 } } };
			if (!state.cards.some(c => c.id === selected)) selected = null;
		}, pendingPreset ? 'Layout applied across all screens.' : 'Your canvas is ready.');
	}
	$('preset-dialog').addEventListener('close', () => { if ($('preset-dialog').returnValue === 'apply') applyPendingPreset(); });
	$('preset-gallery').addEventListener('click', e => { const el = e.target.closest('[data-preset]'); if (el) proposePreset(M.presets.find(p => p.id === el.dataset.preset)); });
	$('start-blank').onclick = () => proposePreset(null);
	$('add-card').onclick = $('empty-add').onclick = addCard;
	$('panel-toggle').onclick = e => {
		e.stopPropagation();
		const minimized = document.querySelector('.editor-shell').classList.toggle('panel-minimized');
		$('panel-content').hidden = minimized;
		$('inspector-heading').hidden = minimized;
		const label = minimized ? 'Expand settings panel' : 'Minimize settings panel';
		$('panel-toggle').setAttribute('aria-expanded', String(!minimized));
		$('panel-toggle').setAttribute('aria-label', label);
		$('panel-toggle').title = label;
		$('panel-toggle').innerHTML = icon(minimized ? 'expand' : 'minimize');
	};
	$('undo').onclick = () => history(undoStack, redoStack);
	$('redo').onclick = () => history(redoStack, undoStack);
	$('breakpoint-bar').addEventListener('click', e => {
		const el = e.target.closest('[data-breakpoint]');
		if (!el) return;
		canvasZoom = null;
		active = el.dataset.breakpoint; render();
		document.querySelector(`[data-breakpoint="${active}"]`).focus({ preventScroll: true });
	});
	function setWidth(value, crossBreakpoints = false) {
		if (crossBreakpoints && Number.isFinite(value)) {
			value = Math.max(320, Math.round(value));
			const next = M.breakpoints.find(bp => value >= bp.min && value <= bp.max).id;
			const changed = next !== active;
			active = next;
			widths[active] = value;
			renderBreakpoints(); renderCards();
			if (changed) renderInspector();
			return;
		}
		const bp = activeBreakpoint();
		if (!Number.isFinite(value)) { $('preview-width').value = widths[active]; return; }
		widths[active] = Math.max(bp.min, Math.min(bp.max, Math.round(value)));
		renderBreakpoints(); renderCards();
	}
	$('fit-screen').onclick = () => { canvasZoom = null; resizePreview(); };
	const resizer = $('screen-resizer');
	resizer.onpointerdown = e => {
		if (e.button !== 0 || screenDrag) return;
		e.preventDefault(); e.stopPropagation();
		canvasZoom = currentScale;
		screenDrag = { pointerId: e.pointerId, x: e.clientX, width: widths[active], scale: currentScale, widths: { ...widths }, active };
		resizer.setPointerCapture(e.pointerId);
		resizer.focus({ preventScroll: true });
		$('preview-holder').classList.add('resizing');
	};
	resizer.onpointermove = e => {
		if (!screenDrag || screenDrag.pointerId !== e.pointerId) return;
		// The centered screen grows equally to the left and right.
		const width = screenDrag.width + (e.clientX - screenDrag.x) * 2 / screenDrag.scale;
		setWidth(Math.min(Math.max(3840, screenDrag.width), width), true);
	};
	function finishScreenResize(cancel = false) {
		if (!screenDrag) return;
		const drag = screenDrag;
		screenDrag = null;
		$('preview-holder').classList.remove('resizing');
		if (resizer.hasPointerCapture(drag.pointerId)) resizer.releasePointerCapture(drag.pointerId);
		if (cancel) { Object.assign(widths, drag.widths); active = drag.active; render(); }
	}
	resizer.onpointerup = () => finishScreenResize();
	resizer.onpointercancel = () => finishScreenResize(true);
	resizer.onlostpointercapture = () => finishScreenResize();
	resizer.onkeydown = e => {
		if (e.key === 'Escape' && screenDrag) { e.preventDefault(); e.stopPropagation(); finishScreenResize(true); return; }
		const step = e.shiftKey ? 64 : 16;
		const value = { ArrowLeft: widths[active] - step, ArrowRight: widths[active] + step, Home: 320, End: Math.max(3840, widths[active]) }[e.key];
		if (value === undefined) return;
		e.preventDefault(); e.stopPropagation();
		canvasZoom = currentScale;
		setWidth(Math.min(Math.max(3840, widths[active]), value), true);
	};
	$('preview-slider').oninput = e => setWidth(Number(e.target.value));
	$('preview-width').oninput = e => {
		const value = Number(e.target.value), bp = activeBreakpoint();
		if (Number.isInteger(value) && value >= bp.min && value <= bp.max) setWidth(value);
	};
	$('preview-width').onchange = e => setWidth(e.target.value === '' ? NaN : Number(e.target.value));
	function selectCard(e) {
		const el = e.target.closest('[data-card]');
		if (!el) return;
		selected = Number(el.dataset.card); renderCards(); renderInspector();
		document.querySelector(`[data-card="${selected}"]`).focus({ preventScroll: true });
	}
	function clearSelection() {
		if (selected === null) return;
		selected = null;
		renderCards(); renderInspector();
	}
	document.addEventListener('click', e => {
		if (e.target.closest('.saBento, .inspector, button, input, textarea, select, a, label, dialog') || document.querySelector('dialog[open]')) return;
		clearSelection();
	});
	$('bento-grid').onclick = selectCard;
	$('bento-grid').onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectCard(e); } };
	document.querySelector('.inspector').addEventListener('click', e => {
		const step = e.target.closest('[data-step]');
		const reset = e.target.closest('[data-reset]');
		if (step) {
			const input = $(step.dataset.target);
			edit(input.dataset.scope, input.dataset.property, Math.max(Number(input.min), Math.min(Number(input.max), Number(input.value) + Number(step.dataset.step))));
			document.querySelector(`[data-target="${step.dataset.target}"][data-step="${step.dataset.step}"]`)?.focus({ preventScroll: true });
		} else if (reset) {
			const settings = reset.dataset.scope === 'grid' ? state.grid : currentCard().settings;
			commit(() => { delete settings[active][reset.dataset.reset]; state.preset = null; }, 'Inherited value restored.');
			$(`${reset.dataset.scope}-${reset.dataset.reset}`)?.focus({ preventScroll: true });
		} else if (e.target.closest('#remove-card')) {
			commit(() => { const index = state.cards.findIndex(c => c.id === selected); state.cards.splice(index, 1); selected = state.cards[Math.min(index, state.cards.length - 1)]?.id ?? null; state.preset = null; }, 'Card removed from every breakpoint.');
		} else if (e.target.closest('#fit-card')) edit('card', 'col', M.effective(state.grid, 'columns', active).value);
		else if (e.target.closest('#fit-all')) commit(() => {
			const cols = M.effective(state.grid, 'columns', active).value;
			state.cards.forEach(c => { if (M.effective(c.settings, 'col', active).value > cols) (c.settings[active] ||= {}).col = cols; });
			state.preset = null;
		}, 'Cards fitted. Smaller screens inherit until their next override.');
	});
	document.querySelector('.inspector').addEventListener('change', e => {
		const el = e.target;
		if (el.dataset.property) {
			if (!el.validity.valid || !Number.isInteger(Number(el.value)) || el.value === '') { renderInspector(); toast('Enter a whole number within the displayed limits.'); return; }
			edit(el.dataset.scope, el.dataset.property, Number(el.value)); $(el.id)?.focus({ preventScroll: true });
		} else if (el.id === 'card-title' && currentCard().title !== el.value) {
			const value = el.value.trim() || 'Untitled card';
			commit(() => currentCard().title = value);
			$('card-title').focus({ preventScroll: true });
		}
	});
	document.addEventListener('keydown', e => {
		if (e.key === 'Escape' && !document.querySelector('dialog[open]')) {
			e.preventDefault();
			if (selected !== null) {
				if (e.target instanceof HTMLElement) e.target.blur();
				clearSelection();
				$('canvas-area').focus({ preventScroll: true });
			}
			return;
		}
		if (e.target.matches('input,textarea,[contenteditable]') || document.querySelector('dialog[open]')) return;
		if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? history(redoStack, undoStack) : history(undoStack, redoStack); }
	});
	new ResizeObserver(resizePreview).observe($('canvas-area'));
	render();
})();
