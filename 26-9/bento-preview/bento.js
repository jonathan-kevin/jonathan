(() => {
	'use strict';
	const M = window.BentoModel;
	const $ = id => document.getElementById(id);
	const esc = M.escapeHtml;
	const icons = { plus: 'plus', minimize: 'minus', expand: 'table-columns', undo: 'arrow-rotate-left', redo: 'arrow-rotate-right', grid: 'border-all', layers: 'layer-group', pointer: 'arrow-pointer', card: 'rectangle', trash: 'trash-can' };
	const icon = name => `<i class="saIcon far fa-${icons[name] || 'border-all'}" aria-hidden="true"></i>`;
	document.querySelectorAll('[data-icon]').forEach(el => el.innerHTML = icon(el.dataset.icon));
	const emptyLayout = () => ({ name: 'Start from scratch', preset: 'blank', nextId: 1, cards: [], sharedCards: {}, grid: { '2xl': { columns: 4 } } });
	let state = M.applyPreset(M.presets.find(p => p.id === 'spotlight'));
	let active = '2xl';
	let selected = [];
	const widths = Object.fromEntries(M.breakpoints.map(b => [b.id, b.width]));
	const undoStack = [], redoStack = [];
	let screenDrag = null, showGrid = false, maxWidth = false;
	let previewPreferences = { sidebarMinimized: false, theme: 'system' };
	const storageKey = 'softadmin-bento-preview:v1';
	let saveTimer, clearingMemory = false;
	function saveWork() {
		clearTimeout(saveTimer);
		if (clearingMemory) return;
		try {
			localStorage.setItem(storageKey, JSON.stringify({ version: 1, state, selected, active, widths, showGrid, maxWidth,
				showGuides: !$('breakpoint-guides').hidden,
				panelMinimized: document.querySelector('.saBentoEditor').classList.contains('saPanelMinimized'),
				details: Object.fromEntries(['inheritance-overview', 'all-card-controls', 'card-appearance'].map(id => [id, $(id).open])),
				previewPreferences }));
		} catch { /* Editing remains available when browser storage is unavailable or full. */ }
	}
	function scheduleSave() { clearTimeout(saveTimer); saveTimer = setTimeout(saveWork, 150); }
	function restoreWork() {
		try {
			const saved = JSON.parse(localStorage.getItem(storageKey));
			const restored = saved?.version === 1 && M.restoreState(saved.state);
			if (!restored) return;
			state = restored;
			selected = [...new Set(Array.isArray(saved.selected) ? saved.selected : [saved.selected])].filter(id => state.cards.some(c => c.id === id));
			if (M.breakpoints.some(b => b.id === saved.active)) active = saved.active;
			for (const bp of M.breakpoints) {
				const width = saved.widths?.[bp.id];
				if (Number.isSafeInteger(width) && width >= bp.min && width <= bp.max) widths[bp.id] = width;
			}
			maxWidth = saved.maxWidth === true;
			$('max-width-toggle').setAttribute('aria-pressed', String(maxWidth));
			showGrid = saved.showGrid === true;
			$('grid-lines-toggle').setAttribute('aria-pressed', String(showGrid));
			$('breakpoint-guides').hidden = saved.showGuides !== true;
			$('breakpoint-guides-toggle').setAttribute('aria-pressed', String(saved.showGuides === true));
			setPanelMinimized(saved.panelMinimized === true);
			$('card-appearance').dataset.cardId = selected.join(',');
			for (const id of ['inheritance-overview', 'all-card-controls', 'card-appearance']) $(id).open = saved.details?.[id] === true;
			previewPreferences = { sidebarMinimized: saved.previewPreferences?.sidebarMinimized === true,
				theme: ['light', 'dark'].includes(saved.previewPreferences?.theme) ? saved.previewPreferences.theme : 'system' };
		} catch { /* Ignore incompatible or damaged saved data. */ }
	}
	window.addEventListener('pagehide', saveWork);
	document.addEventListener('visibilitychange', () => { if (document.hidden) saveWork(); });
	for (const id of ['inheritance-overview', 'all-card-controls', 'card-appearance']) $(id).addEventListener('toggle', scheduleSave);
	const activeBreakpoint = () => M.breakpoints.find(b => b.id === active);
	const selectedCards = () => state.cards.filter(c => selected.includes(c.id));
	const currentCard = () => selectedCards()[0];
	function snapshot() { return { state: structuredClone(state), selected: [...selected] }; }
	function commit(change) {
		undoStack.push(snapshot());
		if (undoStack.length > 100) undoStack.shift();
		redoStack.length = 0;
		change(); render();
	}
	function history(from, to) {
		if (!from.length) return;
		to.push(snapshot());
		const previous = from.pop(); state = previous.state; selected = [...previous.selected];
		render();
	}
	function thumbnail(p) {
		return `<div class="saBentoPresetThumbnail" style="grid-template-columns:repeat(${p.columns},1fr)" aria-hidden="true">${p.spans.map(([col, row]) => `<span class="saBentoPresetTile" style="grid-column:span ${col};grid-row:span ${row}"></span>`).join('')}</div>`;
	}
	function renderGallery() {
		$('preset-gallery').innerHTML = `<button class="saBentoPresetButton ${state.preset === 'blank' ? 'saActive' : ''}" id="start-blank" data-preset="blank" aria-label="Start from scratch, clear all cards and breakpoint overrides" aria-pressed="${state.preset === 'blank'}"><div class="saBentoPresetThumbnail saBlank" aria-hidden="true">${icon('plus')}</div><span class="saBentoPresetCaption">Start from scratch${state.preset === 'blank' ? '<i class="saIcon far fa-check saBentoPresetCheck" aria-hidden="true"></i>' : ''}</span></button>` + M.presets.map(p => `<button class="saBentoPresetButton ${state.preset === p.id ? 'saActive' : ''}" data-preset="${p.id}" aria-label="Apply ${esc(p.name)} preset, ${p.spans.length} cards" aria-pressed="${state.preset === p.id}">${thumbnail(p)}<span class="saBentoPresetCaption">${p.name}${state.preset === p.id ? '<i class="saIcon far fa-check saBentoPresetCheck" aria-hidden="true"></i>' : p.tag ? `<span class="saBentoPresetTag">${p.tag}</span>` : ''}</span></button>`).join('');
	}
	function renderBreakpoints() {
		$('breakpoint-bar').innerHTML = M.breakpoints.map((b, i) => `<button class="saDefaultButtonSecondary saBentoBreakpoint ${b.id === active ? 'saActive' : ''}" data-breakpoint="${b.id}" aria-pressed="${b.id === active}" title="${b.label}: ${b.min}${b.max === Infinity ? '+' : '–' + b.max}px"><span>${b.id}</span>${i === 0 ? '<span class="saBentoBaseLabel">base</span>' : ''}</button>`).join('');
		const bp = activeBreakpoint();
		$('viewport-description').textContent = `${bp.label} · ${bp.min}${bp.max === Infinity ? 'px and up' : '–' + bp.max + 'px'}`;
		$('preview-width').min = 320;
		$('preview-width').removeAttribute('max');
		$('preview-width').value = widths[active];
		document.querySelectorAll('.saBentoInheritanceChain b').forEach((el, i) => el.classList.toggle('saCurrent', M.breakpoints[i].id === active));
	}
	function applyEditorTheme() {
		if (previewPreferences.theme === 'system') document.documentElement.removeAttribute('data-theme');
		else document.documentElement.dataset.theme = previewPreferences.theme;
	}
	function renderCards() {
		applyEditorTheme();
		scheduleSave();
		resizePreview();
		$('preview-frame').contentWindow?.postMessage({ type: 'BENTO_RENDER', state, selected, showGrid, maxWidth, previewPreferences }, location.origin);
	}
	function resizePreview() {
		const width = widths[active];
		const area = $('canvas-area');
		const style = getComputedStyle(area);
		const chromeHeight = document.querySelector('.saBentoScreenHeader').offsetHeight;
		const previewHeight = Math.max(1, area.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom) - chromeHeight - 16);
		$('preview-frame').style.width = width + 'px';
		$('preview-frame').style.height = previewHeight + 'px';
		$('preview-frame').dataset.breakpoint = active;
		$('preview-holder').style.width = width + 'px';
		$('preview-holder').style.height = chromeHeight + previewHeight + 'px';
		$('screen-size').textContent = `${width}px`;
		$('breakpoint-guides').style.top = chromeHeight + 'px';
		const guides = $('breakpoint-guides');
		if (!guides.children.length) {
			guides.innerHTML = M.breakpoints.map(bp => `<div class="saBentoBreakpointGuide" style="left:${bp.min}px"><span class="saBentoBreakpointGuideLabel">${bp.id} · ${bp.min}px</span></div>`).join('');
		}
		M.breakpoints.forEach((bp, index) => {
			const guide = guides.children[index], outside = bp.min > width;
			guide.hidden = outside;
			const label = guide.querySelector('.saBentoBreakpointGuideLabel');
			if (bp.id === active) label.setAttribute('aria-current', 'true');
			else label.removeAttribute('aria-current');
		});
		$('preview-holder').setAttribute('aria-label', `${width}px screen, ${active} breakpoint, actual size`);
		$('screen-resizer').setAttribute('aria-valuenow', width);
		$('screen-resizer').setAttribute('aria-valuemax', Math.max(3840, width));
		$('screen-resizer').setAttribute('aria-valuetext', `${width} pixels, ${active} breakpoint`);
	}
	function property(settings, prop, label, scope, min, max, unit = '') {
		const group = scope === 'card' ? selectedCards().map(c => c.settings) : [settings];
		const values = group.map(s => M.effective(s, prop, active));
		const { value, source } = values[0];
		const mixedValue = values.some(v => v.value !== value), mixedSource = values.some(v => v.source !== source);
		const own = values.some(v => v.source === active), base = active === '2xl';
		const targets = [...new Set(group.flatMap(s => M.affected(s, prop, active)))];
		const id = `${scope}-${prop}`;
		const impact = `${targets.length ? 'Edits also affect ' + targets.join(', ') : 'Edits affect only ' + active}.`;
		return `<div class="saBentoProperty ${own && !base ? 'saOverridden' : ''}"><div class="saBentoPropertyHead"><label for="${id}">${label}${unit ? ' (' + unit + ')' : ''}</label><span class="saBentoSource ${own ? '' : 'saInherited'}">${mixedSource ? 'Mixed sources' : base ? 'Base value' : own ? 'Override' : 'Inherited from ' + source}</span></div><div class="saInputTextWrapper saBentoStepper"><button class="saDefaultIconButtonGhost saBentoIconButton" type="button" data-step="-1" data-target="${id}" aria-label="Decrease ${label.toLowerCase()}" ${values.every(v => v.value <= min) ? 'disabled' : ''}>−</button><input class="saInputText" type="number" id="${id}" min="${min}" max="${max}" value="${mixedValue ? '' : value}" placeholder="Mixed" data-scope="${scope}" data-property="${prop}" aria-describedby="${id}-impact"><button class="saDefaultIconButtonGhost saBentoIconButton" type="button" data-step="1" data-target="${id}" aria-label="Increase ${label.toLowerCase()}" ${values.every(v => v.value >= max) ? 'disabled' : ''}>+</button></div><div class="saBentoPropertyFoot"><small id="${id}-impact" title="${esc(impact)}">${esc(impact)}</small>${own && !base ? `<button class="saDefaultButtonSecondary saBentoReset" data-reset="${prop}" data-scope="${scope}" aria-label="Reset ${label.toLowerCase()} to inherited">Reset to inherited</button>` : ''}</div></div>`;
	}
	function renderInheritance() {
		const multi = selected.length > 1, overview = $('inheritance-overview');
		const summary = overview.querySelector('summary');
		summary.setAttribute('aria-disabled', String(multi));
		summary.title = multi ? 'Select one card to view its values across breakpoints.' : '';
		if (multi) { overview.open = false; $('inheritance-table').innerHTML = ''; return; }
		const card = currentCard();
		const cell = (settings, prop, bp) => {
			const { value, source } = M.effective(settings, prop, bp);
			const label = source !== bp ? `From ${source}` : bp === '2xl' ? 'Base' : 'Override';
			return `<td class="saBentoInheritanceValue ${source !== bp ? 'saInherited' : 'saExplicit'}"><strong>${value}</strong><small>${label}</small></td>`;
		};
		$('inheritance-table').innerHTML = `<table class="saBentoInheritanceTable"><caption class="saBentoVisuallyHidden">Effective values and their source breakpoint${card ? ' for the selected card' : ''}</caption><thead><tr><th scope="col">Screen</th><th scope="col">Columns</th>${card ? '<th scope="col">Col span</th><th scope="col">Row span</th>' : ''}</tr></thead><tbody>${M.breakpoints.map(b => `<tr class="${b.id === active ? 'saActive' : ''}"><th scope="row"><button type="button" data-table-bp="${b.id}" ${b.id === active ? 'aria-current="true"' : ''}>${b.id}</button></th>${cell(state.grid, 'columns', b.id)}${card ? cell(card.settings, 'col', b.id) + cell(card.settings, 'row', b.id) : ''}</tr>`).join('')}</tbody></table>`;
	}
	$('inheritance-overview').onclick = e => { if (selected.length > 1) { e.preventDefault(); return; } const button = e.target.closest('[data-table-bp]'); if (button) { active = button.dataset.tableBp; render(); } };
	$('inheritance-overview').addEventListener('keydown', e => { if (selected.length > 1 && ['Enter', ' '].includes(e.key)) e.preventDefault(); });
	$('inheritance-overview').addEventListener('toggle', () => { if (selected.length > 1) $('inheritance-overview').open = false; });
	function appearanceControls() {
		const c = { ...M.card(0, 0), ...state.cards[0], ...state.sharedCards };
		const mixed = field => state.cards.some(card => card[field] !== c[field]);
		const select = (field, label, choices, value) => `<label class="saBentoAppearanceField">${label}<span class="saInputTextWrapper"><select class="saInputText saDropdown" id="card-${field}" data-card-field="${field}">${mixed(field) ? '<option value="" selected disabled>Varies by card</option>' : ''}${choices.map(([id, name]) => `<option value="${id}" ${!mixed(field) && id === value ? 'selected' : ''}>${name}</option>`).join('')}</select><span class="saTrailingIconsWrapper"><i class="saIcon far fa-angle-down" aria-hidden="true"></i></span></span></label>`;
		const toggle = (field, label) => `<label class="saToggleWrapper"><span class="saToggleLabelWrapper"><span class="saToggleLabel">${label}</span></span><input class="saToggle" type="checkbox" role="switch" id="card-${field}" data-card-field="${field}" ${c[field] ? 'checked' : ''}></label>`;
		const image = c.style === 'image' && !mixed('style');
		const styles = `<fieldset class="saRadioWrapper saBentoStyleOptions"><legend>Card style</legend>${M.cardStyles.map(([value, label]) => `<label class="saRadioLabel"><input class="saRadio" type="radio" name="card-style" id="card-style-${value}" data-card-field="style" value="${value}" ${!mixed('style') && c.style === value ? 'checked' : ''}><span>${label}</span></label>${value === 'image' && image ? `<div class="saBentoImageOptions" role="group" aria-label="Image settings">${select('imageSize', 'Image size', [['small', 'Small'], ['medium', 'Medium'], ['large', 'Large']], c.imageSize || 'large')}${toggle('wrapped', 'Inset image')}${select('imageFit', 'Image fit', [['cover', 'Cover'], ['contain', 'Contain']], c.imageFit || 'cover')}</div>` : ''}`).join('')}</fieldset>`;
		return `<div class="saBentoAppearance">
			<h3>Appearance · all cards</h3>
			${styles}
			${toggle('solid', 'Solid background')}
			${toggle('showTags', 'Show tags')}
			${toggle('showFooter', 'Show footer')}
			${toggle('showFavorite', 'Favorite button')}
			${toggle('showAction', 'Bottom action button')}
		</div>`;
	}
	function renderInspector() {
		renderInheritance();
		const columns = M.effective(state.grid, 'columns', active).value;
		const invalid = state.cards.filter(c => M.effective(c.settings, 'col', active).value > columns);
		$('grid-controls').innerHTML = property(state.grid, 'columns', 'Columns', 'grid', 1, 16) + (invalid.length ? `<div class="saBentoValidation" role="status">${invalid.length} ${invalid.length === 1 ? 'card exceeds' : 'cards exceed'} ${columns} columns. Choose Fit to correct their spans.<button class="saDefaultButtonSecondary" id="fit-all">Fit ${invalid.length === 1 ? 'card' : 'all cards'} to this grid</button></div>` : '');
		const c = currentCard(), cards = selectedCards(), multi = cards.length > 1;
		$('grid-settings').hidden = !!c;
		$('preset-panel').hidden = !!c;
		$('card-inspector').hidden = !c;
		$('inspector-heading').textContent = 'Bento settings';
		$('all-card-controls').hidden = !!c;
		$('all-card-fields').innerHTML = appearanceControls();
		const appearanceOpen = c && $('card-appearance').open && (multi || $('card-appearance').dataset.cardId.includes(',') || $('card-appearance').dataset.cardId === String(c.id));
		$('card-appearance').hidden = !c;
		$('card-appearance').open = !!appearanceOpen;
		$('card-appearance').dataset.cardId = selected.join(',');
		$('card-appearance-fields').innerHTML = c ? `<div class="saBentoAppearance"><label class="saBentoAppearanceField">Card title<span class="saInputTextWrapper"><input class="saInputText" id="card-title" data-card-field="title" value="${esc(c.title)}" maxlength="120"></span></label><label class="saBentoAppearanceField">Description<span class="saInputTextWrapper"><input class="saInputText" id="card-description" data-card-field="description" value="${esc(c.description)}" maxlength="500"></span></label><label class="saBentoAppearanceField">Icon name<span class="saInputTextWrapper"><input class="saInputText" id="card-icon" data-card-field="icon" value="${esc(c.icon || 'link')}" placeholder="car" maxlength="80" pattern="[a-zA-Z0-9-]+" title="Enter an icon name, for example car or arrow-right"></span></label><label class="saBentoAppearanceField">Color · ${multi ? 'selected cards' : 'this card'}<span class="saInputTextWrapper"><select class="saInputText saDropdown" id="card-tone" data-card-field="tone">${M.cardColors.map(([value, label]) => `<option value="${value}" ${value === c.tone ? 'selected' : ''}>${label}</option>`).join('')}</select><span class="saTrailingIconsWrapper"><i class="saIcon far fa-angle-down" aria-hidden="true"></i></span></span></label></div>` : '';
		$('card-inspector').innerHTML = c ? `<section class="saBentoInspectorSection" id="card-layout"><div class="saBentoSectionLabel">${icon('grid')}<h3>Card layout</h3><span class="saBentoSelectedLabel">${multi ? cards.length + ' cards selected' : 'Card ' + String(state.cards.indexOf(c) + 1).padStart(2, '0')}</span></div>${property(c.settings, 'col', 'Column span', 'card', 1, 16)}${property(c.settings, 'row', 'Row span', 'card', 1, 16)}${cards.some(card => M.effective(card.settings, 'col', active).value > columns) ? '<div class="saBentoValidation">Selected cards exceed the grid width.<button class="saDefaultButtonSecondary" id="fit-card">Fit to ' + columns + ' columns</button></div>' : ''}<div class="saActionLinks saBentoCardActions"><button class="saDefaultButtonSecondary" id="duplicate-card"><i class="saIcon far fa-clone" aria-hidden="true"></i>Duplicate${multi ? ' cards' : ''}</button><button class="saDefaultButtonSecondary saDestructive" id="remove-card">${icon('trash')}Remove ${multi ? 'cards' : 'card'}</button></div><p class="saBentoGlobalNote">Card order, additions and removals apply to every screen.</p></section>` : '';
		if (c) {
			for (const field of ['title', 'description', 'icon']) {
				const input = $(`card-${field}`);
				input.disabled = multi;
				if (multi) {
					input.title = 'Select one card to edit this field.';
					if (cards.some(card => card[field] !== c[field])) { input.value = ''; input.placeholder = 'Multiple values'; }
				}
			}
			if (cards.some(card => card.tone !== c.tone)) {
				const option = new Option('Mixed colors', '__mixed__', true, true);
				option.disabled = true;
				$('card-tone').prepend(option);
				$('card-tone').selectedIndex = 0;
			}
		}

	}
	function render() {
		renderGallery(); renderBreakpoints(); renderCards(); renderInspector();
		$('undo').disabled = !undoStack.length; $('redo').disabled = !redoStack.length;
	}
	function edit(scope, prop, value, step = 0) {
		const next = structuredClone(state);
		const targets = scope === 'grid' ? [{ settings: next.grid }] : next.cards.filter(c => selected.includes(c.id));
		if (!M.editCards(targets, active, prop, value, step)) return;
		commit(() => { state = next; state.preset = null; });
	}
	function addCard() {
		commit(() => { const c = M.card(state.cards.length, state.nextId++, state.sharedCards); c.title = `Shortcut ${c.id}`; state.cards.push(c); selected = [c.id]; state.preset = null; });
	}
	function applyPreset(p) {
		commit(() => {
			state = p ? M.applyPreset(p, state) : emptyLayout();
			selected = selected.filter(id => state.cards.some(c => c.id === id));
		});
	}
	$('preset-gallery').addEventListener('click', e => { const el = e.target.closest('[data-preset]'); if (el) applyPreset(M.presets.find(p => p.id === el.dataset.preset)); });
	$('add-card').onclick = addCard;
	$('clear-memory').onclick = () => {
		if (!window.confirm('Clear saved Bento memory?\n\nThis resets your layout and editor preferences to the defaults and reloads the editor. This cannot be undone.')) return;
		clearingMemory = true;
		clearTimeout(saveTimer);
		try { localStorage.removeItem(storageKey); }
		catch {
			clearingMemory = false;
			window.alert('The browser could not clear saved Bento memory. Your layout has not been reset.');
			return;
		}
		// pagehide/visibilitychange must not save the old layout back during reload.
		location.reload();
	};
	function setPanelMinimized(minimized) {
		document.querySelector('.saBentoEditor').classList.toggle('saPanelMinimized', minimized);
		$('panel-content').hidden = minimized;
		$('inspector-heading').hidden = minimized;
		const label = minimized ? 'Expand settings panel' : 'Minimize settings panel';
		$('panel-toggle').setAttribute('aria-expanded', String(!minimized));
		$('panel-toggle').setAttribute('aria-label', label);
		$('panel-toggle').title = label;
		$('panel-toggle').innerHTML = icon(minimized ? 'expand' : 'minimize');
	}
	$('panel-toggle').onclick = e => {
		e.stopPropagation();
		setPanelMinimized(! $('panel-content').hidden);
		scheduleSave();
	};
	$('undo').onclick = () => history(undoStack, redoStack);
	$('redo').onclick = () => history(redoStack, undoStack);
	$('breakpoint-bar').addEventListener('click', e => {
		const el = e.target.closest('[data-breakpoint]');
		if (!el) return;
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
	$('fit-screen').onclick = () => {
		const area = $('canvas-area'), style = getComputedStyle(area);
		const width = Math.floor(area.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - 32);
		setWidth(Math.max(320, width), true);
		area.scrollLeft = 0;
	};
	$('breakpoint-guides-toggle').onclick = () => {
		const visible = $('breakpoint-guides').hidden;
		$('breakpoint-guides').hidden = !visible;
		$('breakpoint-guides-toggle').setAttribute('aria-pressed', String(visible));
		scheduleSave();
	};
	$('max-width-toggle').onclick = () => {
		maxWidth = !maxWidth;
		$('max-width-toggle').setAttribute('aria-pressed', String(maxWidth));
		renderCards();
	};
	$('grid-lines-toggle').onclick = () => {
		showGrid = !showGrid;
		$('grid-lines-toggle').setAttribute('aria-pressed', String(showGrid));
		renderCards();
	};
	const resizer = $('screen-resizer');
	resizer.onpointerdown = e => {
		if (e.button !== 0 || screenDrag) return;
		e.preventDefault(); e.stopPropagation();
		const area = $('canvas-area'), style = getComputedStyle(area);
		const available = area.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
		screenDrag = { pointerId: e.pointerId, x: e.clientX, width: widths[active], available, widths: { ...widths }, active };
		resizer.setPointerCapture(e.pointerId);
		resizer.focus({ preventScroll: true });
		$('preview-holder').classList.add('saResizing');
	};
	resizer.onpointermove = e => {
		if (!screenDrag || screenDrag.pointerId !== e.pointerId) return;
		// Narrow previews are centered; overflowing previews grow from the left edge.
		const { width: startWidth, available } = screenDrag;
		const edge = (startWidth <= available ? (available + startWidth) / 2 : startWidth) + e.clientX - screenDrag.x;
		const width = edge <= available ? edge * 2 - available : edge;
		setWidth(Math.min(Math.max(3840, screenDrag.width), width), true);
	};
	function finishScreenResize(cancel = false) {
		if (!screenDrag) return;
		const drag = screenDrag;
		screenDrag = null;
		$('preview-holder').classList.remove('saResizing');
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
		setWidth(Math.min(Math.max(3840, widths[active]), value), true);
	};
	$('preview-width').oninput = e => {
		const value = Number(e.target.value), bp = activeBreakpoint();
		if (Number.isInteger(value) && value >= 320) setWidth(value, true);
	};
	$('preview-width').onchange = e => setWidth(e.target.value === '' ? NaN : Number(e.target.value), true);
	function clearSelection() {
		if (!selected.length) return;
		selected = [];
		renderCards(); renderInspector();
	}
	document.addEventListener('click', e => {
		if (e.target.closest('.saBento, .saBentoInspector, button, input, textarea, select, a, label')) return;
		clearSelection();
	});
	$('preview-frame').addEventListener('load', renderCards);
	window.addEventListener('message', e => {
		if (e.origin !== location.origin || e.source !== $('preview-frame').contentWindow) return;
		const message = e.data;
		if (!message || typeof message !== 'object') return;
		if (message.type === 'BENTO_PREFERENCES') {
			previewPreferences = { sidebarMinimized: message.sidebarMinimized === true, theme: ['light', 'dark'].includes(message.theme) ? message.theme : 'system' };
			applyEditorTheme();
			scheduleSave();
		}
		if (message.type === 'BENTO_MOVE') {
			const from = state.cards.findIndex(c => c.id === message.id);
			if (from >= 0 && Number.isInteger(message.index) && message.index >= 0 && message.index < state.cards.length && from !== message.index)
				commit(() => { M.moveCard(state, message.id, message.index); if (!selected.includes(message.id)) selected = [message.id]; });
		}
		if (message.type === 'BENTO_READY') renderCards();
		if (message.type === 'BENTO_SELECT' && state.cards.some(c => c.id === message.id)) { selected = M.selectCard(selected, message.id, message.additive === true); renderCards(); renderInspector(); }
		if (message.type === 'BENTO_CLEAR') clearSelection();
		if (message.type === 'BENTO_ADD') addCard();
		if (message.type === 'BENTO_UNDO') history(undoStack, redoStack);
		if (message.type === 'BENTO_REDO') history(redoStack, undoStack);
	});
	document.querySelector('.saBentoInspector').addEventListener('click', e => {
		const step = e.target.closest('[data-step]');
		const reset = e.target.closest('[data-reset]');
		if (step) {
			const input = $(step.dataset.target);
			edit(input.dataset.scope, input.dataset.property, null, Number(step.dataset.step));
			document.querySelector(`[data-target="${step.dataset.target}"][data-step="${step.dataset.step}"]`)?.focus({ preventScroll: true });
		} else if (reset) {
			const settings = reset.dataset.scope === 'grid' ? [state.grid] : selectedCards().map(c => c.settings);
			commit(() => { settings.forEach(s => { if (s[active]) delete s[active][reset.dataset.reset]; }); state.preset = null; });
			$(`${reset.dataset.scope}-${reset.dataset.reset}`)?.focus({ preventScroll: true });
		} else if (e.target.closest('#duplicate-card')) {
			commit(() => { selected = selectedCards().map(card => M.duplicateCard(state, card.id).id); });
		} else if (e.target.closest('#remove-card')) {
			commit(() => { const index = state.cards.findIndex(c => selected.includes(c.id)), single = selected.length === 1; state.cards = state.cards.filter(c => !selected.includes(c.id)); const next = single ? state.cards[Math.min(index, state.cards.length - 1)] : null; selected = next ? [next.id] : []; state.preset = null; });
		} else if (e.target.closest('#fit-card')) commit(() => { const columns = M.effective(state.grid, 'columns', active).value; selectedCards().forEach(card => { if (M.effective(card.settings, 'col', active).value > columns) (card.settings[active] ||= {}).col = columns; }); state.preset = null; });
		else if (e.target.closest('#fit-all')) commit(() => {
			const cols = M.effective(state.grid, 'columns', active).value;
			state.cards.forEach(c => { if (M.effective(c.settings, 'col', active).value > cols) (c.settings[active] ||= {}).col = cols; });
			state.preset = null;
		});
	});
	function commitField(e) {
		const el = e.target;
		if (!el.isConnected || el.disabled) return;
		if (el.dataset.cardField) {
			const field = el.dataset.cardField;
			const individual = ['tone', 'title', 'description', 'icon'].includes(field);
			if (selected.length > 1 && ['title', 'description', 'icon'].includes(field)) return;
			if (el.tagName === 'SELECT' && e.type !== 'change') return;
			if (el.type === 'checkbox' && el.checked === el.defaultChecked) return;
			if (el.type === 'radio' && (e.type !== 'change' || !el.checked)) return;
			let value = el.type === 'checkbox' ? el.checked : el.value.trim();
			if (field === 'icon') {
				if (!el.checkValidity()) { el.reportValidity(); return; }
				value = value.toLowerCase().replace(/^fa-/, '') || 'link';
			}
			if (individual && (!selected.length || selectedCards().every(c => c[field] === value))) return;
			if (!individual && !['checkbox', 'radio'].includes(el.type) && el.tagName === 'INPUT' && el.value === el.defaultValue) return;
			if (!individual && state.sharedCards?.[field] === value) return;
			commit(() => { if (individual) selectedCards().forEach(c => { c[field] = field === 'title' ? value || 'Untitled card' : value; }); else M.setSharedCardField(state, field, value); });
			if (e.type === 'change') $(el.id)?.focus({ preventScroll: true });
			return;
		}
		if (el instanceof HTMLInputElement && el.value === el.defaultValue) return;
		if (el.dataset.property) {
			if (!el.validity.valid || !Number.isInteger(Number(el.value)) || el.value === '') { renderInspector(); return; }
			edit(el.dataset.scope, el.dataset.property, Number(el.value));
			if (e.type === 'change') $(el.id)?.focus({ preventScroll: true });

		}
	}
	document.querySelector('.saBentoInspector').addEventListener('change', commitField);
	document.querySelector('.saBentoInspector').addEventListener('focusout', commitField);
	document.addEventListener('keydown', e => {
		if (e.key === 'Escape') {
			e.preventDefault();
			if (selected.length) {
				if (e.target instanceof HTMLElement) e.target.blur();
				clearSelection();
				$('canvas-area').focus({ preventScroll: true });
			}
			return;
		}
		if (e.target.closest('input,textarea,select,[contenteditable="true"]')) return;
		if (!e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.repeat && !e.isComposing && e.key.toLowerCase() === 'd') {
			e.preventDefault();
			const dark = previewPreferences.theme === 'dark' || (previewPreferences.theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
			previewPreferences.theme = dark ? 'light' : 'dark'; renderCards(); return;
		}
		if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? history(redoStack, undoStack) : history(undoStack, redoStack); }
	});
	new ResizeObserver(resizePreview).observe($('canvas-area'));
	restoreWork();
	render();
})();
