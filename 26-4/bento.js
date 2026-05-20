document.addEventListener('DOMContentLoaded', () => {

	// ── Config ─────────────────────────────────────────────
	let activeBp = '';

	const BP_ORDER = ['2xl', 'xl', 'lg', 'md', 'sm', 'base']; // Desktop → Mobile
	const BP_PREFIX = {
		base: '',
		sm: 'Sm',
		md: 'Md',
		lg: 'Lg',
		xl: 'Xl',
		'2xl': '2xl'
	};

		function updateBentoColumns() {
		$('.saBentoWrapper').each(function () {
			const columns = window
				.getComputedStyle(this)
				.getPropertyValue('grid-template-columns')
				.split(' ')
				.length;

			this.style.setProperty('--columns', columns);
			console.log(columns);
		});
	}

	$(document).ready(updateBentoColumns);
	$(window).on('resize', updateBentoColumns);


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
			result[bp][type] = parseInt(value, 10);
		});

		return result;
	}

	// ── Desktop-first effective state ─────────────────────
	function getEffectiveState(el) {
		const parsed = parseClasses(el.className || '');
		const currentIndex = BP_ORDER.indexOf(activeBp);

		const result = { Col: null, Row: null, GridCol: null };
		const source = {};

		['Col', 'Row', 'GridCol'].forEach(type => {
			// 1. Exact match at current breakpoint
			if (parsed[activeBp]?.[type] !== undefined) {
				result[type] = parsed[activeBp][type];
				source[type] = activeBp;
				return;
			}

			// 2. Look for stronger (larger) breakpoints first (desktop-first)
			for (let i = 0; i < currentIndex; i++) {
				const bp = BP_ORDER[i];
				if (parsed[bp]?.[type] !== undefined) {
					result[type] = parsed[bp][type];
					source[type] = bp;
					return;
				}
			}

			// 3. Fall back to weaker (smaller) breakpoints
			for (let i = currentIndex + 1; i < BP_ORDER.length; i++) {
				const bp = BP_ORDER[i];
				if (parsed[bp]?.[type] !== undefined) {
					result[type] = parsed[bp][type];
					source[type] = bp;
					return;
				}
			}
		});

		return { values: result, source };
	}

	// ── Class manipulation ─────────────────────────────────
	function setClass(el, bp, type, value) {
		const prefix = BP_PREFIX[bp];
		let classes = (el.className || '').split(/\s+/);

		// Remove ALL existing Col/Row/GridCol classes (any breakpoint)
		classes = classes.filter(c => !c.match(/^sa(Sm|Md|Lg|Xl|2xl)?(?:Col|Row|GridCol)\d+$/));

		if (value && value > 0) {
			classes.push(`sa${prefix}${type}${value}`);
		}

		el.className = classes.join(' ').trim();
	}

	function setGridCols(value) {
		setClass(wrapper, activeBp, 'GridCol', value ? parseInt(value) : null);
	}

	function setCardSpan(li, spanType, value) {
		const num = value ? parseInt(value) : null;
		const cssType = spanType === 'col' ? 'Col' : 'Row';
		setClass(li, activeBp, cssType, num);
	}

	// ── UI Sync ────────────────────────────────────────────
	function updateSelect(select, value, sourceBp) {
		select.value = value || '';

		const isInherited = sourceBp && sourceBp !== activeBp;
		select.classList.toggle('is-inherited', isInherited);
		select.dataset.source = sourceBp || '';
		select.title = isInherited
			? `Inherited from ${sourceBp} (larger breakpoint)`
			: `Set at ${activeBp}`;
	}

	function syncGrid() {
		const { values, source } = getEffectiveState(wrapper);
		const gridSelect = document.querySelector('.saGridColSizerSelect');
		if (gridSelect) {
			gridSelect.value = values.GridCol || '';
			gridSelect.classList.toggle('is-inherited', source.GridCol !== activeBp);
		}
	}

	function syncCard(li) {
		const { values, source } = getEffectiveState(li);
		const colSelect = li.querySelector('[data-type="col"]');
		const rowSelect = li.querySelector('[data-type="row"]');

		if (colSelect) updateSelect(colSelect, values.Col, source.Col);
		if (rowSelect) updateSelect(rowSelect, values.Row, source.Row);
	}

	function refreshUI() {
		syncGrid();
		document.querySelectorAll('li.saBento').forEach(syncCard);
	}

	// ── UI Setup ───────────────────────────────────────────
	function initUI() {
		// Grid columns control
		const gridWrap = document.createElement('label');
		gridWrap.className = 'saGridColSizerLabel';
		gridWrap.innerHTML = `
			<span class="saGridColSizerBp">${activeBp}:</span>
			<select class="saGridColSizerSelect">
				<option value="">—</option>
				${Array.from({length: 12}, (_, i) => `<option value="${i+1}">${i+1}</option>`).join('')}
			</select>
		`;
		wrapper.after(gridWrap);

		gridWrap.querySelector('select').addEventListener('change', e => {
			setGridCols(e.target.value);
			refreshUI();
		});

		// Per-card controls
		document.querySelectorAll('li.saBento').forEach(li => {
			const fieldset = document.createElement('div');
			fieldset.className = 'saBentoSizer';
			fieldset.innerHTML = `
				<label>Col <select data-type="col">
					<option value="">—</option>
					${Array.from({length: 12}, (_, i) => `<option value="${i+1}">${i+1}</option>`).join('')}
				</select></label>
				<label>Row <select data-type="row">
					<option value="">—</option>
					${Array.from({length: 12}, (_, i) => `<option value="${i+1}">${i+1}</option>`).join('')}
				</select></label>
			`;

			li.querySelector('article').prepend(fieldset);

			fieldset.addEventListener('change', e => {
				if (e.target.tagName !== 'SELECT') return;
				setCardSpan(li, e.target.dataset.type, e.target.value);
				refreshUI();
			});
		});
	}

	// ── Communication with preview.html ───────────────────
	window.addEventListener('message', e => {
		const { type, bp, value } = e.data || {};

		if (type === 'SET_BP') {
			activeBp = bp;
			refreshUI();
		}

		if (type === 'SET_GRID_COLS') {
			setGridCols(value);
			refreshUI();
		}
	});

	// ── Initialize ─────────────────────────────────────────
	initUI();
	refreshUI();

	// Debug helper
	window.bentoDebug = { getEffectiveState, setCardSpan, activeBp, setClass };
});