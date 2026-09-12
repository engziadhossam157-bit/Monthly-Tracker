import Interactive from '../components/Interactive';
import CheckBox from '../components/CheckBox';
import { useApp } from '../lib/AppContext';
import { uid } from '../lib/dateUtils';
import { GOLD, GOLD_DEEP, INK, MONTHS } from '../lib/constants';

export default function Planning() {
  const ctx = useApp();
  const { data, tracker, state, chip, patch, flash, openModal } = ctx;
  const { y, m, week } = state;
  const monthLabel = MONTHS[m] + ' ' + y;
  const ws = tracker.weekStats(week, y, m) || tracker.weekStats(0, y, m);

  const goals = (data.goals || []).map((g) => ({
    id: g.id, title: g.title, mark: g.done ? '✓' : '', boxBorder: g.done ? GOLD : '#bab6b6', boxFill: g.done ? GOLD : 'transparent',
    bg: g.done ? '#f8f4f4' : '#fff', fg: g.done ? '#9b9797' : INK, deco: g.done ? 'line-through' : 'none',
    anim: state.anim['g' + g.id] ? 'pop .32s cubic-bezier(.2,.9,.2,1)' : 'none',
    toggle: () => { patch((dd) => { const x = dd.goals.filter((z) => z.id === g.id)[0]; x.done = !x.done; }); if (!g.done) flash('g' + g.id); },
    setTitle: (e) => { const v = e.target.value; patch((dd) => { dd.goals.filter((z) => z.id === g.id)[0].title = v; }); },
    del: () => patch((dd) => { dd.goals = dd.goals.filter((z) => z.id !== g.id); }),
  }));
  const addGoal = () => patch((dd) => { dd.goals.push({ id: uid(), title: 'New goal', done: false }); }, 'Goal added.');

  const focusHabits = data.habits.filter((h) => h.active).map((h) => ({
    id: h.id, name: h.name, ...chip(!!h.focus),
    toggle: () => patch((dd) => { const x = dd.habits.filter((z) => z.id === h.id)[0]; x.focus = !x.focus; }),
  }));
  const focusAreas = Object.keys(data.areas || {}).map((k) => ({
    key: k, name: k, ...chip(data.areas[k]),
    toggle: () => patch((dd) => { dd.areas[k] = !dd.areas[k]; }),
  }));

  const weekPriorities = [0, 1, 2].map((i) => ({
    n: i + 1, value: ((data.priorities || {})[week] || [])[i] || '', placeholder: i === 0 ? 'The one thing this week is for' : 'Priority ' + (i + 1),
    onChange: (e) => {
      const v = e.target.value;
      patch((dd) => {
        dd.priorities = dd.priorities || {};
        const arr = (dd.priorities[week] || ['', '', '']).slice();
        arr[i] = v;
        dd.priorities[week] = arr;
      });
    },
  }));

  return (
    <section>
      <div>
        <div style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: '#7d7979' }}>Before the month starts</div>
        <h1 style={{ fontSize: 34, margin: '4px 0 0' }}>Planning · {monthLabel}</h1>
      </div>
      <div style={{ height: 2, background: 'var(--ink)', margin: '14px 0 24px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 22 }}>
        <div style={{ border: '1px solid #d7d3d3', borderTop: '3px solid ' + GOLD, padding: 20 }}>
          <h3 style={{ fontSize: 14, letterSpacing: '.14em', textTransform: 'uppercase', margin: '0 0 14px' }}>Monthly goals</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {goals.map((g) => (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #eae7e7', padding: 10, background: g.bg }}>
                <Interactive as="button" onClick={g.toggle} style={{ cursor: 'pointer' }}>
                  <CheckBox size={17} fontSize={10} boxBorder={g.boxBorder} boxFill={g.boxFill} mark={g.mark} anim={g.anim} />
                </Interactive>
                <Interactive as="input" value={g.title} onChange={g.setTitle} style={{ flex: 1, fontSize: 14, fontWeight: 600, textDecoration: g.deco, color: g.fg, border: 'none', background: 'transparent', padding: 0 }} focusStyle={{ borderBottom: '1px solid ' + GOLD }} />
                <Interactive as="button" onClick={g.del} style={{ cursor: 'pointer', fontSize: 11, color: '#a33a28', padding: '3px 6px' }}>Del</Interactive>
              </div>
            ))}
            <Interactive as="button" onClick={addGoal} style={{ cursor: 'pointer', border: '1px dashed #d7d3d3', padding: 11, fontSize: 13, color: '#9b9797', textAlign: 'left' }} hoverStyle={{ borderColor: GOLD, color: GOLD_DEEP }}>+ Add monthly goal</Interactive>
          </div>
        </div>
        <div style={{ border: '1px solid #d7d3d3', padding: 20 }}>
          <h3 style={{ fontSize: 14, letterSpacing: '.14em', textTransform: 'uppercase', margin: '0 0 6px' }}>Focus habits</h3>
          <div style={{ fontSize: 12, color: '#9b9797', marginBottom: 14 }}>Marked habits sit at the top of every day.</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {focusHabits.map((h) => (
              <Interactive as="button" key={h.id} onClick={h.toggle} style={{ cursor: 'pointer', padding: '7px 12px', fontSize: 12.5, fontWeight: 600, border: '1px solid ' + h.border, background: h.bg, color: h.fg }} hoverStyle={{ borderColor: INK }}>{h.name}</Interactive>
            ))}
          </div>
          <div style={{ height: 1, background: '#eae7e7', margin: '20px 0 14px' }} />
          <h3 style={{ fontSize: 14, letterSpacing: '.14em', textTransform: 'uppercase', margin: '0 0 12px' }}>Focus areas</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {focusAreas.map((a) => (
              <Interactive as="button" key={a.key} onClick={a.toggle} style={{ cursor: 'pointer', padding: '7px 12px', fontSize: 12.5, fontWeight: 600, border: '1px solid ' + a.border, background: a.bg, color: a.fg }} hoverStyle={{ borderColor: INK }}>{a.name}</Interactive>
            ))}
          </div>
        </div>
        <div style={{ border: '1px solid #d7d3d3', padding: 20 }}>
          <h3 style={{ fontSize: 14, letterSpacing: '.14em', textTransform: 'uppercase', margin: '0 0 6px' }}>Week {week + 1} priorities</h3>
          <div style={{ fontSize: 12, color: '#9b9797', marginBottom: 14 }}>{ws.week.label}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {weekPriorities.map((p) => (
              <div key={p.n} style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #eae7e7', padding: '8px 0' }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: GOLD, width: 18 }}>{p.n}</span>
                <Interactive as="input" value={p.value} onChange={p.onChange} placeholder={p.placeholder} style={{ flex: 1, fontSize: 14, border: 'none', background: 'transparent', padding: 0 }} focusStyle={{ borderBottom: '1px solid ' + GOLD }} />
              </div>
            ))}
          </div>
          <div style={{ height: 1, background: '#eae7e7', margin: '20px 0 12px' }} />
          <Interactive as="button" onClick={() => openModal('challenge', { week })} style={{ cursor: 'pointer', padding: '8px 14px', border: '2px solid var(--ink)', fontWeight: 700, fontSize: 13 }} hoverStyle={{ background: 'var(--ink)', color: '#fff' }}>+ Weekly challenge</Interactive>
        </div>
      </div>
    </section>
  );
}
