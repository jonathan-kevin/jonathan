(() => {
  const prices = { standard: 2400, family: 3600, cabin: 5200, skipass: 1200, equipment: 800, lesson: 650 };
  const labels = { standard: 'Standardrum', family: 'Familjerum', cabin: 'Stuga', skipass: 'SkiPass', equipment: 'Utrustning', lesson: 'Skidskola' };
  const panels = [...document.querySelectorAll('[data-panel]')];
  const steps = [...document.querySelectorAll('.saWizardStep')];
  const next = document.querySelector('#wizardNext');
  const back = document.querySelector('#wizardBack');
  const footer = document.querySelector('#saWizardFooter');
  const error = document.querySelector('#saWizardError');
  const summary = document.querySelector('#saWizardSummaryDetails');
  const review = document.querySelector('#saWizardReview');
  const formatMoney = value => `${new Intl.NumberFormat('sv-SE').format(value)} kr`;
  let current = 0;
  let furthest = 0;

  function values() {
    const room = document.querySelector('input[name="wizardRoom"]:checked').value;
    const addons = [...document.querySelectorAll('.saWizardAddon input:checked')].map(input => input.value);
    return {
      guest: document.querySelector('#wizardGuest').value.trim(),
      arrival: document.querySelector('#wizardArrival').value,
      departure: document.querySelector('#wizardDeparture').value,
      adults: document.querySelector('#wizardAdults').value,
      children: document.querySelector('#wizardChildren').value,
      room,
      addons,
      total: prices[room] + addons.reduce((total, addon) => total + prices[addon], 0)
    };
  }

  function dateLabel(value) {
    if (!value) return 'Ej angivet';
    return new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`));
  }

  function addDetail(list, term, description) {
    const dt = document.createElement('dt');
    const dd = document.createElement('dd');
    dt.textContent = term;
    dd.textContent = description;
    list.append(dt, dd);
  }

  function updateSummary() {
    const v = values();
    summary.replaceChildren();
    addDetail(summary, 'Gäst', v.guest || 'Ej angiven');
    addDetail(summary, 'Datum', `${dateLabel(v.arrival)} – ${dateLabel(v.departure)}`);
    addDetail(summary, 'Sällskap', `${v.adults} vuxna${Number(v.children) ? `, ${v.children} barn` : ''}`);
    addDetail(summary, 'Boende', labels[v.room]);
    addDetail(summary, 'Tillägg', v.addons.length ? v.addons.map(addon => labels[addon]).join(', ') : 'Inga valda');
    document.querySelector('#saWizardTotal').textContent = formatMoney(v.total);
    review.replaceChildren();
    const groups = [
      ['Gäst och vistelse', [['Namn', v.guest || 'Ej angivet'], ['Datum', `${dateLabel(v.arrival)} – ${dateLabel(v.departure)}`], ['Sällskap', `${v.adults} vuxna, ${v.children} barn`]]],
      ['Val och pris', [['Boende', `${labels[v.room]} · ${formatMoney(prices[v.room])}`], ['Tillägg', v.addons.length ? v.addons.map(addon => `${labels[addon]} · ${formatMoney(prices[addon])}`).join(', ') : 'Inga tillägg'], ['Totalt', formatMoney(v.total)]]]
    ];
    groups.forEach(([title, rows]) => {
      const section = document.createElement('section');
      const heading = document.createElement('h3');
      const list = document.createElement('dl');
      heading.textContent = title;
      rows.forEach(([term, description]) => addDetail(list, term, description));
      section.append(heading, list);
      review.append(section);
    });
    document.querySelectorAll('.saWizardAddon').forEach(card => {
      card.querySelector('.saWizardAddonAction').textContent = card.querySelector('input').checked ? 'Tillagt' : 'Lägg till';
    });
  }

  function showStep(index) {
    current = index;
    furthest = Math.max(furthest, Math.min(index, 3));
    panels.forEach((panel, i) => { panel.hidden = i !== index; });
    steps.forEach((step, i) => {
      step.classList.toggle('saActive', i === index);
      step.classList.toggle('saComplete', i < furthest);
      step.disabled = i > furthest || index === 4;
      if (i === index && index < 4) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });
    footer.hidden = index === 4;
    back.disabled = index === 0;
    next.innerHTML = index === 3 ? 'Spara utkast <i class="fa-regular fa-check saIcon" aria-hidden="true"></i>' : 'Fortsätt <i class="fa-regular fa-arrow-right saIcon" aria-hidden="true"></i>';
    document.querySelector('#saWizardProgressText').textContent = index === 4 ? 'Klart' : `${index + 1} av 4`;
    error.textContent = '';
    updateSummary();
    if (index > 0) panels[index].querySelector('h2')?.focus({ preventScroll: true });
  }

  function validateFirstStep() {
    const v = values();
    if (!v.guest || !v.arrival || !v.departure) return 'Fyll i namn och datum för att fortsätta.';
    if (v.departure <= v.arrival) return 'Avresan måste vara efter ankomsten.';
    return '';
  }

  next.addEventListener('click', () => {
    const message = current === 0 ? validateFirstStep() : '';
    if (message) { error.textContent = message; return; }
    showStep(current + 1);
  });
  back.addEventListener('click', () => showStep(current - 1));
  steps.forEach(step => step.addEventListener('click', () => showStep(Number(step.dataset.step))));
  document.querySelector('#wizardRestart').addEventListener('click', () => window.location.reload());
  document.querySelectorAll('input, select').forEach(input => input.addEventListener('input', () => { error.textContent = ''; updateSummary(); }));
  showStep(0);
})();
