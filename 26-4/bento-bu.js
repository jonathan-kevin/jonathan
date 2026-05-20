document.addEventListener('DOMContentLoaded', () => {

	// ── Config ─────────────────────────────────────────────

	const BP_ORDER = ['base', 'sm', 'md', 'lg', 'xl', '2xl'];

	const BP_PREFIX = {
		base: '',
		sm:   'Sm',
		md:   'Md',
		lg:   'Lg',
		xl:   'Xl',
		'2xl':'2xl'
	};

	// All class types owned by the bento tool (used for reset)
	const ALL_TYPES = ['Col', 'Row', 'GridCol', 'ColStart', 'ColEnd', 'RowStart', 'RowEnd'];

	let activeBp   = 'lg';
	let selectedId = null;

	const wrapper = document.querySelector('.saBentoWrapper');

	// ── Stable IDs ─────────────────────────────────────────

	document.querySelectorAll('li.saBento').forEach((li, i) => {
		if (!li.dataset.bentoId) li.dataset.bentoId = String(i + 1);
	});

	// ── Parsing ────────────────────────────────────────────

	function parseClasses(className) {
		const result = {};

		className.split(/\s+/).forEach(cls => {
			const match = cls.match(
				/^sa(?:(Sm|Md|Lg|Xl|2xl))?(Col|Row|GridCol|ColStart|ColEnd|RowStart|RowEnd)(\d+)$/
			);
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

		ALL_TYPES.forEach(type => {
			if (parsed[activeBp]?.[type]) {
				result[type] = parsed[activeBp][type];
				source[type] = activeBp;
				return;
			}
			for (let i = currentIndex + 1; i < BP_ORDER.length; i++) {
				const bp = BP_ORDER[i];
				if (parsed[bp]?.[type]) {
					result[type] = parsed[bp][type];
					source[type] = bp;
					return;
				}
			}
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

	// ── Responsive summary ─────────────────────────────────

	// For a given element, resolve effective Col/Row at every breakpoint.
	// We temporarily swap activeBp to compute each one.
	function getResponsiveSummary(el) {
		const saved = activeBp;
		const summary = {};

		BP_ORDER.forEach(bp => {
			activeBp = bp;
			const { values } = getEffectiveState(el);
			summary[bp] = {
				Col:      values.Col      || null,
				Row:      values.Row      || null,
				ColStart: values.ColStart || null,
				ColEnd:   values.ColEnd   || null,
				RowStart: values.RowStart || null,
				RowEnd:   values.RowEnd   || null,
			};
		});

		activeBp = saved;
		return summary;
	}

	// ── Class setter ───────────────────────────────────────

	function setClass(el, bp, type, value) {
		const prefix = BP_PREFIX[bp];
		const saPrefix = `sa${prefix}${type}`;
		const re = new RegExp(`^${saPrefix}\\d+$`);
		const classes = (el.className || '').split(/\s+/);
		const filtered = classes.filter(c => !re.test(c));
		if (value) filtered.push(`${saPrefix}${value}`);
		el.className = filtered.filter(Boolean).join(' ');
	}

	function clearClass(el, bp, type) {
		setClass(el, bp, type, null);
	}

	// ── Style application ──────────────────────────────────

	function applyCardStyles() {
		document.querySelectorAll('li.saBento').forEach(li => {
			const { values } = getEffectiveState(li);
			const mode = li.dataset.bentoMode || 'span';

			if (mode === 'placement') {
				const colStart = values.ColStart || '';
				const colEnd   = values.ColEnd   || '';
				const rowStart = values.RowStart  || '';
				const rowEnd   = values.RowEnd    || '';

				li.style.gridColumn = (colStart || colEnd)
					? `${colStart || 'auto'} / ${colEnd || 'auto'}`
					: '';
				li.style.gridRow = (rowStart || rowEnd)
					? `${rowStart || 'auto'} / ${rowEnd || 'auto'}`
					: '';
			} else {
				li.style.gridColumn = '';
				li.style.gridRow    = '';
			}
		});
	}

	// ── Grid ───────────────────────────────────────────────

	function setGridCols(value) {
		setClass(wrapper, activeBp, 'GridCol', value);
	}

	function normalizeCards() {
		const max = getEffectiveGridCols();
		document.querySelectorAll('li.saBento').forEach(li => {
			const { values } = getEffectiveState(li);
			if (values.Col && parseInt(values.Col, 10) > max) {
				setClass(li, activeBp, 'Col', String(max));
			}
		});
	}

	// ── Undo / Redo ────────────────────────────────────────

	// Each entry: { id: string|'__wrapper__', className: string }
	// We snapshot ALL cards + wrapper before every mutation so
	// undo/redo is a single atomic step.

	const undoStack = [];
	const redoStack = [];
	const MAX_HISTORY = 50;

	function snapshotAll() {
		const cards = [...document.querySelectorAll('li.saBento')].map(li => ({
			id:        li.dataset.bentoId,
			className: li.className,
			mode:      li.dataset.bentoMode || 'span',
		}));
		return {
			wrapper:   wrapper.className,
			cards,
		};
	}

	function pushUndo() {
		undoStack.push(snapshotAll());
		if (undoStack.length > MAX_HISTORY) undoStack.shift();
		redoStack.length = 0; // clear redo on new action
		broadcastHistoryState();
	}

	function restoreSnapshot(snapshot) {
		wrapper.className = snapshot.wrapper;
		snapshot.cards.forEach(({ id, className, mode }) => {
			const li = getCardById(id);
			if (!li) return;
			li.className        = className;
			li.dataset.bentoMode = mode;
		});
		applyCardStyles();
		if (selectedId) broadcastCardState(selectedId);
		broadcastHistoryState();
	}

	function undo() {
		if (!undoStack.length) return;
		redoStack.push(snapshotAll());
		restoreSnapshot(undoStack.pop());
	}

	function redo() {
		if (!redoStack.length) return;
		undoStack.push(snapshotAll());
		restoreSnapshot(redoStack.pop());
	}

	function broadcastHistoryState() {
		window.parent?.postMessage({
			type:    'HISTORY_STATE',
			canUndo: undoStack.length > 0,
			canRedo: redoStack.length > 0,
		}, '*');
	}

	// ── Selection ──────────────────────────────────────────

	function getCardById(id) {
		return document.querySelector(`li.saBento[data-bento-id="${id}"]`);
	}

	function getCardLabel(li) {
		const heading = li.querySelector('h1,h2,h3,h4');
		if (heading) {
			const text = heading.textContent.trim();
			if (text) return text;
		}
		return null;
	}

	function broadcastCardState(id) {
		const li = getCardById(id);
		if (!li) return;

		const { values, source } = getEffectiveState(li);
		const raw     = parseClasses(li.className);
		const summary = getResponsiveSummary(li);

		window.parent?.postMessage({
			type:       'CARD_STATE',
			id,
			label:      getCardLabel(li),
			mode:       li.dataset.bentoMode || 'span',
			values,
			source,
			raw,
			summary,
			gridCols:   getEffectiveGridCols(),
			activeBp,
			totalCards: document.querySelectorAll('li.saBento').length,
		}, '*');
	}

	function selectCard(id) {
		selectedId = id;

		document.querySelectorAll('li.saBento').forEach(li => {
			li.classList.toggle('saBentoSelected', li.dataset.bentoId === id);
		});

		broadcastCardState(id);
	}

	function deselectAll() {
		selectedId = null;
		document.querySelectorAll('li.saBento').forEach(li => {
			li.classList.remove('saBentoSelected');
		});
		window.parent?.postMessage({ type: 'CARD_DESELECTED' }, '*');
	}

	// ── Click delegation ───────────────────────────────────

	wrapper.addEventListener('click', e => {
		const li = e.target.closest('li.saBento');

		if (!li) {
			deselectAll();
			return;
		}

		const id = li.dataset.bentoId;
		if (id === selectedId) {
			deselectAll();
		} else {
			selectCard(id);
		}
	});

	document.addEventListener('keydown', e => {
		if (e.key === 'Escape') { deselectAll(); return; }

		if (!selectedId) return;
		const cards = [...document.querySelectorAll('li.saBento')];
		const idx   = cards.findIndex(li => li.dataset.bentoId === selectedId);

		if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
			e.preventDefault();
			const next = cards[(idx + 1) % cards.length];
			if (next) selectCard(next.dataset.bentoId);
		}
		if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
			e.preventDefault();
			const prev = cards[(idx - 1 + cards.length) % cards.length];
			if (prev) selectCard(prev.dataset.bentoId);
		}
	});

	// ── Selection styles ───────────────────────────────────

	const selStyle = document.createElement('style');
	selStyle.textContent = `
		li.saBento {
			cursor: pointer;
			outline: 2px solid transparent;
			outline-offset: -2px;
			transition: outline-color 0.1s;
		}
		li.saBento:hover {
			outline-color: rgba(59, 130, 246, 0.4);
		}
		li.saBentoSelected {
			outline-color: #3b82f6 !important;
		}
	`;
	document.head.appendChild(selStyle);

	// ── Reset helpers ──────────────────────────────────────

	// Strip all bento-owned classes from a given bp (or all bps).
	function resetCard(li, scope) {
		if (scope === 'bp') {
			// Remove only classes set at activeBp
			ALL_TYPES.forEach(type => clearClass(li, activeBp, type));
		} else {
			// Remove ALL bento classes across every bp
			BP_ORDER.forEach(bp => {
				ALL_TYPES.forEach(type => clearClass(li, bp, type));
			});
			li.dataset.bentoMode = 'span';
		}
	}

	// ── Messaging ──────────────────────────────────────────

	window.addEventListener('message', e => {
		const d = e.data || {};

		switch (d.type) {

			case 'SET_BP':
				activeBp = d.bp;
				applyCardStyles();
				if (selectedId) broadcastCardState(selectedId);
				e.source?.postMessage({ type: 'BP_CHANGED', bp: activeBp }, '*');
				break;

			case 'SET_GRID_COLS':
				pushUndo();
				setGridCols(d.value);
				normalizeCards();
				applyCardStyles();
				if (selectedId) broadcastCardState(selectedId);
				e.source?.postMessage({
					type: 'GRID_CHANGED',
					gridCols: getEffectiveGridCols(),
				}, '*');
				break;

			case 'SET_CARD_MODE': {
				const li = getCardById(d.id);
				if (!li) break;
				pushUndo();
				li.dataset.bentoMode = d.mode;
				applyCardStyles();
				broadcastCardState(d.id);
				break;
			}

			case 'SET_CARD_PROP': {
				const li = getCardById(d.id);
				if (!li) break;
				pushUndo();

				if (d.prop === 'Col') {
					const n = parseInt(d.value, 10);
					const clamped = isNaN(n) ? null : String(Math.min(n, getEffectiveGridCols()));
					setClass(li, activeBp, 'Col', clamped);
				} else {
					setClass(li, activeBp, d.prop, d.value || null);
				}

				applyCardStyles();
				broadcastCardState(d.id);
				break;
			}

			case 'CLEAR_CARD_PROP': {
				const li = getCardById(d.id);
				if (!li) break;
				pushUndo();
				clearClass(li, activeBp, d.prop);
				applyCardStyles();
				broadcastCardState(d.id);
				break;
			}

			case 'APPLY_TO_ALL': {
				// d.prop, d.value — copy one prop/value to every card at activeBp
				pushUndo();
				const max = getEffectiveGridCols();

				document.querySelectorAll('li.saBento').forEach(li => {
					let val = d.value || null;

					if (d.prop === 'Col' && val) {
						const n = parseInt(val, 10);
						val = isNaN(n) ? null : String(Math.min(n, max));
					}

					if (val) {
						setClass(li, activeBp, d.prop, val);
					} else {
						clearClass(li, activeBp, d.prop);
					}
				});

				applyCardStyles();
				if (selectedId) broadcastCardState(selectedId);
				break;
			}

			case 'RESET_CARD': {
				// d.id, d.scope: 'bp' | 'all'
				const li = getCardById(d.id);
				if (!li) break;
				pushUndo();
				resetCard(li, d.scope);
				applyCardStyles();
				broadcastCardState(d.id);
				break;
			}

			case 'UNDO':
				undo();
				break;

			case 'REDO':
				redo();
				break;

			case 'GET_CARD_STATE':
				if (d.id) broadcastCardState(d.id);
				break;

			case 'GET_TOTAL_CARDS':
				e.source?.postMessage({
					type:  'TOTAL_CARDS',
					count: document.querySelectorAll('li.saBento').length,
				}, '*');
				break;

			case 'SELECT_CARD':
				selectCard(d.id);
				break;
		}
	});

	// ── Init ───────────────────────────────────────────────

	applyCardStyles();
	broadcastHistoryState();

});
