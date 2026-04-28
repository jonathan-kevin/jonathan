document.addEventListener('DOMContentLoaded', () => {

	const countries = [
		{ "code": "aw", "country": "Aruba" },
		{ "code": "af", "country": "Afghanistan" },
		{ "code": "ao", "country": "Angola" },
		{ "code": "ai", "country": "Anguilla" },
		{ "code": "al", "country": "Albania" },
		{ "code": "ad", "country": "Andorra" },
		{ "code": "ae", "country": "United Arab Emirates" },
		{ "code": "ar", "country": "Argentina" },
		{ "code": "am", "country": "Armenia" },
		{ "code": "as", "country": "American Samoa" },
		{ "code": "aq", "country": "Antarctica" },
		{ "code": "ag", "country": "Antigua and Barbuda" },
		{ "code": "au", "country": "Australia" },
		{ "code": "at", "country": "Austria" },
		{ "code": "az", "country": "Azerbaijan" },
		{ "code": "bi", "country": "Burundi" },
		{ "code": "be", "country": "Belgium" },
		{ "code": "bj", "country": "Benin" },
		{ "code": "bq", "country": "Bonaire, Sint Eustatius and Saba" },
		{ "code": "bf", "country": "Burkina Faso" },
		{ "code": "bd", "country": "Bangladesh" },
		{ "code": "bg", "country": "Bulgaria" },
		{ "code": "bh", "country": "Bahrain" },
		{ "code": "bs", "country": "Bahamas" },
		{ "code": "ba", "country": "Bosnia and Herzegovina" },
		{ "code": "bl", "country": "Saint Barthélemy" },
		{ "code": "by", "country": "Belarus" },
		{ "code": "bz", "country": "Belize" },
		{ "code": "bm", "country": "Bermuda" },
		{ "code": "bo", "country": "Bolivia" },
		{ "code": "br", "country": "Brazil" },
		{ "code": "bb", "country": "Barbados" },
		{ "code": "bn", "country": "Brunei Darussalam" },
		{ "code": "bt", "country": "Bhutan" },
		{ "code": "bv", "country": "Bouvet Island" },
		{ "code": "bw", "country": "Botswana" },
		{ "code": "cf", "country": "Central African Republic" },
		{ "code": "ca", "country": "Canada" },
		{ "code": "cc", "country": "Cocos (Keeling) Islands" },
		{ "code": "ch", "country": "Switzerland" },
		{ "code": "cl", "country": "Chile" },
		{ "code": "cn", "country": "China" },
		{ "code": "ci", "country": "Côte d'Ivoire" },
		{ "code": "cm", "country": "Cameroon" },
		{ "code": "cd", "country": "Congo (the Democratic Republic of the)" },
		{ "code": "cg", "country": "Congo" },
		{ "code": "ck", "country": "Cook Islands" },
		{ "code": "co", "country": "Colombia" },
		{ "code": "km", "country": "Comoros" },
		{ "code": "cv", "country": "Cabo Verde" },
		{ "code": "cr", "country": "Costa Rica" },
		{ "code": "cu", "country": "Cuba" },
		{ "code": "cw", "country": "Curaçao" },
		{ "code": "cx", "country": "Christmas Island" },
		{ "code": "ky", "country": "Cayman Islands" },
		{ "code": "cy", "country": "Cyprus" },
		{ "code": "cz", "country": "Czechia" },
		{ "code": "de", "country": "Germany" },
		{ "code": "dj", "country": "Djibouti" },
		{ "code": "dm", "country": "Dominica" },
		{ "code": "dk", "country": "Denmark" },
		{ "code": "do", "country": "Dominican Republic" },
		{ "code": "dz", "country": "Algeria" },
		{ "code": "ec", "country": "Ecuador" },
		{ "code": "eg", "country": "Egypt" },
		{ "code": "er", "country": "Eritrea" },
		{ "code": "eh", "country": "Western Sahara" },
		{ "code": "es", "country": "Spain" },
		{ "code": "ee", "country": "Estonia" },
		{ "code": "et", "country": "Ethiopia" },
		{ "code": "fi", "country": "Finland" },
		{ "code": "fj", "country": "Fiji" },
		{ "code": "fk", "country": "Falkland Islands" },
		{ "code": "fr", "country": "France" },
		{ "code": "fo", "country": "Faroe Islands" },
		{ "code": "fm", "country": "Micronesia" },
		{ "code": "ga", "country": "Gabon" },
		{ "code": "gb", "country": "United Kingdom [of Great Britain and Northern Ireland]" },
		{ "code": "ge", "country": "Georgia" },
		{ "code": "gg", "country": "Guernsey" },
		{ "code": "gh", "country": "Ghana" },
		{ "code": "gi", "country": "Gibraltar" },
		{ "code": "gn", "country": "Guinea" },
		{ "code": "gp", "country": "Guadeloupe" },
		{ "code": "gm", "country": "Gambia" },
		{ "code": "gw", "country": "Guinea-Bissau" },
		{ "code": "gq", "country": "Equatorial Guinea" },
		{ "code": "gr", "country": "Greece" },
		{ "code": "gd", "country": "Grenada" },
		{ "code": "gl", "country": "Greenland" },
		{ "code": "gt", "country": "Guatemala" },
		{ "code": "gf", "country": "French Guiana" },
		{ "code": "gu", "country": "Guam" },
		{ "code": "gy", "country": "Guyana" },
		{ "code": "hk", "country": "Hong Kong" },
		{ "code": "hm", "country": "Heard Island and McDonald Islands" },
		{ "code": "hn", "country": "Honduras" },
		{ "code": "hr", "country": "Croatia" },
		{ "code": "ht", "country": "Haiti" },
		{ "code": "hu", "country": "Hungary" },
		{ "code": "id", "country": "Indonesia" },
		{ "code": "im", "country": "Isle of Man" },
		{ "code": "in", "country": "India" },
		{ "code": "ie", "country": "Ireland" },
		{ "code": "ir", "country": "Iran" },
		{ "code": "iq", "country": "Iraq" },
		{ "code": "is", "country": "Iceland" },
		{ "code": "il", "country": "Israel" },
		{ "code": "it", "country": "Italy" },
		{ "code": "jm", "country": "Jamaica" },
		{ "code": "je", "country": "Jersey" },
		{ "code": "jo", "country": "Jordan" },
		{ "code": "jp", "country": "Japan" },
		{ "code": "kz", "country": "Kazakhstan" },
		{ "code": "ke", "country": "Kenya" },
		{ "code": "kg", "country": "Kyrgyzstan" },
		{ "code": "kh", "country": "Cambodia" },
		{ "code": "ki", "country": "Kiribati" },
		{ "code": "kn", "country": "Saint Kitts and Nevis" },
		{ "code": "kr", "country": "South Korea" },
		{ "code": "kw", "country": "Kuwait" },
		{ "code": "la", "country": "Lao People's Democratic Republic" },
		{ "code": "lb", "country": "Lebanon" },
		{ "code": "lr", "country": "Liberia" },
		{ "code": "ly", "country": "Libya" },
		{ "code": "lc", "country": "Saint Lucia" },
		{ "code": "li", "country": "Liechtenstein" },
		{ "code": "lk", "country": "Sri Lanka" },
		{ "code": "ls", "country": "Lesotho" },
		{ "code": "lt", "country": "Lithuania" },
		{ "code": "lu", "country": "Luxembourg" },
		{ "code": "lv", "country": "Latvia" },
		{ "code": "mo", "country": "Macao" },
		{ "code": "mf", "country": "Saint Martin" },
		{ "code": "ma", "country": "Morocco" },
		{ "code": "mc", "country": "Monaco" },
		{ "code": "md", "country": "Moldova (the Republic of)" },
		{ "code": "mg", "country": "Madagascar" },
		{ "code": "mv", "country": "Maldives" },
		{ "code": "mx", "country": "Mexico" },
		{ "code": "mh", "country": "Marshall Islands" },
		{ "code": "mk", "country": "Republic of North Macedonia" },
		{ "code": "ml", "country": "Mali" },
		{ "code": "mt", "country": "Malta" },
		{ "code": "mm", "country": "Myanmar" },
		{ "code": "me", "country": "Montenegro" },
		{ "code": "mn", "country": "Mongolia" },
		{ "code": "mp", "country": "Northern Mariana Islands" },
		{ "code": "mz", "country": "Mozambique" },
		{ "code": "mr", "country": "Mauritania" },
		{ "code": "ms", "country": "Montserrat" },
		{ "code": "mq", "country": "Martinique" },
		{ "code": "mu", "country": "Mauritius" },
		{ "code": "mw", "country": "Malawi" },
		{ "code": "my", "country": "Malaysia" },
		{ "code": "yt", "country": "Mayotte" },
		{ "code": "na", "country": "Namibia" },
		{ "code": "nc", "country": "New Caledonia" },
		{ "code": "ne", "country": "Niger" },
		{ "code": "nf", "country": "Norfolk Island" },
		{ "code": "ng", "country": "Nigeria" },
		{ "code": "ni", "country": "Nicaragua" },
		{ "code": "nu", "country": "Niue" },
		{ "code": "nl", "country": "Netherlands" },
		{ "code": "no", "country": "Norway" },
		{ "code": "np", "country": "Nepal" },
		{ "code": "nr", "country": "Nauru" },
		{ "code": "nz", "country": "New Zealand" },
		{ "code": "om", "country": "Oman" },
		{ "code": "pk", "country": "Pakistan" },
		{ "code": "pa", "country": "Panama" },
		{ "code": "pn", "country": "Pitcairn" },
		{ "code": "pe", "country": "Peru" },
		{ "code": "ph", "country": "Philippines" },
		{ "code": "pw", "country": "Palau" },
		{ "code": "pg", "country": "Papua New Guinea" },
		{ "code": "pl", "country": "Poland" },
		{ "code": "pr", "country": "Puerto Rico" },
		{ "code": "kp", "country": "North Korea" },
		{ "code": "pt", "country": "Portugal" },
		{ "code": "py", "country": "Paraguay" },
		{ "code": "ps", "country": "Palestine" },
		{ "code": "pf", "country": "French Polynesia" },
		{ "code": "qa", "country": "Qatar" },
		{ "code": "re", "country": "Réunion" },
		{ "code": "ro", "country": "Romania" },
		{ "code": "ru", "country": "Russia" },
		{ "code": "rw", "country": "Rwanda" },
		{ "code": "sa", "country": "Saudi Arabia" },
		{ "code": "sd", "country": "Sudan" },
		{ "code": "sn", "country": "Senegal" },
		{ "code": "sg", "country": "Singapore" },
		{ "code": "gs", "country": "South Georgia and the South Sandwich Islands" },
		{ "code": "sh", "country": "Saint Helena, Ascension and Tristan da Cunha" },
		{ "code": "sj", "country": "Svalbard and Jan Mayen" },
		{ "code": "sb", "country": "Solomon Islands" },
		{ "code": "sl", "country": "Sierra Leone" },
		{ "code": "sv", "country": "El Salvador" },
		{ "code": "sm", "country": "San Marino" },
		{ "code": "so", "country": "Somalia" },
		{ "code": "pm", "country": "Saint Pierre and Miquelon" },
		{ "code": "rs", "country": "Serbia" },
		{ "code": "ss", "country": "South Sudan" },
		{ "code": "st", "country": "Sao Tome and Principe" },
		{ "code": "sr", "country": "Suriname" },
		{ "code": "sk", "country": "Slovakia" },
		{ "code": "si", "country": "Slovenia" },
		{ "code": "se", "country": "Sweden" },
		{ "code": "sz", "country": "Eswatini" },
		{ "code": "sx", "country": "Sint Maarten (Dutch part)" },
		{ "code": "sc", "country": "Seychelles" },
		{ "code": "sy", "country": "Syrian Arab Republic" },
		{ "code": "td", "country": "Chad" },
		{ "code": "tg", "country": "Togo" },
		{ "code": "th", "country": "Thailand" },
		{ "code": "tj", "country": "Tajikistan" },
		{ "code": "tk", "country": "Tokelau" },
		{ "code": "tm", "country": "Turkmenistan" },
		{ "code": "tl", "country": "Timor-Leste" },
		{ "code": "to", "country": "Tonga" },
		{ "code": "tt", "country": "Trinidad and Tobago" },
		{ "code": "tn", "country": "Tunisia" },
		{ "code": "tr", "country": "Turkey" },
		{ "code": "tv", "country": "Tuvalu" },
		{ "code": "tw", "country": "Taiwan" },
		{ "code": "tz", "country": "Tanzania" },
		{ "code": "ug", "country": "Uganda" },
		{ "code": "ua", "country": "Ukraine" },
		{ "code": "uy", "country": "Uruguay" },
		{ "code": "us", "country": "United States of America" },
		{ "code": "uz", "country": "Uzbekistan" },
		{ "code": "va", "country": "Vatican" },
		{ "code": "vc", "country": "Saint Vincent and the Grenadines" },
		{ "code": "ve", "country": "Venezuela" },
		{ "code": "vg", "country": "British Virgin Islands" },
		{ "code": "vi", "country": "U.S. Virgin Islands" },
		{ "code": "vn", "country": "Vietnam" },
		{ "code": "vu", "country": "Vanuatu" },
		{ "code": "wf", "country": "Wallis and Futuna" },
		{ "code": "ws", "country": "Samoa" },
		{ "code": "ye", "country": "Yemen" },
		{ "code": "za", "country": "South Africa" },
		{ "code": "zm", "country": "Zambia" },
		{ "code": "zw", "country": "Zimbabwe" }
	];

	countries.sort((a, b) => a.country.localeCompare(b.country));

	const listContainer = document.getElementById('countryDropdown');
	const button = document.getElementById('countryButton');
	const panel = document.getElementById('contextMenu');
	const input = document.getElementById('countrySearch');
	const noResults = listContainer.querySelector('.saNoResults');

	const allItems = [];
	const labels = [];
	const labelsLower = [];
	const textSpans = [];

	// === Build the list (once) ===
	const fragment = document.createDocumentFragment();

	countries.forEach((item, index) => {
		const li = document.createElement('li');
		li.className = 'saOptionWrapper';
		li.setAttribute('role', 'option');
		li.id = `opt-${item.code}`;
		li.dataset.code = item.code;
		li.dataset.label = item.country;
		li.dataset.index = index;

		li.innerHTML = `
      <div class="saOption">
        <img src="https://flagcdn.com/${item.code}.svg" loading="lazy" alt="" aria-hidden="true">
        <span class="saOptionText">${item.country}</span>
      </div>`;

		fragment.appendChild(li);
		allItems.push(li);
		labels.push(item.country);
		labelsLower.push(item.country.toLowerCase());
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
	let selectedI = 0;
	let prevActiveEl = null;
	let renderedStart = -1;
	let renderedEnd = -1;

	let typeBuffer = '';
	let typeTimer = null;
	let rafId = null;

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

		const nextVisible = candidates.filter(i => labelsLower[i].includes(val));

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
			typeBuffer += e.key.toLowerCase();
			clearTimeout(typeTimer);
			typeTimer = setTimeout(() => (typeBuffer = ''), 700);
			const i = labelsLower.findIndex(l => l.startsWith(typeBuffer));
			if (i !== -1) updateButton(i);
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
		if (item) {
			updateButton(parseInt(item.dataset.index, 10));
			closeDropdown({ returnFocus: true });
		}
	});

	document.addEventListener('click', e => {
		if (panel.classList.contains('saOpen') && !e.target.closest('.saDropdown, #contextMenu'))
			closeDropdown();
	});

	document.addEventListener('focusin', e => {
		if (panel.classList.contains('saOpen') && !e.target.closest('.saDropdown, #contextMenu'))
			closeDropdown();
	});

});