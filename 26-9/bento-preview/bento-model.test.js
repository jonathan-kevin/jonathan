const { test } = require('node:test');
const assert = require('node:assert/strict');
const M = require('./bento-model.js');

test('editor emits the same responsive utility classes as the start-page presets', () => {
  const layouts = require('../bento-layouts.js');
  for (const preset of M.presets) {
    const state = M.applyPreset(preset);
    assert.deepEqual(M.classes(state.grid, { columns: 'GridCol' }), layouts.gridClasses(preset));
    state.cards.forEach((card, index) => {
      assert.deepEqual(M.classes(card.settings, { col: 'Col', row: 'Row' }), layouts.cardClasses(preset, index));
    });
    assert.equal(M.effective(state.grid, 'columns', 'xs').value, 2);
  }
});

test('breakpoint boundaries are continuous and xs includes 640px', () => {
  assert.equal(M.breakpoints.at(-1).min, 320);
  assert.equal(M.breakpoints.at(-1).max, 640);
  for (let i = 1; i < M.breakpoints.length; i++) {
    assert.equal(M.breakpoints[i].max + 1, M.breakpoints[i - 1].min);
  }
});

test('each property inherits independently; editing a smaller screen never alters a larger one', () => {
  const s = { '2xl':{col:3,row:2},lg:{col:2},sm:{row:1} };
  assert.deepEqual(M.effective(s,'col','xl'),{value:3,source:'2xl'});
  assert.deepEqual(M.effective(s,'col','md'),{value:2,source:'lg'});
  assert.deepEqual(M.effective(s,'row','md'),{value:2,source:'2xl'});
  assert.deepEqual(M.effective(s,'row','xs'),{value:1,source:'sm'});
  s.md = {col:1};
  assert.equal(M.effective(s,'col','lg').value,2);
  assert.equal(M.effective(s,'col','xl').value,3);
  assert.deepEqual(M.effective(s,'col','xs'),{value:1,source:'md'});
  delete s.md.col;
  assert.deepEqual(M.effective(s,'col','md'),{value:2,source:'lg'});
});

test('impact stops at the next override, including explicit equal-value overrides', () => {
  const s = { '2xl':{col:3,row:2},lg:{col:3},sm:{row:1} };
  assert.deepEqual(M.affected(s,'col','2xl'),['xl']);
  assert.deepEqual(M.affected(s,'row','2xl'),['xl','lg','md']);
  assert.deepEqual(M.affected(s,'col','xs'),[]);
});

test('all presets fit every breakpoint and have complete positive settings', () => {
  for (const preset of M.presets) {
    const state = M.applyPreset(preset);
    for (const bp of M.breakpoints) {
      const columns = M.effective(state.grid,'columns',bp.id).value;
      assert.ok(columns >= 1);
      for (const card of state.cards) {
        const col = M.effective(card.settings,'col',bp.id).value;
        assert.ok(col >= 1 && col <= columns,`${preset.id} at ${bp.id}`);
        assert.ok(M.effective(card.settings,'row',bp.id).value >= 1);
      }
    }
  }
});

test('applying a preset preserves content and stable IDs by order without mutating the old state', () => {
  const before = M.applyPreset(M.presets[2]);
  before.cards[0].title = 'My custom content';
  const original = structuredClone(before);
  const after = M.applyPreset(M.presets[1],before);
  assert.equal(after.cards.length,12);
  assert.deepEqual(after.cards.slice(0,5).map(c => c.id),before.cards.map(c => c.id));
  assert.equal(after.cards[0].title,'My custom content');
  assert.equal(new Set(after.cards.map(c => c.id)).size,12);
  assert.deepEqual(before,original);
  const smaller = M.applyPreset(M.presets[2],after);
  assert.equal(smaller.cards.length,5);
  assert.equal(smaller.cards[0].title,'My custom content');
});


test('card appearance and footer survive preset changes without altering the original', () => {
  const before = M.applyPreset(M.presets[0]);
  Object.assign(before.cards[0], { style: 'image', tone: 'saPurple', showFooter: true, footerName: 'Team', footerDate: '2026-09-28', image: 'custom.png' });
  const after = M.applyPreset(M.presets[1], before);
  for (const key of ['style', 'tone', 'showFooter', 'footerName', 'footerDate', 'image']) assert.equal(after.cards[0][key], before.cards[0][key]);
  after.cards[0].showFooter = false;
  assert.equal(before.cards[0].showFooter, true);
});

