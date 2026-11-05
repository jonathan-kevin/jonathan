(() => {
 const root = document.querySelector('softadmin-magicbox .saMagicBox');
 const grid = root?.querySelector('.saBoxGrid');
 if (!grid) return;
 const selector = '.saBox:is(.dag, .natt, .dygn)';
 const types = {
  dag: { hours: 11, label: 'Dag', time: '07:00 - 18:00' },
  natt: { hours: 13, label: 'Natt', time: '18:00 - 07:00' },
  dygn: { hours: 24, label: 'Dygn', time: '07:00 - 07:00' }
 };
 const typeOf = card => Object.keys(types).find(type => card?.classList.contains(type));
 const rows = [];
 for (const child of grid.children) {
  if (child.classList.contains('saBoxRow')) rows.push([]);
  if (child.classList.contains('saContainersWrapper')) rows.at(-1)?.push(child);
 }
 const cells = new Map(), weeks = new Map();
 let firstWeek = 20;
 rows.forEach(row => {
  const weekHeading = row.map(group => group.querySelector('.saBoxContainerHeading')?.textContent.trim()).find(text => /^V\.\s*\d+$/.test(text || ''));
  if (weekHeading) firstWeek = Number(weekHeading.replace(/\D/g, ''));
  const team = row[0]?.querySelector('.saBoxContainerHeading')?.textContent.trim();
  if (!/^Lag [1-4]$/.test(team || '')) return;
  for (let w = 0; w < 4; w++) {
   const week = { team, number: firstWeek + w, cells: [], heading: row[8 + w * 8].querySelector('.saBoxContainerHeading') };
   weeks.set(`${team}:${week.number}`, week);
   for (let day = 0; day < 7; day++) {
    const container = row[1 + w * 8 + day].querySelector('.saBoxContainer');
    const cell = { week, container, wrapper: container.querySelector('.saBoxesWrapper'), day };
    week.cells.push(cell); cells.set(container, cell);
   }
  }
 });
 const legends = new Map();
 for (const card of grid.querySelectorAll(selector)) {
  card.draggable = true;
  if (!cells.has(card.closest('.saBoxContainer'))) legends.set(typeOf(card), card);
 }
 const removalTargets = new Set([
  ...[...legends.values()].map(card => card.closest('.saBoxContainer')),
  ...[...grid.querySelectorAll('.saBoxContainerHeading')].filter(heading => heading.querySelector('br')).map(heading => heading.closest('.saBoxContainer'))
 ]);
 const status = document.createElement('div');
 status.setAttribute('role', 'status');
 status.classList.add('saScreenReaderOnly');
 root.append(status);
 let dragged = null, highlighted = null, statusTimer = null;
 function announce(text) {
  clearTimeout(statusTimer); status.textContent = text;
  statusTimer = setTimeout(() => { status.textContent = ''; }, 4000);
 }
 function total(week) {
  return week.cells.reduce((sum, cell) => sum + [...cell.wrapper.querySelectorAll(selector)].reduce((n, card) => n + types[typeOf(card)].hours, 0), 0);
 }
 function refreshTotals() { for (const week of weeks.values()) week.heading.textContent = `${total(week)} h`; }
 function clearHighlight() { highlighted?.classList.remove('saDropOn'); highlighted = null; }
 function finish() { dragged?.classList.remove('saDragged'); dragged = null; clearHighlight(); }
 function plan(container) {
  if (!dragged) return null;
  const source = cells.get(dragged.closest('.saBoxContainer'));
  if (source && removalTargets.has(container)) return { source, remove: true };
  const cell = cells.get(container);
  if (!cell) return null;
  if (source === cell) return { cell, source, same: true };
  const existing = cell.wrapper.querySelector(selector);
  const type = typeOf(dragged), existingType = typeOf(existing);
  if (existing && (type === existingType || type === 'dygn' || existingType === 'dygn')) return { error: 'Det finns redan ett pass på detta datum. Endast Dag + Natt kan kombineras.' };
  const result = existing ? 'dygn' : type;
  const removed = source?.week === cell.week ? types[type].hours : 0;
  const nextTotal = total(cell.week) - removed - (existing ? types[existingType].hours : 0) + types[result].hours;
  if (nextTotal > 48) return { error: `${cell.week.team}, vecka ${cell.week.number}, skulle få ${nextTotal}h. Max är 48h per vecka.` };
  return { cell, source, existing, type: result };
 }
 grid.addEventListener('dragstart', event => {
  const card = event.target.closest(selector);
  if (!card) return;
  dragged = card;
  event.dataTransfer.effectAllowed = cells.has(card.closest('.saBoxContainer')) ? 'move' : 'copy';
  event.dataTransfer.setData('text/plain', card.textContent.trim());
  card.classList.add('saDragged');
 });
 grid.addEventListener('dragover', event => {
  if (!dragged) return;
  clearHighlight();
  const container = event.target.closest('.saBoxContainer');
  const move = plan(container);
  if (!move) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = move.error ? 'none' : move.source ? 'move' : 'copy';
  if (move.error && status.textContent !== move.error) announce(move.error);
  if (!move.error) { highlighted = container; container.classList.add('saDropOn'); }
 });
 grid.addEventListener('dragleave', event => {
  if (highlighted && !highlighted.contains(event.relatedTarget)) clearHighlight();
 });
 grid.addEventListener('drop', event => {
  const move = plan(event.target.closest('.saBoxContainer'));
  if (!move) return;
  event.preventDefault();
  if (move.error) { announce(move.error); finish(); return; }
  if (move.same) { finish(); return; }
  if (move.remove) {
   const type = typeOf(dragged);
   dragged.remove();
   if (!move.source.wrapper.querySelector(selector)) move.source.wrapper.style.removeProperty('min-height');
   refreshTotals();
   announce(`${types[type].label} borttaget från ${move.source.week.team}, vecka ${move.source.week.number}.`);
   finish(); legends.get(type).focus(); return;
  }
  const card = move.existing ? legends.get('dygn').cloneNode(true) : move.source ? dragged : dragged.cloneNode(true);
  card.classList.remove('saDragged'); card.draggable = true;
  card.setAttribute('aria-label', types[move.type].time);
  if (move.existing) { move.existing.remove(); if (move.source) dragged.remove(); }
  move.cell.wrapper.append(card);
  if (move.source && !move.source.wrapper.querySelector(selector)) move.source.wrapper.style.removeProperty('min-height');
  refreshTotals();
  announce(`${types[move.type].label} placerat på ${move.cell.week.team}, vecka ${move.cell.week.number}.${move.existing ? ' Dag + Natt blev Dygn.' : ''}`);
  finish(); card.focus();
 });
 grid.addEventListener('dragend', finish);
 const scroller = grid.closest('.scrollcontent');
 scroller?.addEventListener('dragover', event => {
  if (!dragged) return;
  const rect = scroller.getBoundingClientRect(), edge = 36;
  const left = event.clientX < rect.left + edge ? -18 : event.clientX > rect.right - edge ? 18 : 0;
  const top = event.clientY < rect.top + edge ? -18 : event.clientY > rect.bottom - edge ? 18 : 0;
  if (left || top) scroller.scrollBy({ left, top });
 });
})();
