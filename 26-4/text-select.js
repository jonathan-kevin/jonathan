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
	const noResults = listContainer.querySelector('.saNoResults');

	const allItems = [];
	const labels = [];
	const labelsLower = [];
	const searchTermsLower = [];
	const textSpans = [];

	// === Build the list (once) ===
	const fragment = document.createDocumentFragment();

	countries.forEach((item, index) => {
		const li = document.createElement('li');
		li.className = 'saOptionWrapper';
		li.setAttribute('role', 'option');
		li.id = `${idPrefix}-opt-${item.code}`;
		li.dataset.code = item.code;
		li.dataset.label = item.country;
		li.dataset.index = index;

		li.innerHTML = `
      <div class="saOption">
        <img src="https://flagcdn.com/${item.code}.svg" loading="lazy" aria-hidden="true">
        <span class="saOptionText">${item.country}</span>
      </div>`;

		fragment.appendChild(li);
		allItems.push(li);
		labels.push(item.country);
		labelsLower.push(item.country.toLowerCase());
		searchTermsLower.push(item.searchTerms.map(t => t.toLowerCase()));
	});

	listContainer.appendChild(fragment);

	// Cache text spans after DOM insertion
	allItems.forEach(li => textSpans.push(li.querySelector('.saOptionText')));

	// === Search index: first-letter buckets ===
	const searchIndex = new Map();
	labelsLower.forEach((label, i) => {
		const key = label[0];
		if (!searchIndex.has(key)) searchIndex.set(key, []);
		searchIndex.get(key).push(i);
	});

	// === Virtual list state ===
	const ITEM_HEIGHT = 32;
	const OVERSCAN = 3;

	let visibleIndices = allItems.map((_, i) => i);
	let activeVI = -1;
	let selectedI = Math.max(0, countries.findIndex(item => item.code === root.dataset.selectedCode));
	let prevActiveEl = null;
	let renderedStart = -1;
	let renderedEnd = -1;
	let rafId = null;

	// === Type-ahead state ===
	let typeBuffer = '';
	let typeTimer = null;
	let typeMatchIndices = [];
	let typeMatchPos = 0;

	// === Scroll container ===
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

	// === Virtual rendering ===
	function getVirtualRange() {
		const scrollTop = scrollContainer.scrollTop;
		const viewportH = scrollContainer.clientHeight;
		const start = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
		const end = Math.min(
			visibleIndices.length,
			Math.ceil((scrollTop + viewportH) / ITEM_HEIGHT) + OVERSCAN
		);
		return { start, end };
	}

	function renderItem(vi) {
		const i = visibleIndices[vi];
		const el = allItems[i];
		el.style.height = '';
		el.style.overflow = '';
		el.style.visibility = '';
		if (!el.querySelector('.saOption')) {
			el.innerHTML = `
        <div class="saOption">
          <img src="https://flagcdn.com/${el.dataset.code}.svg" loading="lazy" alt="" aria-hidden="true">
          <span class="saOptionText">${labels[i]}</span>
        </div>`;
			textSpans[i] = el.querySelector('.saOptionText');
		}
	}

	function blankItem(vi) {
		if (vi < 0 || vi >= visibleIndices.length) return;
		const el = allItems[visibleIndices[vi]];
		el.innerHTML = '';
		el.style.height = `${ITEM_HEIGHT}px`;
		el.style.overflow = 'hidden';
		el.style.visibility = 'hidden';
	}

	function renderVirtualList() {
		const { start, end } = getVirtualRange();
		if (start === renderedStart && end === renderedEnd) return;

		for (let vi = renderedStart; vi < renderedEnd; vi++) {
			if (vi < start || vi >= end) blankItem(vi);
		}
		for (let vi = start; vi < end; vi++) {
			if (vi < renderedStart || vi >= renderedEnd) renderItem(vi);
		}

		renderedStart = start;
		renderedEnd = end;
	}

	function resetRenderState() {
		renderedStart = -1;
		renderedEnd = -1;
	}

	scrollContainer.addEventListener('scroll', renderVirtualList, { passive: true });

	// === Helpers ===
	function updateNoResults() {
		if (noResults) noResults.style.display = visibleIndices.length === 0 ? '' : 'none';
	}

	function clearActive() {
		if (prevActiveEl) {
			prevActiveEl.classList.remove('saActive');
			prevActiveEl.setAttribute('aria-selected', 'false');
			prevActiveEl = null;
		}
		input.removeAttribute('aria-activedescendant');
		activeVI = -1;
	}

	function scrollActiveIntoView() {
		if (activeVI < 0 || !visibleIndices.length) return;
		allItems[visibleIndices[activeVI]]?.scrollIntoView({ block: 'nearest' });
	}

	function setActive(vi) {
		if (!visibleIndices.length) return;
		if (vi < 0) vi = visibleIndices.length - 1;
		if (vi >= visibleIndices.length) vi = 0;

		clearActive();

		activeVI = vi;
		const el = allItems[visibleIndices[activeVI]];
		el.classList.add('saActive');
		el.setAttribute('aria-selected', 'true');
		input.setAttribute('aria-activedescendant', el.id);
		prevActiveEl = el;

		scrollActiveIntoView();
	}

	function highlightMatch(label, query) {
		const i = label.toLowerCase().indexOf(query);
		if (i === -1) return label;
		return label.slice(0, i)
			+ '<mark>' + label.slice(i, i + query.length) + '</mark>'
			+ label.slice(i + query.length);
	}

	function filterList(query) {
		const val = query.toLowerCase();

		const candidates = val.length === 1
			? (searchIndex.get(val[0]) ?? [])
			: allItems.map((_, i) => i);

		const nextVisible = candidates.filter(i =>
			searchTermsLower[i].some(term => term.includes(val))
		);

		const prevSet = new Set(visibleIndices);
		const nextSet = new Set(nextVisible);

		for (const i of prevSet) {
			if (!nextSet.has(i)) {
				allItems[i].style.display = 'none';
				textSpans[i].innerHTML = labels[i];
			}
		}
		for (const i of nextSet) {
			if (!prevSet.has(i)) allItems[i].style.display = '';
			textSpans[i].innerHTML = val ? highlightMatch(labels[i], query) : labels[i];
		}

		visibleIndices = nextVisible;
		resetRenderState();
		renderVirtualList();
		updateNoResults();
		clearActive();
		if (visibleIndices.length) setActive(0);
	}

	function updateButton(allItemsIndex) {
		selectedI = allItemsIndex;
		const code = allItems[allItemsIndex].dataset.code;
		button.querySelector('.saDropdownText').textContent = labels[allItemsIndex];
		button.querySelector('img').src = `https://flagcdn.com/${code}.svg`;
		root.dataset.selectedCode = code;
	}

	// === Open / Close ===
	function resetToAll() {
		if (visibleIndices.length !== allItems.length) {
			allItems.forEach((el, i) => {
				el.style.display = '';
				textSpans[i].innerHTML = labels[i];
			});
			visibleIndices = allItems.map((_, i) => i);
		}
		updateNoResults();
	}

	function scrollToSelected() {
		const vi = visibleIndices.indexOf(selectedI);
		if (vi === -1) return;
		allItems[selectedI].scrollIntoView({ block: 'nearest' });
	}

	function openDropdown() {
		if (panel.classList.contains('saOpen')) return;

		panel.classList.add('saOpen');
		button.setAttribute('aria-expanded', 'true');
		input.value = '';

		resetToAll();
		clearActive();
		resetRenderState();
		renderVirtualList();

		const sel = allItems[selectedI];
		if (sel) {
			sel.classList.add('saActive');
			sel.setAttribute('aria-selected', 'true');
			input.setAttribute('aria-activedescendant', sel.id);
			prevActiveEl = sel;
			activeVI = visibleIndices.indexOf(selectedI);
		}

		setTimeout(() => { input.focus(); scrollToSelected(); }, 0);
	}

	function closeDropdown({ returnFocus = false } = {}) {
		if (!panel.classList.contains('saOpen')) return;

		panel.classList.remove('saOpen');
		button.setAttribute('aria-expanded', 'false');
		input.value = '';

		resetToAll();
		clearActive();
		resetRenderState();

		if (returnFocus) button.focus();
	}

	// === Events ===
	button.addEventListener('click', () => {
		panel.classList.contains('saOpen') ? closeDropdown({ returnFocus: true }) : openDropdown();
	});

	input.addEventListener('input', () => {
		if (rafId) cancelAnimationFrame(rafId);
		rafId = requestAnimationFrame(() => filterList(input.value));
	});

	input.addEventListener('keydown', e => {
		switch (e.key) {
			case 'ArrowDown': e.preventDefault(); setActive(activeVI + 1); break;
			case 'ArrowUp': e.preventDefault(); setActive(activeVI - 1); break;
			case 'Home': e.preventDefault(); setActive(0); break;
			case 'End': e.preventDefault(); setActive(visibleIndices.length - 1); break;
			case 'Enter':
				e.preventDefault();
				if (!visibleIndices.length || activeVI < 0) return;
				updateButton(visibleIndices[activeVI]);
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
				typeMatchPos = (typeMatchPos + 1) % typeMatchIndices.length;
				if (typeMatchIndices.length) updateButton(typeMatchIndices[typeMatchPos]);
			} else {
				typeBuffer += ch;
				typeMatchIndices = labelsLower
					.map((l, i) => ({ l, i }))
					.filter(({ l }) => l.startsWith(typeBuffer))
					.map(({ i }) => i);
				typeMatchPos = 0;
				if (typeMatchIndices.length) updateButton(typeMatchIndices[0]);
			}

			typeTimer = setTimeout(() => {
				typeBuffer = '';
				typeMatchIndices = [];
				typeMatchPos = 0;
			}, 700);
			return;
		}
		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				if (e.altKey) { openDropdown(); break; }
				if (selectedI + 1 < allItems.length) updateButton(selectedI + 1);
				break;
			case 'ArrowUp':
				e.preventDefault();
				if (e.altKey) { openDropdown(); break; }
				if (selectedI - 1 >= 0) updateButton(selectedI - 1);
				break;
			case 'Enter':
			case ' ':
				e.preventDefault(); openDropdown(); break;
			case 'Home': e.preventDefault(); updateButton(0); break;
			case 'End': e.preventDefault(); updateButton(allItems.length - 1); break;
		}
	});

	listContainer.addEventListener('click', e => {
		const item = e.target.closest('.saOptionWrapper');
		if (item && !item.classList.contains('saNoResults')) {
			updateButton(parseInt(item.dataset.index, 10));
			closeDropdown({ returnFocus: true });
		}
	});

	document.addEventListener('click', e => {
		if (panel.classList.contains('saOpen') && !root.contains(e.target))
			closeDropdown();
	});

	document.addEventListener('focusin', e => {
		if (panel.classList.contains('saOpen') && !root.contains(e.target))
			closeDropdown();
	});

	updateButton(selectedI);
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
		const ITEM_HEIGHT = 32;
		const OVERSCAN = 6;
		const dataSource = countries.map(item => ({
			value: item.code,
			label: item.country,
			searchTerms: item.searchTerms
		}));

		let optionItems = [];
		let loadMoreItem = null;
		let loadedItems = new Map();
		let loadedPages = new Set();
		let pendingPages = new Map();
		let totalCount = 0;
		let loadedCount = 0;
		let activeI = -1;
		let rangeAnchorI = -1;
		let prevActiveEl = null;
		let renderedStart = -1;
		let renderedEnd = -1;
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

		function ensureOptionCount(count) {
			optionItems.forEach(item => item.remove());
			if (loadMoreItem) loadMoreItem.remove();
			optionItems = [];
			loadMoreItem = null;

			const fragment = document.createDocumentFragment();
			for (let i = 0; i < count; i++) {
				const li = document.createElement('li');
				li.className = 'saOptionWrapper';
				li.setAttribute('role', 'option');
				li.setAttribute('aria-checked', 'false');
				li.id = `${idPrefix}-opt-${i}`;
				li.dataset.index = i;
				li.style.height = `${ITEM_HEIGHT}px`;
				li.style.overflow = 'hidden';
				li.style.visibility = 'hidden';
				optionItems.push(li);
				fragment.appendChild(li);
			}
			if (count < totalCount) {
				loadMoreItem = document.createElement('li');
				loadMoreItem.className = 'saOptionWrapper saLoadMoreOption';
				loadMoreItem.setAttribute('role', 'option');
				loadMoreItem.dataset.loadMore = 'true';
				loadMoreItem.innerHTML = `
      <button class="saOption" type="button">
        <i class="far fa-plus saOptionIcon saIcon" aria-hidden="true"></i>
        <span class="saOptionText">Load more</span>
      </button>`;
				fragment.appendChild(loadMoreItem);
			}
			listContainer.appendChild(fragment);
		}

		function applyPage(offset, result) {
			totalCount = result.total;
			loadedCount = Math.max(loadedCount, offset + result.items.length);
			if (optionItems.length !== loadedCount || Boolean(loadMoreItem) !== loadedCount < totalCount) {
				ensureOptionCount(loadedCount);
			}

			result.items.forEach((item, i) => {
				const index = offset + i;
				loadedItems.set(index, item);
				if (selectedValues.has(item.value)) selectedLabels.set(item.value, item.label);
			});

			updateNoResults();
			updateButton();
		}

		async function fetchPage(offset, seq = requestSeq) {
			const pageOffset = Math.floor(offset / PAGE_SIZE) * PAGE_SIZE;
			if (loadedPages.has(pageOffset)) return;
			if (pendingPages.has(pageOffset)) return pendingPages.get(pageOffset);

			const promise = (async () => {
				const result = await fetchCountryPage({
					query: currentQuery,
					offset: pageOffset,
					limit: PAGE_SIZE
				});
				if (seq !== requestSeq) return;

				loadedPages.add(pageOffset);
				applyPage(pageOffset, result);
				resetRenderState();
				renderVirtualList();
			})().finally(() => {
				pendingPages.delete(pageOffset);
			});

			pendingPages.set(pageOffset, promise);
			return promise;
		}

		function getVirtualRange() {
			const scrollTop = scrollContainer.scrollTop;
			const viewportH = scrollContainer.clientHeight;
			const start = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
			const end = Math.min(
				optionItems.length,
				Math.ceil((scrollTop + viewportH) / ITEM_HEIGHT) + OVERSCAN
			);
			return { start, end };
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
			const data = loadedItems.get(index);
			if (!item) return;

			item.style.height = '';
			item.style.overflow = '';
			item.style.visibility = '';
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

		function blankItem(index) {
			const item = optionItems[index];
			if (!item) return;
			item.innerHTML = '';
			item.style.height = `${ITEM_HEIGHT}px`;
			item.style.overflow = 'hidden';
			item.style.visibility = 'hidden';
		}

		function renderVirtualList() {
			const { start, end } = getVirtualRange();
			if (start === renderedStart && end === renderedEnd) return;
			const isFirstRender = renderedStart === -1 && renderedEnd === -1;

			if (isFirstRender) {
				for (let i = 0; i < optionItems.length; i++) {
					if (i < start || i >= end) blankItem(i);
				}
			} else {
				for (let i = renderedStart; i < renderedEnd; i++) {
					if (i < start || i >= end) blankItem(i);
				}
			}

			for (let i = start; i < end; i++) {
				if (isFirstRender || i < renderedStart || i >= renderedEnd || pendingPages.size) renderItem(i);
			}

			renderedStart = start;
			renderedEnd = end;
		}

		function resetRenderState() {
			renderedStart = -1;
			renderedEnd = -1;
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
			if (!optionItems.length) return;
			if (index < 0) index = optionItems.length - 1;
			if (index >= optionItems.length) index = 0;

			clearActive();

			activeI = index;
			const item = optionItems[activeI];
			item.classList.add('saFocus');
			input.setAttribute('aria-activedescendant', item.id);
			prevActiveEl = item;
			item.scrollIntoView({ block: 'nearest' });
		}

		function anchorActiveItem(item) {
			clearActive({ keepIndex: true });
			activeI = parseInt(item.dataset.index, 10);
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
			const data = loadedItems.get(index);
			if (!data) return;

			setOptionData(data, checked);

			const item = optionItems[index];
			item.setAttribute('aria-checked', checked ? 'true' : 'false');
			const checkbox = item.querySelector('input[type="checkbox"]');
			if (checkbox) checkbox.checked = checked;
		}

		function toggleOption(index) {
			const data = loadedItems.get(index);
			if (!data) return;
			setOption(index, !selectedValues.has(data.value));
		}

		function setRange(anchorIndex, clickedIndex, checked) {
			const start = Math.min(anchorIndex, clickedIndex);
			const end = Math.max(anchorIndex, clickedIndex);
			for (let i = start; i <= end; i++) setOption(i, checked);
			renderVirtualList();
		}

		function loadNextPage() {
			if (loadedCount >= totalCount) return;
			clearActive({ keepIndex: true });
			fetchPage(loadedCount);
			input.focus({ preventScroll: true });
		}

		async function loadQuery(query) {
			const seq = ++requestSeq;
			currentQuery = query.trim().toLowerCase();
			loadedItems = new Map();
			loadedPages = new Set();
			pendingPages = new Map();
			totalCount = 0;
			loadedCount = 0;
			activeI = -1;
			rangeAnchorI = -1;
			clearActive();
			ensureOptionCount(0);
			resetRenderState();
			updateNoResults();

			const firstPage = await fetchCountryPage({
				query: currentQuery,
				offset: 0,
				limit: PAGE_SIZE
			});
			if (seq !== requestSeq) return;

			loadedPages.add(0);
			applyPage(0, firstPage);
			resetRenderState();
			renderVirtualList();
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
			resetRenderState();

			if (returnFocus) button.focus();
		}

		scrollContainer.addEventListener('scroll', renderVirtualList, { passive: true });

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
					setActive(activeI < 0 || !prevActiveEl ? (activeI >= 0 ? activeI : optionItems.length - 1) : activeI - 1);
					break;
				case 'Home': e.preventDefault(); setActive(0); break;
				case 'End': e.preventDefault(); setActive(optionItems.length - 1); break;
				case 'Enter':
				case ' ':
					e.preventDefault();
					if (optionItems.length && activeI >= 0) {
						toggleOption(activeI);
						rangeAnchorI = activeI;
					}
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
			if (item.dataset.loadMore === 'true') {
				e.preventDefault();
				e.stopPropagation();
				loadNextPage();
				return;
			}

			const clickedI = parseInt(item.dataset.index, 10);
			const data = loadedItems.get(clickedI);
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
