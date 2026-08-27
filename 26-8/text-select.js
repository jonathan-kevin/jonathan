const employees = [
		{ code: 'ag', name: 'adam.gustavsson@multisoft.se' },
		{ code: 'am', name: 'alexandra.moller@multisoft.se' },
		{ code: 'af', name: 'albin.fors@multisoft.se' },
		{ code: 'ab', name: 'anders.berg@multisoft.se' },
		{ code: 'an', name: 'andreas.nordstrom@multisoft.se' },
		{ code: 'ac', name: 'anna-carin.lund@multisoft.se' },
		{ code: 'as', name: 'anna.sjoberg@multisoft.se' },
		{ code: 'bp', name: 'beatrice.persson@multisoft.se' },
		{ code: 'bw', name: 'bjorn.widell@multisoft.se' },
		{ code: 'bi', name: 'britt.israelsson@multisoft.se' },
		{ code: 'ca', name: 'caroline.ahlberg@multisoft.se' },
		{ code: 'cp', name: 'carl.pettersson@multisoft.se' },
		{ code: 'cn', name: 'cecilia.nilsson@multisoft.se' },
		{ code: 'df', name: 'david.forsberg@multisoft.se' },
		{ code: 'el', name: 'elin.lind@multisoft.se' },
		{ code: 'es', name: 'elin.strom@multisoft.se' },
		{ code: 'er', name: 'ellioth.rosenberg@multisoft.se' },
		{ code: 'ea', name: 'emma.akesson@multisoft.se' },
		{ code: 'eg', name: 'emil.gyllenring@multisoft.se' },
		{ code: 'ek', name: 'erik.karlsson@multisoft.se' },
		{ code: 'fi', name: 'filip.ivarsson@multisoft.se' },
		{ code: 'fm', name: 'fredrik.mattsson@multisoft.se' },
		{ code: 'gi', name: 'gustaf.ikasson@multisoft.se' },
		{ code: 'gk', name: 'gustaf.kallberg@multisoft.se' },
		{ code: 'gs', name: 'gustav.sandling@multisoft.se' },
		{ code: 'hk', name: 'hanna.kallstrom@multisoft.se' },
		{ code: 'hl', name: 'hanna.ljung@multisoft.se' },
		{ code: 'hw', name: 'hanna.wallin@multisoft.se' },
		{ code: 'hg', name: 'henrik.gustafsson@multisoft.se' },
		{ code: 'ho', name: 'hugo.ostberg@multisoft.se' },
		{ code: 'ip', name: 'ida.pettersson@multisoft.se' },
		{ code: 'ja', name: 'jenny.andersson@multisoft.se' },
		{ code: 'jl', name: 'johan.lindqvist@multisoft.se' },
		{ code: 'jo', name: 'jonas.ostlund@multisoft.se' },
		{ code: 'ka', name: 'karin.ahlstrom@multisoft.se' },
		{ code: 'kj', name: 'katarina.johansson@multisoft.se' },
		{ code: 'kb', name: 'kristina.bergman@multisoft.se' },
		{ code: 'le', name: 'linnea.ek@multisoft.se' },
		{ code: 'ls', name: 'linda.svensson@multisoft.se' },
		{ code: 'lj', name: 'linus.jonsson@multisoft.se' },
		{ code: 'la', name: 'lisa.andersson@multisoft.se' },
		{ code: 'me', name: 'maria.ekman@multisoft.se' },
		{ code: 'ml', name: 'maria.lindgren@multisoft.se' },
		{ code: 'mr', name: 'martin.rehn@multisoft.se' },
		{ code: 'mm', name: 'mattias.malm@multisoft.se' },
		{ code: 'mc', name: 'max.carlsson@multisoft.se' },
		{ code: 'mo', name: 'mikael.olsson@multisoft.se' },
		{ code: 'no', name: 'niklas.olofsson@multisoft.se' },
		{ code: 'ni', name: 'nina.isaksson@multisoft.se' },
		{ code: 'ot', name: 'olivia.tornberg@multisoft.se' },
		{ code: 'od', name: 'oskar.dahl@multisoft.se' },
		{ code: 'pl', name: 'patrik.lundqvist@multisoft.se' },
		{ code: 'pa', name: 'per.andersson@multisoft.se' },
		{ code: 'ph', name: 'peter.holm@multisoft.se' },
		{ code: 'pk', name: 'pontus.karlberg@multisoft.se' },
		{ code: 'rl', name: 'robert.larsson@multisoft.se' },
		{ code: 'ru', name: 'robin.ullberg@multisoft.se' },
		{ code: 'rb', name: 'robin.bjork@multisoft.se' },
		{ code: 'sn', name: 'sara.nystrom@multisoft.se' },
		{ code: 'so', name: 'sara.ostrom@multisoft.se' },
		{ code: 'sm', name: 'samantha.melander@multisoft.se' },
		{ code: 'sp', name: 'sebastian.palm@multisoft.se' },
		{ code: 'su', name: 'simon.ulfsson@multisoft.se' },
		{ code: 'sf', name: 'sofia.falk@multisoft.se' },
		{ code: 'sr', name: 'sophia.rehn@multisoft.se' },
		{ code: 'tc', name: 'therese.carlsson@multisoft.se' },
		{ code: 'th', name: 'thomas.hedstrom@multisoft.se' },
		{ code: 'vv', name: 'viktor.vikstrom@multisoft.se' },
		{ code: 'vh', name: 'viktoria.hjalmarsson@multisoft.se' },
		{ code: 'wr', name: 'wilma.rosen@multisoft.se' }
];

