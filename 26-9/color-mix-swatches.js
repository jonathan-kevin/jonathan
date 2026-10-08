(() => {
	'use strict';

	const groups = ['Gray', 'Blue', 'Red', 'Orange', 'Yellow', 'Green', 'Sky', 'Purple', 'Pink'];
	const shades = [50, 100, 150, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300];
	const sourceShades = { Gray: 900, Blue: 600, Red: 600, Orange: 400, Yellow: 300, Green: 500, Sky: 500, Purple: 600, Pink: 400 };
	const output = document.getElementById('swatchDemoGroups');
	const canvas = document.createElement('canvas');
	canvas.width = canvas.height = 1;
	const context = canvas.getContext('2d', { willReadFrequently: true });
	const palette = getComputedStyle(document.documentElement);

	function rgb(color) {
		context.clearRect(0, 0, 1, 1);
		context.fillStyle = color;
		context.fillRect(0, 0, 1, 1);
		return Array.from(context.getImageData(0, 0, 1, 1).data.slice(0, 3));
	}

	function oklab([red, green, blue]) {
		const linear = [red, green, blue].map(channel => {
			const value = channel / 255;
			return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
		});
		const [r, g, b] = linear;
		const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
		const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
		const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
		return [
			0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
			1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
			0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
		];
	}

	function nearestMix(targetLab, source, surface) {
		function differenceAt(alpha) {
			const mixed = source.map((channel, index) => channel * alpha + surface[index] * (1 - alpha));
			const lab = oklab(mixed);
			return Math.hypot(...lab.map((value, index) => value - targetLab[index]));
		}
		let low = 0;
		let high = 1;
		for (let iteration = 0; iteration < 32; iteration++) {
			const left = low + (high - low) * 0.382;
			const right = high - (high - low) * 0.382;
			if (differenceAt(left) < differenceAt(right)) high = right;
			else low = left;
		}
		const candidates = [0, 100, Math.round((low + high) * 500) / 10];
		return candidates.map(percent => ({ percent, difference: differenceAt(percent / 100) * 100 }))
			.reduce((best, result) => result.difference < best.difference ? result : best);
	}

	function element(tag, className, text) {
		const node = document.createElement(tag);
		if (className) node.className = className;
		if (text !== undefined) node.textContent = text;
		return node;
	}

	function renderPanel(group, theme, sourceShade) {
		const panel = element('section', 'swatchDemoTheme');
		panel.dataset.demoTheme = theme;
		panel.append(element('h3', '', theme === 'light' ? 'Light' : 'Dark'));
		const surfaceLabel = element('p', 'swatchDemoSurface', theme === 'light' ? 'Surface: White' : 'Surface: Gray1200');
		panel.append(surfaceLabel);
		const surface = rgb(palette.getPropertyValue(theme === 'light' ? '--White' : '--Gray1200').trim());
		const sourceName = `--${group}${sourceShade}`;
		const source = rgb(palette.getPropertyValue(sourceName).trim());
		const table = element('table', 'swatchDemoTable');
		const head = table.createTHead().insertRow();
		for (const label of ['Shade', 'Original', 'Transparent mix', 'Mix %', 'ΔE']) head.append(element('th', '', label));
		const body = table.createTBody();
		for (const shade of shades) {
			const name = `--${group}${shade}`;
			const value = palette.getPropertyValue(name).trim();
			if (!value) continue;
			const { percent, difference } = nearestMix(oklab(rgb(value)), source, surface);
			const row = body.insertRow();
			row.append(element('td', 'swatchDemoNumber', String(shade)));
			const originalCell = element('td');
			const original = element('span', 'swatchDemoSample');
			original.style.backgroundColor = `var(${name})`;
			original.title = `${name}: ${value}`;
			original.setAttribute('aria-label', `${group}${shade}, original`);
			originalCell.append(original);
			row.append(originalCell);
			const mixCell = element('td');
			const hasTranslucentMix = percent > 0 && percent < 100;
			if (hasTranslucentMix) {
				const mix = element('span', 'swatchDemoSample');
				const expression = `color-mix(in srgb, var(${sourceName}) ${percent}%, transparent)`;
				mix.style.backgroundColor = expression;
				mix.title = expression;
				mix.setAttribute('aria-label', `${group}${shade}, transparent mix from ${sourceName.slice(2)}`);
				mixCell.append(mix);
			}
			row.append(mixCell);
			row.append(element('td', 'swatchDemoApproximation', hasTranslucentMix ? `${percent.toFixed(1)}%` : ''));
			row.append(element('td', 'swatchDemoApproximation', hasTranslucentMix ? difference.toFixed(1) : ''));
		}
		panel.append(table);
		return panel;
	}

	function render() {
		const fragment = document.createDocumentFragment();
		for (const group of groups) {
			const section = element('section', 'swatchDemoGroup');
			const header = element('div', 'swatchDemoGroupHeader');
			header.append(element('h2', '', group));
			const control = element('label', 'swatchDemoControl', 'Mix source');
			const select = element('select');
			select.dataset.group = group;
			for (const shade of shades) {
				if (!palette.getPropertyValue(`--${group}${shade}`).trim()) continue;
				const option = element('option', '', `${group}${shade}`);
				option.value = String(shade);
				option.selected = shade === sourceShades[group];
				select.append(option);
			}
			control.append(select);
			header.append(control);
			section.append(header);
			const themes = element('div', 'swatchDemoThemes');
			themes.append(renderPanel(group, 'light', sourceShades[group]), renderPanel(group, 'dark', sourceShades[group]));
			section.append(themes);
			fragment.append(section);
		}
		output.replaceChildren(fragment);
	}

	output.addEventListener('change', event => {
		if (!event.target.matches('select[data-group]')) return;
		sourceShades[event.target.dataset.group] = Number(event.target.value);
		render();
	});
	render();
})();
