document.addEventListener('DOMContentLoaded', () => {

	// ── Config ─────────────────────────────────────────────

	const BP_ORDER = ['base', 'sm', 'md', 'lg', 'xl', '2xl'];

	const BP_PREFIX = {
		base: '',
		sm: 'Sm',
		md: 'Md',
		lg: 'Lg',
		xl: 'Xl',
		'2xl': '2xl'
	};

	let activeBp = 'lg';

	const wrapper = document.querySelector('.saBentoWrapper');

	// ── Parsing ────────────────────────────────────────────

	function parseClasses(className) {
		const result = {};

		className.split(/\s+/).forEach(cls => {
			const match = cls.match(/^sa(?:(Sm|Md|Lg|Xl|2xl))?(Col|Row|GridCol)(\d+)$/);
			if (!match) return;

			const [, bpRaw, type, value] = match;
			const bp = bpRaw ? bpRaw.toLowerCase() : 'base';

			if (!result[bp]) result[bp] = {};
			result[bp][type] = value;
		});

		return result;
	}

	function getEffectiveState(el) {
		const parsed = parseClasses(el.className || '');
		const currentIndex = BP_ORDER.indexOf(activeBp);

		const result = {};
		const source = {};

		// Desktop-first cascade: prefer the active bp, then walk down toward
		// base as a last resort. This means lg/xl/2xl settings are the
		// authoritative source and smaller breakpoints only override when
		// explicitly set.
		['Col', 'Row', 'GridCol'].forEach(type => {
			// 1. Exact match at the active breakpoint
			if (parsed[activeBp]?.[type]) {
				result[type] = parsed[activeBp][type];
				source[type] = activeBp;
				return;
			}
			// 2. Walk upward (larger breakpoints) — inherit from a bigger sibling
			for (let i = currentIndex + 1; i < BP_ORDER.length; i++) {
				const bp = BP_ORDER[i];
				if (parsed[bp]?.[type]) {
					result[type] = parsed[bp][type];
					source[type] = bp;
					return;
				}
			}
			// 3. Fall back downward (smaller breakpoints) toward base
			for (let i = currentIndex - 1; i >= 0; i--) {
				const bp = BP_ORDER[i];
				if (parsed[bp]?.[type]) {
					result[type] = parsed[bp][type];
					source[type] = bp;
					return;
				}
			}
		});

		return { values: result, source };
	}

	function getEffectiveGridCols() {
		const { values } = getEffectiveState(wrapper);
		return parseInt(values.GridCol || 12, 10);
	}

	// ── Class setter ───────────────────────────────────────

	function setClass(el, bp, type, value) {
		const prefix = BP_PREFIX[bp];
		const classes = (el.className || '').split(/\s+/);

		const filtered = classes.filter(c => !c.startsWith(`sa${prefix}${type}`));

		if (value) {
			filtered.push(`sa${prefix}${type}${value}`);
		}

		el.className = filtered.join(' ');
	}

	// ── API ────────────────────────────────────────────────

	function setGridCols(value) {
		setClass(wrapper, activeBp, 'GridCol', value);
	}

	function setCardSpan(li, type, value) {
		if (type === 'col') {
			value = Math.min(value, getEffectiveGridCols());
		}
		setClass(li, activeBp, type === 'col' ? 'Col' : 'Row', value);
	}

	function normalizeCards() {
		const max = getEffectiveGridCols();

		document.querySelectorAll('li.saBento').forEach(li => {
			const { values } = getEffectiveState(li);

			if (values.Col && parseInt(values.Col, 10) > max) {
				setClass(li, activeBp, 'Col', max);
			}
		});
	}

	// ── UI helpers ─────────────────────────────────────────

	function updateSelect(select, value, sourceBp) {
		select.value = value || '';

		const isInherited = sourceBp !== activeBp;

		select.classList.toggle('is-inherited', isInherited);
		select.dataset.source = sourceBp || '';

		select.title = isInherited
			? `Inherited from ${sourceBp}`
			: `Set on ${activeBp}`;
	}

	function constrainColOptions(select) {
		const max = getEffectiveGridCols();

		[...select.options].forEach(opt => {
			if (!opt.value) return;
			opt.disabled = parseInt(opt.value, 10) > max;
		});
	}

	// ── UI Injection ───────────────────────────────────────

	function buildOptions(max) {
		let html = '<option value="">—</option>';
		for (let i = 1; i <= max; i++) {
			html += `<option value="${i}">${i}</option>`;
		}
		return html;
	}

	// Grid select
	const gridWrap = document.createElement('label');
	gridWrap.className = 'saGridColSizerLabel';

	const gridPrefix = document.createElement('span');
	gridPrefix.className = 'saGridColSizerBp';

	const gridSelect = document.createElement('select');
	gridSelect.className = 'saGridColSizerSelect';
	gridSelect.innerHTML = buildOptions(12);

	gridWrap.append(gridPrefix, gridSelect);
	wrapper.after(gridWrap);

	gridSelect.addEventListener('change', () => {
		setGridCols(gridSelect.value);
		normalizeCards();
		refreshUI();
	});

	// Cards
	document.querySelectorAll('li.saBento').forEach(li => {
		const fieldset = document.createElement('div');
		fieldset.className = 'saBentoSizer';

		fieldset.innerHTML = `
			<label>
				<select data-type="col">${buildOptions(12)}</select>
			</label>
			<label>
				<select data-type="row">${buildOptions(12)}</select>
			</label>
		`;

		li.querySelector('article').prepend(fieldset);

		fieldset.addEventListener('change', e => {
			if (e.target.tagName !== 'SELECT') return;

			const type = e.target.dataset.type;
			const value = e.target.value;

			setCardSpan(li, type, value);
			refreshUI();
		});
	});

	// ── Sync ───────────────────────────────────────────────

	function syncGrid() {
		const { values, source } = getEffectiveState(wrapper);

		gridSelect.value = values.GridCol || '';
		gridPrefix.textContent = activeBp + ': ';

		gridSelect.classList.toggle(
			'is-inherited',
			source.GridCol && source.GridCol !== activeBp
		);
	}

	function syncCard(li) {
		const { values, source } = getEffectiveState(li);

		const colSelect = li.querySelector('[data-type="col"]');
		const rowSelect = li.querySelector('[data-type="row"]');

		updateSelect(colSelect, values.Col, source.Col);
		updateSelect(rowSelect, values.Row, source.Row);

		constrainColOptions(colSelect);
	}

	function syncCards() {
		document.querySelectorAll('li.saBento').forEach(syncCard);
	}

	function refreshUI() {
		syncGrid();
		syncCards();
	}

	// ── Messaging ──────────────────────────────────────────

	window.addEventListener('message', e => {
		const { type, bp, value } = e.data || {};

		if (type === 'SET_BP') {
			activeBp = bp;
			refreshUI();

			e.source?.postMessage({ type: 'BP_CHANGED', bp }, '*');
		}

		if (type === 'SET_GRID_COLS') {
			setGridCols(value);
			normalizeCards();
			refreshUI();
		}
	});

	// ── Init ───────────────────────────────────────────────

	refreshUI();

});