function createPersonSelect({ button, panel, input, list, people }) {
	const valueElement = button.querySelector('.saImpersonatorValue');
	const letterElement = button.querySelector('.saImpersonatorLetter');
	const noResults = list.querySelector('.saNoResults');
	const optionPerson = new WeakMap();
	const sortedPeople = [...people].sort((a, b) => a.name.localeCompare(b.name));

	let selectedCode = button.value || sortedPeople[0]?.code || '';
	let visibleOptions = [];
	let activeIndex = -1;
	let typeAheadBuffer = '';
	let typeAheadTimer;

	function normalize(value) {
		return value
			.normalize('NFD')
			.replace(/\p{Diacritic}/gu, '')
			.toLocaleLowerCase();
	}

	function appendHighlightedText(element, text, query) {
		const matchIndex = text.toLocaleLowerCase().indexOf(query.toLocaleLowerCase());
		if (!query || matchIndex === -1) {
			element.textContent = text;
			return;
		}

		element.append(document.createTextNode(text.slice(0, matchIndex)));
		const mark = document.createElement('mark');
		mark.textContent = text.slice(matchIndex, matchIndex + query.length);
		element.append(mark, document.createTextNode(text.slice(matchIndex + query.length)));
	}

	function clearActiveOption() {
		visibleOptions[activeIndex]?.classList.remove('saFocus');
		input.removeAttribute('aria-activedescendant');
		activeIndex = -1;
	}

	function setActiveOption(index) {
		if (!visibleOptions.length) {
			clearActiveOption();
			return;
		}

		visibleOptions[activeIndex]?.classList.remove('saFocus');
		activeIndex = (index + visibleOptions.length) % visibleOptions.length;

		const option = visibleOptions[activeIndex];
		option.classList.add('saFocus');
		input.setAttribute('aria-activedescendant', option.id);
		option.scrollIntoView({ block: 'nearest' });
	}

	function createOption(person, query) {
		const option = document.createElement('li');
		option.className = 'saOptionWrapper';
		option.id = `${list.id}-option-${person.code}`;
		option.setAttribute('role', 'option');
		option.setAttribute('aria-selected', String(person.code === selectedCode));
		optionPerson.set(option, person);

		const content = document.createElement('div');
		content.className = 'saOption';
		const text = document.createElement('span');
		text.className = 'saOptionText';
		appendHighlightedText(text, person.name, query);
		content.append(text);
		option.append(content);

		return option;
	}

	function renderOptions(query = '') {
		clearActiveOption();
		visibleOptions.forEach(option => option.remove());

		const normalizedQuery = normalize(query.trim());
		const matches = sortedPeople.filter(person => {
			return !normalizedQuery
				|| normalize(person.name).includes(normalizedQuery);
		});

		const fragment = document.createDocumentFragment();
		visibleOptions = matches.map(person => {
			const option = createOption(person, query.trim());
			fragment.append(option);
			return option;
		});
		list.append(fragment);
		noResults.hidden = matches.length !== 0;

		if (visibleOptions.length) {
			const selectedIndex = matches.findIndex(person => person.code === selectedCode);
			setActiveOption(selectedIndex >= 0 ? selectedIndex : 0);
		}
	}

	function selectPerson(person, notify = true) {
		if (!person) return;

		selectedCode = person.code;
		button.value = person.code;
		valueElement.textContent = person.name;
		letterElement.textContent = person.name.trim().charAt(0).toLocaleUpperCase();
		visibleOptions.forEach(option => {
			option.setAttribute('aria-selected', String(optionPerson.get(option).code === selectedCode));
		});

		if (notify) button.dispatchEvent(new Event('change', { bubbles: true }));
	}

	function selectRelativePerson(offset) {
		const selectedIndex = sortedPeople.findIndex(person => person.code === selectedCode);
		const nextIndex = Math.max(0, Math.min(sortedPeople.length - 1, selectedIndex + offset));
		selectPerson(sortedPeople[nextIndex]);
	}

	function selectByTypeAhead(key) {
		clearTimeout(typeAheadTimer);
		const normalizedKey = normalize(key);
		const isRepeatedKey = typeAheadBuffer
			&& [...typeAheadBuffer].every(character => character === normalizedKey);

		if (isRepeatedKey) {
			const matches = sortedPeople.filter(person => normalize(person.name).startsWith(normalizedKey));
			const selectedMatchIndex = matches.findIndex(person => person.code === selectedCode);
			selectPerson(matches[(selectedMatchIndex + 1) % matches.length]);
		} else {
			typeAheadBuffer += normalizedKey;
			selectPerson(sortedPeople.find(person => normalize(person.name).startsWith(typeAheadBuffer)));
		}

		typeAheadTimer = setTimeout(() => {
			typeAheadBuffer = '';
		}, 700);
	}

	function openDropdown() {
		if (panel.classList.contains('saOpen')) return;

		panel.classList.add('saOpen');
		button.setAttribute('aria-expanded', 'true');
		input.setAttribute('aria-expanded', 'true');
		input.value = '';
		renderOptions();
		setTimeout(() => input.focus(), 0);
	}

	function closeDropdown({ returnFocus = false } = {}) {
		if (!panel.classList.contains('saOpen')) return;

		panel.classList.remove('saOpen');
		button.setAttribute('aria-expanded', 'false');
		input.setAttribute('aria-expanded', 'false');
		input.value = '';
		clearActiveOption();
		if (returnFocus) button.focus();
	}

	function chooseActiveOption() {
		const person = optionPerson.get(visibleOptions[activeIndex]);
		if (!person) return;
		selectPerson(person);
		closeDropdown({ returnFocus: true });
	}

	function moveFocusFromSearch(backwards) {
		const focusableElements = [...document.querySelectorAll(
			'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
		)].filter(element => element.getClientRects().length && !element.closest('[aria-hidden="true"]'));
		const direction = backwards ? -1 : 1;
		const inputIndex = focusableElements.indexOf(input);

		for (let offset = 1; offset < focusableElements.length; offset++) {
			const index = (inputIndex + direction * offset + focusableElements.length) % focusableElements.length;
			const target = focusableElements[index];
			if (panel.contains(target)) continue;

			closeDropdown();
			target.focus();
			return;
		}
	}

	button.addEventListener('click', () => {
		panel.classList.contains('saOpen')
			? closeDropdown({ returnFocus: true })
			: openDropdown();
	});

	button.addEventListener('keydown', event => {
		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				event.altKey ? openDropdown() : selectRelativePerson(1);
				return;
			case 'ArrowUp':
				event.preventDefault();
				event.altKey ? openDropdown() : selectRelativePerson(-1);
				return;
			case 'Home':
				event.preventDefault();
				selectPerson(sortedPeople[0]);
				return;
			case 'End':
				event.preventDefault();
				selectPerson(sortedPeople.at(-1));
				return;
			case 'Enter':
			case ' ':
				event.preventDefault();
				openDropdown();
				return;
			case 'Escape':
				closeDropdown({ returnFocus: true });
				return;
		}

		if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
			event.preventDefault();
			selectByTypeAhead(event.key);
		}
	});

	input.addEventListener('input', () => renderOptions(input.value));

	input.addEventListener('keydown', event => {
		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				setActiveOption(activeIndex + 1);
				break;
			case 'ArrowUp':
				event.preventDefault();
				setActiveOption(activeIndex - 1);
				break;
			case 'Home':
				event.preventDefault();
				setActiveOption(0);
				break;
			case 'End':
				event.preventDefault();
				setActiveOption(visibleOptions.length - 1);
				break;
			case 'Enter':
				event.preventDefault();
				chooseActiveOption();
				break;
			case 'Escape':
				event.preventDefault();
				closeDropdown({ returnFocus: true });
				break;
			case 'Tab':
				event.preventDefault();
				moveFocusFromSearch(event.shiftKey);
				break;
		}
	});

	list.addEventListener('mousedown', event => {
		if (event.target.closest('[role="option"]')) event.preventDefault();
	});

	list.addEventListener('click', event => {
		const option = event.target.closest('[role="option"]');
		if (!option) return;

		selectPerson(optionPerson.get(option));
		closeDropdown({ returnFocus: true });
	});

	document.addEventListener('click', event => {
		if (!panel.classList.contains('saOpen')) return;
		if (!button.contains(event.target) && !panel.contains(event.target)) closeDropdown();
	});

	document.addEventListener('focusin', event => {
		if (!panel.classList.contains('saOpen')) return;
		if (!button.contains(event.target) && !panel.contains(event.target)) closeDropdown();
	});

	selectPerson(sortedPeople.find(person => person.code === selectedCode) || sortedPeople[0], false);
}

document.addEventListener('DOMContentLoaded', () => {
	createPersonSelect({
		button: document.getElementById('impPersonButton'),
		panel: document.getElementById('impPersonContextMenu'),
		input: document.getElementById('impPersonSearch'),
		list: document.getElementById('impPersonDropdown'),
		people: employees
	});
});
