document.addEventListener('DOMContentLoaded', () => {

	// ── Config ─────────────────────────────────────────────
	const BP_ORDER = ['2xl', 'xl', 'lg', 'md', 'sm', 'mobile'];
	const BP_PREFIX = { '2xl': '', xl: 'Xl', lg: 'Lg', md: 'Md', sm: 'Sm', mobile: 'Mobile' };
	const ALL_TYPES = ['Col', 'Row', 'GridCol', 'Flex', 'ColStart', 'ColEnd', 'RowStart', 'RowEnd'];

	let activeBp   = 'lg';
	let selectedId = null;

	const wrapper = document.querySelector('.saBentoWrapper');

	// Stable IDs
	if (wrapper) {
		document.querySelectorAll('li.saBento').forEach((li, i) => {
			if (!li.dataset.bentoId) li.dataset.bentoId = String(i + 1);
		});
	}

	// ── Parsing ────────────────────────────────────────────
	function parseClasses(className) {
		const result = {};
		(className || '').split(/\s+/).forEach(cls => {
			const match = cls.match(/^sa(?:(Xl|Lg|Md|Sm|Mobile))?((Col|Row|GridCol|Flex|ColStart|ColEnd|RowStart|RowEnd)(\d+)?)$/);
			if (!match) return;
			let [, bpRaw, , type, value] = match;
			const bp = bpRaw ? bpRaw.toLowerCase() : '2xl';
			if (!result[bp]) result[bp] = {};
			result[bp][type] = value || (type === 'Flex' ? '1' : null);
		});
		return result;
	}

	function getEffectiveState(el) {
		if (!el) return { values: {}, source: {} };
		const parsed = parseClasses(el.className || '');
		const currentIndex = BP_ORDER.indexOf(activeBp);
		const result = {};
		const source = {};

		ALL_TYPES.forEach(type => {
			if (parsed[activeBp]?.[type] !== undefined) {
				result[type] = parsed[activeBp][type];
				source[type] = activeBp;
				return;
			}
			for (let i = currentIndex - 1; i >= 0; i--) {
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

	function isFlexMode() {
		return getEffectiveState(wrapper).values.hasOwnProperty('Flex');
	}

	// ── Class helpers ──────────────────────────────────────
	function setClass(el, bp, type, value) {
		if (!el) return;
		const prefix = BP_PREFIX[bp];
		const saPrefix = `sa${prefix}${type}`;
		const re = new RegExp(`sa${prefix}${type}\\d*`, 'g');

		let classes = (el.className || '').split(/\s+/).filter(c => !re.test(c));

		if (value !== null && value !== undefined && value !== '') {
			const cls = (type === 'Flex' && String(value) === '1') ? saPrefix : `${saPrefix}${value}`;
			classes.push(cls);
		}
		el.className = classes.filter(Boolean).join(' ');
	}

	function clearClass(el, bp, type) {
		setClass(el, bp, type, null);
	}

	// ── Grid & Flex ────────────────────────────────────────
	function getEffectiveGridCols() {
		return parseInt(getEffectiveState(wrapper).values.GridCol || 12, 10);
	}

	function setGridCols(value) {
		if (value) setClass(wrapper, activeBp, 'GridCol', value);
	}

	function setFlexMode(enable) {
		if (enable) {
			setClass(wrapper, activeBp, 'Flex', '1');
		} else {
			clearClass(wrapper, activeBp, 'Flex');
		}
	}

	function setFlexCols(value) {
		setClass(wrapper, activeBp, 'Flex', value || '1');
	}

	// ── Apply styles ───────────────────────────────────────
	function applyCardStyles() {
		if (!wrapper) return;
		const flexActive = isFlexMode();
		const gridCols = getEffectiveGridCols();

		wrapper.style.gridTemplateColumns = `repeat(${gridCols}, minmax(0, 1fr))`;

		document.querySelectorAll('li.saBento').forEach(li => {
			if (activeBp === 'mobile' || flexActive) {
				li.style.gridColumn = '';
				li.style.gridRow = '';
				return;
			}

			const { values } = getEffectiveState(li);
			const mode = li.dataset.bentoMode || 'span';

			if (mode === 'placement') {
				li.style.gridColumn = `${values.ColStart || 'auto'} / ${values.ColEnd || 'auto'}`;
				li.style.gridRow    = `${values.RowStart || 'auto'} / ${values.RowEnd || 'auto'}`;
			} else if (values.Col) {
				li.style.gridColumn = `span ${values.Col}`;
			} else {
				li.style.gridColumn = '';
				li.style.gridRow = '';
			}
		});
	}

	// ── Undo / Redo ────────────────────────────────────────
	const undoStack = [];
	const redoStack = [];
	const MAX_HISTORY = 50;

	function snapshotAll() {
		if (!wrapper) return { wrapper: '', cards: [] };
		const cards = [...document.querySelectorAll('li.saBento')].map(li => ({
			id: li.dataset.bentoId,
			className: li.className,
			mode: li.dataset.bentoMode || 'span'
		}));
		return { wrapper: wrapper.className, cards };
	}

	function pushUndo() {
		undoStack.push(snapshotAll());
		if (undoStack.length > MAX_HISTORY) undoStack.shift();
		redoStack.length = 0;
		broadcastHistoryState();
	}

	function restoreSnapshot(snapshot) {
		if (!wrapper) return;
		wrapper.className = snapshot.wrapper;
		snapshot.cards.forEach(({ id, className, mode }) => {
			const li = document.querySelector(`li.saBento[data-bento-id="${id}"]`);
			if (li) {
				li.className = className;
				li.dataset.bentoMode = mode;
			}
		});
		applyCardStyles();
		broadcastWrapperState();
		if (selectedId) broadcastCardState(selectedId);
		broadcastHistoryState();
	}

	function undo() { if (undoStack.length) { redoStack.push(snapshotAll()); restoreSnapshot(undoStack.pop()); } }
	function redo() { if (redoStack.length) { undoStack.push(snapshotAll()); restoreSnapshot(redoStack.pop()); } }

	function broadcastHistoryState() {
		window.parent?.postMessage({ type: 'HISTORY_STATE', canUndo: undoStack.length > 0, canRedo: redoStack.length > 0 }, '*');
	}

	// ── Card State ─────────────────────────────────────────
	function getCardById(id) {
		return document.querySelector(`li.saBento[data-bento-id="${id}"]`);
	}

	function broadcastCardState(id) {
		const li = getCardById(id);
		if (!li) return;

		const { values, source } = getEffectiveState(li);
		const raw = parseClasses(li.className);
		const summary = {};

		BP_ORDER.forEach(bp => {
			const oldBp = activeBp;
			activeBp = bp;
			const state = getEffectiveState(li);
			summary[bp] = state.values;
			activeBp = oldBp;
		});

		window.parent?.postMessage({
			type: 'CARD_STATE',
			id,
			label: li.querySelector('h2.saBentoHeading')?.textContent.trim() || '',
			mode: li.dataset.bentoMode || 'span',
			flexMode: isFlexMode(),
			values, source, raw, summary,
			gridCols: getEffectiveGridCols(),
			activeBp,
			totalCards: document.querySelectorAll('li.saBento').length
		}, '*');
	}

	function selectCard(id) {
		selectedId = id;
		document.querySelectorAll('li.saBento').forEach(li => li.classList.toggle('saBentoSelected', li.dataset.bentoId === id));
		broadcastCardState(id);
	}

	function deselectAll() {
		selectedId = null;
		document.querySelectorAll('li.saBento').forEach(li => li.classList.remove('saBentoSelected'));
		window.parent?.postMessage({ type: 'CARD_DESELECTED' }, '*');
	}

	// ── Wrapper State ──────────────────────────────────────
	function broadcastWrapperState() {
		window.parent?.postMessage({
			type: 'WRAPPER_STATE',
			flexMode: isFlexMode(),
			gridCols: getEffectiveGridCols(),
			activeBp
		}, '*');
	}

	// ── Messaging ──────────────────────────────────────────
	window.addEventListener('message', e => {
		const d = e.data || {};

		switch (d.type) {
			case 'SET_BP':
				activeBp = d.bp;
				applyCardStyles();
				broadcastWrapperState();
				if (selectedId) broadcastCardState(selectedId);
				break;

			case 'SET_WRAPPER_MODE':
				pushUndo();
				setFlexMode(d.mode === 'flex');
				applyCardStyles();
				broadcastWrapperState();
				if (selectedId) broadcastCardState(selectedId);
				break;

			case 'SET_FLEX_COLS':
				pushUndo();
				setFlexCols(d.value);
				applyCardStyles();
				broadcastWrapperState();
				break;

			case 'SET_GRID_COLS':
				pushUndo();
				setGridCols(d.value);
				applyCardStyles();
				broadcastWrapperState();
				if (selectedId) broadcastCardState(selectedId);
				break;

			case 'SET_CARD_MODE':
				const li = getCardById(d.id);
				if (li) {
					pushUndo();
					li.dataset.bentoMode = d.mode;
					applyCardStyles();
					broadcastCardState(d.id);
				}
				break;

			case 'SET_CARD_PROP':
			case 'CLEAR_CARD_PROP':
				const targetLi = getCardById(d.id);
				if (!targetLi || activeBp === 'mobile') break;
				pushUndo();
				if (d.type === 'SET_CARD_PROP') {
					setClass(targetLi, activeBp, d.prop, d.value);
				} else {
					clearClass(targetLi, activeBp, d.prop);
				}
				applyCardStyles();
				broadcastCardState(d.id);
				break;

			case 'APPLY_TO_ALL':
				pushUndo();
				const max = getEffectiveGridCols();
				document.querySelectorAll('li.saBento').forEach(li => {
					if (d.prop === 'Col' && d.value) {
						setClass(li, activeBp, d.prop, Math.min(d.value, max));
					} else if (d.value) {
						setClass(li, activeBp, d.prop, d.value);
					} else {
						clearClass(li, activeBp, d.prop);
					}
				});
				applyCardStyles();
				break;

			case 'RESET_CARD':
				// ... (kept minimal for now)
				break;

			case 'UNDO': undo(); break;
			case 'REDO': redo(); break;
			case 'GET_WRAPPER_STATE': broadcastWrapperState(); break;
			case 'SELECT_CARD': selectCard(d.id); break;
		}
	});

	// ── Init ───────────────────────────────────────────────
	applyCardStyles();
	broadcastWrapperState();
	broadcastHistoryState();
});