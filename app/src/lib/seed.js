import { ds, dow, rng, uid, parseDate, pad } from './dateUtils';
import { HABIT_SEED, HIGH_SEED, MED_SEED, LOW_SEED, CH_SEED, CATS, MONTHS } from './constants';

export function weeksFor(y, m) {
  const dim = new Date(y, m + 1, 0).getDate();
  const weeks = [];
  let cur = [];
  for (let d = 1; d <= dim; d++) {
    const s = ds(y, m, d);
    cur.push(s);
    if (dow(s) === 0 || d === dim) {
      weeks.push({ days: cur });
      cur = [];
    }
  }
  return weeks.map((w, i) => {
    const a = parseDate(w.days[0]);
    const b = parseDate(w.days[w.days.length - 1]);
    return { n: i + 1, days: w.days, label: MONTHS[a.getMonth()].slice(0, 3) + ' ' + a.getDate() + ' – ' + b.getDate() };
  });
}

export function seed() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const dim = new Date(y, m + 1, 0).getDate();
  const r = rng(y * 100 + m);
  const habits = HABIT_SEED.map((h, i) => ({
    id: 'h' + i, name: h[0], icon: h[1], category: h[2], frequency: 'Daily', target: '1 / day', focus: i < 3, active: true,
  }));
  const tasks = [];
  const comp = {};
  for (let d = 1; d <= now.getDate(); d++) {
    const s = ds(y, m, d);
    const free = dow(s) === 5;
    const counts = free
      ? { high: 0, medium: r() > 0.6 ? 1 : 0, low: r() > 0.5 ? 2 : 0 }
      : { high: 1, medium: 3, low: 4 + (r() > 0.5 ? 1 : 0) };
    ['high', 'medium', 'low'].forEach((p) => {
      const pool = p === 'high' ? HIGH_SEED : p === 'medium' ? MED_SEED : LOW_SEED;
      for (let i = 0; i < counts[p]; i++) {
        const doneChance = p === 'high' ? 0.85 : p === 'medium' ? 0.74 : 0.6;
        const completed = d < now.getDate() ? r() < doneChance : r() < 0.5;
        tasks.push({
          id: uid(), title: pool[Math.floor(r() * pool.length)], date: s, priority: p, completed,
          category: CATS[Math.floor(r() * CATS.length)], notes: '', deadline: '',
        });
      }
    });
    if (!free) habits.forEach((h) => { if (r() < 0.78) comp[h.id + '|' + s] = true; });
    else habits.forEach((h) => { if (r() < 0.35) comp[h.id + '|' + s] = true; });
  }
  const weeks = weeksFor(y, m);
  const challenges = weeks.map((w, i) => {
    const c = CH_SEED[i % CH_SEED.length];
    const past = parseDate(w.days[w.days.length - 1]) < now;
    const prog = past ? c[2] : Math.max(1, Math.round(c[2] * 0.6));
    return {
      id: uid(), week: i, title: c[0], goal: c[1], target: c[2],
      progress: Math.min(prog, c[2]), reward: c[3], completed: past,
    };
  });
  const reviews = {};
  reviews['0'] = {
    good: 'Held the High Priority task every working day.\nExercise three times.',
    bad: 'Low Priority list kept spilling over.\nSlept late twice.',
    lessons: 'I work best before noon. Prepare tasks the night before.',
  };
  const goals = [
    { id: uid(), title: 'Finish the AI Engineering track', done: false },
    { id: uid(), title: 'Ship one portfolio project', done: false },
    { id: uid(), title: 'Exercise 16 times this month', done: false },
  ];
  return {
    habits, tasks, completions: comp, challenges, reviews, goals,
    areas: { 'AI Engineering': true, University: true, Health: true, Personal: false, Projects: true, Career: false },
    priorities: {}, reminders: { high: true, evening: true, review: true, challenge: false },
    dim, month: y + '-' + pad(m + 1),
  };
}
