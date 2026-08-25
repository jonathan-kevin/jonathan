const employees = [
	{ "code": "eg", "name": "Emil Gyllenring", "email": "emil.gyllenring@multisoft.se" },
	{ "code": "as", "name": "Anna Sjöberg", "email": "anna.sjoberg@multisoft.se" },
	{ "code": "jl", "name": "Johan Lindqvist", "email": "johan.lindqvist@multisoft.se" },
	{ "code": "ml", "name": "Maria Lindgren", "email": "maria.lindgren@multisoft.se" },
	{ "code": "ek", "name": "Erik Karlsson", "email": "erik.karlsson@multisoft.se" },
	{ "code": "sn", "name": "Sara Nyström", "email": "sara.nystrom@multisoft.se" },
	{ "code": "ph", "name": "Peter Holm", "email": "peter.holm@multisoft.se" },
	{ "code": "le", "name": "Linnea Ek", "email": "linnea.ek@multisoft.se" },
	{ "code": "ab", "name": "Anders Berg", "email": "anders.berg@multisoft.se" },
	{ "code": "ca", "name": "Caroline Ahlberg", "email": "caroline.ahlberg@multisoft.se" },
	{ "code": "df", "name": "David Forsberg", "email": "david.forsberg@multisoft.se" },
	{ "code": "hw", "name": "Hanna Wallin", "email": "hanna.wallin@multisoft.se" },
	{ "code": "mo", "name": "Mikael Olsson", "email": "mikael.olsson@multisoft.se" },
	{ "code": "es", "name": "Elin Ström", "email": "elin.strom@multisoft.se" },
	{ "code": "th", "name": "Thomas Hedström", "email": "thomas.hedstrom@multisoft.se" },
	{ "code": "kb", "name": "Kristina Bergman", "email": "kristina.bergman@multisoft.se" },
	{ "code": "no", "name": "Niklas Olofsson", "email": "niklas.olofsson@multisoft.se" },
	{ "code": "ja", "name": "Jenny Andersson", "email": "jenny.andersson@multisoft.se" },
	{ "code": "rl", "name": "Robert Larsson", "email": "robert.larsson@multisoft.se" },
	{ "code": "ip", "name": "Ida Pettersson", "email": "ida.pettersson@multisoft.se" },
	{ "code": "fm", "name": "Fredrik Mattsson", "email": "fredrik.mattsson@multisoft.se" },
	{ "code": "cn", "name": "Cecilia Nilsson", "email": "cecilia.nilsson@multisoft.se" },
	{ "code": "gs", "name": "Gustav Sandberg", "email": "gustav.sandberg@multisoft.se" },
	{ "code": "am", "name": "Alexandra Möller", "email": "alexandra.moller@multisoft.se" },
	{ "code": "bw", "name": "Björn Widell", "email": "bjorn.widell@multisoft.se" },
	{ "code": "sf", "name": "Sofia Falk", "email": "sofia.falk@multisoft.se" },
	{ "code": "mr", "name": "Martin Rehn", "email": "martin.rehn@multisoft.se" },
	{ "code": "ea", "name": "Emma Åkesson", "email": "emma.akesson@multisoft.se" },
	{ "code": "od", "name": "Oskar Dahl", "email": "oskar.dahl@multisoft.se" },
	{ "code": "vh", "name": "Viktoria Hjalmarsson", "email": "viktoria.hjalmarsson@multisoft.se" },
	{ "code": "pl", "name": "Patrik Lundqvist", "email": "patrik.lundqvist@multisoft.se" }
];

