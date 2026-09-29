const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const prefixes = ['sa', 'saXl', 'saLg', 'saMd', 'saSm', 'saXs'];

function value(classes, property, index) {
	for (let i = index; i >= 0; i--) {
		const pattern = new RegExp(`^${prefixes[i]}${property}(\\d+)$`);
		const matches = classes.filter(name => pattern.test(name));
		assert.ok(matches.length <= 1, `Conflicting ${property} classes at ${prefixes[i]}`);
		if (matches.length) return Number(matches[0].match(pattern)[1]);
	}
	assert.fail(`Missing base ${property}`);
}

function checkLayout(markup) {
	markup = markup.replace(/<!--[\s\S]*?-->/g, '').replace(/<template\b[\s\S]*?<\/template>/g, '');
	const container = markup.match(/<ul class="(saBentoWrapper[^"]*)"/)[1].split(/\s+/);
	const cards = [...markup.matchAll(/<li class="(saBento\s[^"]*)"/g)].map(m => m[1].split(/\s+/));
	assert.ok(cards.length);
	assert.equal(value(container, 'GridCol', 5), 2, 'Examples retain two columns at xs');
	for (let bp = 0; bp < prefixes.length; bp++) {
		const columns = value(container, 'GridCol', bp);
		for (const [index, card] of cards.entries()) {
			assert.ok(value(card, 'Col', bp) <= columns, `Card ${index + 1} exceeds ${columns} columns at ${prefixes[bp]}`);
			assert.ok(value(card, 'Row', bp) >= 1);
		}

	}
}

test('authored demo fits every breakpoint and retains two columns at xs', () => {
	checkLayout(readFileSync(join(__dirname, 'bento.html'), 'utf8'));
});

test('all documented compositions fit every breakpoint', () => {
	const docs = readFileSync(join(__dirname, 'BENTO.md'), 'utf8');
	const examples = [...docs.matchAll(/```html\r?\n(<ul[\s\S]*?)```/g)];
	assert.equal(examples.length, 3);
	for (const example of examples) checkLayout(example[1]);
});

test('preset patterns and repeated cards fit every breakpoint', () => {
	const layouts = require('./bento-layouts.js');
	for (const preset of layouts.presets) {
		const cards = Array.from({ length: 31 }, (_, index) => `<li class="saBento ${layouts.cardClasses(preset, index).join(' ')}"></li>`).join('');
		checkLayout(`<ul class="saBentoWrapper ${layouts.gridClasses(preset).join(' ')}">${cards}</ul>`);
	}
	assert.equal(layouts.isLayoutClass('saSmall'), false);
	assert.equal(layouts.isLayoutClass('saPurple'), false);
	assert.equal(layouts.isLayoutClass('saShowGridLines'), false);
	assert.equal(layouts.isLayoutClass('saMdCol2'), true);
});
