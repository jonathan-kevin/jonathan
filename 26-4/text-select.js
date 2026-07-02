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

const birdTypes = [
	{ value: 'albatross', label: 'Albatross' },
	{ value: 'auk', label: 'Auk' },
	{ value: 'avocet', label: 'Avocet' },
	{ value: 'bittern', label: 'Bittern' },
	{ value: 'blackbird', label: 'Blackbird' },
	{ value: 'bobolink', label: 'Bobolink' },
	{ value: 'booby', label: 'Booby' },
	{ value: 'budgerigar', label: 'Budgerigar' },
	{ value: 'bulbul', label: 'Bulbul' },
	{ value: 'bustard', label: 'Bustard' },
	{ value: 'butterfly-warbler', label: 'Butterfly Warbler' },
	{ value: 'cormorant', label: 'Cormorant' },
	{ value: 'coot', label: 'Coot' },
	{ value: 'corvid', label: 'Corvid' },
	{ value: 'crane', label: 'Crane' },
	{ value: 'crow', label: 'Crow' },
	{ value: 'cuckoo', label: 'Cuckoo' },
	{ value: 'curlew', label: 'Curlew' },
	{ value: 'dove', label: 'Dove' },
	{ value: 'dowitcher', label: 'Dowitcher' },
	{ value: 'duck', label: 'Duck' },
	{ value: 'eagle', label: 'Eagle' },
	{ value: 'egret', label: 'Egret' },
	{ value: 'auklet', label: 'Eurasian Auklet' },
	{ value: 'falcon', label: 'Falcon' },
	{ value: 'fennec', label: 'Fennec', },
	{ value: 'finch', label: 'Finch' },
	{ value: 'flamingo', label: 'Flamingo' },
	{ value: 'gannet', label: 'Gannet' },
	{ value: 'goldfinch', label: 'Goldfinch' },
	{ value: 'goose', label: 'Goose' },
	{ value: 'goshawk', label: 'Goshawk' },
	{ value: 'grebe', label: 'Grebe' },
	{ value: 'grouse', label: 'Grouse' },
	{ value: 'gull', label: 'Gull' },
	{ value: 'hawk', label: 'Hawk' },
	{ value: 'heron', label: 'Heron' },
	{ value: 'hoopoe', label: 'Hoopoe' },
	{ value: 'hornbill', label: 'Hornbill' },
	{ value: 'hummingbird', label: 'Hummingbird' },
	{ value: 'ibis', label: 'Ibis' },
	{ value: 'jay', label: 'Jay' },
	{ value: 'kite', label: 'Kite' },
	{ value: 'kingfisher', label: 'Kingfisher' },
	{ value: 'kookaburra', label: 'Kookaburra' },
	{ value: 'lapwing', label: 'Lapwing' },
	{ value: 'lark', label: 'Lark' },
	{ value: 'loon', label: 'Loon' },
	{ value: 'macaw', label: 'Macaw' },
	{ value: 'magpie', label: 'Magpie' },
	{ value: 'manakin', label: 'Manakin' },
	{ value: 'myna', label: 'Myna' },
	{ value: 'mockingbird', label: 'Mockingbird' },
	{ value: 'nightingingale', label: 'Nightingale' },
	{ value: 'nuthatch', label: 'Nuthatch' },
	{ value: 'oystercatcher', label: 'Oystercatcher' },
	{ value: 'osprey', label: 'Osprey' },
	{ value: 'owl', label: 'Owl' },
	{ value: 'parakeet', label: 'Parakeet' },
	{ value: 'parrot', label: 'Parrot' },
	{ value: 'partridge', label: 'Partridge' },
	{ value: 'pelican', label: 'Pelican' },
	{ value: 'penguin', label: 'Penguin' },
	{ value: 'peacock', label: 'Peacock' },
	{ value: 'pheasant', label: 'Pheasant' },
	{ value: 'pigeon', label: 'Pigeon' },
	{ value: 'ptarmigan', label: 'Ptarmigan' },
	{ value: 'quail', label: 'Quail' },
	{ value: 'rail', label: 'Rail' },
	{ value: 'raven', label: 'Raven' },
	{ value: 'reedwarbler', label: 'Reed Warbler' },
	{ value: 'roadrunner', label: 'Roadrunner' },
	{ value: 'robin', label: 'Robin' },
	{ value: 'sandpiper', label: 'Sandpiper' },
	{ value: 'sapsucker', label: 'Sapsucker' },
	{ value: 'sandgrouse', label: 'Sandgrouse' },
	{ value: 'skua', label: 'Skua' },
	{ value: 'skylark', label: 'Skylark' },
	{ value: 'snipe', label: 'Snipe' },
	{ value: 'sparrow', label: 'Sparrow' },
	{ value: 'starling', label: 'Starling' },
	{ value: 'stilt', label: 'Stilt' },
	{ value: 'stork', label: 'Stork' },
	{ value: 'swallow', label: 'Swallow' },
	{ value: 'swan', label: 'Swan' },
	{ value: 'swift', label: 'Swift' },
	{ value: 'thrush', label: 'Thrush' },
	{ value: 'tit', label: 'Tit' },
	{ value: 'turnstone', label: 'Turnstone' },
	{ value: 'turkey', label: 'Turkey' },
	{ value: 'vireos', label: 'Vireo' },
	{ value: 'vulture', label: 'Vulture' },
	{ value: 'whimbrel', label: 'Whimbrel' },
	{ value: 'woodcock', label: 'Woodcock' },
	{ value: 'woodpecker', label: 'Woodpecker' },
	{ value: 'wren', label: 'Wren' }
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
		const allItems = [];
		const visibleIndices = [];
		let activeI = -1;
		let prevActiveEl = null;
		let rangeAnchorI = -1;

		const fragment = document.createDocumentFragment();
		birdTypes.forEach((item, index) => {
			const li = document.createElement('li');
			li.className = 'saOptionWrapper';
			li.setAttribute('role', 'option');
			li.setAttribute('aria-checked', 'false');
			li.id = `${idPrefix}-opt-${item.value}`;
			li.dataset.value = item.value;
			li.dataset.label = item.label;
			li.dataset.index = index;
			li.innerHTML = `
      <div class="saOption">
        <input class="saCheckbox" type="checkbox" tabindex="-1" aria-hidden="true">
        <span class="saOptionText">${item.label}</span>
      </div>`;

			fragment.appendChild(li);
			allItems.push(li);
			visibleIndices.push(index);
		});
		listContainer.appendChild(fragment);

		function updateNoResults() {
			if (noResults) noResults.style.display = visibleIndices.length === 0 ? '' : 'none';
		}

		function clearActive({ keepIndex = false } = {}) {
			if (prevActiveEl) {
				prevActiveEl.classList.remove('saFocus');
				prevActiveEl = null;
			}
			input.removeAttribute('aria-activedescendant');
			if (!keepIndex) activeI = -1;
		}

		function setActive(visibleIndex) {
			if (!visibleIndices.length) return;
			if (visibleIndex < 0) visibleIndex = visibleIndices.length - 1;
			if (visibleIndex >= visibleIndices.length) visibleIndex = 0;

			clearActive();

			activeI = visibleIndex;
			const el = allItems[visibleIndices[activeI]];
			el.classList.add('saFocus');
			input.setAttribute('aria-activedescendant', el.id);
			prevActiveEl = el;
			el.scrollIntoView({ block: 'nearest' });
		}

		function anchorActiveItem(item) {
			const visibleIndex = visibleIndices.indexOf(parseInt(item.dataset.index, 10));
			clearActive({ keepIndex: true });
			if (visibleIndex !== -1) activeI = visibleIndex;
			input.focus({ preventScroll: true });
		}

		function updateButton() {
			const selected = birdTypes.filter(item => selectedValues.has(item.value));
			const buttonText = button.querySelector('.saDropdownText');

			if (selected.length === 0) {
				buttonText.textContent = 'Select birds';
			} else if (selected.length <= 2) {
				buttonText.textContent = selected.map(item => item.label).join(', ');
			} else {
				buttonText.textContent = `${selected.length} selected`;
			}

			root.dataset.selectedValues = selected.map(item => item.value).join(',');
		}

		function setOption(item, checked) {
			const value = item.dataset.value;
			const checkbox = item.querySelector('input[type="checkbox"]');

			if (checked) {
				selectedValues.add(value);
			} else {
				selectedValues.delete(value);
			}

			item.setAttribute('aria-checked', checked ? 'true' : 'false');
			checkbox.checked = checked;
			updateButton();
		}

		function toggleOption(item) {
			setOption(item, !selectedValues.has(item.dataset.value));
		}

		function setRange(anchorAllItemsIndex, clickedAllItemsIndex, checked) {
			const anchorVisibleIndex = visibleIndices.indexOf(anchorAllItemsIndex);
			const clickedVisibleIndex = visibleIndices.indexOf(clickedAllItemsIndex);
			if (anchorVisibleIndex === -1 || clickedVisibleIndex === -1) {
				setOption(allItems[clickedAllItemsIndex], checked);
				return;
			}

			const start = Math.min(anchorVisibleIndex, clickedVisibleIndex);
			const end = Math.max(anchorVisibleIndex, clickedVisibleIndex);
			for (let i = start; i <= end; i++) {
				setOption(allItems[visibleIndices[i]], checked);
			}
		}

		function filterList(query) {
			const val = query.trim().toLowerCase();
			visibleIndices.length = 0;

			allItems.forEach((item, index) => {
				const isVisible = item.dataset.label.toLowerCase().includes(val);
				item.style.display = isVisible ? '' : 'none';
				if (isVisible) visibleIndices.push(index);
			});

			updateNoResults();
			clearActive();
		}

		function openDropdown() {
			if (panel.classList.contains('saOpen')) return;

			panel.classList.add('saOpen');
			button.setAttribute('aria-expanded', 'true');
			input.value = '';
			filterList('');

			setTimeout(() => input.focus(), 0);
		}

		function closeDropdown({ returnFocus = false } = {}) {
			if (!panel.classList.contains('saOpen')) return;

			panel.classList.remove('saOpen');
			button.setAttribute('aria-expanded', 'false');
			input.value = '';
			filterList('');
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

		input.addEventListener('input', () => filterList(input.value));

		input.addEventListener('keydown', e => {
			switch (e.key) {
				case 'ArrowDown':
					e.preventDefault();
					setActive(activeI < 0 || !prevActiveEl ? Math.max(activeI, 0) : activeI + 1);
					break;
				case 'ArrowUp':
					e.preventDefault();
					setActive(activeI < 0 || !prevActiveEl ? (activeI >= 0 ? activeI : visibleIndices.length - 1) : activeI - 1);
					break;
				case 'Home': e.preventDefault(); setActive(0); break;
				case 'End': e.preventDefault(); setActive(visibleIndices.length - 1); break;
				case 'Enter':
				case ' ':
					e.preventDefault();
					if (visibleIndices.length && activeI >= 0) {
						toggleOption(allItems[visibleIndices[activeI]]);
						rangeAnchorI = visibleIndices[activeI];
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
			if (!item || item.classList.contains('saNoResults')) return;

			const clickedI = parseInt(item.dataset.index, 10);
			const nextChecked = !selectedValues.has(item.dataset.value);

			anchorActiveItem(item);

			if (e.shiftKey) {
				const anchorI = rangeAnchorI !== -1 ? rangeAnchorI : clickedI;
				setRange(anchorI, clickedI, nextChecked);
				if (rangeAnchorI === -1) rangeAnchorI = clickedI;
			} else {
				toggleOption(item);
				rangeAnchorI = clickedI;
			}
		});

		document.addEventListener('click', e => {
			if (panel.classList.contains('saOpen') && !root.contains(e.target)) closeDropdown();
		});

		document.addEventListener('focusin', e => {
			if (panel.classList.contains('saOpen') && !root.contains(e.target)) closeDropdown();
		});

		allItems.forEach(item => setOption(item, selectedValues.has(item.dataset.value)));
		updateNoResults();
		updateButton();
	});
});
