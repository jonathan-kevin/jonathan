(function (root) {
  'use strict';
  const breakpoints = [
    { id: '2xl', min: 1536, max: Infinity, width: 1536, label: 'Large desktop' },
    { id: 'xl', min: 1280, max: 1535, width: 1440, label: 'Desktop' },
    { id: 'lg', min: 1024, max: 1279, width: 1200, label: 'Small desktop' },
    { id: 'md', min: 768, max: 1023, width: 900, label: 'Tablet' },
    { id: 'sm', min: 640, max: 767, width: 700, label: 'Small tablet' },
    { id: 'smallscreen', min: 320, max: 639, width: 390, label: 'Mobile' }
  ];
  const presets = [
    { id: 'spotlight', name: 'The spotlight', description: 'One big idea. Room for the details.', columns: 4, spans: [[2,2],[2,1],[1,1],[1,1]], tag: 'POPULAR' },
    { id: 'balanced', name: 'Perfect balance', description: 'A little space for everything.', columns: 3, spans: [[1,1],[1,1],[1,1],[1,1],[1,1],[1,1]] },
    { id: 'editorial', name: 'The editorial', description: 'An unexpected rhythm that works.', columns: 4, spans: [[2,2],[2,1],[1,2],[1,1],[2,1]] },
    { id: 'dashboard', name: 'At a glance', description: 'Your big picture, all together.', columns: 4, spans: [[2,1],[1,1],[1,1],[3,2],[1,2]] },
    { id: 'mosaic', name: 'Creative mix', description: 'Wide, tall, and a little of both.', columns: 4, spans: [[1,2],[2,1],[1,1],[1,1],[2,1],[3,1]] }
  ];
  const titles = ['Ideas, beautifully connected.', 'A little more possibility.', 'Space to grow.', 'Make it yours.', 'A fresh perspective.', 'Good things, together.'];
  function effective(settings, property, breakpoint) {
    for (let i = breakpoints.findIndex(b => b.id === breakpoint); i >= 0; i--) {
      const source = breakpoints[i].id;
      if (settings[source]?.[property] !== undefined) return { value: settings[source][property], source };
    }
    throw new Error('Missing base value: ' + property);
  }
  function card(index, id) {
    return { id, title: titles[index % titles.length], tone: index % 6, settings: { '2xl': { col: 1, row: 1 } } };
  }
  function applyPreset(preset, previous = { cards: [], nextId: 1 }) {
    let nextId = previous.nextId;
    const cards = preset.spans.map(([col, row], i) => {
      const c = previous.cards[i] ? structuredClone(previous.cards[i]) : card(i, nextId++);
      c.settings = { '2xl': { col, row }, md: { col: Math.min(col, 2) }, smallscreen: { col: 1, row: 1 } };
      return c;
    });
    return { name: preset.name, preset: preset.id, nextId, cards,
      grid: { '2xl': { columns: preset.columns }, md: { columns: 2 }, smallscreen: { columns: 1 } } };
  }
  function affected(settings, property, breakpoint) {
    const ids = [];
    for (let i = breakpoints.findIndex(b => b.id === breakpoint) + 1; i < breakpoints.length; i++) {
      const id = breakpoints[i].id;
      if (settings[id]?.[property] !== undefined) break;
      ids.push(id);
    }
    return ids;
  }
  function escapeHtml(value) { return String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])); }
  const api = { breakpoints, presets, effective, affected, card, applyPreset, escapeHtml };
  if (typeof module !== 'undefined') module.exports = api;
  else root.BentoModel = api;
})(globalThis);