document.addEventListener('DOMContentLoaded', () => {
	employees.forEach(item => {
		if (item.alias) {
			item.searchTerms = [item.name, ...item.alias.split(',').map(a => a.trim())];
		} else {
			item.searchTerms = [item.name];
		}
	});
	employees.sort((a, b) => a.name.localeCompare(b.name));

	document.querySelectorAll('[data-country-select]').forEach((root, selectIndex) => {
		const listContainer = root.querySelector('[role="listbox"]');
		const button = root.querySelector('button[aria-haspopup="listbox"]');
		const panel = root.querySelector('.saContextMenu');
		const input = root.querySelector('input[role="combobox"]');
		if (!listContainer || !button || !panel || !input) return;

		const idPrefix = listContainer.id || `country-select-${selectIndex}`;
		const useFlags = !root.closest('[data-destination-country]');
		const noResults = listContainer.querySelector('.saNoResults');
		const PAGE_SIZE = 50;
		const dataSource = employees.map(item => ({
			value: item.code,
			label: item.name,
			searchTerms: item.searchTerms
		}));
		const labelsLower = dataSource.map(item => item.label.toLowerCase());

		let optionItems = [];
		let loadPreviousItem = null;
		let loadMoreItem = null;
		let loadedItems = [];
		let loadedOffset = 0;
		let totalCount = 0;
		let selectedValue = root.dataset.selectedCode || dataSource[0]?.value || '';
		let activeI = -1;
		let prevActiveEl = null;
		let currentQuery = '';
		let requestSeq = 0;
		let filterTimer = null;

		let typeBuffer = '';
		let typeTimer = null;
		let typeMatchIndices = [];
		let typeMatchPos = 0;

		function getScrollContainer() {
			let el = listContainer;
			while (el) {
				const ov = getComputedStyle(el).overflowY;
				if (ov === 'auto' || ov === 'scroll') return el;
				el = el.parentElement;
			}
			return listContainer;
		}
		const scrollContainer = getScrollContainer();

		function fetchCountryPage({ query, offset, limit }) {
			const val = query.trim().toLowerCase();
			const filtered = val
				? dataSource.filter(item => item.searchTerms.some(term => term.toLowerCase().includes(val)))
				: dataSource;

			return Promise.resolve({
				items: filtered.slice(offset, offset + limit),
				total: filtered.length
			});
		}

		function updateNoResults() {
			if (noResults) noResults.style.display = totalCount === 0 ? '' : 'none';
		}

		function setListBusy(isBusy) {
			if (isBusy) {
				listContainer.setAttribute('aria-busy', 'true');
			} else {
				listContainer.removeAttribute('aria-busy');
			}
		}

		function highlightMatch(label, query) {
			const i = label.toLowerCase().indexOf(query);
			if (i === -1) return label;
			return label.slice(0, i)
				+ '<mark>' + label.slice(i, i + query.length) + '</mark>'
				+ label.slice(i + query.length);
		}

		function clearActive() {
			if (prevActiveEl) {
				prevActiveEl.classList.remove('saActive');
				prevActiveEl.setAttribute('aria-selected', 'false');
				prevActiveEl = null;
			}
			input.removeAttribute('aria-activedescendant');
			activeI = -1;
		}

		function renderOption(item, index) {
			const li = document.createElement('li');
			li.className = 'saOptionWrapper';
			li.setAttribute('role', 'option');
			li.setAttribute('aria-selected', item.value === selectedValue ? 'true' : 'false');
			li.id = `${idPrefix}-opt-${index}`;
			li.dataset.index = index;
			li.dataset.code = item.value;
			li.dataset.label = item.label;
			li.innerHTML = `
      <div class="saOption">
				${useFlags ? `<img src="https://flagcdn.com/${item.value}.svg" loading="lazy" alt="" aria-hidden="true">` : ''}
        <span class="saOptionText">${currentQuery ? highlightMatch(item.label, currentQuery) : item.label}</span>
      </div>`;
			return li;
		}

		function renderList() {
			optionItems.forEach(item => item.remove());
			if (loadPreviousItem) loadPreviousItem.remove();
			if (loadMoreItem) loadMoreItem.remove();
			optionItems = [];
			loadPreviousItem = null;
			loadMoreItem = null;

			const fragment = document.createDocumentFragment();
			if (loadedOffset > 0) {
				loadPreviousItem = document.createElement('li');
				loadPreviousItem.className = 'saOptionWrapper saLoadMoreOption';
				loadPreviousItem.setAttribute('role', 'presentation');
				loadPreviousItem.dataset.loadPrevious = 'true';
				loadPreviousItem.innerHTML = `
      <button class="saOption" type="button" id="${idPrefix}-load-previous" tabindex="-1" aria-controls="${idPrefix}">
        <i class="far fa-plus saOptionIcon saIcon" aria-hidden="true"></i>
        <span class="saOptionText">Load previous</span>
      </button>`;
				fragment.appendChild(loadPreviousItem);
			}

			loadedItems.forEach((item, index) => {
				const li = renderOption(item, index);
				optionItems.push(li);
				fragment.appendChild(li);
			});

			if (loadedOffset + loadedItems.length < totalCount) {
				loadMoreItem = document.createElement('li');
				loadMoreItem.className = 'saOptionWrapper saLoadMoreOption';
				loadMoreItem.setAttribute('role', 'presentation');
				loadMoreItem.dataset.loadMore = 'true';
				loadMoreItem.innerHTML = `
      <button class="saOption" type="button" id="${idPrefix}-load-more" tabindex="-1" aria-controls="${idPrefix}">
        <i class="far fa-plus saOptionIcon saIcon" aria-hidden="true"></i>
        <span class="saOptionText">Load more</span>
      </button>`;
				fragment.appendChild(loadMoreItem);
			}

			listContainer.appendChild(fragment);
			updateNoResults();
		}

		function getInitialOffset(query) {
			if (query.trim()) return 0;
			const selectedIndex = dataSource.findIndex(item => item.value === selectedValue);
			if (selectedIndex === -1) return 0;
			return Math.max(0, Math.min(
				selectedIndex - Math.floor(PAGE_SIZE / 2),
				Math.max(0, dataSource.length - PAGE_SIZE)
			));
		}

		function applyPage(result, mode = 'append', offset = loadedOffset) {
			totalCount = result.total;
			if (mode === 'prepend') {
				loadedOffset = offset;
				loadedItems = result.items.concat(loadedItems);
				if (activeI >= 0) activeI += result.items.length;
			} else if (mode === 'append') {
				loadedItems = loadedItems.concat(result.items);
			} else {
				loadedOffset = offset;
				loadedItems = result.items;
			}

			renderList();
			if (mode === 'replace' && loadedItems.length) {
				const selectedI = loadedItems.findIndex(item => item.value === selectedValue);
				setActive(selectedI === -1 ? 0 : getFocusableIndexForOption(selectedI));
			}
		}

		async function loadQuery(query) {
			const seq = ++requestSeq;
			currentQuery = query.trim().toLowerCase();
			loadedItems = [];
			loadedOffset = 0;
			totalCount = 0;
			clearActive();
			renderList();

			setListBusy(true);
			const offset = getInitialOffset(currentQuery);
			try {
				const firstPage = await fetchCountryPage({
					query: currentQuery,
					offset,
					limit: PAGE_SIZE
				});
				if (seq !== requestSeq) return;
				applyPage(firstPage, 'replace', offset);
			} finally {
				if (seq === requestSeq) setListBusy(false);
			}
		}

		async function loadPreviousPage({ focusNewItem = false } = {}) {
			if (loadedOffset <= 0) return;
			clearActive();
			const seq = requestSeq;
			const offset = Math.max(0, loadedOffset - PAGE_SIZE);
			setListBusy(true);
			try {
				const result = await fetchCountryPage({
					query: currentQuery,
					offset,
					limit: loadedOffset - offset
				});
				if (seq !== requestSeq || currentQuery !== input.value.trim().toLowerCase()) return;
				applyPage(result, 'prepend', offset);
				if (focusNewItem && result.items.length) setActive(getFocusableIndexForOption(0));
				input.focus({ preventScroll: true });
			} finally {
				if (seq === requestSeq) setListBusy(false);
			}
		}

		async function loadNextPage({ focusNewItem = false } = {}) {
			if (loadedOffset + loadedItems.length >= totalCount) return;
			clearActive();
			const focusIndex = loadedItems.length;
			const seq = requestSeq;
			setListBusy(true);
			try {
				const result = await fetchCountryPage({
					query: currentQuery,
					offset: loadedOffset + loadedItems.length,
					limit: PAGE_SIZE
				});
				if (seq !== requestSeq || currentQuery !== input.value.trim().toLowerCase()) return;
				applyPage(result);
				if (focusNewItem && result.items.length) setActive(getFocusableIndexForOption(focusIndex));
				input.focus({ preventScroll: true });
			} finally {
				if (seq === requestSeq) setListBusy(false);
			}
		}

		function scheduleLoadQuery(query) {
			clearTimeout(filterTimer);
			filterTimer = setTimeout(() => loadQuery(query), 150);
		}

		function getFocusableItems() {
			return [loadPreviousItem, ...optionItems, loadMoreItem].filter(Boolean);
		}

		function getActiveItem() {
			return getFocusableItems()[activeI] || null;
		}

		function getFocusableIndexForOption(index) {
			return getFocusableItems().indexOf(optionItems[index]);
		}

		function setActive(index) {
			const focusableItems = getFocusableItems();
			if (!focusableItems.length) return;
			if (index < 0) index = focusableItems.length - 1;
			if (index >= focusableItems.length) index = 0;

			clearActive();

			activeI = index;
			const item = focusableItems[activeI];
			item.classList.add('saActive');
			item.setAttribute('aria-selected', 'true');
			input.setAttribute('aria-activedescendant', (item.querySelector('button.saOption') || item).id);
			prevActiveEl = item;
			item.scrollIntoView({ block: 'nearest' });
		}

		function updateButtonByData(data) {
			if (!data) return;
			selectedValue = data.value;
			button.querySelector('.saDropdownText').textContent = data.label;
			const flag = button.querySelector('img');
			if (useFlags) {
				if (flag) flag.src = `https://flagcdn.com/${data.value}.svg`;
			} else if (flag) {
				flag.remove();
			}
			root.dataset.selectedCode = data.value;
		}

		function updateButtonByIndex(index) {
			updateButtonByData(dataSource[index]);
		}

		function openDropdown() {
			if (panel.classList.contains('saOpen')) return;

			panel.classList.add('saOpen');
			button.setAttribute('aria-expanded', 'true');
			input.value = '';
			scrollContainer.scrollTop = 0;
			loadQuery('');

			setTimeout(() => input.focus(), 0);
		}

		function closeDropdown({ returnFocus = false } = {}) {
			if (!panel.classList.contains('saOpen')) return;

			clearTimeout(filterTimer);
			panel.classList.remove('saOpen');
			button.setAttribute('aria-expanded', 'false');
			input.value = '';
			clearActive();

			if (returnFocus) button.focus();
		}

		button.addEventListener('click', () => {
			panel.classList.contains('saOpen') ? closeDropdown({ returnFocus: true }) : openDropdown();
		});

		input.addEventListener('input', () => scheduleLoadQuery(input.value));

		input.addEventListener('keydown', e => {
			switch (e.key) {
				case 'ArrowDown': e.preventDefault(); setActive(activeI + 1); break;
				case 'ArrowUp': e.preventDefault(); setActive(activeI - 1); break;
				case 'Home': e.preventDefault(); setActive(0); break;
				case 'End': e.preventDefault(); setActive(getFocusableItems().length - 1); break;
				case ' ':
					if (getActiveItem()?.dataset.loadPrevious === 'true') {
						e.preventDefault();
						loadPreviousPage({ focusNewItem: true });
					} else if (getActiveItem()?.dataset.loadMore === 'true') {
						e.preventDefault();
						loadNextPage({ focusNewItem: true });
					}
					break;
				case 'Enter':
					e.preventDefault();
					const activeItem = getActiveItem();
					if (!activeItem) return;
					if (activeItem.dataset.loadPrevious === 'true') {
						loadPreviousPage({ focusNewItem: true });
						return;
					}
					if (activeItem.dataset.loadMore === 'true') {
						loadNextPage({ focusNewItem: true });
						return;
					}
					updateButtonByData(loadedItems[parseInt(activeItem.dataset.index, 10)]);
					closeDropdown({ returnFocus: true });
					break;
				case 'Escape': closeDropdown({ returnFocus: true }); break;
				case 'Tab': closeDropdown(); break;
			}
		});

		button.addEventListener('keydown', e => {
			if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
				const ch = e.key.toLowerCase();
				clearTimeout(typeTimer);

				const isSameChar = typeBuffer.length > 0 && [...typeBuffer].every(c => c === ch);

				if (isSameChar) {
					if (typeMatchIndices.length) {
						typeMatchPos = (typeMatchPos + 1) % typeMatchIndices.length;
						updateButtonByIndex(typeMatchIndices[typeMatchPos]);
					}
				} else {
					typeBuffer += ch;
					typeMatchIndices = labelsLower
						.map((l, i) => ({ l, i }))
						.filter(({ l }) => l.startsWith(typeBuffer))
						.map(({ i }) => i);
					typeMatchPos = 0;
					if (typeMatchIndices.length) updateButtonByIndex(typeMatchIndices[0]);
				}

				typeTimer = setTimeout(() => {
					typeBuffer = '';
					typeMatchIndices = [];
					typeMatchPos = 0;
				}, 700);
				return;
			}
			const selectedI = Math.max(0, dataSource.findIndex(item => item.value === selectedValue));
			switch (e.key) {
				case 'ArrowDown':
					e.preventDefault();
					if (e.altKey) { openDropdown(); break; }
					if (selectedI + 1 < dataSource.length) updateButtonByIndex(selectedI + 1);
					break;
				case 'ArrowUp':
					e.preventDefault();
					if (e.altKey) { openDropdown(); break; }
					if (selectedI - 1 >= 0) updateButtonByIndex(selectedI - 1);
					break;
				case 'Enter':
				case ' ':
					e.preventDefault(); openDropdown(); break;
				case 'Home': e.preventDefault(); updateButtonByIndex(0); break;
				case 'End': e.preventDefault(); updateButtonByIndex(dataSource.length - 1); break;
			}
		});

		listContainer.addEventListener('mousedown', e => {
			const item = e.target.closest('.saOptionWrapper');
			if (item && !item.classList.contains('saNoResults')) e.preventDefault();
		});

		listContainer.addEventListener('click', e => {
			const item = e.target.closest('.saOptionWrapper');
			if (!item || item.classList.contains('saNoResults')) return;
			if (item.dataset.loadPrevious === 'true') {
				e.preventDefault();
				e.stopPropagation();
				loadPreviousPage();
				return;
			}
			if (item.dataset.loadMore === 'true') {
				e.preventDefault();
				e.stopPropagation();
				loadNextPage();
				return;
			}

			const data = loadedItems[parseInt(item.dataset.index, 10)];
			updateButtonByData(data);
			closeDropdown({ returnFocus: true });
		});

		document.addEventListener('click', e => {
			if (panel.classList.contains('saOpen') && !root.contains(e.target))
				closeDropdown();
		});

		document.addEventListener('focusin', e => {
			if (panel.classList.contains('saOpen') && !root.contains(e.target))
				closeDropdown();
		});

		updateButtonByData(dataSource.find(item => item.value === selectedValue) || dataSource[0]);
	});

	document.querySelectorAll('[data-multi-select]').forEach((root, selectIndex) => {
		const listContainer = root.querySelector('[role="listbox"]');
		const button = root.querySelector('button[aria-haspopup="listbox"]');
		const panel = root.querySelector('.saContextMenu');
		const input = root.querySelector('input[role="combobox"]');
		if (!listContainer || !button || !panel || !input) return;

		const idPrefix = listContainer.id || `multi-select-${selectIndex}`;
		const noResults = listContainer.querySelector('.saNoResults');
		const selectedValues = new Set(
			(root.dataset.selectedValues || '')
				.split(',')
				.map(value => value.trim())
				.filter(Boolean)
		);
		const selectedLabels = new Map();
		employees.forEach(item => {
			if (selectedValues.has(item.id)) selectedLabels.set(item.id, item.name);
		});

		const PAGE_SIZE = 50;
		const dataSource = employees.map(item => ({
			value: item.id,
			label: item.name,
			searchTerms: item.searchTerms
		}));

		let optionItems = [];
		let loadPreviousItem = null;
		let loadMoreItem = null;
		let loadedItems = [];
		let loadedOffset = 0;
		let totalCount = 0;
		let activeI = -1;
		let rangeAnchorI = -1;
		let prevActiveEl = null;
		let currentQuery = '';
		let requestSeq = 0;
		let filterTimer = null;

		function getScrollContainer() {
			let el = listContainer;
			while (el) {
				const ov = getComputedStyle(el).overflowY;
				if (ov === 'auto' || ov === 'scroll') return el;
				el = el.parentElement;
			}
			return listContainer;
		}
		const scrollContainer = getScrollContainer();

		function fetchCountryPage({ query, offset, limit }) {
			const val = query.trim().toLowerCase();
			const filtered = val
				? dataSource.filter(item => item.searchTerms.some(term => term.toLowerCase().includes(val)))
				: dataSource;

			return Promise.resolve({
				items: filtered.slice(offset, offset + limit),
				total: filtered.length
			});
		}

		function updateNoResults() {
			if (noResults) noResults.style.display = totalCount === 0 ? '' : 'none';
		}

		function setListBusy(isBusy) {
			if (isBusy) {
				listContainer.setAttribute('aria-busy', 'true');
			} else {
				listContainer.removeAttribute('aria-busy');
			}
		}

		function ensureOptionCount(count) {
			optionItems.forEach(item => item.remove());
			if (loadPreviousItem) loadPreviousItem.remove();
			if (loadMoreItem) loadMoreItem.remove();
			optionItems = [];
			loadPreviousItem = null;
			loadMoreItem = null;

			const fragment = document.createDocumentFragment();
			if (loadedOffset > 0) {
				loadPreviousItem = document.createElement('li');
				loadPreviousItem.className = 'saOptionWrapper saLoadMoreOption';
				loadPreviousItem.setAttribute('role', 'presentation');
				loadPreviousItem.dataset.loadPrevious = 'true';
				loadPreviousItem.innerHTML = `
      <button class="saOption" type="button" id="${idPrefix}-load-previous" tabindex="-1" aria-controls="${idPrefix}">
        <i class="far fa-plus saOptionIcon saIcon" aria-hidden="true"></i>
        <span class="saOptionText">Load previous</span>
      </button>`;
				fragment.appendChild(loadPreviousItem);
			}

			for (let i = 0; i < count; i++) {
				const li = document.createElement('li');
				li.className = 'saOptionWrapper';
				li.setAttribute('role', 'option');
				li.setAttribute('aria-checked', 'false');
				li.id = `${idPrefix}-opt-${i}`;
				li.dataset.index = i;
				optionItems.push(li);
				fragment.appendChild(li);
			}
			if (loadedOffset + count < totalCount) {
				loadMoreItem = document.createElement('li');
				loadMoreItem.className = 'saOptionWrapper saLoadMoreOption';
				loadMoreItem.setAttribute('role', 'presentation');
				loadMoreItem.dataset.loadMore = 'true';
				loadMoreItem.innerHTML = `
      <button class="saOption" type="button" id="${idPrefix}-load-more" tabindex="-1" aria-controls="${idPrefix}">
        <i class="far fa-plus saOptionIcon saIcon" aria-hidden="true"></i>
        <span class="saOptionText">Load more</span>
      </button>`;
				fragment.appendChild(loadMoreItem);
			}
			listContainer.appendChild(fragment);
		}

		function getInitialOffset(query) {
			if (query.trim()) return 0;
			const selectedValue = [...selectedValues].find(value =>
				dataSource.some(item => item.value === value)
			);
			const selectedIndex = dataSource.findIndex(item => item.value === selectedValue);
			if (selectedIndex === -1) return 0;
			return Math.max(0, Math.min(
				selectedIndex - Math.floor(PAGE_SIZE / 2),
				Math.max(0, dataSource.length - PAGE_SIZE)
			));
		}

		function applyPage(offset, result, mode = 'append') {
			totalCount = result.total;
			if (mode === 'prepend') {
				loadedOffset = offset;
				loadedItems = result.items.concat(loadedItems);
				if (activeI >= 0) activeI += result.items.length;
				if (rangeAnchorI >= 0) rangeAnchorI += result.items.length;
			} else if (mode === 'append') {
				loadedItems = loadedItems.concat(result.items);
			} else {
				loadedOffset = offset;
				loadedItems = result.items;
			}

			if (optionItems.length !== loadedItems.length
				|| Boolean(loadPreviousItem) !== (loadedOffset > 0)
				|| Boolean(loadMoreItem) !== (loadedOffset + loadedItems.length < totalCount)) {
				ensureOptionCount(loadedItems.length);
			}

			result.items.forEach(item => {
				if (selectedValues.has(item.value)) selectedLabels.set(item.value, item.label);
			});

			updateNoResults();
			updateButton();
		}

		function highlightMatch(label, query) {
			const i = label.toLowerCase().indexOf(query);
			if (i === -1) return label;
			return label.slice(0, i)
				+ '<mark>' + label.slice(i, i + query.length) + '</mark>'
				+ label.slice(i + query.length);
		}

		function renderItem(index) {
			const item = optionItems[index];
			const data = loadedItems[index];
			if (!item) return;

			item.dataset.index = index;

			if (!data) {
				item.removeAttribute('data-value');
				item.removeAttribute('data-label');
				item.setAttribute('aria-disabled', 'true');
				item.innerHTML = `
      <div class="saOption">
        <span class="saOptionText">Loading...</span>
      </div>`;
				return;
			}

			item.dataset.value = data.value;
			item.dataset.label = data.label;
			item.removeAttribute('aria-disabled');
			item.setAttribute('aria-checked', selectedValues.has(data.value) ? 'true' : 'false');
			item.innerHTML = `
      <div class="saOption">
        <input class="saCheckbox" type="checkbox" tabindex="-1" aria-hidden="true">
        <span class="saOptionText">${currentQuery ? highlightMatch(data.label, currentQuery) : data.label}</span>
      </div>`;

			const checkbox = item.querySelector('input[type="checkbox"]');
			if (checkbox) checkbox.checked = selectedValues.has(data.value);
		}

		function renderLoadedItems() {
			for (let i = 0; i < optionItems.length; i++) renderItem(i);
		}

		function scrollFirstSelectedIntoView() {
			const selectedI = loadedItems.findIndex(item => selectedValues.has(item.value));
			if (selectedI !== -1) optionItems[selectedI]?.scrollIntoView({ block: 'nearest' });
		}

		function getFocusableItems() {
			return [loadPreviousItem, ...optionItems, loadMoreItem].filter(Boolean);
		}

		function getActiveItem() {
			return getFocusableItems()[activeI] || null;
		}

		function clearActive({ keepIndex = false } = {}) {
			if (prevActiveEl) {
				prevActiveEl.classList.remove('saFocus');
				prevActiveEl = null;
			}
			input.removeAttribute('aria-activedescendant');
			if (!keepIndex) activeI = -1;
		}

		function setActive(index) {
			const focusableItems = getFocusableItems();
			if (!focusableItems.length) return;
			if (index < 0) index = focusableItems.length - 1;
			if (index >= focusableItems.length) index = 0;

			clearActive();

			activeI = index;
			const item = focusableItems[activeI];
			item.classList.add('saFocus');
			input.setAttribute('aria-activedescendant', (item.querySelector('button.saOption') || item).id);
			prevActiveEl = item;
			item.scrollIntoView({ block: 'nearest' });
		}

		function anchorActiveItem(item) {
			clearActive({ keepIndex: true });
			activeI = getFocusableItems().indexOf(item);
			input.focus({ preventScroll: true });
		}

		function updateButton() {
			const selected = [...selectedValues]
				.map(value => selectedLabels.get(value) ?? value)
				.filter(Boolean);
			const buttonText = button.querySelector('.saDropdownText');

			if (selected.length === 0) {
				buttonText.textContent = 'Select countries';
			} else if (selected.length <= 2) {
				buttonText.textContent = selected.join(', ');
			} else {
				buttonText.textContent = `${selected.length} selected`;
			}

			root.dataset.selectedValues = [...selectedValues].join(',');
		}

		function setOptionData(data, checked) {
			if (checked) {
				selectedValues.add(data.value);
				selectedLabels.set(data.value, data.label);
			} else {
				selectedValues.delete(data.value);
			}
			updateButton();
		}

		function setOption(index, checked) {
			const data = loadedItems[index];
			if (!data) return;

			setOptionData(data, checked);

			const item = optionItems[index];
			item.setAttribute('aria-checked', checked ? 'true' : 'false');
			const checkbox = item.querySelector('input[type="checkbox"]');
			if (checkbox) checkbox.checked = checked;
		}

		function toggleOption(index) {
			const data = loadedItems[index];
			if (!data) return;
			setOption(index, !selectedValues.has(data.value));
		}

		function setRange(anchorIndex, clickedIndex, checked) {
			const start = Math.min(anchorIndex, clickedIndex);
			const end = Math.max(anchorIndex, clickedIndex);
			for (let i = start; i <= end; i++) setOption(i, checked);
			renderLoadedItems();
		}

		async function loadPreviousPage({ focusNewItem = false } = {}) {
			if (loadedOffset <= 0) return;
			clearActive();
			const seq = requestSeq;
			const offset = Math.max(0, loadedOffset - PAGE_SIZE);
			setListBusy(true);
			try {
				const result = await fetchCountryPage({
					query: currentQuery,
					offset,
					limit: loadedOffset - offset
				});
				if (seq !== requestSeq || currentQuery !== input.value.trim().toLowerCase()) return;
				applyPage(offset, result, 'prepend');
				renderLoadedItems();
				if (focusNewItem && result.items.length) setActive(getFocusableItems().indexOf(optionItems[0]));
				input.focus({ preventScroll: true });
			} finally {
				if (seq === requestSeq) setListBusy(false);
			}
		}

		async function loadNextPage({ focusNewItem = false } = {}) {
			if (loadedOffset + loadedItems.length >= totalCount) return;
			clearActive();
			const focusIndex = loadedItems.length;
			const seq = requestSeq;
			const offset = loadedOffset + loadedItems.length;
			setListBusy(true);
			try {
				const result = await fetchCountryPage({
					query: currentQuery,
					offset,
					limit: PAGE_SIZE
				});
				if (seq !== requestSeq || currentQuery !== input.value.trim().toLowerCase()) return;
				applyPage(offset, result);
				renderLoadedItems();
				if (focusNewItem && result.items.length) setActive(getFocusableItems().indexOf(optionItems[focusIndex]));
				input.focus({ preventScroll: true });
			} finally {
				if (seq === requestSeq) setListBusy(false);
			}
		}

		async function loadQuery(query) {
			const seq = ++requestSeq;
			currentQuery = query.trim().toLowerCase();
			loadedItems = [];
			loadedOffset = 0;
			totalCount = 0;
			activeI = -1;
			rangeAnchorI = -1;
			clearActive();
			ensureOptionCount(0);
			updateNoResults();

			setListBusy(true);
			const offset = getInitialOffset(currentQuery);
			try {
				const firstPage = await fetchCountryPage({
					query: currentQuery,
					offset,
					limit: PAGE_SIZE
				});
				if (seq !== requestSeq) return;

				applyPage(offset, firstPage, 'replace');
				renderLoadedItems();
				scrollFirstSelectedIntoView();
			} finally {
				if (seq === requestSeq) setListBusy(false);
			}
		}

		function scheduleLoadQuery(query) {
			clearTimeout(filterTimer);
			filterTimer = setTimeout(() => loadQuery(query), 150);
		}

		function openDropdown() {
			if (panel.classList.contains('saOpen')) return;

			panel.classList.add('saOpen');
			button.setAttribute('aria-expanded', 'true');
			input.value = '';
			scrollContainer.scrollTop = 0;
			loadQuery('');

			setTimeout(() => input.focus(), 0);
		}

		function closeDropdown({ returnFocus = false } = {}) {
			if (!panel.classList.contains('saOpen')) return;

			clearTimeout(filterTimer);
			panel.classList.remove('saOpen');
			button.setAttribute('aria-expanded', 'false');
			input.value = '';
			clearActive();

			if (returnFocus) button.focus();
		}

		button.addEventListener('click', () => {
			panel.classList.contains('saOpen') ? closeDropdown({ returnFocus: true }) : openDropdown();
		});

		button.addEventListener('keydown', e => {
			switch (e.key) {
				case 'Enter':
				case ' ':
				case 'ArrowDown':
					e.preventDefault();
					openDropdown();
					break;
				case 'Escape':
					closeDropdown({ returnFocus: true });
					break;
			}
		});

		input.addEventListener('input', () => scheduleLoadQuery(input.value));

		input.addEventListener('keydown', e => {
			switch (e.key) {
				case 'ArrowDown':
					e.preventDefault();
					setActive(activeI < 0 || !prevActiveEl ? Math.max(activeI, 0) : activeI + 1);
					break;
				case 'ArrowUp':
					e.preventDefault();
					setActive(activeI < 0 || !prevActiveEl ? (activeI >= 0 ? activeI : getFocusableItems().length - 1) : activeI - 1);
					break;
				case 'Home': e.preventDefault(); setActive(0); break;
				case 'End': e.preventDefault(); setActive(getFocusableItems().length - 1); break;
				case 'Enter':
				case ' ':
					e.preventDefault();
					const activeItem = getActiveItem();
					if (!activeItem) return;
					if (activeItem.dataset.loadPrevious === 'true') {
						loadPreviousPage({ focusNewItem: true });
						return;
					}
					if (activeItem.dataset.loadMore === 'true') {
						loadNextPage({ focusNewItem: true });
						return;
					}
					const activeOptionI = parseInt(activeItem.dataset.index, 10);
					if (Number.isNaN(activeOptionI)) return;
					toggleOption(activeOptionI);
					rangeAnchorI = activeOptionI;
					break;
				case 'Escape': closeDropdown({ returnFocus: true }); break;
				case 'Tab': closeDropdown(); break;
			}
		});

		listContainer.addEventListener('mousedown', e => {
			const item = e.target.closest('.saOptionWrapper');
			if (item && !item.classList.contains('saNoResults')) e.preventDefault();
		});

		listContainer.addEventListener('click', e => {
			const item = e.target.closest('.saOptionWrapper');
			if (!item || item.classList.contains('saNoResults') || item.getAttribute('aria-disabled') === 'true') return;
			if (item.dataset.loadPrevious === 'true') {
				e.preventDefault();
				e.stopPropagation();
				loadPreviousPage();
				return;
			}
			if (item.dataset.loadMore === 'true') {
				e.preventDefault();
				e.stopPropagation();
				loadNextPage();
				return;
			}

			const clickedI = parseInt(item.dataset.index, 10);
			const data = loadedItems[clickedI];
			if (!data) return;

			const nextChecked = !selectedValues.has(data.value);
			anchorActiveItem(item);

			if (e.shiftKey) {
				const anchorI = rangeAnchorI !== -1 ? rangeAnchorI : clickedI;
				setRange(anchorI, clickedI, nextChecked);
				if (rangeAnchorI === -1) rangeAnchorI = clickedI;
			} else {
				toggleOption(clickedI);
				rangeAnchorI = clickedI;
			}
		});

		document.addEventListener('click', e => {
			if (panel.classList.contains('saOpen') && !root.contains(e.target)) closeDropdown();
		});

		document.addEventListener('focusin', e => {
			if (panel.classList.contains('saOpen') && !root.contains(e.target)) closeDropdown();
		});

		updateButton();
	});
});
