(() => {
	const magicbox = document.querySelector('softadmin-magicbox .saMagicBox');
	const grid = magicbox?.querySelector('.saBoxGrid');
	if (!grid) return;
	const employeeSelector = '.saBox.a554c849bfff3403293a229aec68c4c86';
	const rows = [];
	for (const child of grid.children) {
		if (child.classList.contains('saBoxRow')) rows.push([]);
		if (child.classList.contains('saContainersWrapper')) rows.at(-1)?.push(child);
	}
	const rowName = row => row[0]?.querySelector('.saBoxContainerHeading')?.textContent.trim() ?? '';
	const totalRow = rows.find(row => rowName(row) === 'Station total');
	const totalBackgrounds = new Map();
	for (const container of totalRow?.flatMap(group => [...group.querySelectorAll('.saBoxContainer')]) ?? []) {
		totalBackgrounds.set(container, container.dataset.baseBackground ?? container.style.backgroundColor);
	}
	const cells = new Map();
	for (const row of rows) {
		if (!/^Styrkeledare(?:\s|$)|^Brandman$/.test(rowName(row))) continue;
		row.slice(2).forEach((stationGroup, station) => {
			[...stationGroup.querySelectorAll('.saBoxContainer')].forEach((container, shift) => {
				cells.set(container, { row, station, shift, wrapper: container.querySelector('.saBoxesWrapper') });
			});
		});
	}
	for (const card of magicbox.querySelectorAll(employeeSelector)) {
		card.draggable = cells.has(card.closest('.saBoxContainer'));
	}
	const announcement = document.createElement('div');
	announcement.setAttribute('role', 'status');
	announcement.style.cssText = 'position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%);';
	magicbox.append(announcement);
	let dragged = null;
	let highlighted = null;
	function clearHighlight() {
		highlighted?.classList.remove('saDropOn');
		highlighted = null;
	}
	function finish() {
		dragged?.classList.remove('saDragged');
		dragged = null;
		clearHighlight();
	}
	function destination(event) {
		const container = event.target.closest('.saBoxContainer');
		const target = cells.get(container);
		const source = cells.get(dragged?.closest('.saBoxContainer'));
		return target && source && target.row === source.row ? container : null;
	}
	function context(cell) {
		const station = rows[0][cell.station + 2].querySelector('.saBoxContainerHeading').textContent.trim().split(/\s+/)[0];
		return `${station}, ${cell.shift === 0 ? 'Dag' : 'Natt'}`;
	}
	function adjustSummary(cell, delta) {
		const heading = cell.row[1].querySelectorAll('.saBoxContainerHeading')[cell.shift];
		function textNodes(node) {
			return [...node.childNodes].flatMap(child => child.nodeType === 3 ? [child] : textNodes(child));
		}
		const number = textNodes(heading).filter(node => /^\s*\d+\s*$/.test(node.textContent)).at(-1);
		if (number) number.textContent = String(Number(number.textContent.trim()) + delta);
	}
	function adjustTotal(group, shift, delta) {
		const heading = group?.querySelectorAll('.saBoxContainerHeading')[shift];
		const spans = heading?.querySelectorAll('span');
		if (!spans || spans.length < 2) return;
		const container = heading.closest('.saBoxContainer');
		const total = Number(spans[0].textContent) + delta;
		const minimum = Number(spans[1].textContent.replace('/', ''));
		spans[0].textContent = String(total);
		container.style.backgroundColor = total < minimum ? 'var(--Red100)'
			: total >= minimum + 2 ? 'var(--Green100)'
			: totalBackgrounds.get(container);
		if (total < minimum) {
			spans[0].style.color = 'var(--Red700)';
			spans[0].style.fontWeight = '500';
		} else {
			spans[0].style.removeProperty('color');
			spans[0].style.removeProperty('font-weight');
		}
	}
	grid.addEventListener('dragstart', event => {
		const card = event.target.closest(employeeSelector);
		if (!card || !cells.has(card.closest('.saBoxContainer'))) {
			event.preventDefault();
			return;
		}
		dragged = card;
		card.classList.add('saDragged');
		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.setData('text/plain', card.textContent.trim());
	});
	grid.addEventListener('dragover', event => {
		if (!dragged) return;
		const container = destination(event);
		clearHighlight();
		if (!container) {
			event.dataTransfer.dropEffect = 'none';
			return;
		}
		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';
		highlighted = container;
		container.classList.add('saDropOn');
	});
	grid.addEventListener('dragleave', event => {
		if (highlighted && !highlighted.contains(event.relatedTarget)) clearHighlight();
	});
	grid.addEventListener('drop', event => {
		const container = destination(event);
		if (!container || !dragged) return;
		event.preventDefault();
		const card = dragged;
		const sourceContainer = card.closest('.saBoxContainer');
		const source = cells.get(sourceContainer);
		const target = cells.get(container);
		const before = event.target.closest(employeeSelector);
		if (before === card) { finish(); return; }
		target.wrapper.insertBefore(card, before?.parentElement === target.wrapper ? before : null);
		if (sourceContainer !== container) {
			if (!source.wrapper.querySelector(employeeSelector)) source.wrapper.style.removeProperty('min-height');
			adjustSummary(source, -1);
			adjustSummary(target, 1);
			if (totalRow) {
				adjustTotal(totalRow[source.station + 2], source.shift, -1);
				adjustTotal(totalRow[target.station + 2], target.shift, 1);
				adjustTotal(totalRow[1], source.shift, -1);
				adjustTotal(totalRow[1], target.shift, 1);
			}
			const label = card.getAttribute('aria-label').split('\n');
			const sameShift = source.shift === target.shift;
			const color = sameShift ? 'Purple' : 'Blue';
			card.style.backgroundColor = `var(--${color}100)`;
			card.style.color = `var(--${color}700)`;
			card.style.borderColor = `var(--${color}200)`;
			const reason = sameShift ? 'Bytt station samma pass (löpning)' : 'Bytt pass';
			card.setAttribute('aria-label', [label[0], label[1], reason, `Flyttad från: ${context(source)}`, `Nu placerad: ${context(target)}`, '', ...label.filter(line => line.startsWith('Kompetens:'))].join('\n'));
			announcement.textContent = `Personal ${card.textContent.trim()} flyttad till ${context(target)}.`;
		}
		finish();
		card.focus();
	});
	grid.addEventListener('dragend', finish);
	const scroller = grid.closest('.scrollcontent');
	scroller?.addEventListener('dragover', event => {
		if (!dragged) return;
		const rect = scroller.getBoundingClientRect();
		const edge = 36;
		const left = event.clientX < rect.left + edge ? -18 : event.clientX > rect.right - edge ? 18 : 0;
		const top = event.clientY < rect.top + edge ? -18 : event.clientY > rect.bottom - edge ? 18 : 0;
		if (left || top) scroller.scrollBy({ left, top });
	});
})();
