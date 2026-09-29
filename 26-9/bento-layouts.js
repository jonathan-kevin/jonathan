(function (root) {
	'use strict';
	const presets = [
		{ id: 'spotlight', name: 'The spotlight', columns: 4, spans: [[2, 2], [2, 1], [1, 1], [1, 1], [2, 2], [2, 2]], xsSpans: [[2, 1], [1, 1], [1, 1]] },
		{ id: 'balanced', name: 'Perfect balance', columns: 4, gridOverrides: { lg: 3, md: 2, sm: 1, xs: 2 }, spans: Array.from({ length: 12 }, () => [1, 1]), xsSpans: [[1, 1]] },
		{ id: 'editorial', name: 'The editorial', columns: 4, spans: [[2, 2], [2, 1], [1, 2], [1, 1], [2, 1]], xsSpans: [[2, 1], [1, 2], [1, 1], [1, 1], [2, 1]] },
		{ id: 'dashboard', name: 'At a glance', columns: 4, spans: [[2, 1], [1, 1], [1, 1], [3, 2], [1, 2]], xsSpans: [[1, 1], [1, 1], [2, 1], [2, 2], [2, 1]] },
		{ id: 'mosaic', name: 'Creative mix', columns: 4, spans: [[1, 2], [2, 1], [1, 1], [1, 1], [2, 1], [3, 1]], xsSpans: [[1, 2], [1, 1], [1, 1], [2, 1], [1, 1], [1, 1]] },
		{ id: 'essentials', name: 'The essentials', description: 'Three shortcuts: one featured link with two supporting cards.', columns: 4, spans: [[2, 2], [2, 1], [2, 1]], xsSpans: [[2, 1], [1, 1], [1, 1]] },
		{ id: 'hub', name: 'The hub', description: 'Eight shortcuts: a tall feature, six compact links, and a full-width card.', columns: 4, spans: [[2, 3], [1, 1], [1, 1], [1, 1], [1, 1], [1, 1], [1, 1], [4, 1]], xsSpans: [[2, 1], [1, 1], [1, 1], [1, 1], [1, 1], [1, 1], [1, 1], [2, 1]] }
	];
	const isLayoutClass = name => /^sa(?:(?:2xl|Xl|Lg|Md|Sm|Xs))?(?:GridCol|Col|Row)\d+$/.test(name) || /^sa(?:Col|Row)Full$/.test(name);
	function gridSettings(preset) {
		return { '2xl': { columns: preset.columns }, ...Object.fromEntries(Object.entries(preset.gridOverrides || { md: 2 }).map(([bp, columns]) => [bp, { columns }])) };
	}
	function gridClasses(preset) {
		const prefixes = { '2xl': 'sa', xl: 'saXl', lg: 'saLg', md: 'saMd', sm: 'saSm', xs: 'saXs' };
		const settings = gridSettings(preset);
		return Object.entries(prefixes).filter(([bp]) => settings[bp]).map(([bp, prefix]) => `${prefix}GridCol${settings[bp].columns}`);
	}
	function cardClasses(preset, index) {
		const [col, row] = preset.spans[index % preset.spans.length];
		const [xsCol, xsRow] = preset.xsSpans[index % preset.xsSpans.length];
		return [`saCol${col}`, `saRow${row}`, ...(col > 2 ? ['saMdCol2'] : []), ...(xsCol !== Math.min(col, 2) ? [`saXsCol${xsCol}`] : []), ...(xsRow !== row ? [`saXsRow${xsRow}`] : [])];
	}
	const api = { presets, isLayoutClass, gridSettings, gridClasses, cardClasses };
	if (typeof module !== 'undefined') module.exports = api;
	else root.BentoLayouts = api;
})(globalThis);
