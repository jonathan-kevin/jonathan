(function () {
  'use strict';
  const D = window.ProductionData;
  const $ = selector => document.querySelector(selector);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num = value => new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 1 }).format(value);
  const hours = value => value === null ? 'Ej rapporterat' : `${num(value)} h`;
  const money = value => `${num(Math.round(value))} kr`;
  const day = value => new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'short' }).format(new Date(value + 'T12:00:00'));
  const icon = name => `<i class="far fa-${name} saIcon" aria-hidden="true"></i>`;
  const pname = id => D.productions.find(p => p.id === id).name;
  const person = id => D.people.find(p => p.id === id);
  const tabs = [['overview','Uppföljning','chart-column'],['staff','Bemanning','users'],['time','Tid & genomförande','calendar-days'],['costs','Kostnader','file-invoice-dollar'],['deviations','Avvikelser','triangle-exclamation'],['history','Publiceringshistorik','clock-rotate-left']];
  const state = { production: 'bancroft', tab: 'overview', period: 'september', operation: 'concert', query: '', group: '', resource: 'all', sort: '', direction: 1 };
  let data, reportModel, toastTimer;
  const col = (key, label, format = null, numeric = false) => ({ key, label, format, numeric });
  const hourCol = (key, label) => col(key, label, hours, true);
  const delta = value => `${value > 0 ? '+' : ''}${hours(value)}`;
  const deltaCol = col('difference', 'Avvikelse', delta, true);
  function status(text) {
    const tone = /frånvaro|inställd/i.test(text) ? 'iconred' : /saknas|inväntar|förlängd|behov/i.test(text) ? 'iconyellow' : 'icongreen';
    return `<span><span class="systemicon saSystemIcon"><i class="fas fa-circle icon saIcon ${tone}" aria-hidden="true"></i></span>${esc(text)}</span>`;
  }
  function command(text, glyph, attrs = '') {
    return `<button class="saTopLink saActionLink saButtonSecondary" type="button" ${attrs}><div class="saIconHolder saOptionIcon">${icon(glyph)}</div><span class="saButtonText saOptionText">${esc(text)}</span></button>`;
  }
  function fields(values) {
    return values.map(([label, value]) => `<div class="saInfoBoxCol"><div class="saInfoBoxLabel">${esc(label)}</div><p class="saInfoBoxContent"><span class="saInfoBoxTextContent">${value}</span></p></div>`).join('');
  }
  function infoBox(title, content) {
    return `<div class="saCol"><div class="saInfoBox saOpen">${title ? `<button class="saInfoBoxHeading saInfoBoxHeadingButton" type="button" data-collapse-info aria-expanded="true"><div class="saInfoBoxHeaderWrapper"><h3>${esc(title)}</h3></div><i class="far fa-angle-down saIcon saInfoBoxExpandIcon"></i></button>` : ''}<div class="saInfoBoxInner">${content}</div></div></div>`;
  }
  function infoArea(boxes, extra = '') {
    return `<softadmin-infosql class="infoarea saInfoArea"><div class="saInfoBoxAreaWrapper"><div class="saInfoBoxArea ${extra}"><div class="saRowWrapper"><div class="saColWrapper">${boxes.join('')}</div></div></div></div></softadmin-infosql>`;
  }
  function kpi(label, value, suffix, note) {
    return infoBox('', `<div class="saInfoBoxCol"><div class="saInfoBoxContent"><div class="saInfoSqlKpiWrapper"><div class="saKpiOuter"><span class="saKpiHeading">${label}</span><div class="saKpiWrapper"><div class="saKpi"><span class="saKpiValue">${num(value)}</span><span class="saKpiSuffix">${suffix}</span></div></div></div></div></div><div class="saInfoBoxLabel">${note}</div></div>`);
  }
  function openDialog(title, html) {
    $('#detail-title').textContent = title; $('#detail-body').innerHTML = html;
    if (!$('#detail').open) $('#detail').showModal();
  }
  function notice(text) {
    clearTimeout(toastTimer); $('#toast').textContent = text; $('#toast').hidden = false;
    toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 4000);
  }
  function actions(row) {
    const name = row.name || row.title || row.subject || row.type;
    return `<ul><li><button type="button" class="saGridRowButton" data-detail="${row.kind}" data-id="${row.id}" title="Visa detaljer" aria-label="Visa detaljer: ${esc(name)}"><i class="fas fa-eye saIcon"></i></button></li><li><button type="button" class="saGridRowButton" data-schedule="${row.kind}" data-id="${row.id}" title="Visa tidsunderlag" aria-label="Visa tidsunderlag: ${esc(name)}" ${row.cancelled || row.kind === 'expense' ? 'disabled' : ''}>${icon('calendar-days')}</button></li></ul>`;
  }
  function grid(model, { interactive = false, totals = false } = {}) {
    let rows = [...model.rows];
    if (interactive && state.sort) rows.sort((a,b) => (typeof a[state.sort] === 'number' ? a[state.sort] - b[state.sort] : String(a[state.sort] ?? '').localeCompare(String(b[state.sort] ?? ''), 'sv')) * state.direction);
    model.rows = rows;
    const rowActions = rows.some(row => row.kind);
    const renderRow = row => `<tr class="saGridRow">${rowActions ? `<td class="saGridRowControls">${actions(row)}</td>` : ''}${model.columns.map(c => `<td ${c.numeric ? 'class="right"' : ''}><div class="saGridCell ${['effect','state','role','description'].includes(c.key) ? 'wrap-cell' : ''}">${c.format ? c.format(row[c.key], row) : esc(row[c.key])}</div></td>`).join('')}</tr>`;
    const groups = model.columns.filter(c => !c.numeric && !['name','date','time','effect','description'].includes(c.key));
    let body = rows.map(renderRow).join('');
    if (interactive && groups.some(c => c.key === state.group)) {
      const grouped = new Map();
      for (const row of rows) { const key = String(row[state.group]); if (!grouped.has(key)) grouped.set(key, []); grouped.get(key).push(row); }
      body = [...grouped].map(([key, items]) => `<tr class="saGridGroupedRowsHeader"><th colspan="${model.columns.length + Number(rowActions)}">${esc(key)} (${items.length})</th></tr>${items.map(renderRow).join('')}`).join('');
    }
    return `<softadmin-grid class="grid saMenuItemRoot"><div class="maincolbody listpage saNotUsingAccessibilityMode"><div class="grid-scroll"><div class="saGridWrapper">${interactive ? `<div class="saGridTop"><div class="saGridTopInner"><div class="saGridHitCounter">${rows.length} träffar</div><div class="saButtons"><label class="saInputTextWrapper saLabeled saGroupingGrid ${state.group ? 'saIsGrouped' : ''}"><span class="saLabeledLabel saGroupingGridLabel">Gruppera på</span><div class="saTrailingIconsWrapper">${icon('angle-down')}</div><select id="grouping" class="saInputText saDropdown saGridGroupingDropdown" aria-label="Gruppera på"><option value="">(Ingenting)</option>${groups.map(c=>`<option value="${c.key}" ${state.group === c.key ? 'selected' : ''}>${esc(c.label)}</option>`).join('')}</select></label><button class="saGridButton saExcel" type="button" data-export title="Exportera till CSV" aria-label="Exportera till CSV">${icon('file-excel')}</button></div></div></div>` : ''}<table class="saGrid" aria-label="${esc(model.title)}"><caption>${esc(model.title)}</caption><thead class="saGridHead"><tr class="saGridHeadingRow">${rowActions ? '<th class="saGridRowControls saGridSpecialHeader" scope="col" aria-label="Åtgärder"><ul></ul></th>' : ''}${model.columns.map(c=>`<th scope="col" ${interactive && state.sort === c.key ? `aria-sort="${state.direction === 1 ? 'ascending' : 'descending'}"` : ''}>${interactive ? `<a role="button" tabindex="0" class="saGridHeadingInner sort ${state.sort === c.key ? 'saSorted' : ''}" data-sort="${c.key}"><span class="saGridHeadingLabel">${esc(c.label)}</span>${state.sort === c.key ? `<i class="fas fa-caret-${state.direction === 1 ? 'up' : 'down'} saIcon"></i>` : ''}</a>` : `<span class="saGridHeadingInner"><span class="saGridHeadingLabel">${esc(c.label)}</span></span>`}</th>`).join('')}</tr></thead><tbody>${body || `<tr class="saGridRow"><td colspan="${model.columns.length + Number(rowActions)}"><div class="saGridCell">Inga träffar.</div></td></tr>`}</tbody>${totals && rows.length ? `<tfoot><tr>${rowActions ? '<td></td>' : ''}${model.columns.map((c,index)=>`<td ${c.numeric ? 'class="right"' : ''}><div class="saGridCell">${index === 0 ? 'Totalt' : c.numeric ? c.format ? c.format(D.sum(rows,c.key)) : num(D.sum(rows,c.key)) : ''}</div></td>`).join('')}</tr></tfoot>` : ''}</table></div></div></div></softadmin-grid>`;
  }
  function searchControls(extra = '') {
    return `<div class="report-controls"><div class="saInputTextWrapper saInputPageField saHasLeadingIcon"><div class="saLeadingIconWrapper">${icon('magnifying-glass')}</div><input class="saInputText" id="report-search" type="search" aria-label="Sök i rapporten" placeholder="Sök i rapporten" value="${esc(state.query)}"></div>${extra}</div>`;
  }
  function matches(row) { return Object.values(row).some(value => String(value ?? '').toLocaleLowerCase('sv').includes(state.query.toLocaleLowerCase('sv'))); }
  const timeColumns = [col('name','Produktion'),col('date','Datum',day),col('time','Tid'),col('type','Planeringstyp'),hourCol('planned','Publicerad plan'),hourCol('scheduled','Aktuellt schema'),hourCol('actual','Rapporterat'),col('state','Status',status)];
  function timeRows(slice = data) {
    return slice.sessions.map(s => { const rows = slice.assignments.filter(a => a.session === s.id); return {...s, kind:'session', name:pname(s.production), time:`${s.start}–${s.end}`, planned:D.sum(rows,'planned'), scheduled:D.sum(rows,'scheduled'), actual:D.sum(rows,'actual'), state:s.cancelled ? 'Inställd' : rows.some(a=>a.actual === null) ? 'Tidrapport saknas' : 'Genomförd'}; });
  }
  function productionRows() {
    return data.productions.map(p => { const slice = D.select(p.id,state.period); return {id:p.id,kind:'production',name:p.name,date:slice.sessions[0].date,end:slice.sessions.at(-1).date,count:D.staffRows(slice).length,planned:slice.planned,scheduled:slice.scheduled,actual:slice.actual,cost:slice.cost,budget:slice.budget,state:p.status}; });
  }
  function meters() {
    return infoArea(['Repetition','Genrep','Konsert'].map((type,index)=> {
      const rows = data.assignments.filter(a=>a.type === type);
      const planned = D.sum(rows,'planned'), scheduled = D.sum(rows,'scheduled'), actual = D.sum(rows,'actual');
      const fraction = planned ? Math.min(1,scheduled/planned) : 0;
      return infoBox('', `<div class="saInfoBoxCol"><div class="saInfoBoxContent"><div class="saInfoSqlMeterWrapper"><div class="saMeterOuter"><h3 class="saMeterHeading">${type}</h3><svg viewBox="0 0 260 130" role="img" aria-label="${type}: ${hours(scheduled)} schemalagt av ${hours(planned)} publicerat"><path class="saMeterUnreachedValue saMeterValue" fill="none" d="M60,115 A70,70 0 0 1 200,115"/><path class="saMeterValue ${index === 2 ? 'saMeterYellow' : 'saMeterGreen'}" fill="none" d="M60,115 A70,70 0 0 1 200,115" pathLength="100" stroke-dasharray="${fraction*100} 100"/><text class="saMeterValueText" x="130" y="115"><tspan font-size="32">${num(scheduled)}</tspan><tspan font-size="16" dx="3">h</tspan></text></svg></div></div></div></div><div class="meter-details">${fields([['Publicerad plan',hours(planned)],['Rapporterad tid',hours(actual)]])}</div>`);
    }));
  }
  function overview() {
    const staff = D.staffRows(data);
    const denominator = data.scheduled - data.pending;
    let html = infoArea([kpi('Bemannade resurser',staff.length,'personer',`${staff.filter(p=>p.category === 'Musiker').length} musiker · ${staff.filter(p=>p.category === 'Teknik').length} tekniker`),kpi('Rapporterad tid',data.actual,'h',`Aktuellt schema ${hours(data.scheduled)}`),kpi('Nyttjad schematid',denominator ? data.actual/denominator*100 : 0,'%',data.pending ? `${hours(data.pending)} saknar rapport` : 'Rapporterat / aktuellt schema'),kpi('Personalkostnad',data.cost/1000,'tkr',`Budget ${money(data.budget)}`)]);
    const issues = D.deviations(data);
    if (issues.length) html += `<softadmin-infosql class="infoarea saInfoArea"><div class="saWarningArea"><div class="saWarningBox saWarning"><div class="saIcon"><i class="fas fa-triangle-exclamation"></i></div><div class="saContent"><span>${issues.length} ${issues.length === 1 ? 'avvikelse' : 'avvikelser'} i urvalet.${data.pending ? ` ${hours(data.pending)} saknar tidrapport.` : ''}${data.sessions.some(s=>s.cancelled) ? ' Ett tillfälle har ställts in efter publicering.' : ''}</span></div><div class="saActionWrapper"><a class="saAction" href="#${state.production}/deviations" data-route="deviations">Visa avvikelser</a></div><div class="saPadding"></div></div></div></softadmin-infosql>`;
    html += `<section class="report-section"><h2>Schemalagd tid per planeringstyp</h2>${meters()}</section>`;
    const roles = [...new Set(staff.map(p=>p.role))].map(role=>({role,count:staff.filter(p=>p.role===role).length,scheduled:D.sum(staff.filter(p=>p.role===role),'scheduled'),actual:D.sum(staff.filter(p=>p.role===role),'actual')}));
    reportModel = state.production === 'all' ? {title:'Uppföljning per produktion',columns:[col('name','Produktion'),hourCol('planned','Publicerad plan'),hourCol('scheduled','Aktuellt schema'),hourCol('actual','Rapporterat'),col('cost','Kostnad',money,true)],rows:productionRows()} : {title:'Bemanning per roll',columns:[col('role','Bemanningsroll'),col('count','Personer',num,true),hourCol('scheduled','Schemalagt'),hourCol('actual','Rapporterat')],rows:roles};
    html += `<section class="report-section"><h2>${reportModel.title}</h2>${grid(reportModel,{totals:true})}</section>`;
    return html;
  }
  function productions() {
    reportModel = {title:'Produktioner',columns:[col('name','Produktion'),col('date','Från',day),col('end','Till',day),col('count','Resurser',num,true),hourCol('planned','Publicerad plan'),hourCol('actual','Rapporterat'),col('cost','Personalkostnad',money,true),col('state','Status',status)],rows:productionRows().filter(matches)};
    return searchControls()+grid(reportModel,{interactive:true});
  }
  function staff() {
    const rows = D.staffRows(data).map(p=>({...p,kind:'person',state:p.pending ? 'Tidrapport saknas' : p.reasons.join(', ') || 'Rapporterat'})).filter(p=>(state.resource === 'all' || p.category === state.resource)&&matches(p));
    reportModel = {title:'Bemanning',columns:[col('name','Namn'),col('role','Bemanningsroll'),hourCol('planned','Publicerad plan'),hourCol('scheduled','Aktuellt schema'),hourCol('actual','Rapporterat'),deltaCol,col('sessions','Deltagna tillfällen',num,true),col('state','Status',status)],rows};
    return searchControls(`<label class="saInputTextWrapper saLabeled saHasTrailingIcons"><span class="saLabeledLabel">Resurstyp</span><select id="resource-type" class="saInputText saDropdown" aria-label="Resurstyp">${[['all','Alla resurser'],['Musiker','Musiker'],['Teknik','Teknik']].map(([v,t])=>`<option value="${v}" ${state.resource===v?'selected':''}>${t}</option>`).join('')}</select><div class="saTrailingIconsWrapper">${icon('angle-down')}</div></label>`)+grid(reportModel,{interactive:true});
  }
  function time() {
    reportModel={title:'Tid & genomförande',columns:timeColumns,rows:timeRows().filter(matches)};
    return searchControls()+grid(reportModel,{interactive:true});
  }
  function costs() {
    const labor = data.productions.map(p=>({id:p.id,kind:'labor',name:p.name,date:data.sessions.filter(s=>s.production===p.id).at(-1).date,resource:'Samtliga tidrapporterade resurser',category:'Arbetstid',amount:D.select(p.id,state.period).laborCost,state:'Tidunderlag'}));
    const expenses=data.expenses.map(e=>({...e,kind:'expense',name:pname(e.production),resource:person(e.person).name,state:e.status}));
    reportModel={title:'Kostnadsunderlag',columns:[col('name','Produktion'),col('date','Datum',day),col('resource','Resurs / underlag'),col('category','Kostnadsslag'),col('amount','Redovisat belopp',money,true),col('state','Status',status)],rows:[...labor,...expenses].filter(matches)};
    return infoArea([infoBox('Budget och utfall',fields([['Personalbudget',money(data.budget)],['Rapporterad personalkostnad',money(data.cost)]])),infoBox('Attest och återstående budget',fields([['Kvitton som inväntar attest',money(D.sum(data.expenses.filter(e=>e.status!=='Attesterat'),'amount'))],['Budget minus redovisat',money(data.budget-data.cost)]]))])+searchControls()+grid(reportModel,{interactive:true,totals:true});
  }
  function deviations() {
    reportModel={title:'Avvikelser',columns:[col('title','Avvikelse',status),col('subject','Resurs / produktion'),col('date','Datum',day),col('effect','Påverkan')],rows:D.deviations(data).filter(matches)};
    return searchControls()+grid(reportModel,{interactive:true});
  }
  function publicationHistory() {
    const rows=data.productions.flatMap(p=>[
      {name:p.name,date:p.published,phase:'Schema publicerat',description:`${hours(D.select(p.id,state.period).planned)} publicerade. Synligt för berörda resurser.`},
      {name:p.name,date:p.changed,phase:p.id==='bancroft'?'Schema ändrat':'Uppföljning',description:p.id==='bancroft'?'Konserten 19 september inställd. 64 persontimmar borttagna från aktuellt schema. Publicerad plan bevaras.':p.id==='pintscher'?'Genomförande klart. 3 timmar inväntar tidrapport.':'Genomförandet avslutat. Tid och kostnader tillgängliga för uppföljning.'}
    ]).filter(matches);
    reportModel={title:'Publiceringshistorik',columns:[col('name','Produktion'),col('date','Datum',day),col('phase','Händelse'),col('description','Beskrivning')],rows};
    return searchControls()+grid(reportModel,{interactive:true});
  }
  function header() {
    const p=D.productions.find(p=>p.id===state.production);
    const title=state.tab==='productions'?'Produktioner':p?p.name:'Produktionsuppföljning';
    document.title=title+' - Tid och bemanning - Demo';
    $('#pageheader').innerHTML=`<div class="saPageHeader saDesktopHeader"><div class="saHeader"><div class="saRowWrapper"><div class="saTopRow"><nav class="saBreadcrumbs" aria-label="Brödsmulor"><button type="button" class="saBackButton" id="mobile-menu" aria-label="Öppna menyn">${icon('bars')}</button><div class="saBackButtonWrapper"><button class="saBackButton" type="button" data-route="productions" aria-label="Till produktioner">${icon('arrow-left')}</button></div><span class="saBreadcrumb"><a href="#all/productions" data-route="productions">Produktioner</a></span><span class="saBreadcrumbSeparator">&gt;</span><span class="saBreadcrumb saNoLinkBreadcrumb">${state.tab==='productions'?'Sök produktioner':p?'Visa produktion':'Uppföljning'}</span></nav></div><div class="saBottomRow"><div class="saTitle"><h1 class="saHeaderText">${esc(title)}</h1><button type="button" class="saFavoriteToggle" id="favorite" aria-label="Spara favorit" title="Spara favorit" aria-checked="false"><i class="far fa-star saIcon"></i><i class="fas fa-star saIcon"></i></button></div></div><nav class="saNavigationBar" aria-label="Sidnavigering"><div class="saTopButtons"><div class="saActionLinks">${command('Ändra urval','filter','data-filter')}${command('Jämför produktioner','table-columns','data-route="overview" data-production="all"')}${command('Publiceringshistorik','clock-rotate-left','data-route="history"')}${command('Exportera CSV','file-excel','data-export')}${command('Skriv ut','print','data-print')}</div></div></nav></div></div></div>`;
  }
  function context() {
    const p=D.productions.find(p=>p.id===state.production);
    const period=state.period==='autumn'?'Höstterminen 2026':state.period==='august'?'Augusti 2026':'September 2026';
    const boxes=p?[infoBox('Allmän information',fields([['Verksamhet','Konsertverksamhet'],['Produktion',esc(p.subtitle)]])),infoBox('Planering',fields([['Period',period],['Status',status(p.status)]])),infoBox('Publicering',fields([['Schema publicerat',day(p.published)],['Senast ändrad',day(p.changed)]]))]:[infoBox('Urval',fields([['Period',period],['Verksamhet',state.operation==='all'?'Alla verksamheter':'Konsertverksamhet']])),infoBox('Produktioner',fields([['Antal i urvalet',num(data.productions.length)],['Bemannade resurser',`${D.staffRows(data).length} unika personer`]]))];
    $('#context').innerHTML=infoArea(boxes,'context-info');
  }
  function renderPanel() {
    const node=$('#panel');
    if(!data.sessions.length){reportModel={title:'Tomt urval',columns:[],rows:[]};node.innerHTML='<h2>Inget underlag för den valda perioden</h2>'+command('Ändra urval','filter','data-filter');return;}
    node.innerHTML=({overview,productions,staff,time,costs,deviations,history:publicationHistory}[state.tab])();
  }
  function render() {
    data=D.select(state.production,state.period);header();context();
    const isList=state.tab==='productions';
    const title=isList?'Produktioner':tabs.find(t=>t[0]===state.tab)[1];
    const tabHtml=tabs.map(([key,label,glyph])=>`<div><button class="saTab ${state.tab===key?'saSelected':''}" type="button" role="tab" id="tab-${key}" aria-controls="panel" aria-selected="${state.tab===key}" tabindex="${state.tab===key?0:-1}" data-route="${key}"><span>${icon(glyph)}</span><span class="saTabText">${label}</span></button></div>`).join('');
    $('#view').innerHTML=`<softadmin-tabview class="maincolbody saMenuItemRoot saTabView saIFrameTabs"><div class="saTabViewInner">${isList?'':`<div class="saTabGroup" role="tablist" aria-label="Visa produktion">${tabHtml}<div class="saMoreTabWrapper saHidden"></div></div>`}<div class="saTabContent"><div class="iframecontent embedded-view"><div class="embedded-heading"><h2>${title}</h2></div><div id="panel" ${isList?'':`role="tabpanel" aria-labelledby="tab-${state.tab}"`}></div></div></div></div></softadmin-tabview>`;
    renderPanel();
    document.querySelectorAll('.saSideBar a[data-route]').forEach(a=>{const selected=state.production!=='all'?a.dataset.production==='bancroft':state.tab===a.dataset.route&&a.dataset.production==='all';if(selected)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  }
  function route(tab,production=state.production,replace=false) {
    if(!['productions',...tabs.map(t=>t[0])].includes(tab))return;
    if(tab==='productions')production='all';
    if(production!=='all'&&!D.productions.some(p=>p.id===production))return;
    Object.assign(state,{tab,production,query:'',group:'',resource:'all',sort:'',direction:1});
    const hash=`#${production}/${tab}`;
    if(location.hash!==hash)history[replace?'replaceState':'pushState'](null,'',hash);
    closeNav();render();$('.scrollcontent').scrollTop=0;
  }
  function readRoute() {
    const [first,second]=location.hash.slice(1).split('/');
    const tab=second||first||'overview',production=second?first:'bancroft';
    route(['productions',...tabs.map(t=>t[0])].includes(tab)?tab:'overview',production==='all'||D.productions.some(p=>p.id===production)?production:'bancroft',true);
  }
  function detail(kind,id,schedule=false) {
    if(kind==='production'){route(schedule?'time':'overview',id);return;}
    if(kind==='labor'){
      if(schedule){route('time',id);return;}
      const slice=D.select(id,state.period);
      openDialog(`${pname(id)} · Kostnad för arbetstid`,grid({title:'Personalkostnad',columns:[col('name','Namn'),col('role','Roll'),hourCol('actual','Rapporterat'),col('rate','Timkostnad',money,true),col('amount','Kostnad',money,true)],rows:D.staffRows(slice).map(p=>({...p,amount:p.actual*p.rate}))}));return;
    }
    if(kind==='person'){
      const p=D.staffRows(data).find(p=>p.id===id);
      const rows=data.assignments.filter(a=>a.person===id).map(a=>{const s=D.sessions.find(s=>s.id===a.session);return {...a,name:pname(a.production),time:`${s.start}–${s.end}`,state:a.reason||'Rapporterat'};});
      openDialog(p.name,infoArea([infoBox('Resurs',fields([['Bemanningsroll',esc(p.role)],['Publicerad plan',hours(p.planned)],['Rapporterad tid',hours(p.actual)]]))])+grid({title:'Personens tidsunderlag',columns:timeColumns,rows}));return;
    }
    if(kind==='session'){
      const s=data.sessions.find(s=>s.id===id);
      const rows=data.assignments.filter(a=>a.session===id).map(a=>({...a,name:person(a.person).name,role:person(a.person).role,state:a.reason||'Rapporterat'}));
      openDialog(`${pname(s.production)} · ${s.type}`,infoArea([infoBox('Tillfälle',fields([['Datum och tid',`${day(s.date)} · ${s.start}–${s.end}`],['Lokal',esc(s.location)],['Status',status(s.cancelled?'Inställd efter publicering':'Genomförd')]]))])+grid({title:'Deltagare',columns:[col('name','Namn'),col('role','Roll'),hourCol('planned','Publicerad plan'),hourCol('actual','Rapporterat'),col('state','Status',status)],rows}));return;
    }
    const e=D.expenses.find(e=>e.id===id);
    if(e)openDialog(`${e.category} · ${pname(e.production)}`,infoArea([infoBox('Kvittounderlag',fields([['Resurs',esc(person(e.person).name)],['Belopp',money(e.amount)],['Status',status(e.status)],['Beskrivning',esc(e.description)]]))]));
  }
  function filterDialog() {
    const select=(id,label,options,value)=>`<label><span>${label}</span><div class="saInputTextWrapper saInputPageField saHasTrailingIcons"><select class="saInputText saDropdown" id="${id}" aria-label="${label}">${options.map(([v,t])=>`<option value="${v}" ${v===value?'selected':''}>${esc(t)}</option>`).join('')}</select><div class="saTrailingIconsWrapper">${icon('angle-down')}</div></div></label>`;
    openDialog('Ändra urval',`<form id="filter-form"><div class="filter-fields">${select('production','Produktion',[['all','Alla produktioner'],...D.productions.map(p=>[p.id,p.name])],state.production)}${select('period','Period',[['september','September 2026'],['autumn','Höstterminen 2026'],['august','Augusti 2026']],state.period)}${select('operation','Verksamhet',[['concert','Konsertverksamhet'],['all','Alla verksamheter']],state.operation)}</div><div class="filter-actions"><button type="submit" class="saButtonPrimary">Visa</button><button type="button" class="saButtonSecondary" data-close-dialog>Avbryt</button></div></form>`);
  }
  function exportCsv() {
    if(!reportModel.rows.length){notice('Det finns inga rader att exportera.');return;}
    const cell=v=>{let text=typeof v==='number'?String(v).replace('.',','):String(v??'');if(typeof v!=='number'&&/^[=+@-]/.test(text))text="'"+text;return '"'+text.replace(/"/g,'""')+'"';};
    const lines=[['Rapport',reportModel.title],['Produktion',state.production==='all'?'Alla produktioner':pname(state.production)],['Period',state.period],['Underlag','Fiktiva demodata'],['Publicerad plan (h)',data.planned],['Aktuellt schema (h)',data.scheduled],['Rapporterad tid (h)',data.actual],['Saknad tidrapport (h)',data.pending],[],reportModel.columns.map(c=>c.label),...reportModel.rows.map(r=>reportModel.columns.map(c=>r[c.key]))];
    const url=URL.createObjectURL(new Blob(['\ufeff'+lines.map(r=>r.map(cell).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download=`produktionsuppfoljning-${state.production}-${state.tab}.csv`;a.hidden=true;document.body.append(a);a.click();setTimeout(()=>{a.remove();URL.revokeObjectURL(url);},1000);notice(`CSV-fil skapad med ${reportModel.rows.length} rader.`);
  }
  function about() {
    openDialog('Definitioner och demounderlag',infoArea([infoBox('Publicerad plan och aktuellt schema',fields([['Publicerad plan','Ursprungligen publicerade persontimmar. Inställda tillfällen ligger kvar.'],['Aktuellt schema','Publicerad plan efter schemaändringar. Inställda tillfällen räknas som 0 timmar.']])),infoBox('Rapporterad tid och kostnad',fields([['Nyttjad schematid','Rapporterat / aktuellt schema för tidrapporterade pass. Saknad rapport är inte noll arbetstid. Inte ett mått på anställningsgrad.'],['Personalkostnad','Rapporterade timmar × fiktiv timkostnad inklusive påslag + redovisade utlägg. Även ej attesterade utlägg ingår. Ingen slutkostnadsprognos.']]))]));
  }
  function closeNav(){document.body.classList.remove('nav-open');$('#nav-backdrop').hidden=true;}
  document.addEventListener('click',event=>{
    const el=event.target.closest('button,a');if(!el)return;
    if(el.dataset.route){event.preventDefault();route(el.dataset.route,el.dataset.production||state.production);}
    if(el.dataset.sort){const pos=$('.scrollcontent').scrollTop;state.direction=state.sort===el.dataset.sort?-state.direction:1;state.sort=el.dataset.sort;renderPanel();$('.scrollcontent').scrollTop=pos;}
    if(el.hasAttribute('data-detail'))detail(el.dataset.detail,el.dataset.id);
    if(el.hasAttribute('data-schedule'))detail(el.dataset.schedule,el.dataset.id,true);
    if(el.hasAttribute('data-filter'))filterDialog();
    if(el.hasAttribute('data-export'))exportCsv();
    if(el.hasAttribute('data-print'))window.print();
    if(el.hasAttribute('data-about'))about();
    if(el.id==='close-detail'||el.hasAttribute('data-close-dialog'))$('#detail').close();
    if(el.hasAttribute('data-collapse-info')){const box=el.closest('.saInfoBox');const closed=box.classList.toggle('saClosed');box.classList.toggle('saOpen',!closed);el.setAttribute('aria-expanded',!closed);}
    if(el.id==='favorite'){const saved=el.getAttribute('aria-checked')!=='true';el.setAttribute('aria-checked',saved);el.title=saved?'Ta bort favorit':'Spara favorit';}
    if(el.id==='mobile-menu'){const nav=$('#sidebar nav');nav.classList.remove('saMinimized');nav.classList.add('saExpanded');$('#sidebar').classList.remove('saClosed');$('#collapse-sidebar').setAttribute('aria-expanded','true');document.body.classList.add('nav-open');$('#nav-backdrop').hidden=false;}
  });
  document.addEventListener('submit',event=>{if(event.target.id!=='filter-form')return;event.preventDefault();state.period=$('#period').value;state.operation=$('#operation').value;const p=$('#production').value;$('#detail').close();route(state.tab==='productions'&&p!=='all'?'overview':state.tab,p);});
  document.addEventListener('input',event=>{if(event.target.id!=='report-search')return;state.query=event.target.value;const top=$('.scrollcontent').scrollTop;renderPanel();$('#report-search').focus();$('.scrollcontent').scrollTop=top;});
  document.addEventListener('change',event=>{if(event.target.id==='grouping'){state.group=event.target.value;renderPanel();}if(event.target.id==='resource-type'){state.resource=event.target.value;renderPanel();}});
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape')closeNav();
    if(event.target.matches('[data-sort]')&&['Enter',' '].includes(event.key)){event.preventDefault();event.target.click();}
    if(event.target.matches('[role="tab"]')&&['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();let i=tabs.findIndex(t=>t[0]===state.tab);i=event.key==='Home'?0:event.key==='End'?tabs.length-1:(i+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;route(tabs[i][0]);$('#tab-'+tabs[i][0]).focus();}
  });
  $('#collapse-sidebar').addEventListener('click',()=>{if(innerWidth<=850){closeNav();return;}const nav=$('#sidebar nav'),closed=nav.classList.toggle('saMinimized');nav.classList.toggle('saExpanded',!closed);$('#sidebar').classList.toggle('saClosed',closed);$('#collapse-sidebar').setAttribute('aria-expanded',!closed);$('#collapse-sidebar').setAttribute('aria-label',closed?'Expandera menyn':'Minimera menyn');});
  $('#nav-backdrop').addEventListener('click',closeNav);
  window.addEventListener('popstate',readRoute);
  window.addEventListener('hashchange',readRoute);
  readRoute();
}());
