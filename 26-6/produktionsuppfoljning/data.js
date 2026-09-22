(function (root) {
  'use strict';
  const roles = ['Dirigent', 'Konsertmästare', 'Stämledare', 'Biträdande stämledare', 'Solist', 'Violinist', 'Violinist', 'Violinist', 'Violinist', 'Violinist', 'Violinist', 'Violinist', 'Violinist', 'Violist', 'Violist', 'Cellist', 'Cellist', 'Kontrabasist', 'Flöjtist', 'Flöjtist', 'Klarinettist', 'Klarinettist', 'Fagottist', 'Hornist', 'Hornist', 'Trumpetare', 'Slagverkare', 'Organist', 'Pianist', 'Extra musiker', 'Tekniker', 'Tekniker'];
  const names = ['Erik Sandström', 'Anna Berglund', 'Johan Nyström', 'Sofia Ek', 'Elin Dahl', 'Viktor Lindgren', 'Maria Holm', 'Oskar Berg', 'Karin Lund', 'Emil Westin', 'Linnea Falk', 'David Sjöberg', 'Clara Lind', 'Henrik Wall', 'Sara Norén', 'Axel Ström', 'Emma Bergman', 'Filip Lindahl', 'Lisa Engström', 'Isak Lundgren', 'Julia Hed', 'Anton Sund', 'Maja Rosén', 'Daniel Wahl', 'Ida Holmström', 'Gustav Ekman', 'Nils Hall', 'Agnes Vik', 'Oscar Strand', 'Elsa Nord', 'Martin Blom', 'Amanda Lindqvist'];
  const people = names.map((name, index) => ({ id: `person-${index}`, name, role: roles[index], rate: index === 0 ? 1400 : index === 4 ? 1250 : index >= 30 ? 520 : 610, category: index >= 30 ? 'Teknik' : 'Musiker' }));
  const productions = [
    { id: 'bancroft', name: 'Bancroft', subtitle: 'Symfonikonsert · Stora salen', start: 14, count: 32, budget: 470000, expenseBudget: 18000, status: 'Genomförd', published: '2026-09-07', changed: '2026-09-18' },
    { id: 'blomstedt', name: 'Blomstedt', subtitle: 'Symfonikonsert · Stora salen', start: 1, count: 30, budget: 465000, expenseBudget: 16000, status: 'Avslutad', published: '2026-08-25', changed: '2026-09-06' },
    { id: 'glenn', name: 'Glenn Miller Orchestra', subtitle: 'Konsertserie · Stora salen', start: 8, count: 20, budget: 310000, expenseBudget: 24000, status: 'Avslutad', published: '2026-08-31', changed: '2026-09-14' },
    { id: 'pintscher', name: 'Pintscher', subtitle: 'Konsertserie · Grünewaldsalen', start: 15, count: 28, budget: 410000, expenseBudget: 15000, status: 'Inväntar tidrapport', published: '2026-09-08', changed: '2026-09-21' }
  ];
  const date = day => `2026-09-${String(day).padStart(2, '0')}`;
  const sessions = [];
  const assignments = [];
  const expenses = [];
  productions.forEach(production => {
    const cast = [...people.slice(0, production.count - 2), ...people.slice(-2)];
    const layout = [[0, 'Repetition', '10:00', '13:00', 3], [0, 'Repetition', '14:00', '17:00', 3], [1, 'Repetition', '10:00', '13:00', 3], [2, 'Repetition', '10:00', '13:00', 3], [3, 'Genrep', '10:00', '13:00', 3], [3, 'Konsert', '19:00', '21:00', 2], [4, 'Konsert', '19:00', '21:00', 2], [5, 'Konsert', '15:00', '17:00', 2], [6, 'Konsert', '15:00', '17:00', 2]];
    // Shared resources must not be scheduled simultaneously across productions.
    if (production.id === 'glenn') layout[8].splice(2, 2, '19:00', '21:00');
    if (production.id === 'pintscher') {
      layout[0].splice(2, 2, '07:00', '10:00');
      layout[2].splice(2, 2, '07:00', '10:00');
      layout[3].splice(2, 2, '14:00', '17:00');
      layout[5].splice(2, 2, '16:00', '18:00');
      layout[7].splice(2, 2, '19:00', '21:00');
    }
    layout.forEach(([offset, type, start, end, hours], index) => {
      const cancelled = production.id === 'bancroft' && index === 7;
      const session = { id: `${production.id}-${index}`, production: production.id, date: date(production.start + offset), type, start, end, hours, cancelled, location: production.id === 'pintscher' ? 'Grünewaldsalen' : 'Stora salen' };
      sessions.push(session);
      cast.forEach(person => {
        const absent = production.id === 'bancroft' && person.id === 'person-5' && index === 6;
        const extra = production.id === 'bancroft' && person.category === 'Teknik' && index === 5 ? 1 : 0;
        const pending = production.id === 'pintscher' && person.id === 'person-0' && index === 4;
        assignments.push({ id: `${session.id}-${person.id}`, person: person.id, session: session.id, production: production.id, date: session.date, type, planned: hours, scheduled: cancelled ? 0 : hours, actual: pending ? null : cancelled || absent ? 0 : hours + extra, reason: cancelled ? 'Inställd konsert' : absent ? 'Frånvaro' : extra ? 'Förlängd teknikinsats' : pending ? 'Tidrapport saknas' : '' });
      });
    });
    [['Resor', 6400, 'Tågresor och lokala transporter', 4], ['Logi', production.id === 'glenn' ? 15200 : 8400, 'Hotell under produktionsperioden', 0], ['Extra instrument', 3200, 'Transport och hyra av extra instrument', 26], ['Övriga tillägg', 1800, 'Traktamente', 29]].forEach(([category, amount, description, person], index) => {
      expenses.push({ id: `${production.id}-expense-${index}`, production: production.id, date: date(production.start + 6), category, amount, description, person: cast.find(member => member.id === people[person].id)?.id || cast.at(-1).id, status: production.id === 'bancroft' && index === 2 ? 'Inväntar attest' : 'Attesterat' });
    });
  });
  const sum = (items, field) => items.reduce((total, item) => total + (item[field] ?? 0), 0);
  function select(production = 'bancroft', period = 'september') {
    const from = period === 'august' ? '2026-08-01' : period === 'autumn' ? '2026-08-01' : '2026-09-01';
    const to = period === 'august' ? '2026-08-31' : period === 'autumn' ? '2026-12-31' : '2026-09-30';
    const included = item => (production === 'all' || item.production === production) && item.date >= from && item.date <= to;
    const selectedSessions = sessions.filter(included);
    const selectedAssignments = assignments.filter(included);
    const selectedExpenses = expenses.filter(included);
    const selectedProductions = productions.filter(item => selectedSessions.some(session => session.production === item.id));
    const laborCost = selectedAssignments.reduce((total, assignment) => total + (assignment.actual ?? 0) * people.find(person => person.id === assignment.person).rate, 0);
    return { sessions: selectedSessions, assignments: selectedAssignments, expenses: selectedExpenses, productions: selectedProductions, planned: sum(selectedAssignments, 'planned'), scheduled: sum(selectedAssignments, 'scheduled'), actual: sum(selectedAssignments, 'actual'), pending: selectedAssignments.filter(item => item.actual === null).reduce((total, item) => total + item.scheduled, 0), budget: sum(selectedProductions, 'budget'), expenseBudget: sum(selectedProductions, 'expenseBudget'), laborCost, expenseCost: sum(selectedExpenses, 'amount'), cost: laborCost + sum(selectedExpenses, 'amount') };
  }
  function staffRows(data) {
    return people.filter(person => data.assignments.some(item => item.person === person.id)).map(person => {
      const rows = data.assignments.filter(item => item.person === person.id);
      return { ...person, planned: sum(rows, 'planned'), scheduled: sum(rows, 'scheduled'), actual: sum(rows, 'actual'), sessions: rows.filter(item => item.actual > 0).length, difference: sum(rows.filter(item => item.actual !== null), 'actual') - sum(rows.filter(item => item.actual !== null), 'scheduled'), pending: rows.some(item => item.actual === null), reasons: [...new Set(rows.map(item => item.reason).filter(reason => reason && reason !== 'Inställd konsert'))] };
    });
  }
  function deviations(data) {
    const result = data.sessions.filter(session => session.cancelled).map(session => ({ id: session.id, title: 'Inställd konsert', subject: productions.find(p => p.id === session.production).name, date: session.date, effect: `${sum(data.assignments.filter(item => item.session === session.id), 'planned')} h borttagna ur aktuellt schema`, tone: 'yellow', kind: 'session', target: session.id, note: 'Konserten ställdes in efter schemapublicering. Den publicerade planen ligger kvar som jämförelse.' }));
    staffRows(data).forEach(person => {
      if (person.reasons.length) result.push({ id: person.id, title: person.reasons.join(', '), subject: person.name, date: data.assignments.filter(row => row.person === person.id && row.reason && row.reason !== 'Inställd konsert')[0].date, effect: person.pending ? 'Rapporterad tid saknas' : `${person.difference > 0 ? '+' : ''}${person.difference} h mot aktuellt schema`, tone: person.pending || person.difference > 0 ? 'yellow' : 'red', kind: 'person', target: person.id, note: person.pending ? 'Saknad tidrapport räknas inte som noll arbetade timmar. Utfallet är preliminärt.' : person.difference < 0 ? 'Deltog i två av fyra ursprungligen planerade konserter. Ett tillfälle ställdes in och ett tillfälle föll bort på grund av frånvaro.' : 'Ljud- och ljusarbetet förlängdes med en timme i samband med konserten.' });
    });
    data.expenses.filter(item => item.status !== 'Attesterat').forEach(item => result.push({ id: item.id, title: 'Kvitto inväntar attest', subject: item.category, date: item.date, effect: `${item.amount} kr redovisat`, tone: 'yellow', kind: 'expense', target: item.id, note: item.description }));
    return result;
  }
  const api = { people, productions, sessions, assignments, expenses, sum, select, staffRows, deviations };
  root.ProductionData = api;
  if (typeof module !== 'undefined') module.exports = api;
}(typeof window === 'undefined' ? globalThis : window));
