(() => {
 const board = document.querySelector('softadmin-magicbox .saMagicBox');
 if (!board) return;
 // Detail links are placeholders in this demo.
 board.addEventListener('click', event => {
  if (event.target.closest('.saDealflowLink')) event.preventDefault();
 });
 const format = new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 2 });
 const columns = [...board.querySelectorAll('[data-deal-stage]')];
 function refreshTotals() {
  for (const column of columns) {
   const deals = [...column.querySelector('.saBoxesWrapper').children].filter(card => card.classList.contains('saBox'));
   const value = deals.reduce((sum, card) => sum + (Number(card.dataset.dealValueMsek) || 0), 0);
   column.querySelector('[data-deal-count]').textContent = deals.length;
   const stage = column.querySelector('.saBoxContainerHeading > span').textContent;
   column.querySelector('[data-deal-count]').setAttribute('aria-label', `${deals.length} companies in ${stage}`);
   column.querySelector('[data-deal-total]').textContent = `${format.format(value)} MSEK`;
  }
 }
 refreshTotals();
 for (const card of board.querySelectorAll('[data-deal-stage] .saBox')) {
  card.draggable = true;
  for (const image of card.querySelectorAll('img')) image.draggable = false;
 }
 let dragged = null, highlighted = null;
 const marker = document.createElement('div');
 marker.className = 'saDealDropMarker';
 marker.setAttribute('aria-hidden', 'true');
 marker.style.cssText = 'position: absolute; left: 0.75rem; right: 0.75rem; height: 3px; border-radius: 2px; background-color: var(--Blue600); pointer-events: none; z-index: 3;';
 function clearHighlight() {
  highlighted?.classList.remove('saDropOn');
  highlighted = null;
  marker.remove();
 }
 function placement(event) {
  const column = event.target.closest('[data-deal-stage]');
  if (!dragged || !columns.includes(column)) return null;
  const wrapper = column.querySelector('.saBoxesWrapper');
  const cards = [...wrapper.children].filter(card => card.classList.contains('saBox') && card !== dragged);
  const before = cards.find(card => {
   const rect = card.getBoundingClientRect();
   return event.clientY < rect.top + rect.height / 2;
  });
  return { column, wrapper, cards, before };
 }
 function finish() {
  dragged?.classList.remove('saDragged');
  dragged = null;
  clearHighlight();
 }
 board.addEventListener('dragstart', event => {
  const card = event.target.closest('.saBox');
  if (!card?.closest('[data-deal-stage]')) return;
  dragged = card;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', card.children[0].children[0].textContent.trim());
  card.classList.add('saDragged');
 });
 board.addEventListener('dragover', event => {
  if (!dragged) return;
  clearHighlight();
  const target = placement(event);
  if (!target) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  highlighted = target.column;
  highlighted.classList.add('saDropOn');
  target.wrapper.style.position = 'relative';
  target.wrapper.append(marker);
  const wrapperTop = target.wrapper.getBoundingClientRect().top;
  const lineTop = target.before ? target.before.getBoundingClientRect().top - 6
   : target.cards.length ? target.cards.at(-1).getBoundingClientRect().bottom + 6 : wrapperTop;
  marker.style.top = `${Math.max(0, lineTop - wrapperTop)}px`;
 });
 board.addEventListener('dragleave', event => {
  if (highlighted && !highlighted.contains(event.relatedTarget)) clearHighlight();
 });
 board.addEventListener('drop', event => {
  const target = placement(event);
  if (!target) return;
  event.preventDefault();
  target.wrapper.insertBefore(dragged, target.before || null);
  refreshTotals();
  finish();
 });
 board.addEventListener('dragend', finish);
 const scroller = board.closest('.scrollcontent');
 scroller?.addEventListener('dragover', event => {
  if (!dragged) return;
  const rect = scroller.getBoundingClientRect(), edge = 36;
  const left = event.clientX < rect.left + edge ? -18 : event.clientX > rect.right - edge ? 18 : 0;
  const top = event.clientY < rect.top + edge ? -18 : event.clientY > rect.bottom - edge ? 18 : 0;
  if (left || top) scroller.scrollBy({ left, top });
 });
})();
