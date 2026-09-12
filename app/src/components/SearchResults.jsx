import Interactive from './Interactive';
import { GOLD_DEEP, INK } from '../lib/constants';
import { useApp } from '../lib/AppContext';
import { pretty } from '../lib/logic';

export default function SearchResults() {
  const { data, state, setPage, setSel, setDetail, setWeek, setQuery } = useApp();
  const q = state.query.trim().toLowerCase();
  if (!q || !data) return null;

  const results = [];
  data.tasks.forEach((t) => {
    if (t.title.toLowerCase().indexOf(q) >= 0) {
      results.push({ kind: 'Task', title: t.title, meta: pretty(t.date) + ' · ' + t.priority, go: () => { setPage('today'); setSel(t.date); setQuery(''); } });
    }
  });
  data.habits.forEach((h) => {
    if (h.name.toLowerCase().indexOf(q) >= 0) {
      results.push({ kind: 'Habit', title: h.name, meta: h.category, go: () => { setPage('habits'); setDetail(h.id); setQuery(''); } });
    }
  });
  data.challenges.forEach((c) => {
    if ((c.title + ' ' + c.goal).toLowerCase().indexOf(q) >= 0) {
      results.push({ kind: 'Challenge', title: c.title, meta: 'Week ' + (c.week + 1), go: () => { setPage('challenges'); setQuery(''); } });
    }
  });
  Object.keys(data.reviews || {}).forEach((k) => {
    const r = data.reviews[k];
    if ((r.good + r.bad + r.lessons).toLowerCase().indexOf(q) >= 0) {
      results.push({ kind: 'Review', title: 'Week ' + (+k + 1) + ' reflection', meta: 'Good / bad / lessons', go: () => { setPage('review'); setWeek(+k); setQuery(''); } });
    }
  });
  const shown = results.slice(0, 12);

  return (
    <section style={{ borderBottom: '2px solid var(--ink)', padding: '18px 28px', background: '#faf4e2' }}>
      <div style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: '#7d7979', marginBottom: 10 }}>Search · {shown.length} results</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 10 }}>
        {shown.map((r, i) => (
          <Interactive
            as="button"
            key={i}
            onClick={r.go}
            style={{ cursor: 'pointer', background: '#fff', border: '1px solid #d7d3d3', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 4, textAlign: 'left' }}
            hoverStyle={{ borderColor: INK }}
          >
            <span style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: GOLD_DEEP }}>{r.kind}</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{r.title}</span>
            <span style={{ fontSize: 12, color: '#7d7979' }}>{r.meta}</span>
          </Interactive>
        ))}
      </div>
    </section>
  );
}
