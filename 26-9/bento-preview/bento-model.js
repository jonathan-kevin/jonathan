(function (root) {
  'use strict';
  const breakpoints = [
    { id: '2xl', min: 1536, max: Infinity, width: 1536, label: 'Large desktop' },
    { id: 'xl', min: 1280, max: 1535, width: 1440, label: 'Desktop' },
    { id: 'lg', min: 1024, max: 1279, width: 1200, label: 'Small desktop' },
    { id: 'md', min: 768, max: 1023, width: 900, label: 'Tablet' },
    { id: 'sm', min: 641, max: 767, width: 700, label: 'Small tablet' },
    { id: 'xs', min: 320, max: 640, width: 390, label: 'Mobile' }
  ];
  const layouts = typeof module !== 'undefined' ? require('../bento-layouts.js') : root.BentoLayouts;
  const presets = layouts.presets.map(p => ({ ...p, description: p.description || (p.id === 'spotlight' ? 'A featured shortcut with supporting links.' : 'A responsive arrangement for your start page.') }));
  const shortcuts = [
    ['My tasks', 'View your tasks and upcoming deadlines.', 'list-check', ''],
    ['Projects', 'View your projects and latest progress.', 'folder-open', 'saPink'],
    ['Documents', 'Find shared files and useful templates.', 'file-lines', 'saRed'],
    ['Reports', 'View key figures and business reports.', 'chart-line', 'saYellow'],
    ['People', 'Find your colleagues and team details.', 'users', 'saSky'],
    ['Support', 'Find useful guides and get extra help.', 'circle-question', 'saOrange'],
    ['Calendar', 'View upcoming meetings and key dates.', 'calendar-days', 'saPurple'],
    ['Approvals', 'Review requests and pending decisions.', 'circle-check', 'saGreen']
  ];
  const prefixes = { '2xl': 'sa', xl: 'saXl', lg: 'saLg', md: 'saMd', sm: 'saSm', xs: 'saXs' };
  function classes(settings, properties) {
    return breakpoints.flatMap(bp => Object.entries(properties).flatMap(([property, suffix]) =>
      settings[bp.id]?.[property] === undefined ? [] : [`${prefixes[bp.id]}${suffix}${settings[bp.id][property]}`]));
  }
  function effective(settings, property, breakpoint) {
    for (let i = breakpoints.findIndex(b => b.id === breakpoint); i >= 0; i--) {
      const source = breakpoints[i].id;
      if (settings[source]?.[property] !== undefined) return { value: settings[source][property], source };
    }
    throw new Error('Missing base value: ' + property);
  }
  const avatars = ['andi-lane', 'noah-pierre', 'ava-wright', 'drew-cano', 'olivia-rhye', 'orlando-diggs', 'loki-bright', 'aliah-lane'].map(name => `https://untitledui.com/images/avatars/${name}`);
  const authors = ['Lina Forsberg', 'Emil Jansson', 'Anna Bergström', 'Oskar Nilsson', 'Maja Svensson', 'Erik Johansson', 'Johan Lindström', 'Karin Holmberg'];
  const photos = ['photo-1667818450198-0ee0cd1c7e79', 'photo-1668090956076-b2c9d6193e6b', 'photo-1661768261898-e2b2a6083092', 'photo-1677167113238-45922ca5ba3d', 'photo-1644318295821-12c4ddf2a36e', 'photo-1473448912268-2022ce9509d8', 'photo-1555679432-b7b7a5e3680c'].map(photo => `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=1000&q=80`);
  function card(index, id, shared = {}) {
    const [title, description, icon, tone] = shortcuts[index % shortcuts.length];
    return { id, title, description, icon, tone, showFooter: false, footerName: authors[index % authors.length], footerDate: `2026-09-${String(28 - index % 14).padStart(2, '0')}`, image: photos[index % photos.length], imageAlt: '', imageFit: 'cover', solid: false, wrapped: false, showTags: false, tags: ['Planning', 'Collaboration', 'Resources', 'Insights', 'Directory', 'Help', 'Schedule', 'Review'][index % 8], showFavorite: false, showAction: false, footerAvatar: avatars[index % avatars.length], ...structuredClone(shared), style: normalizeCardStyle(shared.style || 'small'), settings: { '2xl': { col: 1, row: 1 } } };
  }
  function setSharedCardField(state, field, value) {
    if (!['style', 'solid', 'wrapped', 'imageFit', 'showTags', 'showFooter', 'showFavorite', 'showAction'].includes(field)) throw new Error('Not a shared card field: ' + field);
    if (field === 'style') value = normalizeCardStyle(value);
    (state.sharedCards ||= {})[field] = value;
    state.cards.forEach(c => c[field] = value);
  }
  function applyPreset(preset, previous = { cards: [], nextId: 1 }) {
    let nextId = previous.nextId;
    const cards = preset.spans.map(([col, row], i) => {
      const c = previous.cards[i] ? structuredClone(previous.cards[i]) : card(i, nextId++, previous.sharedCards);
      const [xsCol, xsRow] = preset.xsSpans[i % preset.xsSpans.length];
      c.settings = { '2xl': { col, row } };
      if (col > 2) c.settings.md = { col: 2 };
      if (xsCol !== Math.min(col, 2)) c.settings.xs = { col: xsCol };
      if (xsRow !== row) (c.settings.xs ||= {}).row = xsRow;
      return c;
    });
    return { name: preset.name, preset: preset.id, nextId, cards, sharedCards: structuredClone(previous.sharedCards || {}),
      grid: { '2xl': { columns: preset.columns }, md: { columns: 2 } } };
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
  const cardStyles = [['small', 'Small icon'], ['medium', 'Medium icon'], ['large', 'Large icon'], ['image', 'Image'], ['text', 'Nothing']];
  function normalizeCardStyle(style) { return style === 'tiny' ? 'small' : style === 'icon' ? 'large' : style; }
  function cardStyleClasses(card) {
    const style = normalizeCardStyle(card.style || 'small');
    return [style === 'small' ? 'saSmall' : style === 'medium' ? 'saMedium' : '', style === 'image' && card.wrapped ? 'saWrapped' : ''].filter(Boolean);
  }
  const cardColors = [['', 'Blue'], ['saGray', 'Gray'], ['saGreen', 'Green'], ['saRed', 'Red'], ['saOrange', 'Orange'], ['saYellow', 'Yellow'], ['saSky', 'Sky'], ['saPurple', 'Purple'], ['saPink', 'Pink']];
  function imageUrl(value) {
    try {
      const url = new URL(value, 'http://localhost/');
      return ['http:', 'https:'].includes(url.protocol) ? value : 'card-image.svg';
    } catch { return 'card-image.svg'; }
  }
  function cardContent(c) {
    const style = normalizeCardStyle(c.style || 'small');
    const visual = style === 'image'
      ? `<div class="saBentoImage"><img src="${escapeHtml(imageUrl(c.image || 'card-image.svg'))}" alt="${escapeHtml(c.imageAlt || '')}" class="${c.imageFit === 'contain' ? 'saContain' : ''}"></div>`
      : style === 'text' ? '' : `<div class="saBentoIcon"><i class="saIcon far fad fa-${escapeHtml(c.icon || 'link')}" aria-hidden="true"></i></div>`;
    const footer = c.showFooter ? `<div class="saBentoFooter"><div class="saBentoAuthor"><img class="saBentoAvatar" src="${escapeHtml(imageUrl(c.footerAvatar || avatars[0]))}" alt=""><div class="saBentoName">${escapeHtml(c.footerName || '')}</div></div>${c.footerDate ? `<time class="saBentoDate" datetime="${escapeHtml(c.footerDate)}">${escapeHtml(c.footerDate)}</time>` : ''}</div>` : '';
    const tags = c.showTags ? (c.tags || '').split(',').map(tag => tag.trim()).filter(Boolean) : [];
    const pills = tags.length ? `<ul class="saPillGroup">${tags.map(tag => `<li class="saPill">${escapeHtml(tag)}</li>`).join('')}</ul>` : '';
    return `${visual}<div class="saBentoBody">${pills}<h2 class="saBentoHeading"><span>${escapeHtml(c.title)}</span></h2><p class="saBentoDescription">${escapeHtml(c.description ?? 'Add a link to a page you use often.')}</p>${footer}</div>`;
  }
  function cardArticle(c, label, selected) {
    const favorite = c.showFavorite ? `<button type="button" class="saBentoButton" aria-pressed="false" aria-label="Favorite ${escapeHtml(c.title)}"><i class="saIcon far fad fa-heart" aria-hidden="true"></i><i class="saIcon fas fa-heart" aria-hidden="true"></i></button>` : '';
    const action = c.showAction ? `<div class="saBentoButtonWrapper"><a class="saDefaultButtonSecondary" href="#">Open ${escapeHtml(c.title)}</a></div>` : '';
    return `<article>${favorite}<a href="#" class="saBentoInner ${c.solid ? 'saSolid' : ''}" role="button" aria-pressed="${selected}" aria-label="${escapeHtml(label)}">${cardContent(c)}</a>${action}</article>`;
  }
  function duplicateCard(state, id) {
    const index = state.cards.findIndex(c => c.id === id);
    if (index < 0) return null;
    const copy = structuredClone(state.cards[index]);
    copy.id = state.nextId++;
    state.cards.splice(index + 1, 0, copy);
    state.preset = null;
    return copy;
  }
  function moveCard(state, id, index) {
    const from = state.cards.findIndex(c => c.id === id);
    if (from < 0 || !Number.isInteger(index) || index < 0 || index >= state.cards.length || from === index) return false;
    state.cards.splice(index, 0, state.cards.splice(from, 1)[0]);
    state.preset = null;
    return true;
  }
  // Only accept our versioned, well-formed layout data from local storage.
  function restoreState(value) {
    try {
      if (!value || !Array.isArray(value.cards) || value.cards.length > 1000) return null;
      const settingsValid = (settings, props) => settings && typeof settings === 'object' && !Array.isArray(settings)
        && props.every(p => Number.isInteger(settings['2xl']?.[p]))
        && Object.entries(settings).every(([bp, fields]) => breakpoints.some(b => b.id === bp)
          && fields && typeof fields === 'object' && !Array.isArray(fields)
          && Object.entries(fields).every(([key, n]) => props.includes(key) && Number.isInteger(n) && n >= 1 && n <= 16));
      if (!settingsValid(value.grid, ['columns'])) return null;
      const ids = new Set();
      const cards = value.cards.map((c, index) => {
        if (!Number.isSafeInteger(c.id) || c.id < 1 || ids.has(c.id) || !settingsValid(c.settings, ['col', 'row'])) throw new Error('Invalid card');
        ids.add(c.id);
        const result = card(index, c.id);
        for (const key of Object.keys(result)) {
          if (key === 'settings') result.settings = structuredClone(c.settings);
          else if (typeof c[key] === typeof result[key]) result[key] = c[key];
        }
        result.style = normalizeCardStyle(result.style);
        if (!cardColors.some(([tone]) => tone === result.tone) || !cardStyles.some(([style]) => style === result.style)
          || !/^[a-z0-9-]+$/.test(result.icon)) throw new Error('Invalid appearance');
        return result;
      });
      const result = { name: typeof value.name === 'string' ? value.name : 'Custom layout', preset: value.preset === 'blank' || presets.some(p => p.id === value.preset) ? value.preset : null,
        nextId: Math.max(0, ...ids) + 1, cards, grid: structuredClone(value.grid), sharedCards: {} };
      if (Number.isSafeInteger(value.nextId)) result.nextId = Math.max(result.nextId, value.nextId);
      for (const field of ['style', 'solid', 'wrapped', 'imageFit', 'showTags', 'showFooter', 'showFavorite', 'showAction']) {
        const stored = value.sharedCards?.[field];
        const v = field === 'style' && typeof stored === 'string' ? normalizeCardStyle(stored) : stored;
        if ((field === 'style' && cardStyles.some(([s]) => s === v)) || (field === 'imageFit' && ['cover', 'contain'].includes(v))
          || (!['style', 'imageFit'].includes(field) && typeof v === 'boolean')) result.sharedCards[field] = v;
      }
      return result;
    } catch { return null; }
  }
  function selectCard(selected, id, additive = false) {
    if (!additive) return selected.length === 1 && selected[0] === id ? [] : [id];
    return selected.includes(id) ? selected.filter(value => value !== id) : [...selected, id];
  }
  function editCards(cards, breakpoint, property, value, step = 0) {
    let changed = false;
    for (const card of cards) {
      const current = effective(card.settings, property, breakpoint).value;
      const next = step ? Math.max(1, Math.min(16, current + step)) : value;
      if (card.settings[breakpoint]?.[property] === next || (step && current === next)) continue;
      (card.settings[breakpoint] ||= {})[property] = next;
      changed = true;
    }
    return changed;
  }
  const api = { normalizeCardStyle, cardStyleClasses, selectCard, editCards, duplicateCard, moveCard, restoreState, breakpoints, presets, effective, affected, card, applyPreset, escapeHtml, classes, cardStyles, cardColors, cardContent, imageUrl, cardArticle, setSharedCardField };
  if (typeof module !== 'undefined') module.exports = api;
  else root.BentoModel = api;
})(globalThis);
