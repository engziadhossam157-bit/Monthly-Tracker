import { useApp } from '../lib/AppContext';
import { GOLD, GOLD_DEEP, MONTHS, OK, PRI } from '../lib/constants';
import { pad } from '../lib/dateUtils';

export default function Analytics() {
  const ctx = useApp();
  const { data, tracker, today, state, weeksFor } = ctx;
  const { y, m } = state;
  const monthLabel = MONTHS[m] + ' ' + y;
  const days = tracker.monthDays(y, m);
  const weeks = weeksFor(y, m);
  const curWeek = tracker.weekIndexOf(today);

  const allTasks = data.tasks.filter((t) => t.date.indexOf(y + '-' + pad(m + 1)) === 0);
  const doneCount = allTasks.filter((t) => t.completed).length;
  const overall = allTasks.length ? Math.round((doneCount / allTasks.length) * 100) : 0;
  const openCount = allTasks.length - doneCount;
  const C2 = 2 * Math.PI * 46;
  const donutDash = ((C2 * overall) / 100).toFixed(1) + ' ' + C2.toFixed(1);

  const distBars = PRI.map((p) => {
    const set = allTasks.filter((t) => t.priority === p.key);
    const pct = allTasks.length ? Math.round((set.length / allTasks.length) * 100) : 0;
    return { key: p.key, label: p.short, pct, val: set.length + ' tasks · ' + pct + '%', color: p.color };
  });

  const streak = tracker.streak(y, m);
  const bestStreak = tracker.bestStreak(y, m);
  const longestHabitStreak = Math.max(0, ...data.habits.map((h) => tracker.habitStats(h, y, m).best));
  const streakStats = [
    { label: 'Current', val: streak },
    { label: 'Best day streak', val: bestStreak },
    { label: 'Longest habit streak', val: longestHabitStreak },
  ];
  const chDone = data.challenges.filter((c) => c.completed).length;
  const chOpen = data.challenges.filter((c) => !c.completed).length;

  const dayVals = days.map((s) => (s <= today ? (tracker.dayStats(s).score === null ? null : tracker.dayStats(s).score) : null));
  const plotted = dayVals.map((v) => (v === null ? 0 : v));
  const monthCurveTall = tracker.curve(plotted, 480, 120, 130);
  const monthAreaFull = monthCurveTall ? monthCurveTall + ' L 480 130 L 0 130 Z' : '';

  const weekBars = weeks.map((w, i) => {
    const s2 = tracker.weekStats(i, y, m);
    return { key: i, label: 'W' + (i + 1), val: s2 ? s2.score : 0, h: Math.max(3, (s2 ? s2.score : 0) * 1.6), color: i === curWeek ? GOLD : '#d7d3d3' };
  });
  const habitBars = data.habits.filter((h) => h.active).map((h) => {
    const s2 = tracker.habitStats(h, y, m);
    return { key: h.id, label: h.name, pct: s2.pct, val: s2.pct + '%', color: s2.pct >= 70 ? GOLD : '#bab6b6' };
  }).sort((a, b) => b.pct - a.pct);

  return (
    <section>
      <div>
        <div style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: '#7d7979' }}>Am I actually improving?</div>
        <h1 style={{ fontSize: 34, margin: '4px 0 0' }}>Analytics · {monthLabel}</h1>
      </div>
      <div style={{ height: 2, background: 'var(--ink)', margin: '14px 0 24px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20 }}>
        <div style={{ border: '1px solid #d7d3d3', padding: 20 }}>
          <div style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: '#7d7979', marginBottom: 12 }}>Completed vs incomplete</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            <svg viewBox="0 0 120 120" style={{ width: 130, height: 130 }}>
              <circle cx="60" cy="60" r="46" fill="none" stroke="#eae7e7" strokeWidth="18" />
              <circle cx="60" cy="60" r="46" fill="none" stroke="#c9a227" strokeWidth="18" strokeDasharray={donutDash} transform="rotate(-90 60 60)" />
              <text x="60" y="67" textAnchor="middle" fontSize="24" fontWeight="800" fill="#201e1d" fontFamily="Archivo">{overall}%</text>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><div style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: '#9b9797' }}>Completed</div><div style={{ fontSize: 24, fontWeight: 800, color: GOLD_DEEP }}>{doneCount}</div></div>
              <div><div style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: '#9b9797' }}>Incomplete</div><div style={{ fontSize: 24, fontWeight: 800, color: '#7d7979' }}>{openCount}</div></div>
            </div>
          </div>
        </div>
        <div style={{ border: '1px solid #d7d3d3', padding: 20 }}>
          <div style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: '#7d7979', marginBottom: 14 }}>Priority distribution</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {distBars.map((b) => (
              <div key={b.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 4 }}><span style={{ letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700 }}>{b.label}</span><span style={{ color: '#605d5d' }}>{b.val}</span></div>
                <div style={{ height: 12, background: '#eae7e7' }}><div style={{ height: '100%', background: b.color, width: b.pct + '%' }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ border: '1px solid #d7d3d3', padding: 20 }}>
          <div style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: '#7d7979', marginBottom: 10 }}>Streaks</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {streakStats.map((s, i) => (
              <div key={i} style={{ borderLeft: '3px solid ' + GOLD, paddingLeft: 10 }}>
                <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-.03em' }}>{s.val}</div>
                <div style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: '#7d7979' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ height: 1, background: '#eae7e7', margin: '18px 0 12px' }} />
          <div style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: '#7d7979', marginBottom: 10 }}>Challenges</div>
          <div style={{ display: 'flex', gap: 20 }}>
            <div><div style={{ fontSize: 26, fontWeight: 800, color: OK }}>{chDone}</div><div style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: '#9b9797' }}>Completed</div></div>
            <div><div style={{ fontSize: 26, fontWeight: 800, color: '#7d7979' }}>{chOpen}</div><div style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: '#9b9797' }}>Open</div></div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: 20, marginTop: 20 }}>
        <div style={{ border: '1px solid #d7d3d3', padding: 20 }}>
          <div style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: '#7d7979', marginBottom: 10 }}>Monthly productivity curve</div>
          <svg viewBox="0 0 480 150" style={{ width: '100%', height: 170, display: 'block' }}>
            <line x1="0" y1="130" x2="480" y2="130" stroke="#d7d3d3" />
            <line x1="0" y1="65" x2="480" y2="65" stroke="#eae7e7" strokeDasharray="3 4" />
            <path d={monthAreaFull} fill="#faf4e2" />
            <path d={monthCurveTall} fill="none" stroke="#c9a227" strokeWidth="2.5" />
          </svg>
        </div>
        <div style={{ border: '1px solid #d7d3d3', padding: 20 }}>
          <div style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: '#7d7979', marginBottom: 14 }}>Weekly comparison</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 170, borderBottom: '1px solid #d7d3d3' }}>
            {weekBars.map((b) => (
              <div key={b.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 6, height: '100%' }}>
                <span style={{ fontSize: 13, fontWeight: 800 }}>{b.val}</span>
                <span style={{ width: '100%', background: b.color, height: b.h, transition: 'height .5s cubic-bezier(.2,.8,.2,1)' }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 6 }}>
            {weekBars.map((b) => (
              <span key={b.key} style={{ flex: 1, textAlign: 'center', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: '#7d7979' }}>{b.label}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ border: '1px solid #d7d3d3', padding: 20, marginTop: 20 }}>
        <div style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: '#7d7979', marginBottom: 14 }}>Habit performance · month</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {habitBars.map((b) => (
            <div key={b.key} style={{ display: 'grid', gridTemplateColumns: '150px minmax(0,1fr) 48px', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.label}</span>
              <span style={{ display: 'block', height: 12, background: '#eae7e7' }}><span style={{ display: 'block', height: '100%', background: b.color, width: b.pct + '%' }} /></span>
              <span style={{ fontSize: 12, color: '#605d5d', textAlign: 'right' }}>{b.val}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
