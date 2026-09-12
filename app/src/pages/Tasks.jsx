import Interactive from '../components/Interactive';
import CheckBox from '../components/CheckBox';
import { useApp } from '../lib/AppContext';
import { taskRow } from '../lib/builders';
import { GOLD, INK, MONTHS } from '../lib/constants';
import { pad } from '../lib/dateUtils';

const FILTERS = ['All', 'Open', 'Done', 'High'];

export default function Tasks() {
  const ctx = useApp();
  const { data, state, setFilter, chip, openModal } = ctx;
  const { y, m, filter } = state;
  const monthLabel = MONTHS[m] + ' ' + y;

  const allTasks = data.tasks.filter((t) => t.date.indexOf(y + '-' + pad(m + 1)) === 0);
  const filtered = allTasks
    .filter((t) => filter === 'All' || (filter === 'Open' && !t.completed) || (filter === 'Done' && t.completed) || (filter === 'High' && t.priority === 'high'))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  const taskFilters = FILTERS.map((f) => {
    const c = chip(filter === f);
    return { label: f, ...c, go: () => setFilter(f) };
  });
  const taskList = filtered.map((t) => taskRow(ctx, t));

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 14, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: '#7d7979' }}>All tasks · {monthLabel}</div>
          <h1 style={{ fontSize: 34, margin: '4px 0 0' }}>Tasks</h1>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {taskFilters.map((f, i) => (
            <Interactive
              as="button" key={i} onClick={f.go}
              style={{ cursor: 'pointer', padding: '7px 13px', fontSize: 12, fontWeight: 700, border: '1px solid ' + f.border, background: f.bg, color: f.fg }}
              hoverStyle={{ borderColor: INK }}
            >
              {f.label}
            </Interactive>
          ))}
        </div>
      </div>
      <div style={{ height: 2, background: 'var(--ink)', margin: '14px 0 0' }} />
      <div>
        {taskList.map((t) => (
          <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '28px 92px minmax(0,1fr) 130px 110px auto', gap: 14, alignItems: 'center', padding: '12px 4px', borderBottom: '1px solid #eae7e7', background: t.bg }}>
            <Interactive as="button" onClick={t.toggle} style={{ cursor: 'pointer' }}>
              <CheckBox size={18} fontSize={11} boxBorder={t.boxBorder} boxFill={t.boxFill} mark={t.mark} anim={t.anim} />
            </Interactive>
            <span style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: '#7d7979' }}>{t.dateLabel}</span>
            <span style={{ fontSize: 14, fontWeight: 600, textDecoration: t.deco, color: t.fg, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: '#605d5d' }}>
              <span style={{ width: 8, height: 8, background: t.color }} />{t.priority}
            </span>
            <span style={{ fontSize: 11, color: '#7d7979', border: '1px solid #d7d3d3', padding: '2px 7px', justifySelf: 'start' }}>{t.category}</span>
            <span style={{ display: 'flex', gap: 4 }}>
              <Interactive as="button" onClick={t.edit} style={{ cursor: 'pointer', fontSize: 11, color: '#7d7979', padding: '3px 7px', border: '1px solid transparent' }} hoverStyle={{ borderColor: '#d7d3d3', color: INK }}>Edit</Interactive>
              <Interactive as="button" onClick={t.del} style={{ cursor: 'pointer', fontSize: 11, color: '#a33a28', padding: '3px 7px', border: '1px solid transparent' }} hoverStyle={{ borderColor: '#a33a28' }}>Del</Interactive>
            </span>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: '56px 8px', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 22, fontWeight: 800 }}>Your day is clear.</span>
            <span style={{ fontSize: 13, color: '#7d7979' }}>Nothing matches this filter. Add a task to get moving.</span>
            <Interactive as="button" onClick={() => openModal('task')} style={{ cursor: 'pointer', marginTop: 6, padding: '8px 14px', background: GOLD, fontWeight: 700, fontSize: 13 }} hoverStyle={{ background: 'var(--color-accent-400)' }}>+ New task</Interactive>
          </div>
        )}
      </div>
    </section>
  );
}