test('card variants use shared markup and escape content and unsafe image URLs', () => {
  const card = M.card(0, 1);
  card.style = 'image'; card.image = 'javascript:alert(1)'; card.title = '<test>';
  assert.match(M.cardContent(card), /src="card-image.svg"/);
  assert.match(M.cardContent(card), /&lt;test&gt;/);
  assert.doesNotMatch(M.cardContent(card), /saBentoFooter/);
  card.showFooter = true;
  for (const style of ['small', 'medium', 'large', 'image', 'text']) {
    card.style = style;
    const html = M.cardContent(card);
    assert.match(html, /saBentoFooter/);
    assert.match(html, /saBentoAuthor/);
    assert.match(html, /saBentoDate/);
    assert.equal(html.includes('saBentoImage'), style === 'image');
    assert.equal(html.includes('saBentoIcon'), ['small', 'medium', 'large'].includes(style));
  }
});


test('extended content uses shared card structures without nested action links', () => {
  const c = M.card(0, 1);
  Object.assign(c, { style: 'image', imageFit: 'contain', imageAlt: 'Project overview', solid: true, showTags: true, tags: 'News, <Team>', showAction: true, showFavorite: true, showFooter: true, footerAvatar: 'team.png' });
  const html = M.cardArticle(c, 'Selected card', true);
  assert.match(html, /alt="Project overview" class="saContain"/);
  assert.match(html, /saBentoInner saSolid/);
  assert.match(html, /saPill">&lt;Team&gt;/);
  assert.match(html, /src="team.png"/);
  assert.match(html, /fa-heart/);
  assert.match(html, /<\/a><div class="saBentoButtonWrapper"><button/);
  assert.match(html, /<button type="button" class="saDefaultButtonSecondary saBentoActionButton">Open My tasks<\/button><button type="button" class="saDefaultButtonSecondary saBentoActionButton">About My tasks<\/button>/);
  assert.equal((html.match(/<button type="button" class="saDefaultButtonSecondary saBentoActionButton">/g) || []).length, 2);
  const other = M.card(1, 2);
  other.showAction = true;
  assert.match(M.cardArticle(other, 'Project card', false), /Open Projects<\/button>.*About Projects<\/button>/);
  c.description = '';
  assert.doesNotMatch(M.cardContent(c), /Add a link to a page/);
});

test('presets preserve all extended card options', () => {
  const before = M.applyPreset(M.presets[0]);
  const options = { solid: true, wrapped: true, tags: 'News, Team', showFavorite: true, showAction: true, footerAvatar: 'avatar.png', imageAlt: 'Team', imageFit: 'contain', description: 'Custom description', icon: 'house' };
  Object.assign(before.cards[0], options);
  const after = M.applyPreset(M.presets[1], before);
  for (const [key, value] of Object.entries(options)) assert.equal(after.cards[0][key], value);
});


test('shared changes affect every existing and future card but preserve colors and spans', () => {
  const state = M.applyPreset(M.presets[0]);
  const original = structuredClone(state.cards);
  M.setSharedCardField(state, 'style', 'image');
  M.setSharedCardField(state, 'showFooter', true);
  M.setSharedCardField(state, 'showTags', true);
  state.cards.forEach((c, i) => {
    assert.equal(c.style, 'image');
    assert.equal(c.showFooter, true);
    assert.equal(c.title, original[i].title);
    assert.equal(c.icon, original[i].icon);
    assert.equal(c.tags, original[i].tags);
    assert.equal(c.footerName, original[i].footerName);
    assert.equal(c.tone, original[i].tone);
    assert.deepEqual(c.settings, original[i].settings);
  });
  const added = M.card(6, state.nextId, state.sharedCards);
  assert.equal(added.style, 'image');
  assert.equal(added.showFooter, true);
  const expanded = M.applyPreset(M.presets.find(p => p.id === 'hub'), state);
  assert.ok(expanded.cards.every(c => c.showTags && c.style === 'image'));
  assert.deepEqual(expanded.sharedCards, state.sharedCards);
  for (const field of ['tone', 'title', 'description', 'icon', 'tags', 'footerName', 'footerDate', 'footerAvatar']) assert.throws(() => M.setSharedCardField(state, field, 'test'));
});


test('dynamic tags and footer content differ by card and toggles preserve them', () => {
  const state = M.applyPreset(M.presets[0]);
  assert.equal(new Set(state.cards.map(c => c.tags)).size, state.cards.length);
  assert.equal(new Set(state.cards.map(c => c.footerName)).size, state.cards.length);
  assert.equal(new Set(state.cards.map(c => c.footerDate)).size, state.cards.length);
  M.setSharedCardField(state, 'showTags', true);
  assert.ok(state.cards.every(c => M.cardContent(c).includes('saPillGroup')));
  M.setSharedCardField(state, 'showTags', false);
  assert.ok(state.cards.every(c => !M.cardContent(c).includes('saPillGroup')));
});


test('duplicates copy all content and breakpoint settings without sharing nested objects', () => {
  const state = M.applyPreset(M.presets[0]);
  const source = state.cards[1];
  source.settings.lg = { col: 3, row: 4 };
  source.icon = 'car'; source.tone = 'saGreen';
  const original = structuredClone(state);
  const copy = M.duplicateCard(state, source.id);
  assert.equal(state.cards[2], copy);
  assert.notEqual(copy.id, source.id);
  assert.deepEqual({ ...copy, id: source.id }, source);
  copy.settings.lg.col = 1;
  assert.equal(source.settings.lg.col, 3);
  assert.equal(state.preset, null);
  assert.equal(M.duplicateCard(state, -1), null);
  assert.equal(original.cards.length + 1, state.cards.length);
});

test('reordering preserves every card and its settings across all breakpoints and supports undo snapshots', () => {
  const state = M.applyPreset(M.presets[0]);
  const before = structuredClone(state);
  const id = state.cards[0].id;
  assert.equal(M.moveCard(state, id, state.cards.length - 1), true);
  assert.deepEqual(state.cards.at(-1), before.cards[0]);
  assert.deepEqual(state.cards.slice(0, -1), before.cards.slice(1));
  for (const bp of M.breakpoints) {
    assert.deepEqual(M.effective(state.cards.at(-1).settings, 'col', bp.id), M.effective(before.cards[0].settings, 'col', bp.id));
  }
  assert.equal(M.moveCard(state, id, 0), true);
  assert.deepEqual(state.cards, before.cards);
  assert.equal(M.moveCard(state, id, 0), false);
  assert.equal(M.moveCard(state, id, -1), false);
  assert.equal(M.moveCard(state, -1, 1), false);
});

test('saved layouts round trip with overrides, shared appearance, order, and unique duplicate IDs', () => {
  const state = M.applyPreset(M.presets[0]);
  M.setSharedCardField(state, 'showFooter', true);
  M.setSharedCardField(state, 'style', 'image');
  state.cards[0].settings.xs = { row: 3, col: 2 };
  M.duplicateCard(state, state.cards[0].id);
  M.moveCard(state, state.cards[0].id, 3);
  const restored = M.restoreState(JSON.parse(JSON.stringify(state)));
  assert.deepEqual(restored, state);
  const copy = M.duplicateCard(restored, restored.cards[0].id);
  assert.equal(new Set(restored.cards.map(c => c.id)).size, restored.cards.length);
  assert.ok(copy.showFooter);
  assert.equal(M.restoreState({ cards: [], grid: { '2xl': { columns: 4 } } }).nextId, 1);
});

test('damaged saved data cannot produce invalid CSS classes or duplicate card identities', () => {
  assert.equal(M.restoreState(null), null);
  assert.equal(M.restoreState({ cards: [] }), null);
  const state = M.applyPreset(M.presets[0]);
  state.cards[1].id = state.cards[0].id;
  assert.equal(M.restoreState(state), null);
  state.cards[1].id = 2;
  state.cards[0].settings.xs = { col: -1 };
  assert.equal(M.restoreState(state), null);
  delete state.cards[0].settings.xs;
  state.cards[0].tone = 'unwanted-class';
  assert.equal(M.restoreState(state), null);
});


test('Shift selection toggles individual cards without losing the other selections', () => {
  const first = M.selectCard([], 1);
  assert.deepEqual(first, [1]);
  const multiple = M.selectCard(first, 3, true);
  assert.deepEqual(multiple, [1, 3]);
  assert.deepEqual(first, [1], 'selection snapshots must not be mutated');
  assert.deepEqual(M.selectCard(multiple, 1, true), [3]);
  assert.deepEqual(M.selectCard(multiple, 3), [3]);
  assert.deepEqual(M.selectCard([3], 3), []);
});

test('bulk span edits respect each card inheritance and leave unselected cards and larger screens alone', () => {
  const state = M.applyPreset(M.presets[0]);
  const before = structuredClone(state);
  const cards = [state.cards[0], state.cards[2]];
  assert.equal(M.editCards(cards, 'lg', 'row', 3), true);
  for (const card of cards) {
    assert.deepEqual(M.effective(card.settings, 'row', 'lg'), { value: 3, source: 'lg' });
    assert.deepEqual(card.settings['2xl'], before.cards.find(c => c.id === card.id).settings['2xl']);
  }
  assert.deepEqual(state.cards[1], before.cards[1]);
  assert.equal(M.editCards(cards, 'lg', 'row', 3), false);
  assert.equal(M.editCards(cards, 'lg', 'row', null, 1), true);
  assert.ok(cards.every(c => c.settings.lg.row === 4));
});

test('mixed spans step individually and clamp at the allowed bounds', () => {
  const cards = [M.card(0, 1), M.card(1, 2)];
  cards[0].settings['2xl'].col = 16;
  cards[1].settings['2xl'].col = 2;
  M.editCards(cards, 'xl', 'col', null, 1);
  assert.deepEqual(M.effective(cards[0].settings, 'col', 'xl'), { value: 16, source: '2xl' });
  assert.deepEqual(M.effective(cards[1].settings, 'col', 'xl'), { value: 3, source: 'xl' });
});


test('independent sizes use Softadmin modifiers for icons, images and Nothing', () => {
  for (const style of ['icon', 'image', 'text']) {
    for (const [size, cls] of [['small', 'saSmall'], ['medium', 'saMedium'], ['large', null]]) {
      assert.deepEqual(M.cardStyleClasses({style, size, wrapped:true}), [...(cls ? [cls] : []), ...(style === 'image' ? ['saWrapped'] : [])]);
    }
  }
  assert.equal(M.card(0,1).style, 'icon');
  assert.equal(M.card(0,1).size, 'small');
});

test('legacy icon and image styles migrate without losing saved appearance or content', () => {
  for (const [legacy, imageSize, size] of [['tiny', null, 'small'], ['small', null, 'small'], ['medium', null, 'medium'], ['large', null, 'large'], ['icon', null, 'large'], ['image', 'small', 'small'], ['image', 'medium', 'medium'], ['image', null, 'large']]) {
    const state = M.applyPreset(M.presets[0]);
    state.sharedCards = {style:legacy};
    if (imageSize) state.sharedCards.imageSize = imageSize;
    state.cards.forEach(c => { c.style=legacy; delete c.size; if (imageSize) c.imageSize=imageSize; });
    state.cards[0].title = 'Saved shortcut';
    state.cards[0].settings.xs = {col:2,row:3};
    const restored = M.restoreState(JSON.parse(JSON.stringify(state)));
    assert.ok(restored);
    assert.equal(restored.sharedCards.style, legacy === 'image' ? 'image' : 'icon');
    assert.equal(restored.sharedCards.size, size);
    assert.ok(restored.cards.every(c=>c.size===size));
    assert.equal(restored.cards[0].title, 'Saved shortcut');
    assert.deepEqual(restored.cards[0].settings, state.cards[0].settings);
    assert.equal(M.card(8,restored.nextId,restored.sharedCards).size,size);
  }
});

test('size survives type switches, presets, duplicate, new cards and saved state', () => {
  const state = M.applyPreset(M.presets[0]);
  M.setSharedCardField(state,'size','medium');
  for (const style of ['image','text','icon']) {
    M.setSharedCardField(state,'style',style);
    assert.ok(state.cards.every(c=>c.size==='medium' && c.style===style));
    assert.equal(M.card(8,state.nextId,state.sharedCards).size,'medium');
    assert.deepEqual(M.restoreState(JSON.parse(JSON.stringify(state))),state);
  }
  assert.equal(M.duplicateCard(state,state.cards[0].id).size,'medium');
  assert.ok(M.applyPreset(M.presets.find(p=>p.id==='hub'),state).cards.every(c=>c.size==='medium'));
});


test('Perfect balance has twelve equal cards and the requested desktop-first columns', () => {
  const state = M.applyPreset(M.presets.find(p => p.id === 'balanced'));
  assert.equal(state.cards.length, 12);
  assert.deepEqual(M.breakpoints.map(bp => M.effective(state.grid, 'columns', bp.id).value), [4, 4, 3, 2, 1, 2]);
  assert.equal(state.grid.xl, undefined);
  assert.equal(M.effective(state.grid, 'columns', 'xl').source, '2xl');
  for (const card of state.cards) for (const bp of M.breakpoints) {
    assert.equal(M.effective(card.settings, 'col', bp.id).value, 1);
    assert.equal(M.effective(card.settings, 'row', bp.id).value, 1);
  }
});
