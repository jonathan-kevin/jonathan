(() => {
	'use strict';
	const grid = document.getElementById('bento');
	if (!grid) return;
	const breakpoints = [
		{ name: 'base', prefix: 'sa', min: 1536 },
		{ name: 'xl', prefix: 'saXl', min: 1280 },
		{ name: 'lg', prefix: 'saLg', min: 1024 },
		{ name: 'md', prefix: 'saMd', min: 768 },
		{ name: 'sm', prefix: 'saSm', min: 641 },
		{ name: 'xs', prefix: 'saXs', min: 320 }
	];
	const selectors = [...document.querySelectorAll('[data-bento-columns]')];
	const toggles = [...document.querySelectorAll('[data-bento-grid-toggle]')];
	const cardControls = [
		{ property: 'Col', label: 'columns', selects: [...document.querySelectorAll('[data-bento-card-columns]')] },
		{ property: 'Row', label: 'rows', selects: [...document.querySelectorAll('[data-bento-card-rows]')] }
	];
	let selectedCard = null;
	const layouts = window.BentoLayouts;
	const presetSelectors = [...document.querySelectorAll('[data-bento-preset]')];
	const authoredGrid = [...grid.classList].filter(layouts.isLayoutClass);
	const authoredCards = new WeakMap([...grid.children].map(card => [card, [...card.classList].filter(layouts.isLayoutClass)]));
	let activePreset = 'spotlight';
	let nextCard = grid.children.length + 1;
	function replaceLayout(element, classes) {
		for (const name of [...element.classList]) if (layouts.isLayoutClass(name)) element.classList.remove(name);
		element.classList.add(...classes);
	}
	for (const select of presetSelectors) {
		select.innerHTML = '<option value="custom" disabled>Custom layout</option><option value="authored">Default</option>' + layouts.presets.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
		select.title = 'Applies responsive layout classes to every card. Content and order are preserved; the pattern repeats for additional cards.';
		select.addEventListener('change', () => {
			activePreset = select.value;
			const preset = layouts.presets.find(p => p.id === activePreset);
			replaceLayout(grid, preset ? layouts.gridClasses(preset) : authoredGrid);
			[...grid.children].forEach((card, i) => replaceLayout(card, preset ? layouts.cardClasses(preset, i) : authoredCards.get(card) || ['saCol1', 'saRow1']));
			sync();
		});
	}
	for (const button of document.querySelectorAll('[data-bento-add]')) button.addEventListener('click', () => {
		const card = document.getElementById('bento-card-template').content.firstElementChild.cloneNode(true);
		card.querySelector('.saBentoHeading span').textContent = `Shortcut ${nextCard++}`;
		const preset = layouts.presets.find(p => p.id === activePreset);
		if (preset) replaceLayout(card, layouts.cardClasses(preset, grid.children.length));
		authoredCards.set(card, ['saCol1', 'saRow1']);
		grid.append(card);
		selectedCard = card;
		card.querySelector('a').focus({ preventScroll: true });
		card.scrollIntoView({ block: 'nearest', inline: 'nearest' });
		sync();
	});
	const activeIndex = () => {
		const index = breakpoints.findIndex(bp => innerWidth >= bp.min);
		return index === -1 ? breakpoints.length - 1 : index;
	};
	function ownValue(prefix, element = grid, property = 'GridCol') {
		const pattern = new RegExp(`^${prefix}${property}(\\d+)$`);
		const match = [...element.classList].map(name => name.match(pattern)).find(Boolean);
		return match ? Number(match[1]) : null;
	}
	function effective(index, element = grid, property = 'GridCol') {
		for (let i = index; i >= 0; i--) {
			const value = ownValue(breakpoints[i].prefix, element, property);
			if (value !== null) return { value, source: breakpoints[i].name };
		}
		return { value: ownValue('sa', element, property) ?? (property === 'GridCol' ? 8 : 1), source: 'base' };
	}
	function sync() {
		for (const select of presetSelectors) select.value = activePreset;
		const index = activeIndex(), bp = breakpoints[index];
		const current = effective(index), inherited = effective(index - 1);
		for (const button of document.querySelectorAll('[data-bento-breakpoint]')) {
			const name = index === 0 ? '2xl (base)' : bp.name;
			button.textContent = name;
			button.setAttribute('aria-label', `Current breakpoint: ${name}`);
			button.title = index === 0 ? '1536px and above' : `${bp.min}–${breakpoints[index - 1].min - 1}px`;
		}
		for (const select of selectors) {
			select.innerHTML = (index ? `<option value="">Inherit ${inherited.value} columns (${inherited.source})</option>` : '') +
				Array.from({ length: 16 }, (_, i) => `<option value="${i + 1}">${i + 1} ${i ? 'columns' : 'column'}</option>`).join('');
			select.value = String(ownValue(bp.prefix) ?? (index ? '' : current.value));
			select.setAttribute('aria-label', `Grid columns (${bp.name})`);
			select.title = `${bp.name}: ${current.value} columns${current.source !== bp.name ? `, inherited from ${current.source}` : ', set here'}. Changes apply to smaller screens until overridden.`;
		}
		for (const button of toggles) button.setAttribute('aria-pressed', String(grid.classList.contains('saShowGridLines')));
		for (const card of grid.children) {
			card.classList.toggle('saBentoSelected', card === selectedCard);
			const trigger = card.querySelector('.saBentoInner');
			trigger.setAttribute('role', 'button');
			trigger.setAttribute('aria-pressed', String(card === selectedCard));
		}
		for (const { property, label, selects } of cardControls) {
			for (const select of selects) {
				select.disabled = !selectedCard;
				select.setAttribute('aria-label', `Card ${label} (${bp.name})`);
				if (!selectedCard) {
					select.innerHTML = `<option>Select card: ${label}</option>`;
					select.title = 'Click a card to change its size.';
					continue;
				}
				const value = effective(index, selectedCard, property);
				const parent = effective(index - 1, selectedCard, property);
				const own = ownValue(bp.prefix, selectedCard, property);
				const limit = property === 'Col' ? current.value : 16;
				select.innerHTML = (index ? `<option value="">Card: inherit ${parent.value} ${parent.value === 1 ? label.slice(0, -1) : label} (${parent.source})</option>` : '') +
					Array.from({ length: Math.max(limit, value.value) }, (_, i) => `<option value="${i + 1}"${i >= limit ? ' disabled' : ''}>Card: ${i + 1} ${label}${i >= limit ? ' — exceeds grid' : ''}${own === i + 1 ? (index ? ' · override' : ' · base') : ''}</option>`).join('');
				select.value = String(own ?? (index ? '' : value.value));
				select.title = `${selectedCard.querySelector('.saBentoHeading').textContent.trim()}: ${value.value} ${label} at ${bp.name}, ${value.source === bp.name ? 'set here' : `inherited from ${value.source}`}. Changes apply to smaller screens until overridden.${index ? ' Choose Inherit to reset.' : ''}`;
			}
		}
	}
	for (const { property, selects } of cardControls) {
		for (const select of selects) select.addEventListener('change', () => {
			if (!selectedCard) return;
			const bp = breakpoints[activeIndex()];
			const pattern = new RegExp(`^${bp.prefix}${property}\\d+$`);
			for (const name of [...selectedCard.classList]) if (pattern.test(name)) selectedCard.classList.remove(name);
			if (select.value) selectedCard.classList.add(`${bp.prefix}${property}${Number(select.value)}`);
			activePreset = 'custom';
			sync();
		});
	}
	grid.addEventListener('click', event => {
		const button = event.target.closest('.saBentoButton');
		if (button) {
			event.preventDefault();
			button.setAttribute('aria-pressed', String(button.getAttribute('aria-pressed') !== 'true'));
			return;
		}
		const card = event.target.closest('.saBento');
		if (!card || card.parentElement !== grid) return;
		event.preventDefault();
		selectedCard = card === selectedCard ? null : card;
		sync();
	});
	grid.addEventListener('keydown', event => {
		if (event.key === ' ' && event.target.matches('.saBentoInner')) {
			event.preventDefault();
			event.target.click();
		}
	});
	document.addEventListener('keydown', event => {
		if (event.key === 'Escape') { selectedCard = null; sync(); }
	});
	document.addEventListener('click', event => {
		if (selectedCard && !event.target.closest('.saBento, .saActionLinks')) {
			selectedCard = null;
			sync();
		}
	});
	for (const select of selectors) select.addEventListener('change', () => {
		activePreset = 'custom';
		const bp = breakpoints[activeIndex()];
		const pattern = new RegExp(`^${bp.prefix}GridCol\\d+$`);
		for (const name of [...grid.classList]) if (pattern.test(name)) grid.classList.remove(name);
		if (select.value) grid.classList.add(`${bp.prefix}GridCol${Number(select.value)}`);
		sync();
	});
	for (const button of toggles) button.addEventListener('click', () => {
		grid.classList.toggle('saShowGridLines');
		sync();
	});
	window.addEventListener('resize', sync);
	// Wrapped top controls change the available height of the real page preview.
	const scrollContent = document.getElementById('MI_ScrollContent');
	const sizeScrollContent = () => {
		scrollContent.style.height = `${Math.max(0, innerHeight - scrollContent.getBoundingClientRect().top)}px`;
	};
	new ResizeObserver(sizeScrollContent).observe(document.getElementById('pageheader'));
	window.addEventListener('resize', sizeScrollContent);
	sync();
})();
