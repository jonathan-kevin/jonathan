$(function () {
	// Use the same preset palette and controls as the sidebar logo editor.
	const root = document.documentElement;
	const rootStyles = getComputedStyle(root);
	const groups = ['Gray', 'Blue', 'Red', 'Orange', 'Yellow', 'Green', 'Sky', 'Purple', 'Pink'];
	const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1200];
	const palette = shades.flatMap(shade => groups.map(group => ({
		label: `${group} ${shade}`,
		color: rootStyles.getPropertyValue(`--${group}${shade}`).trim().toUpperCase()
	})));
	const refreshPickers = [];

	document.querySelectorAll('.saEnvironmentColorControl').forEach(function (picker) {
		const property = picker.dataset.colorProperty;
		const environmentButton = document.getElementById(picker.closest('.saEnvironmentGroup').dataset.environment);
		const customColor = picker.querySelector('input[type="color"]');
		const output = picker.querySelector('output');
		const reset = picker.querySelector('[data-reset-color]');
		// Resolve light-dark() even when this environment is not currently selected.
		const preview = document.createElement('span');
		preview.hidden = true;
		preview.style.color = `var(${property})`;
		picker.appendChild(preview);

		function addSwatch(color, label, container, extraClass = '') {
			const input = document.createElement('input');
			input.type = 'radio';
			input.className = `saColor ${extraClass}`.trim();
			input.name = property;
			input.value = color;
			input.setAttribute('aria-label', label);
			input.style.backgroundColor = color;
			container.appendChild(input);
		}

		const mainPalette = picker.querySelector('.saPalette');
		const footer = picker.querySelector('.saFooter');
		palette.forEach(({ color, label }) => addSwatch(color, label, mainPalette));
		addSwatch('#FFFFFF', 'White', footer, 'saExtraColor saWhite');
		addSwatch('#000000', 'Black', footer, 'saExtraColor saBlack');
		const swatches = Array.from(picker.querySelectorAll('input[type="radio"]'));

		function refresh() {
			const rgb = getComputedStyle(preview).color;
			const color = '#' + rgb.match(/\d+/g).slice(0, 3)
				.map(channel => Number(channel).toString(16).padStart(2, '0')).join('').toUpperCase();
			customColor.value = color;
			output.value = color;
			swatches.forEach(input => { input.checked = input.value === color; });
			customColor.classList.toggle('saSelected', !swatches.some(input => input.checked));
			reset.disabled = !root.style.getPropertyValue(property);
		}

		function applyColor(event) {
			if (!event.target.matches('input.saColor')) return;
			root.style.setProperty(property, event.target.value);
			environmentButton.click();
			refresh();
		}

		picker.addEventListener('input', applyColor);
		picker.addEventListener('change', applyColor);
		picker.addEventListener('click', function (event) {
			// Clicking an already-selected swatch must still activate its environment.
			if (event.target.matches('input[type="radio"]') && !environmentButton.classList.contains('saOpen')) {
				applyColor(event);
			}
		});
		reset.addEventListener('click', function () {
			root.style.removeProperty(property);
			refresh();
		});
		refreshPickers.push(refresh);
		refresh();
	});

	new MutationObserver(function () {
		refreshPickers.forEach(refresh => refresh());
	}).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
});
