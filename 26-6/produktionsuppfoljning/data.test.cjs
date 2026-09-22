const assert = require('node:assert/strict');
const { test } = require('node:test');
const D = require('./data.js');

test('Bancroft: published plan, cancellation, absence and overtime reconcile', () => {
  const data = D.select();
  assert.equal(data.planned, 736);
  assert.equal(data.scheduled, 672);
  assert.equal(data.actual, 672);
  assert.equal(data.cost, 455790);
  assert.equal(data.laborCost, 435990);
  assert.equal(data.pending, 0);
  assert.equal(D.staffRows(data).length, 32);
  assert.equal(D.deviations(data).length, 5);
  const viktor = D.staffRows(data).find(person => person.name === 'Viktor Lindgren');
  assert.equal(viktor.actual, 19);
  assert.equal(viktor.difference, -2);
  assert.equal(viktor.sessions, 7);
  assert.deepEqual(['Repetition', 'Genrep', 'Konsert'].map(type => D.sum(data.assignments.filter(row => row.type === type), 'scheduled')), [384, 96, 192]);
});

test('Missing time remains null and does not create an absence deviation', () => {
  const data = D.select('pintscher');
  assert.equal(data.pending, 3);
  assert.equal(data.actual, data.scheduled - 3);
  const conductor = D.staffRows(data).find(person => person.role === 'Dirigent');
  assert.equal(conductor.pending, true);
  assert.equal(conductor.difference, 0);
  assert.equal(data.assignments.filter(row => row.actual === null).length, 1);
});

test('All production totals equal their underlying assignments and expenses', () => {
  const all = D.select('all');
  for (const key of ['planned', 'scheduled', 'actual', 'cost', 'pending', 'budget']) {
    assert.equal(all[key], D.productions.reduce((total, p) => total + D.select(p.id)[key], 0));
  }
  assert.equal(D.sum(D.staffRows(all), 'actual'), all.actual);
  for (const p of D.productions) {
    const data = D.select(p.id);
    const staff = D.staffRows(data);
    assert.equal(data.cost, staff.reduce((total, person) => total + person.actual * person.rate, 0) + D.sum(data.expenses, 'amount'));
    assert.ok(data.expenses.every(expense => staff.some(person => person.id === expense.person)));
  }
});

test('Period filters produce an explicit empty state', () => {
  const empty = D.select('all', 'august');
  assert.equal(empty.sessions.length, 0);
  assert.equal(empty.assignments.length, 0);
  assert.equal(empty.expenses.length, 0);
  assert.equal(empty.cost, 0);
  assert.equal(D.deviations(empty).length, 0);
  assert.equal(D.select('all', 'autumn').cost, D.select('all').cost);
});

test('Demo schedules have valid durations and no double-booked resources', () => {
  const minutes = time => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
  for (const session of D.sessions) {
    assert.equal(minutes(session.end) - minutes(session.start), session.hours * 60);
    assert.ok(session.date <= '2026-09-22');
  }
  for (const person of D.people) {
    const assignments = D.assignments.filter(a => a.person === person.id && a.scheduled > 0);
    for (let i = 0; i < assignments.length; i++) {
      const a = D.sessions.find(s => s.id === assignments[i].session);
      for (let j = i + 1; j < assignments.length; j++) {
        const b = D.sessions.find(s => s.id === assignments[j].session);
        if (a.date !== b.date) continue;
        assert.ok(a.end <= b.start || b.end <= a.start, `${person.name}: ${a.id} overlaps ${b.id}`);
      }
    }
  }
});
