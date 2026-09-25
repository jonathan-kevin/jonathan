function initBentoEditor() {
	const BP_ORDER = ['2xl', 'xl', 'lg', 'md', 'sm', 'mobile'];
	const BP_PREFIX = { '2xl': '', xl: 'Xl', lg: 'Lg', md: 'Md', sm: 'Sm', mobile: 'Mobile' };
	const CARD_PROPS = ['Col', 'Row', 'ColStart', 'ColEnd', 'RowStart', 'RowEnd'];
	const wrapper = document.querySelector('.saBentoWrapper');
	if (!wrapper) return;
	const cards = () => [...wrapper.querySelectorAll('li.saBento')];
	let activeBp = 'lg';
	let selectedId = null;
	const undoStack = [];
	const redoStack = [];

	cards().forEach((li, i) => { li.dataset.bentoId = String(i + 1); });
	// These demo controls bypass the inspector's breakpoint rules and history.
	document.querySelectorAll('#toggleSelect, #random, #oneByOne, #twoByOne, #toggleFlex').forEach(button => {
		button.style.display = 'none';
	});
	const send = data => window.parent.postMessage(data, window.location.origin);
	const getCard = id => cards().find(li => li.dataset.bentoId === id);

	// Unprefixed classes form the desktop base. Accept the demo's legacy 2xl prefix too.
	function parseClasses(className) {
		const result = {};
		className.split(/\s+/).forEach(cls => {
			const match = cls.match(/^sa(2xl|Xl|Lg|Md|Sm|Mobile)?(ColStart|ColEnd|RowStart|RowEnd|GridCol|Col|Row|Flex)(\d+)$/);
			if (!match) return;
			const [, prefix, prop, value] = match;
			const bp = prefix ? prefix.toLowerCase() : '2xl';
			(result[bp] ||= {})[prop] = value;
		});
		return result;
	}

	function effectiveState(el, bp = activeBp) {
		const raw = parseClasses(el.className);
		const values = {}, source = {};
		for (let i = 0; i <= BP_ORDER.indexOf(bp); i++) {
			const from = BP_ORDER[i];
			Object.entries(raw[from] || {}).forEach(([prop, value]) => {
				values[prop] = value;
				source[prop] = from;
			});
		}
		return { values, source };
	}

	function classPattern(bp, prop, suffix = '\\d+') {
		const prefix = bp === '2xl' ? '(?:2xl)?' : BP_PREFIX[bp];
		return new RegExp('^sa' + prefix + prop + suffix + '$');
	}

	function setClass(el, bp, prop, value) {
		const pattern = classPattern(bp, prop);
		el.className = [...el.classList].filter(cls => !pattern.test(cls)).join(' ');
		if (value !== '' && value != null) el.classList.add('sa' + BP_PREFIX[bp] + prop + value);
	}

	// Numbered Flex classes specify items per row; an unnumbered Flex/Grid class selects the mode.
	function flexMode() {
		let flex = false;
		for (let i = 0; i <= BP_ORDER.indexOf(activeBp); i++) {
			const bp = BP_ORDER[i];
			if ([...wrapper.classList].some(cls => classPattern(bp, 'Flex', '').test(cls))) flex = true;
			if ([...wrapper.classList].some(cls => classPattern(bp, 'Grid', '').test(cls))) flex = false;
		}
		return flex;
	}

	function gridCols() { return Number(effectiveState(wrapper).values.GridCol || 12); }
	function flexCols() {
		const value = effectiveState(wrapper).values.Flex;
		return value && value !== '0' ? value : '';
	}

	function applyStyles() {
		const mobile = activeBp === 'mobile';
		const flex = flexMode();
		const cols = gridCols();
		wrapper.style.display = mobile || flex ? 'flex' : 'grid';
		wrapper.style.flexDirection = mobile ? 'column' : 'row';
		wrapper.style.flexWrap = 'wrap';
		wrapper.style.gridTemplateColumns = 'repeat(' + cols + ', minmax(0, 1fr))';
		wrapper.style.setProperty('--columns', String(mobile ? 1 : cols));
		const gap = getComputedStyle(wrapper).columnGap;
		const count = Number(flexCols());
		cards().forEach(li => {
			const { values } = effectiveState(li);
			li.classList.toggle('saBentoSelected', li.dataset.bentoId === selectedId);
			li.style.flex = mobile ? '0 0 auto' : count
				? '0 1 calc((100% - ' + (count - 1) + ' * ' + (gap === 'normal' ? '0px' : gap) + ') / ' + count + ')'
				: '1 1 16rem';
			li.style.width = mobile ? '100%' : '';
			li.style.minWidth = '0';
			if (mobile || flex) {
				li.style.gridColumn = 'auto';
				li.style.gridRow = 'auto';
			} else if (li.dataset.bentoMode === 'placement') {
				const line = value => value ? Math.min(Number(value), cols + 1) : 'auto';
				li.style.gridColumn = line(values.ColStart) + ' / ' + line(values.ColEnd);
				li.style.gridRow = (values.RowStart || 'auto') + ' / ' + (values.RowEnd || 'auto');
			} else {
				li.style.gridColumn = 'span ' + Math.min(Number(values.Col || 1), cols);
				li.style.gridRow = 'span ' + (values.Row || 1);
			}
		});
	}

	function wrapperState() {
		return { flexMode: flexMode(), flexCols: flexCols(), gridCols: gridCols(), activeBp };
	}

	function broadcastCard() {
		const li = getCard(selectedId);
		if (!li) return;
		const summary = {};
		BP_ORDER.forEach(bp => {
			const { values, source } = effectiveState(li, bp);
			summary[bp] = { ...values, source };
		});
		send({
			type: 'CARD_STATE', id: selectedId,
			label: li.querySelector('.saBentoHeading')?.textContent.trim() || '',
			mode: li.dataset.bentoMode || 'span',
			...effectiveState(li), raw: parseClasses(li.className), summary,
			...wrapperState(), totalCards: cards().length
		});
	}

	function refresh() {
		applyStyles();
		send({ type: 'WRAPPER_STATE', ...wrapperState() });
		send({ type: 'TOTAL_CARDS', count: cards().length });
		broadcastCard();
		send({ type: 'HISTORY_STATE', canUndo: !!undoStack.length, canRedo: !!redoStack.length });
	}

	function snapshot() {
		return {
			wrapper: wrapper.className,
			cards: cards().map(li => ({
				id: li.dataset.bentoId,
				className: [...li.classList].filter(cls => cls !== 'saBentoSelected').join(' '),
				mode: li.dataset.bentoMode || 'span'
			}))
		};
	}

	function change(update) {
		const before = snapshot();
		update();
		if (JSON.stringify(before) !== JSON.stringify(snapshot())) {
			undoStack.push(before);
			if (undoStack.length > 50) undoStack.shift();
			redoStack.length = 0;
		}
		refresh();
	}

	function restore(from, to) {
		if (!from.length) return;
		to.push(snapshot());
		const saved = from.pop();
		wrapper.className = saved.wrapper;
		saved.cards.forEach(({ id, className, mode }) => {
			const li = getCard(id);
			if (li) { li.className = className; li.dataset.bentoMode = mode; }
		});
		refresh();
	}

	function selectCard(id) {
		if (!getCard(id)) return;
		selectedId = id;
		applyStyles();
		broadcastCard();
	}

	wrapper.addEventListener('click', event => {
		const li = event.target.closest('li.saBento');
		if (!li) return;
		event.preventDefault();
		event.stopPropagation();
		selectCard(li.dataset.bentoId);
	}, true);
	document.addEventListener('keydown', event => {
		if (event.key !== 'Escape') return;
		selectedId = null;
		applyStyles();
		send({ type: 'CARD_DESELECTED' });
	});

	window.addEventListener('message', event => {
		if (event.source !== window.parent || event.origin !== window.location.origin) return;
		const d = event.data || {};
		const li = getCard(d.id);
		const validProp = CARD_PROPS.includes(d.prop);
		const validValue = max => /^\d+$/.test(String(d.value)) && Number(d.value) >= 1 && Number(d.value) <= max;
		const editable = activeBp !== 'mobile';
		switch (d.type) {
			case 'SET_BP':
				if (BP_ORDER.includes(d.bp)) { activeBp = d.bp; refresh(); }
				break;
			case 'SELECT_CARD': selectCard(d.id); break;
			case 'GET_TOTAL_CARDS': send({ type: 'TOTAL_CARDS', count: cards().length }); break;
			case 'GET_WRAPPER_STATE': refresh(); break;
			case 'SET_WRAPPER_MODE':
				if (!editable || !['grid', 'flex'].includes(d.mode)) break;
				change(() => {
					wrapper.className = [...wrapper.classList].filter(cls => !classPattern(activeBp, '(?:Grid|Flex)', '').test(cls)).join(' ');
					wrapper.classList.add('sa' + BP_PREFIX[activeBp] + (d.mode === 'flex' ? 'Flex' : 'Grid'));
				});
				break;
			case 'SET_GRID_COLS':
				if (editable && (d.value === '' || validValue(12))) change(() => setClass(wrapper, activeBp, 'GridCol', d.value));
				break;
			case 'SET_FLEX_COLS':
				if (editable && (d.value === '' || validValue(16))) change(() => setClass(wrapper, activeBp, 'Flex', d.value || '0'));
				break;
			case 'SET_CARD_MODE':
				if (li && editable && !flexMode() && ['span', 'placement'].includes(d.mode)) change(() => { li.dataset.bentoMode = d.mode; });
				break;
			case 'SET_CARD_PROP':
			case 'CLEAR_CARD_PROP': {
				const max = d.prop?.startsWith('Col') ? gridCols() + (d.prop === 'Col' ? 0 : 1) : d.prop === 'Row' ? 12 : 13;
				if (!li || !editable || flexMode() || !validProp || (d.type === 'SET_CARD_PROP' && !validValue(max))) break;
				change(() => setClass(li, activeBp, d.prop, d.type === 'CLEAR_CARD_PROP' ? '' : d.value));
				break;
			}
			case 'APPLY_TO_ALL':
				if (!editable || flexMode() || !validProp || !validValue(16)) break;
				change(() => cards().forEach(card => {
					setClass(card, activeBp, d.prop, d.prop === 'Col' ? Math.min(Number(d.value), gridCols()) : d.value);
				}));
				break;
			case 'RESET_CARD':
				if (!li || !['bp', 'all'].includes(d.scope)) break;
				change(() => {
					const breakpoints = d.scope === 'all' ? BP_ORDER : [activeBp];
					breakpoints.forEach(bp => CARD_PROPS.forEach(prop => setClass(li, bp, prop, '')));
					if (d.scope === 'all') li.dataset.bentoMode = 'span';
				});
				break;
			case 'UNDO': restore(undoStack, redoStack); break;
			case 'REDO': restore(redoStack, undoStack); break;
		}
	});

	refresh();
	send({ type: 'EDITOR_READY' });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initBentoEditor);
else initBentoEditor();
