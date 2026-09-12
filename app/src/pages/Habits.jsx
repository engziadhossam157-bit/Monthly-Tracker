import Interactive from '../components/Interactive';
import { useApp } from '../lib/AppContext';
import { pretty } from '../lib/logic';
import { GOLD, GOLD_DEEP, INK } from '../lib/constants';

export default function Habits() {
  const ctx = useApp();
  const { data, tracker, today, state, setDetail, openModal, patch } = ctx;
  const { y, m, detail } = state;
  const days = tracker.monthDays(y, m);

  const habitRows = data.habits.filter((h) => h.active).map((h) => {
    const s2 = tracker.habitStats(h, y, m);
    return {
      id: h.id, name: h.name, icon: h.icon, category: h.category, frequency: h.frequency,
      pct: s2.pct, streak: s2.streak, best: s2.best,
      rowBg: detail === h.id ? '#faf4e2' : 'transparent',
      chipBg: h.focus ? GOLD : '#eae7e7', chipFg: h.focus ? INK : '#605d5d',
      cells: days.map((s) => {
        const fr = tracker.isFree(s);
        const fut = s > today;
        const on = tracker.habitDone(h.id, s);
        return {
          key: s, label: fr ? '·' : on ? '✓' : '',
          title: pretty(s) + (fr ? ' · free day' : on ? ' · done' : fut ? ' · upcoming' : ' · missed'),
          bg: on ? GOLD : fr ? '#f8f4f4' : fut ? '#fff' : '#eae7e7',
          border: fr ? '#e6d190' : fut ? '#eae7e7' : on ? GOLD : '#d7d3d3',
          fg: on ? INK : '#bab6b6', cursor: fut ? 'not-allowed' : 'pointer',
          toggle: () => ctx.toggleHabit(h.id, s),
        };
      }),
      select: () => setDetail(detail === h.id ? null : h.id),
      del: () => patch((dd) => { dd.habits = dd.habits.filter((x) => x.id !== h.id); }, 'Habit removed.'),
    };
  });

  const detailHabit = data.habits.filter((h) => h.id === detail)[0];
  let detailData = null;
  if (detailHabit) {
    const s2 = tracker.habitStats(detailHabit, y, m);
    const C = 2 * Math.PI * 50;
    const work = tracker.pastDays(y, m).filter((s) => !tracker.isFree(s));
    let acc = 0;
    const run = work.map((s, i) => {
      if (tracker.habitDone(detailHabit.id, s)) acc++;
      return Math.round((acc / (i + 1)) * 100);
    });
    detailData = {
      name: detailHabit.name, category: detailHabit.category, target: detailHabit.target,
      pct: s2.pct, dash: ((C * s2.pct) / 100).toFixed(1) + ' ' + C.toFixed(1),
      stats: [
        { label: 'Current streak', val: s2.streak + ' days' },
        { label: 'Best streak', val: s2.best + ' days' },
        { label: 'Completed days', val: s2.done },
        { label: 'Missed days', val: s2.missed },
      ],
      curve: tracker.curve(run, 480, 90, 100),
    };
  }

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 14, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: '#7d7979' }}>Consistency</div>
          <h1 style={{ fontSize: 34, margin: '4px 0 0' }}>Habits</h1>
        </div>
        <Interactive as="button" onClick={() => openModal('habit')} style={{ cursor: 'pointer', padding: '9px 16px', background: GOLD, fontWeight: 700, fontSize: 13 }} hoverStyle={{ background: 'var(--color-accent-400)' }}>+ Add habit</Interactive>
      </div>
      <div style={{ height: 2, background: 'var(--ink)', margin: '14px 0 0' }} />

      {habitRows.length === 0 && (
        <div style={{ border: '1px dashed #d7d3d3', padding: '60px 30px', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start', marginTop: 24 }}>
          <span style={{ fontSize: 24, fontWeight: 800 }}>No habits yet.</span>
          <span style={{ fontSize: 14, color: '#605d5d', maxWidth: '44ch' }}>Start small. Add your first habit and begin building your system.</span>
          <Interactive as="button" onClick={() => openModal('habit')} style={{ cursor: 'pointer', padding: '9px 16px', border: '2px solid var(--ink)', fontWeight: 700, fontSize: 13 }} hoverStyle={{ background: 'var(--ink)', color: '#fff' }}>+ Add habit</Interactive>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {habitRows.map((h) => (
          <div key={h.id} style={{ borderBottom: '1px solid #eae7e7', padding: '16px 0', display: 'grid', gridTemplateColumns: 'minmax(190px,240px) minmax(0,1fr) auto', gap: 20, alignItems: 'center', background: h.rowBg }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <span style={{ width: 30, height: 30, background: h.chipBg, color: h.chipFg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flex: 'none' }}>{h.icon}</span>
              <Interactive as="button" onClick={h.select} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', minWidth: 0, textAlign: 'left' }} hoverStyle={{ color: GOLD_DEEP }}>
                <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.01em' }}>{h.name}</span>
                <span style={{ fontSize: 11, color: '#7d7979', letterSpacing: '.1em', textTransform: 'uppercase' }}>{h.category} · {h.frequency}</span>
              </Interactive>
            </div>
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              {h.cells.map((c) => (
                <Interactive
                  as="button"
                  key={c.key}
                  onClick={c.toggle}
                  title={c.title}
                  style={{ cursor: c.cursor, width: 20, height: 20, background: c.bg, border: '1px solid ' + c.border, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: c.fg }}
                  hoverStyle={{ outline: '2px solid var(--ink)', outlineOffset: 1 }}
                >
                  {c.label}
                </Interactive>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 22, alignItems: 'center', flex: 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: GOLD_DEEP }}>{h.pct}%</span>
                <span style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: '#9b9797' }}>Month</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: 20, fontWeight: 800 }}>{h.streak}</span>
                <span style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: '#9b9797' }}>Streak</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: 20, fontWeight: 800 }}>{h.best}</span>
                <span style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: '#9b9797' }}>Best</span>
              </div>
              <Interactive as="button" onClick={h.del} style={{ cursor: 'pointer', fontSize: 11, color: '#a33a28', padding: '4px 6px', border: '1px solid transparent' }} hoverStyle={{ borderColor: '#a33a28' }}>Del</Interactive>
            </div>
          </div>
        ))}
      </div>

      {detailData && (
        <div style={{ marginTop: 32, border: '1px solid #d7d3d3', borderTop: '3px solid ' + GOLD, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: '#7d7979' }}>Habit statistics</div>
              <h2 style={{ fontSize: 28, margin: '4px 0 0' }}>{detailData.name}</h2>
              <div style={{ fontSize: 12, color: '#7d7979', letterSpacing: '.1em', textTransform: 'uppercase' }}>{detailData.category} · target {detailData.target}</div>
            </div>
            <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
              <svg viewBox="0 0 120 120" style={{ width: 112, height: 112 }}>
                <circle cx="60" cy="60" r="50" fill="none" stroke="#eae7e7" strokeWidth="12" />
                <circle cx="60" cy="60" r="50" fill="none" stroke="#c9a227" strokeWidth="12" strokeDasharray={detailData.dash} transform="rotate(-90 60 60)" />
                <text x="60" y="66" textAnchor="middle" fontSize="26" fontWeight="800" fill="#201e1d" fontFamily="Archivo">{detailData.pct}%</text>
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {detailData.stats.map((s, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: '#9b9797' }}>{s.label}</span>
                    <span style={{ fontSize: 22, fontWeight: 800 }}>{s.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ height: 1, background: '#eae7e7', margin: '22px 0 14px' }} />
          <div style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: '#7d7979', marginBottom: 8 }}>Monthly progress · running completion rate</div>
          <svg viewBox="0 0 480 120" style={{ width: '100%', height: 130, display: 'block' }}>
            <line x1="0" y1="100" x2="480" y2="100" stroke="#d7d3d3" />
            <path d={detailData.curve} fill="none" stroke="#c9a227" strokeWidth="2.5" />
          </svg>
        </div>
      )}
    </section>
  );
}
