import Interactive from './Interactive';
import { GOLD, GOLD_DEEP, INK } from '../lib/constants';
import { useApp } from '../lib/AppContext';

const NAV = [
  ['dashboard', 'Dashboard', '◱'],
  ['calendar', 'Calendar', '▦'],
  ['today', 'Today', '◉'],
  ['habits', 'Habits', '≡'],
  ['tasks', 'Tasks', '✓'],
  ['challenges', 'Challenges', '★'],
  ['review', 'Weekly review', '✎'],
  ['analytics', 'Analytics', '◔'],
  ['planning', 'Planning', '◇'],
  ['settings', 'Settings', '⚙'],
];

export default function Sidebar() {
  const { state, setPage, tracker, data } = useApp();
  const streak = tracker.streak(state.y, state.m);
  const best = tracker.bestStreak(state.y, state.m);

  return (
    <aside style={{ borderRight: '2px solid var(--ink)', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', background: '#fff' }}>
      <div style={{ padding: '22px 20px 16px', borderBottom: '2px solid var(--ink)' }}>
        <div style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: '#7d7979' }}>My productivity</div>
        <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1.1, marginTop: 6 }}>
          1 · 3 · 5<span style={{ color: GOLD }}> TRACKER</span>
        </div>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', padding: '8px 0', overflow: 'auto', flex: 1 }}>
        {NAV.map((n) => {
          const on = state.page === n[0];
          return (
            <Interactive
              as="button"
              key={n[0]}
              onClick={() => setPage(n[0])}
              style={{
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px',
                fontSize: 14, fontWeight: on ? 700 : 500, color: on ? INK : '#605d5d',
                background: on ? '#faf4e2' : 'transparent', borderLeft: '3px solid ' + (on ? GOLD : 'transparent'), width: '100%',
              }}
              hoverStyle={{ background: '#faf4e2' }}
            >
              <span style={{ width: 16, display: 'inline-flex', color: on ? GOLD_DEEP : '#9b9797' }}>{n[2]}</span>
              <span>{n[1]}</span>
            </Interactive>
          );
        })}
      </nav>
      <div style={{ borderTop: '2px solid var(--ink)', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: '#7d7979' }}>Current streak</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-.03em', color: GOLD_DEEP }}>{data ? streak : 0}</span>
          <span style={{ fontSize: 12, color: '#605d5d' }}>days</span>
        </div>
        <div style={{ fontSize: 11, color: '#7d7979' }}>Best this month · {data ? best : 0}</div>
      </div>
    </aside>
  );
}
