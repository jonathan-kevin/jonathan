const countries = [
	{ "code": "af", "country": "Afghanistan" },
	{ "code": "al", "country": "Albania" },
	{ "code": "dz", "country": "Algeria" },
	{ "code": "ad", "country": "Andorra" },
	{ "code": "ao", "country": "Angola" },
	{ "code": "ag", "country": "Antigua and Barbuda" },
	{ "code": "ar", "country": "Argentina" },
	{ "code": "am", "country": "Armenia" },
	{ "code": "au", "country": "Australia" },
	{ "code": "at", "country": "Austria" },
	{ "code": "az", "country": "Azerbaijan" },
	{ "code": "bs", "country": "Bahamas" },
	{ "code": "bh", "country": "Bahrain" },
	{ "code": "bd", "country": "Bangladesh" },
	{ "code": "bb", "country": "Barbados" },
	{ "code": "by", "country": "Belarus" },
	{ "code": "be", "country": "Belgium" },
	{ "code": "bz", "country": "Belize" },
	{ "code": "bj", "country": "Benin" },
	{ "code": "bt", "country": "Bhutan" },
	{ "code": "bo", "country": "Bolivia" },
	{ "code": "ba", "country": "Bosnia and Herzegovina" },
	{ "code": "bw", "country": "Botswana" },
	{ "code": "br", "country": "Brazil" },
	{ "code": "bn", "country": "Brunei" },
	{ "code": "bg", "country": "Bulgaria" },
	{ "code": "bf", "country": "Burkina Faso" },
	{ "code": "bi", "country": "Burundi" },
	{ "code": "cv", "country": "Cape Verde" },
	{ "code": "kh", "country": "Cambodia" },
	{ "code": "cm", "country": "Cameroon" },
	{ "code": "ca", "country": "Canada" },
	{ "code": "cf", "country": "Central African Republic" },
	{ "code": "td", "country": "Chad" },
	{ "code": "cl", "country": "Chile" },
	{ "code": "cn", "country": "China" },
	{ "code": "co", "country": "Colombia" },
	{ "code": "km", "country": "Comoros" },
	{ "code": "cg", "country": "Congo", "alias": "Kongo" },
	{ "code": "cd", "country": "Democratic Republic of the Congo", "alias": "DR Congo, DRC, Kongo" },
	{ "code": "cr", "country": "Costa Rica" },
	{ "code": "ci", "country": "Côte d’Ivoire", "alias": "Ivory Coast" },
	{ "code": "hr", "country": "Croatia" },
	{ "code": "cu", "country": "Cuba" },
	{ "code": "cy", "country": "Cyprus" },
	{ "code": "cz", "country": "Czech Republic", "alias": "Czechia" },
	{ "code": "dk", "country": "Denmark" },
	{ "code": "dj", "country": "Djibouti" },
	{ "code": "dm", "country": "Dominica" },
	{ "code": "do", "country": "Dominican Republic" },
	{ "code": "ec", "country": "Ecuador" },
	{ "code": "eg", "country": "Egypt" },
	{ "code": "sv", "country": "El Salvador" },
	{ "code": "gq", "country": "Equatorial Guinea" },
	{ "code": "er", "country": "Eritrea" },
	{ "code": "ee", "country": "Estonia" },
	{ "code": "sz", "country": "Eswatini", "alias": "Swaziland" },
	{ "code": "et", "country": "Ethiopia" },
	{ "code": "fj", "country": "Fiji" },
	{ "code": "fi", "country": "Finland" },
	{ "code": "fr", "country": "France" },
	{ "code": "ga", "country": "Gabon" },
	{ "code": "gm", "country": "Gambia" },
	{ "code": "ge", "country": "Georgia" },
	{ "code": "de", "country": "Germany" },
	{ "code": "gh", "country": "Ghana" },
	{ "code": "gr", "country": "Greece" },
	{ "code": "gd", "country": "Grenada" },
	{ "code": "gt", "country": "Guatemala" },
	{ "code": "gn", "country": "Guinea" },
	{ "code": "gw", "country": "Guinea-Bissau" },
	{ "code": "gy", "country": "Guyana" },
	{ "code": "ht", "country": "Haiti" },
	{ "code": "hn", "country": "Honduras" },
	{ "code": "hu", "country": "Hungary" },
	{ "code": "is", "country": "Iceland" },
	{ "code": "in", "country": "India" },
	{ "code": "id", "country": "Indonesia" },
	{ "code": "ir", "country": "Iran", "alias": "Islamic Republic of" },
	{ "code": "iq", "country": "Iraq" },
	{ "code": "ie", "country": "Ireland" },
	{ "code": "il", "country": "Israel" },
	{ "code": "it", "country": "Italy" },
	{ "code": "jm", "country": "Jamaica" },
	{ "code": "jp", "country": "Japan" },
	{ "code": "jo", "country": "Jordan" },
	{ "code": "kz", "country": "Kazakhstan" },
	{ "code": "ke", "country": "Kenya" },
	{ "code": "ki", "country": "Kiribati" },
	{ "code": "kp", "country": "North Korea", "alias": "DPRK" },
	{ "code": "kr", "country": "South Korea", "alias": "Republic of Korea, Korea" },
	{ "code": "kw", "country": "Kuwait" },
	{ "code": "kg", "country": "Kyrgyzstan" },
	{ "code": "la", "country": "Laos" },
	{ "code": "lv", "country": "Latvia" },
	{ "code": "lb", "country": "Lebanon" },
	{ "code": "ls", "country": "Lesotho" },
	{ "code": "lr", "country": "Liberia" },
	{ "code": "ly", "country": "Libya" },
	{ "code": "li", "country": "Liechtenstein" },
	{ "code": "lt", "country": "Lithuania" },
	{ "code": "lu", "country": "Luxembourg" },
	{ "code": "mg", "country": "Madagascar" },
	{ "code": "mw", "country": "Malawi" },
	{ "code": "my", "country": "Malaysia" },
	{ "code": "mv", "country": "Maldives" },
	{ "code": "ml", "country": "Mali" },
	{ "code": "mt", "country": "Malta" },
	{ "code": "mh", "country": "Marshall Islands" },
	{ "code": "mr", "country": "Mauritania" },
	{ "code": "mu", "country": "Mauritius" },
	{ "code": "mx", "country": "Mexico" },
	{ "code": "fm", "country": "Micronesia" },
	{ "code": "md", "country": "Moldova" },
	{ "code": "mc", "country": "Monaco" },
	{ "code": "mn", "country": "Mongolia" },
	{ "code": "me", "country": "Montenegro" },
	{ "code": "ma", "country": "Morocco" },
	{ "code": "mz", "country": "Mozambique" },
	{ "code": "mm", "country": "Myanmar", "alias": "Burma" },
	{ "code": "na", "country": "Namibia" },
	{ "code": "nr", "country": "Nauru" },
	{ "code": "np", "country": "Nepal" },
	{ "code": "nl", "country": "Netherlands" },
	{ "code": "nz", "country": "New Zealand" },
	{ "code": "ni", "country": "Nicaragua" },
	{ "code": "ne", "country": "Niger" },
	{ "code": "ng", "country": "Nigeria" },
	{ "code": "mk", "country": "North Macedonia" },
	{ "code": "no", "country": "Norway" },
	{ "code": "om", "country": "Oman" },
	{ "code": "pk", "country": "Pakistan" },
	{ "code": "pw", "country": "Palau" },
	{ "code": "ps", "country": "Palestine" },
	{ "code": "pa", "country": "Panama" },
	{ "code": "pg", "country": "Papua New Guinea" },
	{ "code": "py", "country": "Paraguay" },
	{ "code": "pe", "country": "Peru" },
	{ "code": "ph", "country": "Philippines" },
	{ "code": "pl", "country": "Poland" },
	{ "code": "pt", "country": "Portugal" },
	{ "code": "qa", "country": "Qatar" },
	{ "code": "ro", "country": "Romania" },
	{ "code": "ru", "country": "Russia", "alias": "Russian Federation" },
	{ "code": "rw", "country": "Rwanda" },
	{ "code": "kn", "country": "Saint Kitts and Nevis" },
	{ "code": "lc", "country": "Saint Lucia" },
	{ "code": "vc", "country": "Saint Vincent and the Grenadines" },
	{ "code": "ws", "country": "Samoa" },
	{ "code": "sm", "country": "San Marino" },
	{ "code": "st", "country": "São Tomé and Príncipe" },
	{ "code": "sa", "country": "Saudi Arabia" },
	{ "code": "sn", "country": "Senegal" },
	{ "code": "rs", "country": "Serbia" },
	{ "code": "sc", "country": "Seychelles" },
	{ "code": "sl", "country": "Sierra Leone" },
	{ "code": "sg", "country": "Singapore" },
	{ "code": "sk", "country": "Slovakia" },
	{ "code": "si", "country": "Slovenia" },
	{ "code": "sb", "country": "Solomon Islands" },
	{ "code": "so", "country": "Somalia" },
	{ "code": "za", "country": "South Africa" },
	{ "code": "ss", "country": "South Sudan" },
	{ "code": "es", "country": "Spain" },
	{ "code": "lk", "country": "Sri Lanka" },
	{ "code": "sd", "country": "Sudan" },
	{ "code": "sr", "country": "Suriname" },
	{ "code": "se", "country": "Sweden" },
	{ "code": "ch", "country": "Switzerland" },
	{ "code": "sy", "country": "Syria" },
	{ "code": "tw", "country": "Taiwan" },
	{ "code": "tj", "country": "Tajikistan" },
	{ "code": "tz", "country": "Tanzania" },
	{ "code": "th", "country": "Thailand" },
	{ "code": "tl", "country": "Timor-Leste", "alias": "East Timor" },
	{ "code": "tg", "country": "Togo" },
	{ "code": "to", "country": "Tonga" },
	{ "code": "tt", "country": "Trinidad and Tobago" },
	{ "code": "tn", "country": "Tunisia" },
	{ "code": "tr", "country": "Turkey" },
	{ "code": "tm", "country": "Turkmenistan" },
	{ "code": "tv", "country": "Tuvalu" },
	{ "code": "ug", "country": "Uganda" },
	{ "code": "ua", "country": "Ukraine" },
	{ "code": "ae", "country": "United Arab Emirates", "alias": "UAE" },
	{ "code": "gb", "country": "United Kingdom", "alias": "UK, Great Britain, Britain, England, Wales, Northern Ireland, Scotland" },
	{ "code": "us", "country": "United States", "alias": "US, USA" },
	{ "code": "uy", "country": "Uruguay" },
	{ "code": "uz", "country": "Uzbekistan" },
	{ "code": "vu", "country": "Vanuatu" },
	{ "code": "va", "country": "Vatican City", "alias": "Holy See" },
	{ "code": "ve", "country": "Venezuela" },
	{ "code": "vn", "country": "Vietnam" },
	{ "code": "ye", "country": "Yemen" },
	{ "code": "zm", "country": "Zambia" },
	{ "code": "zw", "country": "Zimbabwe" }
];


document.addEventListener('DOMContentLoaded', () => {
	countries.forEach(item => {
		if (item.alias) {
			item.searchTerms = [item.country, ...item.alias.split(',').map(a => a.trim())];
		} else {
			item.searchTerms = [item.country];
		}
	});
	countries.sort((a, b) => a.country.localeCompare(b.country));

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
		const dataSource = countries.map(item => ({
			value: item.code,
			label: item.country,
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
		countries.forEach(item => {
			if (selectedValues.has(item.code)) selectedLabels.set(item.code, item.country);
		});

		const PAGE_SIZE = 50;
		const dataSource = countries.map(item => ({
			value: item.code,
			label: item.country,
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
