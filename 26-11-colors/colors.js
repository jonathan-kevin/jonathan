/* Palette metadata contains names only. Every color is resolved by the browser
   from the loaded stylesheet, including theme-dependent application variables. */
(() => {
  'use strict';
  const families = ['Gray', 'Blue', 'Red', 'Orange', 'Yellow', 'Green', 'Sky', 'Purple', 'Pink', 'Primary'];
  const shades = [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300];
  const $ = id => document.getElementById(id);
  const state = { pinned: null, temporary: null, colors: new Map(), candidates: [], nextId: 1,
    preview: { surface: 'Gray50', label: 'Gray900', iconBg: 'Blue100', iconFg: 'Blue700' } };
  const probe = document.createElement('span');
  probe.hidden = true;
  document.body.append(probe);
  const token = (family, shade) => shade === 0 ? 'White' : family === 'Primary' ? `Sa-Color-Primary${shade}` : `${family}${shade}`;
  const familyShades = () => shades;
  function resolve(name) {
    probe.style.backgroundColor = `var(--${name}, transparent)`;
    const value = getComputedStyle(probe).backgroundColor;
    // Canvas normalizes any CSS color syntax (including light-dark / oklch) to sRGB.
    const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = value;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    if (a !== 255) return null;
    return { name, value, rgb: [r, g, b], hex: '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('') };
  }
  const luminance = color => color.rgb.map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
  function contrast(a, b) {
    if (!a || !b) return null;
    const x = luminance(a), y = luminance(b);
    return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
  }
  const color = name => state.colors.get(name);
  function ink(c) {
    const white = color('White'), black = color('Black');
    return contrast(c, white) >= contrast(c, black) ? white : black;
  }
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function options(select, values, selected) {
    select.replaceChildren(...values.map(value => {
      const option = el('option', '', value);
      option.value = value;
      return option;
    }));
    if (selected !== undefined) select.value = selected;
  }
  function mapPrimary() {
    const family = $('primary-family').value;
    for (const shade of familyShades('Primary')) {
      document.body.style.setProperty(`--Sa-Color-Primary${shade}`, `var(--${token(family, shade)})`);
    }
    $('primary-name').textContent = family;
  }
  function discover() {
    state.colors.clear();
    for (const family of families) for (const shade of familyShades(family)) {
      const name = token(family, shade);
      state.colors.set(name, resolve(name));
    }
    state.colors.set('Black', resolve('Black'));
  }
  function swatch(name, displayName = name) {
    const c = color(name);
    if (!c) return el('span', 'missing', `${displayName} · unresolved`);
    const button = el('button', 'swatch palette-swatch');
    button.type = 'button';
    button.dataset.token = name;
    button.style.backgroundColor = c.value;
    button.style.color = ink(c).value;
    button.style.setProperty('--swatch-ink', ink(c).value);
    button.setAttribute('aria-label', `${displayName}. Select color`);
    button.setAttribute('aria-pressed', 'false');
    button.append(el('span', '', displayName));
    return button;
  }
  function tableHead(table, rowTitle) {
    table.replaceChildren();
    const thead = el('thead'), row = el('tr');
    row.append(el('th', '', rowTitle));
    for (const shade of shades) { const th = el('th', '', shade); th.scope = 'col'; row.append(th); }
    thead.append(row); table.append(thead);
    const tbody = el('tbody'); table.append(tbody); return tbody;
  }
  function renderPalette() {
    const tbody = tableHead($('palette'), 'Family / shade');
    for (const family of families) {
      const row = el('tr'), heading = el('th', '', family);
      heading.scope = 'row'; row.append(heading);
      for (const shade of shades) {
        const td = el('td');
        td.append(swatch(token(family, shade), shade === 0 ? 'White' : `${family}${shade}`));
        row.append(td);
      }
      tbody.append(row);
    }
    const fixed = [...state.colors].filter(([name, c]) => !name.startsWith('Sa-') && c).length;
    $('palette-count').textContent = `${fixed} fixed tokens · 9 families + demo Primary`;
    $('black-token').replaceChildren(swatch('Black'), el('span', '', 'Black is a separate token. Shade 0 in every family is shared White.'));
    renderSemantics();
    updateSelection();
  }
  function renderSemantics() {
    const list = el('div', 'semantic-list');
    const names = ['Sa-Color-Primary600', 'Sa-Color-Background', 'Sa-Color-Surface', 'Sa-Color-Text', 'Sa-Color-TextSecondary'];
    const unresolved = [...state.colors].filter(([, c]) => !c).map(([name]) => name);
    for (const name of [...names, ...unresolved]) {
      const c = resolve(name), chip = el('div', `semantic-chip${c ? '' : ' unresolved'}`);
      if (c) { const dot = el('i'); dot.style.background = c.value; chip.append(dot); }
      chip.append(el('code', '', `--${name}`), el('span', '', c ? 'Resolved' : 'Unresolved'));
      list.append(chip);
    }
    $('semantic-status').replaceChildren(el('p', '', unresolved.length ? `${unresolved.length} unresolved palette values. Check stylesheet loading.` : 'All requested palette values resolved. Five application variables use explicit local demo values.'), list);
  }
  function updateSelection() {
    const name = state.temporary || state.pinned, selected = color(name), threshold = Number($('threshold').value);
    let matches = new Set();
    document.querySelectorAll('.palette-swatch').forEach(button => {
      const c = color(button.dataset.token), ratio = selected ? contrast(c, selected) : null;
      const match = ratio !== null && ratio >= threshold;
      button.classList.toggle('match', match);
      button.classList.toggle('failing', ratio !== null && !match && button.dataset.token !== name && button.dataset.token !== state.pinned);
      button.classList.toggle('selected', button.dataset.token === state.pinned);
      button.setAttribute('aria-pressed', String(button.dataset.token === state.pinned));
      if (match) matches.add(button.dataset.token);
      button.title = `${button.dataset.token}${ratio !== null ? ` · ${match ? 'Pass' : 'Fail'} against ${name}` : ''}`;
    });
    $('selection-readout').textContent = selected ? `${state.temporary ? 'Comparing' : 'Pinned'} ${name} · ${matches.size} unique tokens meet the selected threshold. Outlined swatches pass; faded swatches fail.` : 'Select a color to highlight compatible colors.';
  }
  function renderMatrix() {
    const fgFamily = $('foreground-family').value, bgFamily = $('background-family').value, threshold = Number($('matrix-filter').value);
    const tbody = tableHead($('matrix'), 'FG ↓ / BG →');
    let shown = 0, total = 0;
    for (const fgShade of familyShades(fgFamily)) {
      const row = el('tr'), th = el('th', '', `${fgFamily}${fgShade}`);
      th.scope = 'row'; row.append(th);
      for (const bgShade of shades) {
        const td = el('td');
        const fgName = token(fgFamily, fgShade), bgName = token(bgFamily, bgShade);
        const fg = color(fgName), bg = color(bgName), ratio = contrast(fg, bg);
        total++;
        if (ratio === null) td.append(el('span', 'missing', 'Unresolved'));
        else if (ratio < threshold) td.append(el('span', 'filtered-pair', 'Filtered'));
        else {
          shown++;
          const button = el('button', 'pair'); button.type = 'button';
          button.style.color = fg.value; button.style.backgroundColor = bg.value;
          button.dataset.fg = fgName; button.dataset.bg = bgName;
          button.setAttribute('aria-label', `${fgName} on ${bgName}. ${ratio >= 4.5 ? 'Pass normal text' : ratio >= 3 ? 'Pass large text and icons' : 'Fail text and icons'}. Apply to preview.`);
          button.append(el('strong', '', 'Aa'));
          td.append(button);
        }
        row.append(td);
      }
      tbody.append(row);
    }
    $('matrix-count').textContent = `${shown} / ${total} pairs shown`;
  }
  const roles = { surface: 'Card surface', label: 'Label / pill text', iconBg: 'Icon / pill background', iconFg: 'Icon foreground' };
  function splitToken(name) {
    if (name === 'White') return ['Gray', 0];
    if (name.startsWith('Sa-Color-Primary')) return ['Primary', Number(name.replace('Sa-Color-Primary', ''))];
    const match = name.match(/^([A-Za-z]+)(\d+)$/);
    return match ? [match[1], Number(match[2])] : ['Black', 0];
  }
  function renderControls() {
    const familyStrip = $('preview-families');
    familyStrip.replaceChildren();
    for (const family of families) {
      const c = color(token(family, 600)), button = el('button', 'family-choice', family);
      button.type = 'button'; button.dataset.family = family;
      if (c) { button.style.background = c.value; button.style.color = ink(c).value; }
      button.setAttribute('aria-label', `Use ${family} for the card color family`);
      button.setAttribute('aria-pressed', String(Object.values(state.preview).every(name => splitToken(name)[0] === family || name === 'White')));
      button.addEventListener('click', () => {
        for (const role of Object.keys(roles)) state.preview[role] = token(family, splitToken(state.preview[role])[1]);
        renderControls(); renderLive();
        $('preview-families').querySelector(`[data-family="${family}"]`)?.focus({ preventScroll: true });
      });
      familyStrip.append(button);
    }
    $('preview-controls').replaceChildren();
    for (const [role, title] of Object.entries(roles)) {
      const row = el('div', 'token-control'), label = el('label', '', title), familySelect = el('select'), strip = el('div', 'shade-strip');
      const [family] = splitToken(state.preview[role]);
      familySelect.id = `preview-${role}-family`; familySelect.setAttribute('aria-label', `${title} family`);
      options(familySelect, [...families, 'Black'], family);
      label.append(familySelect);
      strip.setAttribute('role', 'group'); strip.setAttribute('aria-label', `${title} shades`);
      for (const shade of family === 'Black' ? [0] : shades) {
        const name = family === 'Black' ? 'Black' : token(family, shade), c = color(name);
        const button = el('button', 'shade-choice', family === 'Black' ? 'Black' : shade);
        button.type = 'button'; button.dataset.role = role; button.dataset.token = name;
        button.setAttribute('aria-label', `${title}: ${name}${c ? '' : ', unresolved'}`);
        button.setAttribute('aria-pressed', String(name === state.preview[role]));
        if (c) { button.style.background = c.value; button.style.color = ink(c).value; }
        else { button.disabled = true; button.classList.add('unresolved'); }
        button.classList.toggle('selected', name === state.preview[role]);
        const against = role === 'surface' ? [['label', 4.5]] : role === 'label' ? [['surface', 4.5], ['iconBg', 4.5]] : role === 'iconFg' ? [['iconBg', 3]] : [['iconFg', 3], ['label', 4.5]];
        const failing = c && against.some(([other, threshold]) => { const ratio = contrast(c, color(state.preview[other])); return ratio !== null && ratio < threshold; });
        button.classList.toggle('failing', Boolean(failing));
        button.title = `${name} · ${failing ? 'Fail' : c ? 'Pass' : 'Unresolved'}`;
        const tryShade = () => {
          sample($('live-preview'), { ...state.preview, [role]: name });
          $('live-preview').dataset.editing = role;
        };
        button.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') tryShade(); });
        button.addEventListener('focus', tryShade);
        button.addEventListener('pointerleave', () => { renderLive(); });
        button.addEventListener('blur', () => { renderLive(); });
        button.addEventListener('click', () => {
          state.preview[role] = name;
          const hadFocus = document.activeElement === button;
          renderControls(); renderLive();
          if (hadFocus) $('preview-controls').querySelector(`[data-role="${role}"][data-token="${name}"]`)?.focus({ preventScroll: true });
        });
        strip.append(button);
      }
      strip.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        const buttons = [...strip.querySelectorAll('button:not(:disabled)')], index = buttons.indexOf(event.target);
        const next = event.key === 'Home' ? buttons[0] : event.key === 'End' ? buttons.at(-1) : buttons[index + (event.key === 'ArrowLeft' ? -1 : 1)];
        event.preventDefault(); next?.focus();
      });
      familySelect.addEventListener('change', () => {
        state.preview[role] = familySelect.value === 'Black' ? 'Black' : token(familySelect.value, splitToken(state.preview[role])[1]);
        renderControls(); renderLive(); $('preview-controls').querySelector(`#preview-${role}-family`).focus();
      });
      row.append(label, strip);
      $('preview-controls').append(row);
    }
  }
  function sample(target, selection) {
    target.replaceChildren();
    const c = Object.fromEntries(Object.entries(selection).map(([role, name]) => [role, color(name)]));
    if (Object.values(c).some(value => !value)) { target.append(el('p', '', 'Preview has unresolved values. Choose resolved tokens.')); return; }
    const card = el('article', 'sample-card'); card.style.backgroundColor = c.surface.value; card.style.color = c.label.value;
    const icon = el('span', 'sample-icon'); icon.style.backgroundColor = c.iconBg.value; icon.style.color = c.iconFg.value;
    icon.innerHTML = '<svg class="saIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 5h14v14H5zM8 9h8M8 12h8M8 15h5"/></svg>';
    const copy = el('div', 'sample-copy'); copy.append(el('h3', '', 'Preview'), el('p', '', 'Description'));
    card.append(icon, copy);
    const pill = el('span', 'sample-pill', 'In progress'); pill.style.backgroundColor = c.iconBg.value; pill.style.color = c.label.value;
    const checks = el('div', 'contrast-checks');
    for (const [title, a, b, threshold] of [['Card text', 'label', 'surface', 4.5], ['Icon', 'iconFg', 'iconBg', 3], ['Pill text', 'label', 'iconBg', 4.5]]) {
      const ratio = contrast(c[a], c[b]), line = el('span');
      line.append(el('span', '', title), el('strong', '', ratio >= threshold ? 'Pass' : 'Fail')); checks.append(line);
    }
    target.append(card, pill, checks);
    target.title = Object.entries(selection).map(([role, name]) => `${roles[role]}: ${name}`).join('\n');
  }
  function renderLive() { delete $('live-preview').dataset.editing; sample($('live-preview'), state.preview); }
  function renderCandidates() {
    $('candidates').replaceChildren();
    for (const candidate of state.candidates) {
      const stage = el('div', 'preview-stage'), header = el('div', 'candidate-heading'), body = el('div', 'preview-stage');
      const remove = el('button', 'control', 'Remove'); remove.type = 'button'; remove.setAttribute('aria-label', `Remove candidate ${candidate.id}`);
      remove.addEventListener('click', () => { state.candidates = state.candidates.filter(c => c.id !== candidate.id); renderCandidates(); $('pin-candidate').focus(); });
      header.append(el('strong', '', `Candidate ${candidate.id}`), remove); sample(body, candidate.selection);
      stage.append(header, body, el('p', 'hint', Object.values(candidate.selection).join(' · '))); $('candidates').append(stage);
    }
    $('pin-candidate').disabled = state.candidates.length >= 4;
    $('candidate-status').textContent = `${state.candidates.length} / 4 candidates pinned. Candidates retain their token choices; semantic tokens follow the demo theme.`;
  }
  function apply(name) { state.preview[$('apply-target').value] = name; renderControls(); renderLive(); }
  function refresh() { discover(); renderPalette(); renderMatrix(); renderControls(); renderLive(); renderCandidates(); }
  function tableKeyboard(event) {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    const button = event.target.closest('button'); if (!button) return;
    const row = button.closest('tr'), rows = [...row.parentNode.rows], cells = [...row.cells], index = cells.indexOf(button.closest('td'));
    let next;
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      const direction = event.key === 'ArrowUp' ? -1 : 1;
      let i = rows.indexOf(row) + direction;
      while (i >= 0 && i < rows.length && !next) { next = rows[i].cells[index]?.querySelector('button'); i += direction; }
    } else {
      const buttons = [...row.querySelectorAll('button')], position = buttons.indexOf(button);
      next = event.key === 'Home' ? buttons[0] : event.key === 'End' ? buttons.at(-1) : buttons[position + (event.key === 'ArrowLeft' ? -1 : 1)];
    }
    event.preventDefault(); next?.focus();
  }
  for (const id of ['palette', 'black-token']) {
    const container = $(id);
    container.addEventListener('pointerover', event => { if (event.pointerType === 'touch') return; const button = event.target.closest('.swatch'); if (button) { state.temporary = button.dataset.token; updateSelection(); } });
    container.addEventListener('pointerleave', () => { state.temporary = null; updateSelection(); });
    container.addEventListener('focusin', event => { const button = event.target.closest('.swatch'); if (button) { state.temporary = button.dataset.token; updateSelection(); } });
    container.addEventListener('focusout', () => { state.temporary = null; updateSelection(); });
    container.addEventListener('click', event => { const button = event.target.closest('.swatch'); if (button) { state.pinned = button.dataset.token; state.temporary = null; updateSelection(); apply(state.pinned); } });
    container.addEventListener('keydown', tableKeyboard);
  }
  $('matrix').addEventListener('keydown', tableKeyboard);
  $('matrix').addEventListener('click', event => { const pair = event.target.closest('.pair'); if (pair) { state.preview.label = pair.dataset.fg; state.preview.surface = pair.dataset.bg; renderControls(); renderLive(); } });
  $('threshold').addEventListener('change', updateSelection);
  $('clear-selection').addEventListener('click', () => { state.pinned = null; state.temporary = null; updateSelection(); });
  for (const id of ['foreground-family', 'background-family', 'matrix-filter']) $(id).addEventListener('change', renderMatrix);
  $('swap').addEventListener('click', () => { const fg = $('foreground-family').value; $('foreground-family').value = $('background-family').value; $('background-family').value = fg; renderMatrix(); });
  $('primary-family').addEventListener('change', () => { mapPrimary(); refresh(); });
  $('theme').addEventListener('change', () => { document.body.dataset.theme = $('theme').value; refresh(); });
  for (const theme of ['light', 'dark']) $(`preset-${theme}`).addEventListener('click', () => {
    document.body.dataset.theme = theme; $('theme').value = theme;
    state.preview = theme === 'dark' ? { surface: 'Gray1200', label: 'Gray100', iconBg: 'Blue1000', iconFg: 'Blue200' } : { surface: 'Gray50', label: 'Gray900', iconBg: 'Blue100', iconFg: 'Blue700' };
    refresh();
  });
  $('pin-candidate').addEventListener('click', () => { if (state.candidates.length < 4) { state.candidates.push({ id: state.nextId++, selection: { ...state.preview } }); renderCandidates(); } });
  options($('primary-family'), families.filter(family => family !== 'Primary'), 'Blue');
  options($('foreground-family'), families, 'Blue'); options($('background-family'), families, 'Gray');
  mapPrimary(); refresh();
  // Read-only helpers for verifying actual resolved colors and unrounded ratios.
  window.ColorExplorer = { resolve, contrast, getPalette: () => [...state.colors.entries()] };
})();
