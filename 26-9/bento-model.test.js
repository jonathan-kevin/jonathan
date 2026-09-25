const { test } = require('node:test');
const assert = require('node:assert/strict');
const M = require('./bento-model.js');

test('each property inherits independently; editing a smaller screen never alters a larger one', () => {
  const s = { '2xl':{col:3,row:2},lg:{col:2},sm:{row:1} };
  assert.deepEqual(M.effective(s,'col','xl'),{value:3,source:'2xl'});
  assert.deepEqual(M.effective(s,'col','md'),{value:2,source:'lg'});
  assert.deepEqual(M.effective(s,'row','md'),{value:2,source:'2xl'});
  assert.deepEqual(M.effective(s,'row','smallscreen'),{value:1,source:'sm'});
  s.md = {col:1};
  assert.equal(M.effective(s,'col','lg').value,2);
  assert.equal(M.effective(s,'col','xl').value,3);
  assert.deepEqual(M.effective(s,'col','smallscreen'),{value:1,source:'md'});
  delete s.md.col;
  assert.deepEqual(M.effective(s,'col','md'),{value:2,source:'lg'});
});

test('impact stops at the next override, including explicit equal-value overrides', () => {
  const s = { '2xl':{col:3,row:2},lg:{col:3},sm:{row:1} };
  assert.deepEqual(M.affected(s,'col','2xl'),['xl']);
  assert.deepEqual(M.affected(s,'row','2xl'),['xl','lg','md']);
  assert.deepEqual(M.affected(s,'col','smallscreen'),[]);
});

test('all five presets fit every breakpoint and have complete positive settings', () => {
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
  const before = M.applyPreset(M.presets[0]);
  before.cards[0].title = 'My custom content';
  const original = structuredClone(before);
  const after = M.applyPreset(M.presets[1],before);
  assert.equal(after.cards.length,6);
  assert.deepEqual(after.cards.slice(0,4).map(c => c.id),before.cards.map(c => c.id));
  assert.equal(after.cards[0].title,'My custom content');
  assert.equal(new Set(after.cards.map(c => c.id)).size,6);
  assert.deepEqual(before,original);
  const smaller = M.applyPreset(M.presets[0],after);
  assert.equal(smaller.cards.length,4);
  assert.equal(smaller.cards[0].title,'My custom content');
});
