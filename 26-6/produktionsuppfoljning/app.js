(function () {
  'use strict';
  const D = window.ProductionData;
  const $ = selector => document.querySelector(selector);
  const number = value => new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 1 }).format(value);
  const hours = value => value === null ? 'Ej rapporterat' : `${number(value)} h`;
  const money = value => `${number(Math.round(value))} kr`;
  const day = value => new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'short' }).format(new Date(`${value}T12:00:00`));
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = name => `<i class="far fa-${name}" aria-hidden="true"></i>`;
  const state = { tab: 'overview', query: '', group: 'all', sort: '', direction: 1 };
  let reportModel = { columns: [], rows: [] };
  let data;
  let toastTimer;
  const productionName = id => D.productions.find(item => item.id === id).name;
  const personName = id => D.people.find(item => item.id === id).name;
  const status = (text, tone = 'green') => `<span class="status ${tone}">${escape(text)}</span>`;
  const delta = value => `${value > 0 ? '+' : ''}${hours(value)}`;
  const column = (key, label, numeric = false, format = null) => ({ key, label, numeric, format });

  function actions(row) {
    if (!row.kind) return '';
    return `<div class="row-actions"><button class="icon-button" type="button" data-detail="${row.kind}" data-id="${row.id}" title="Visa detaljer" aria-label="Visa detaljer: ${escape(row.name || row.title)}">${icon('eye')}</button><button class="icon-button" type="button" data-schedule="${row.kind}" data-id="${row.id}" title="Visa tidsunderlag" aria-label="Visa tidsunderlag: ${escape(row.name || row.title)}" ${row.cancelled || row.kind === 'expense' ? 'disabled' : ''}>${icon('calendar-days')}</button></div>`;
  }
  function table(model, { sort = false, totals = false } = {}) {
    const hasActions = model.rows.some(row => row.kind);
    let rows = model.rows;
    if (sort && state.sort) rows = [...rows].sort((a, b) => (typeof a[state.sort] === 'number' ? a[state.sort] - b[state.sort] : String(a[state.sort] ?? '').localeCompare(String(b[state.sort] ?? ''), 'sv')) * state.direction);
    model.rows = rows;
    return `<div class="table-scroll"><table class="saGrid" aria-label="${escape(model.title)}"><thead><tr>${hasActions ? '<th scope="col"><span class="sr-only">Åtgärder</span></th>' : ''}${model.columns.map(col => `<th scope="col" ${sort && state.sort === col.key ? `aria-sort="${state.direction === 1 ? 'ascending' : 'descending'}"` : ''}>${sort ? `<button type="button" class="saGridHeadingInner sort ${state.sort === col.key ? 'saSorted' : ''}" data-sort="${col.key}"><span class="saGridHeadingLabel">${escape(col.label)}</span>${state.sort === col.key ? `<i class="saIcon fas fa-caret-${state.direction === 1 ? 'up' : 'down'}" aria-hidden="true"></i>` : ''}</button>` : escape(col.label)}</th>`).join('')}</tr></thead><tbody>${rows.length ? rows.map(row => `<tr class="saGridRow">${hasActions ? `<td>${actions(row)}</td>` : ''}${model.columns.map(col => `<td class="${col.numeric ? 'num' : ''}">${col.format ? col.format(row[col.key], row) : escape(row[col.key])}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${model.columns.length + Number(hasActions)}">Inga träffar för sökningen.</td></tr>`}</tbody>${totals && rows.length ? `<tfoot><tr>${hasActions ? '<td></td>' : ''}${model.columns.map((col, index) => `<td class="${col.numeric ? 'num' : ''}">${index === 0 ? 'Totalt' : col.numeric ? (col.format ? col.format(D.sum(rows, col.key), {}) : number(D.sum(rows, col.key))) : ''}</td>`).join('')}</tr></tfoot>` : ''}</table></div>`;
  }
  function facts(values) { return `<dl class="detail-facts">${values.map(([key, value]) => `<div><dt>${escape(key)}</dt><dd>${escape(value)}</dd></div>`).join('')}</dl>`; }
  function openDetail(title, html) { $('#detail-title').textContent = title; $('#detail-body').innerHTML = html; if (!$('#detail').open) $('#detail').showModal(); }
  function notice(text) { clearTimeout(toastTimer); $('#toast').textContent = text; $('#toast').hidden = false; toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 3500); }

  function summary() {
    const people = D.staffRows(data);
    const completed = data.sessions.filter(item => !item.cancelled).length;
    const usage = data.scheduled - data.pending ? data.actual / (data.scheduled - data.pending) * 100 : 0;
    const metrics = [
      ['Bemannade resurser', 'users', `${people.length} <small>personer</small>`, `${people.filter(item => item.category === 'Musiker').length} musiker · ${people.filter(item => item.category === 'Teknik').length} tekniker`],
      ['Rapporterad arbetstid', 'clock', `${number(data.actual)} <small>h</small>`, `Aktuellt schema ${hours(data.scheduled)}${data.pending ? ` · ${hours(data.pending)} saknas` : ''}`],
      ['Nyttjad schematid', 'chart-simple', `${data.scheduled ? number(usage) : '–'} <small>%</small>`, data.pending ? 'Endast tidrapporterade pass' : `${completed} av ${data.sessions.length} tillfällen genomförda`],
      ['Rapporterad personalkostnad', 'coins', `${number(data.cost / 1000)} <small>tkr</small>`, `Budget ${number(data.budget / 1000)} tkr · ${data.budget ? number(data.cost / data.budget * 100) : 0} % nyttjad`]
    ];
    $('#summary').innerHTML = metrics.map(([label, glyph, value, foot]) => `<div class="metric saInfoBox"><div class="metric-label saInfoBoxLabel">${label}${icon(glyph)}</div><div class="metric-value">${value}</div><div class="metric-foot">${foot}</div></div>`).join('');
    const issues = D.deviations(data);
    $('#nav-count').textContent = issues.length;
    $('#deviation-count').textContent = issues.length;
    $('#attention').innerHTML = issues.length ? `<div class="warning saWarningBox">${icon('triangle-exclamation')}<span><strong>${issues.length} avvikelser i urvalet.</strong> ${data.sessions.some(item => item.cancelled) ? 'En konsert har ställts in efter publicering.' : 'Tid eller kostnadsunderlag behöver följas upp.'} ${data.pending ? `${hours(data.pending)} saknar tidrapport.` : ''}</span><button type="button" data-view="deviations">Visa avvikelser ${icon('arrow-right')}</button></div>` : '';
  }
  function meters() {
    return `<div class="meters">${['Repetition', 'Genrep', 'Konsert'].map((type, index) => {
      const rows = data.assignments.filter(item => item.type === type);
      const planned = D.sum(rows, 'planned');
      const scheduled = D.sum(rows, 'scheduled');
      const actual = D.sum(rows, 'actual');
      const count = data.sessions.filter(item => item.type === type && !item.cancelled).length;
      const fraction = planned ? Math.min(1, scheduled / planned) : 0;
      const color = ['#2d6ce1', '#1d8879', '#9563bc'][index];
      return `<div class="meter saMeterOuter"><h3 class="saMeterHeading">${type}</h3><svg viewBox="0 0 200 120" role="img" aria-label="${type}: ${hours(scheduled)} schemalagt av ${hours(planned)} i publicerad plan"><path d="M 26 92 A 74 74 0 0 1 174 92" fill="none" stroke="#e9eef4" stroke-width="12" stroke-linecap="round"/><path d="M 26 92 A 74 74 0 0 1 174 92" fill="none" stroke="${color}" stroke-width="12" stroke-linecap="round" pathLength="100" stroke-dasharray="${fraction * 100} 100"/><text x="100" y="81" fill="#313a44" font-size="27" font-weight="600">${number(scheduled)}<tspan font-size="13"> h</tspan></text><text x="100" y="101" fill="#60748b" font-size="10">schemalagd tid</text></svg><div class="meter-data"><span>Publicerad plan <strong>${hours(planned)}</strong></span><span>Utfall <strong>${hours(actual)}</strong></span></div><p class="meter-caption">${count} ${type === 'Konsert' ? count === 1 ? 'genomförd konsert' : 'genomförda konserter' : count === 1 ? 'genomfört tillfälle' : 'genomförda tillfällen'}</p></div>`;
    }).join('')}</div>`;
  }
  function costsChart() {
    const entries = [['Arbetstid', data.laborCost, '#2d6ce1'], ...['Resor', 'Logi', 'Extra instrument', 'Övriga tillägg'].map((category, index) => [category, D.sum(data.expenses.filter(item => item.category === category), 'amount'), ['#1d8879', '#9563bc', '#c08b21', '#7f91a7'][index]])];
    return `<div class="bars">${entries.map(([label, value, color]) => `<div><div class="bar-label"><span>${label}</span><strong>${money(value)}</strong></div><div class="track"><span style="width:${data.cost ? value / data.cost * 100 : 0}%;background:${color}"></span></div></div>`).join('')}</div><div class="cost-total"><span>Totalt redovisat</span><strong>${money(data.cost)}</strong></div><p class="report-note">${money(D.sum(data.expenses.filter(item => item.status !== 'Attesterat'), 'amount'))} inväntar attest. Inkluderat i redovisat belopp.</p>`;
  }
  function productionRows() {
    return data.productions.map(production => {
      const slice = D.select(production.id, $('#period').value);
      return { id: production.id, kind: 'production', name: production.name, count: D.staffRows(slice).length, planned: slice.planned, actual: slice.actual, cost: slice.cost, budget: slice.budget, state: production.status };
    });
  }
  function overview() {
    let model;
    if ($('#production').value === 'all') {
      model = { title: 'Jämförelse per produktion', columns: [column('name', 'Produktion'), column('count', 'Resurser', true), column('planned', 'Publicerad plan', true, hours), column('actual', 'Rapporterat', true, hours), column('cost', 'Kostnad', true, money)], rows: productionRows() };
    } else {
      const staff = D.staffRows(data);
      const roleNames = ['Dirigent', 'Konsertmästare', 'Violinist', 'Flöjtist', 'Klarinettist', 'Tekniker'];
      const rows = [...roleNames, 'Övriga roller'].map(role => {
        const members = staff.filter(person => role === 'Övriga roller' ? !roleNames.includes(person.role) : person.role === role);
        return { role, count: members.length, planned: D.sum(members, 'scheduled'), actual: D.sum(members, 'actual') };
      }).filter(row => row.count);
      model = { title: 'Bemanning per roll', columns: [column('role', 'Bemanningsroll'), column('count', 'Personer', true), column('planned', 'Schemalagt', true, hours), column('actual', 'Rapporterat', true, hours)], rows };
    }
    reportModel = model;
    return `<div class="section-heading"><h2>Tid per planeringstyp</h2><p>Persontimmar · Aktuellt schema i förhållande till publicerad plan</p></div>${meters()}<div class="overview-bottom"><section><div class="section-heading"><h2>${model.title}</h2><button type="button" class="text-button" data-view="staff">Visa alla resurser ${icon('arrow-right')}</button></div>${table(model, { totals: true })}</section><section><div class="section-heading"><h2>Personalkostnader</h2><button type="button" class="text-button" data-view="costs">Visa underlag ${icon('arrow-right')}</button></div>${costsChart()}</section></div>`;
  }
  function reportToolbar(title, options = '') {
    return `<div class="report-toolbar"><h2>${title}</h2>${options}<input type="search" id="report-search" class="report-search" placeholder="Sök i rapporten" aria-label="Sök i rapporten" value="${escape(state.query)}"></div>`;
  }
  function matching(row) { return Object.values(row).some(value => String(value ?? '').toLocaleLowerCase('sv').includes(state.query.toLocaleLowerCase('sv'))); }
  function staff() {
    const rows = D.staffRows(data).map(person => ({ ...person, kind: 'person', state: person.pending ? 'Tidrapport saknas' : person.reasons.length ? person.reasons.join(', ') : 'Rapporterat' })).filter(row => (state.group === 'all' || row.category === state.group) && matching(row));
    reportModel = { title: 'Bemanning och deltagande', columns: [column('name', 'Person'), column('role', 'Bemanningsroll'), column('planned', 'Publicerad plan', true, hours), column('scheduled', 'Aktuellt schema', true, hours), column('actual', 'Rapporterat', true, hours), column('difference', 'Avvikelse¹', true, delta), column('sessions', 'Deltagna tillfällen', true), column('state', 'Status', false, (value, row) => status(value, row.pending ? 'yellow' : row.reasons?.length ? 'red' : 'green'))], rows };
    return reportToolbar(`Bemanning och deltagande · ${rows.length} ${rows.length === 1 ? 'person' : 'personer'}`, `<select id="resource-group" aria-label="Resurstyp"><option value="all">Alla resurser</option><option value="Musiker" ${state.group === 'Musiker' ? 'selected' : ''}>Musiker</option><option value="Teknik" ${state.group === 'Teknik' ? 'selected' : ''}>Teknik</option></select>`) + table(reportModel, { sort: true }) + '<p class="report-note">¹ Rapporterad tid minus aktuellt schema för tidrapporterade pass. Inställda tillfällen ligger kvar i den publicerade planen.</p>';
  }
  function sessionRows() {
    return data.sessions.map(session => {
      const rows = data.assignments.filter(item => item.session === session.id);
      return { ...session, kind: 'session', name: productionName(session.production), time: `${session.start}–${session.end}`, planned: D.sum(rows, 'planned'), scheduled: D.sum(rows, 'scheduled'), actual: D.sum(rows, 'actual'), state: session.cancelled ? 'Inställd' : rows.some(row => row.actual === null) ? 'Tidrapport saknas' : 'Genomförd' };
    });
  }
  const sessionColumns = [column('name', 'Produktion'), column('date', 'Datum', false, day), column('time', 'Tid'), column('type', 'Planeringstyp'), column('planned', 'Publicerad plan', true, hours), column('scheduled', 'Aktuellt schema', true, hours), column('actual', 'Rapporterat', true, hours), column('state', 'Status', false, value => status(value, ['Inställd', 'Inställd konsert', 'Frånvaro'].includes(value) ? 'red' : ['Genomförd', 'Rapporterat'].includes(value) ? 'green' : 'yellow'))];
  function timeReport() {
    reportModel = { title: 'Tid och genomförande', columns: sessionColumns, rows: sessionRows().filter(matching) };
    return reportToolbar('Tid och genomförande') + table(reportModel, { sort: true }) + '<p class="report-note">Tiderna i schemat är klockslag. Summeringarna är persontimmar för samtliga resurser på tillfället.</p>';
  }
  function costReport() {
    const labor = data.productions.map(production => ({ id: production.id, kind: 'labor', name: production.name, date: dateEnd(production.id), person: 'Samtliga tidrapporterade resurser', category: 'Arbetstid', amount: D.select(production.id, $('#period').value).laborCost, state: 'Tidunderlag' }));
    const entries = data.expenses.map(item => ({ ...item, kind: 'expense', name: productionName(item.production), person: personName(item.person), state: item.status }));
    reportModel = { title: 'Kostnadsunderlag', columns: [column('name', 'Produktion'), column('date', 'Datum', false, day), column('person', 'Resurs / underlag'), column('category', 'Kostnadsslag'), column('amount', 'Redovisat belopp', true, money), column('state', 'Status', false, value => status(value, value === 'Inväntar attest' ? 'yellow' : 'green'))], rows: [...labor, ...entries].filter(matching) };
    return reportToolbar('Kostnadsunderlag') + facts([['Personalbudget', money(data.budget)], ['Rapporterad kostnad', money(data.cost)], ['Budget minus redovisat', money(data.budget - data.cost)]]) + table(reportModel, { sort: true }) + '<p class="report-note">Arbetstid beräknas med fiktiva timkostnader inklusive påslag. Kvitton inkluderar även ej attesterade poster. Ej rapporterad tid ingår inte; beloppet är inte en slutkostnadsprognos.</p>';
  }
  function dateEnd(id) { return data.sessions.filter(session => session.production === id).map(session => session.date).sort().at(-1); }
  function deviationReport() {
    reportModel = { title: 'Avvikelser', columns: [column('title', 'Avvikelse'), column('subject', 'Berörd resurs / produktion'), column('date', 'Datum', false, day), column('effect', 'Påverkan'), column('tone', 'Uppföljning', false, (_, row) => status('Se underlag', row.tone))], rows: D.deviations(data).filter(matching) };
    return reportToolbar('Avvikelser') + table(reportModel, { sort: true }) + '<p class="report-note">Avvikelser är inte automatiskt likställda med besparingar eller bristande bemanning. Orsaken framgår av underlaget.</p>';
  }
  function renderContent() {
    if (!data.sessions.length) {
      reportModel = { title: 'Tomt urval', columns: [], rows: [] };
      $('#content').innerHTML = `<div class="empty-state">${icon('calendar-xmark')}<h2>Inget underlag för den valda perioden</h2><p>Det finns inga tillfällen eller kostnader som matchar urvalet.</p><button type="button" class="command" id="reset-period">Visa september 2026</button></div>`;
      return;
    }
    $('#content').innerHTML = ({ overview, staff, time: timeReport, costs: costReport, deviations: deviationReport }[state.tab])();
  }
  function render() {
    data = D.select($('#production').value, $('#period').value);
    const production = D.productions.find(item => item.id === $('#production').value);
    $('#page-title').innerHTML = `${escape(production?.name || 'Alla produktioner')} <span>· Produktionsuppföljning</span>`;
    $('#production-meta').textContent = production ? `${production.subtitle} · ${production.status} · Schema publicerat ${day(production.published)}` : 'Konsertverksamhet · Jämförelse av produktioner och rapporterat utfall';
    $('#filter-context').textContent = `${data.productions.length} produktion${data.productions.length === 1 ? '' : 'er'} · ${data.sessions.length} tillfällen`;
    summary();
    document.querySelectorAll('[data-tab]').forEach(tab => { const active = tab.dataset.tab === state.tab; tab.setAttribute('aria-selected', active); tab.tabIndex = active ? 0 : -1; });
    $('#content').setAttribute('aria-labelledby', `tab-${state.tab}`);
    document.querySelectorAll('.nav-links a').forEach(link => { const active = link.id === 'follow-up' ? state.tab === 'overview' && $('#production').value !== 'all' : link.dataset.view === state.tab && link.id !== 'follow-up' && state.tab !== 'overview' || link.dataset.view === 'productions' && $('#production').value === 'all' && state.tab === 'overview'; link.classList.toggle('active', active); if (active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current'); });
    renderContent();
  }
  function setView(tab) {
    if (tab === 'productions') { $('#production').value = 'all'; tab = 'overview'; }
    if (!['overview', 'staff', 'time', 'costs', 'deviations'].includes(tab)) return;
    state.tab = tab; state.query = ''; state.group = 'all'; state.sort = ''; state.direction = 1;
    history.replaceState(null, '', `#${tab}`);
    closeNav(); render();
  }
  function showPerson(id) {
    const person = D.staffRows(data).find(item => item.id === id);
    const rows = data.assignments.filter(item => item.person === id).map(item => { const session = D.sessions.find(s => s.id === item.session); return { ...item, name: productionName(item.production), time: `${session.start}–${session.end}`, state: item.reason || 'Rapporterat' }; });
    openDetail(person.name, facts([['Bemanningsroll', person.role], ['Publicerad plan', hours(person.planned)], ['Rapporterad tid', hours(person.actual)]]) + table({ title: 'Personens tidsunderlag', columns: sessionColumns, rows }) + `<p class="report-note">${person.pending ? 'Minst en tidrapport saknas. Totalen visar bara inkomna rapporter.' : 'Samtliga tillfällen för personen inom valt urval.'}</p>`);
  }
  function detail(kind, id) {
    if (kind === 'person') return showPerson(id);
    if (kind === 'production') { $('#production').value = id; setView('overview'); return; }
    if (kind === 'session') {
      const session = data.sessions.find(item => item.id === id);
      const rows = data.assignments.filter(item => item.session === id).map(item => ({ ...item, name: personName(item.person), role: D.people.find(p => p.id === item.person).role, state: item.reason || 'Rapporterat' }));
      return openDetail(`${productionName(session.production)} · ${session.type}`, facts([['Datum', day(session.date)], ['Tid', `${session.start}–${session.end}`], ['Status', session.cancelled ? 'Inställd efter publicering' : 'Genomförd']]) + table({ title: 'Deltagare per tillfälle', columns: [column('name', 'Person'), column('role', 'Roll'), column('planned', 'Publicerad plan', true, hours), column('actual', 'Rapporterat', true, hours), column('state', 'Kommentar')], rows }));
    }
    if (kind === 'labor') {
      const slice = D.select(id, $('#period').value);
      return openDetail(`${productionName(id)} · Kostnad för arbetstid`, table({ title: 'Personalkostnad', columns: [column('name', 'Person'), column('role', 'Roll'), column('actual', 'Rapporterat', true, hours), column('rate', 'Timkostnad', true, money), column('amount', 'Kostnad', true, money)], rows: D.staffRows(slice).map(person => ({ ...person, amount: person.actual * person.rate })) }, { totals: false }));
    }
    const item = D.expenses.find(item => item.id === id);
    openDetail(`${item.category} · ${productionName(item.production)}`, facts([['Resurs', personName(item.person)], ['Belopp', money(item.amount)], ['Status', item.status]]) + `<p>${escape(item.description)}</p><p class="muted">Fiktiv kvittopost. Inget verkligt kvitto eller utbetalningsunderlag är bifogat.</p>`);
  }
  function exportCsv() {
    if (!reportModel.rows.length) return notice('Det finns inga rader att exportera.');
    const cell = value => { let text = typeof value === 'number' ? String(value).replace('.', ',') : String(value ?? ''); if (typeof value !== 'number' && /^[=+@-]/.test(text)) text = "'" + text; return `"${text.replace(/"/g, '""')}"`; };
    const meta = [['Rapport', reportModel.title], ['Produktion', $('#production').selectedOptions[0].text], ['Period', $('#period').selectedOptions[0].text], ['Verksamhet', $('#operation').selectedOptions[0].text], ['Underlag', 'Fiktiva demodata'], ['Publicerad plan (h)', data.planned], ['Aktuellt schema (h)', data.scheduled], ['Rapporterad tid (h)', data.actual], ['Tidrapport saknas (h)', data.pending], ['Personalbudget (kr)', data.budget], ['Rapporterad kostnad (kr)', data.cost], []];
    const lines = [...meta, reportModel.columns.map(col => col.label), ...reportModel.rows.map(row => reportModel.columns.map(col => col.key === 'tone' ? 'Se underlag' : row[col.key]))];
    const blob = new Blob(['\ufeff' + lines.map(row => row.map(cell).join(';')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `produktionsuppfoljning-${$('#production').value}-${state.tab}.csv`; link.hidden = true; document.body.append(link); link.click(); setTimeout(() => { link.remove(); URL.revokeObjectURL(url); }, 1000); notice(`CSV-fil skapad med ${reportModel.rows.length} rader.`);
  }
  function closeNav() { document.body.classList.remove('nav-open'); $('#nav-backdrop').hidden = true; $('#mobile-menu').setAttribute('aria-expanded', 'false'); }
  $('#filters').addEventListener('submit', event => event.preventDefault());
  $('#filters').addEventListener('change', () => { state.query = ''; state.sort = ''; render(); });
  $('#compare').addEventListener('click', () => { $('#production').value = 'all'; setView('overview'); });
  $('#export').addEventListener('click', exportCsv);
  $('#print').addEventListener('click', () => window.print());
  $('#close-detail').addEventListener('click', () => $('#detail').close());
  $('#detail').addEventListener('click', event => { if (event.target === $('#detail') && event.clientX < $('#detail').getBoundingClientRect().left) $('#detail').close(); });
  $('#definitions').addEventListener('click', () => openDetail('Definitioner & beräkningsunderlag', '<h3>Publicerad plan</h3><p>Persontimmar i det ursprungligen publicerade schemat. Behålls även om ett tillfälle senare ställs in.</p><h3>Aktuellt schema</h3><p>Publicerad plan efter schemaändringar. Inställda tillfällen räknas som 0 schemalagda timmar.</p><h3>Rapporterad tid och nyttjad schematid</h3><p>Summerad faktiskt rapporterad tid. Nyttjad schematid = rapporterad tid / aktuellt schema för pass där tid har rapporterats. Saknad tidrapport är inte noll arbetade timmar. Måttet är inte ett mått på anställningsgrad eller total tillgänglighet.</p><h3>Kostnader</h3><p>Rapporterade timmar × fiktiv timkostnad inklusive påslag, plus samtliga redovisade kvitton och tillägg. Ej attesterade utlägg särredovisas men ingår i totalen. Personalbudgeten omfattar både arbetstid och utlägg.</p><h3>Datakälla</h3><p>Alla namn, scheman, belopp och avvikelser är fiktiva. Rapportdatum är 22 september 2026. Ingen information hämtas från Pegasus.</p>'));
  document.addEventListener('click', event => {
    const button = event.target.closest('button, a'); if (!button) return;
    if (button.dataset.view) { event.preventDefault(); setView(button.dataset.view); }
    if (button.dataset.tab) setView(button.dataset.tab);
    if (button.dataset.detail) detail(button.dataset.detail, button.dataset.id);
    if (button.dataset.schedule) {
      if (button.dataset.schedule === 'production' || button.dataset.schedule === 'labor') { $('#production').value = button.dataset.id; setView('time'); }
      else detail(button.dataset.schedule, button.dataset.id);
    }
    if (button.dataset.sort) { state.direction = state.sort === button.dataset.sort ? -state.direction : 1; state.sort = button.dataset.sort; renderContent(); }
    if (button.id === 'reset-period') { $('#period').value = 'september'; render(); }
  });
  $('#content').addEventListener('input', event => { if (event.target.id !== 'report-search') return; const start = event.target.selectionStart; state.query = event.target.value; renderContent(); const input = $('#report-search'); input.focus(); if (input.setSelectionRange && input.type !== 'search') input.setSelectionRange(start, start); });
  $('#content').addEventListener('change', event => { if (event.target.id === 'resource-group') { state.group = event.target.value; renderContent(); } });
  $('#tabs').addEventListener('keydown', event => { const tabs = [...document.querySelectorAll('[data-tab]')]; let index = tabs.indexOf(document.activeElement); if (index < 0 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return; event.preventDefault(); index = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length; setView(tabs[index].dataset.tab); tabs[index].focus(); });
  $('#nav-search').addEventListener('input', event => document.querySelectorAll('.nav-links a').forEach(link => { link.hidden = !link.textContent.toLocaleLowerCase('sv').includes(event.target.value.toLocaleLowerCase('sv')); }));
  $('#collapse-sidebar').addEventListener('click', () => { if (innerWidth <= 850) return closeNav(); const collapsed = document.body.classList.toggle('nav-collapsed'); $('#sidebar').classList.toggle('saClosed', collapsed); $('#sidebar nav').classList.toggle('saMinimized', collapsed); $('#sidebar nav').classList.toggle('saExpanded', !collapsed); $('#collapse-sidebar').setAttribute('aria-expanded', !collapsed); $('#collapse-sidebar').title = collapsed ? 'Expandera menyn' : 'Minimera menyn'; $('#collapse-sidebar').setAttribute('aria-label', $('#collapse-sidebar').title); $('#collapse-sidebar').innerHTML = icon(collapsed ? 'angles-right' : 'angles-left'); });
  $('#mobile-menu').addEventListener('click', () => { document.body.classList.remove('nav-collapsed'); document.body.classList.add('nav-open'); $('#nav-backdrop').hidden = false; $('#mobile-menu').setAttribute('aria-expanded', 'true'); });
  $('#nav-backdrop').addEventListener('click', closeNav);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeNav(); });
  window.addEventListener('hashchange', () => setView(location.hash.slice(1)));
  setView(['overview', 'staff', 'time', 'costs', 'deviations'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'overview');
}());
