import Interactive from '../components/Interactive';
import { useApp } from '../lib/AppContext';
import { GOLD, GOLD_DEEP, INK, MONTHS, PRI, DOW as DOWSHORT } from '../lib/constants';
import { parseDate, dow } from '../lib/dateUtils';

export default function Calendar() {
  const ctx = useApp();
  const { data, tracker, today, state, setPage, setSel } = ctx;
  const { y, m } = state;
  const monthLabel = MONTHS[m] + ' ' + y;
  const days = tracker.monthDays(y, m);
  const free = tracker.freeDow();

  const firstDow = parseDate(days[0]).getDay();
  const lead = (firstDow + 6) % 7;
  const leadCells = Array.from({ length: lead }, (_, i) => i);

  const cells = days.map((s) => {
    const x = tracker.dayStats(s);
    const future = s > today;
    const isToday = s === today;
    const hp = x.habits.total ? Math.round((x.habits.done / x.habits.total) * 100) : 0;
    return {
      key: s, dayNum: parseDate(s).getDate(), dowLabel: DOWSHORT[dow(s)].toUpperCase(),
      free: x.free, work: !x.free, freeNote: future ? 'Planned rest' : 'Optional only',
      cellBg: isToday ? '#faf4e2' : future ? '#fdfdfd' : '#fff',
      accent: x.free ? '#e6d190' : isToday ? GOLD : x.score >= 60 ? GOLD_DEEP : '#d7d3d3',
      numColor: future ? '#bab6b6' : INK,
      rows: PRI.map((p) => ({
        key: p.key, label: p.short, color: p.color,
        val: p.key === 'high' ? (x.high.total ? (x.high.done ? '✓' : '—') : '·') : x[p.key].done + '/' + p.limit,
        valColor: x[p.key].total && x[p.key].done === x[p.key].total ? GOLD_DEEP : '#605d5d',
      })),
      habitPct: hp + '%', pct: x.score === null ? 0 : x.score, barColor: x.score >= 60 ? GOLD : '#bab6b6',
      open: () => { setPage('today'); setSel(s); },
    };
  });

  const dowNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((l) => ({
    label: l, color: DOWSHORT[free].slice(0, 3) === l ? GOLD_DEEP : '#7d7979',
  }));

  if (!data) return null;

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: '#7d7979' }}>Productivity grid</div>
          <h1 style={{ fontSize: 34, margin: '4px 0 0' }}>{monthLabel}</h1>
        </div>
        <div style={{ display: 'flex', gap: 18, fontSize: 11, color: '#605d5d', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, background: GOLD }} />High</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, background: '#7d7979' }} />Medium</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, background: '#bab6b6' }} />Low</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, border: '2px dashed ' + GOLD }} />Free day</span>
        </div>
      </div>
      <div style={{ height: 2, background: 'var(--ink)', margin: '14px 0 0' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,minmax(0,1fr))' }}>
        {dowNames.map((d, i) => (
          <div key={i} style={{ padding: '8px 10px', fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: d.color, borderRight: '1px solid #eae7e7', borderBottom: '1px solid #d7d3d3' }}>{d.label}</div>
        ))}
        {leadCells.map((i) => (
          <div key={'lead' + i} style={{ borderRight: '1px solid #eae7e7', borderBottom: '1px solid #eae7e7', minHeight: 126, background: '#f8f4f4' }} />
        ))}
        {cells.map((c) => (
          <div key={c.key} style={{ borderRight: '1px solid #eae7e7', borderBottom: '1px solid #eae7e7', minHeight: 126, background: c.cellBg }}>
            <Interactive
              as="button"
              onClick={c.open}
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8, padding: '11px 12px', width: 'calc(100% - 24px)', height: 'calc(100% - 22px)', borderLeft: '3px solid ' + c.accent, textAlign: 'left' }}
              hoverStyle={{ background: '#faf4e2' }}
            >
              <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', width: '100%' }}>
                <span style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: '#9b9797' }}>{c.dowLabel}</span>
                <span style={{ fontSize: 19, fontWeight: 800, color: c.numColor }}>{c.dayNum}</span>
              </span>
              {c.free && (
                <span style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 6 }}>
                  <span style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: GOLD_DEEP, fontWeight: 700 }}>Free day</span>
                  <span style={{ fontSize: 11, color: '#9b9797' }}>{c.freeNote}</span>
                </span>
              )}
              {c.work && (
                <span style={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
                  {c.rows.map((r) => (
                    <span key={r.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, color: '#605d5d' }}>
                      <span style={{ width: 7, height: 7, background: r.color, flex: 'none' }} />
                      <span style={{ flex: 1, letterSpacing: '.08em', textTransform: 'uppercase' }}>{r.label}</span>
                      <span style={{ fontWeight: 700, color: r.valColor }}>{r.val}</span>
                    </span>
                  ))}
                  <span style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: '#7d7979', marginTop: 5 }}>
                    <span style={{ letterSpacing: '.08em', textTransform: 'uppercase' }}>Habits</span>
                    <span style={{ fontWeight: 700 }}>{c.habitPct}</span>
                  </span>
                  <span style={{ display: 'block', height: 5, background: '#eae7e7', width: '100%' }}>
                    <span style={{ display: 'block', height: '100%', background: c.barColor, width: c.pct + '%' }} />
                  </span>
                </span>
              )}
            </Interactive>
          </div>
        ))}
      </div>
    </section>
  );
}
