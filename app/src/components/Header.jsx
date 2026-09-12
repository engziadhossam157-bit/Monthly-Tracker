import Interactive from './Interactive';
import { GOLD, INK, MONTHS } from '../lib/constants';
import { useApp } from '../lib/AppContext';

export default function Header() {
  const { state, setQuery, prevMonth, nextMonth, goToday, openModal } = useApp();
  const monthLabel = MONTHS[state.m] + ' ' + state.y;

  return (
    <header style={{
      borderBottom: '2px solid var(--ink)', padding: '14px 28px', display: 'flex', alignItems: 'center', gap: 14,
      flexWrap: 'wrap', position: 'sticky', top: 0, background: '#fff', zIndex: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Interactive as="button" onClick={prevMonth} style={{ cursor: 'pointer', padding: '6px 10px', border: '1px solid #d7d3d3', fontWeight: 700 }} hoverStyle={{ background: '#faf4e2' }}>‹</Interactive>
        <div style={{ minWidth: 190, textAlign: 'center', fontSize: 17, fontWeight: 800, letterSpacing: '-.01em', padding: '0 6px' }}>{monthLabel}</div>
        <Interactive as="button" onClick={nextMonth} style={{ cursor: 'pointer', padding: '6px 10px', border: '1px solid #d7d3d3', fontWeight: 700 }} hoverStyle={{ background: '#faf4e2' }}>›</Interactive>
      </div>
      <Interactive as="button" onClick={goToday} style={{ cursor: 'pointer', padding: '7px 14px', background: GOLD, color: INK, fontWeight: 700, fontSize: 13 }} hoverStyle={{ background: 'var(--color-accent-400)' }}>Today</Interactive>
      <div style={{ flex: 1, minWidth: 120 }} />
      <Interactive
        as="input"
        value={state.query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search tasks, habits, notes…   /"
        style={{ border: '1px solid #d7d3d3', padding: '8px 12px', fontSize: 13, width: 250, background: '#fff', color: INK }}
        focusStyle={{ borderColor: GOLD }}
      />
      <Interactive as="button" onClick={() => openModal('task')} style={{ cursor: 'pointer', padding: '8px 14px', border: '2px solid var(--ink)', fontWeight: 700, fontSize: 13 }} hoverStyle={{ background: 'var(--ink)', color: '#fff' }}>+ New task</Interactive>
    </header>
  );
}
