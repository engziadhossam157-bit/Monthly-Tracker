import Interactive from './Interactive';
import { CATS, GOLD, INK, PRI } from '../lib/constants';
import { useApp } from '../lib/AppContext';
import { pretty } from '../lib/logic';

function buildFields(m, ctx) {
  const { chip, setModalField, tracker, weeksFor, state } = ctx;
  const opt = (list, cur, set) => list.map((o) => {
    const value = o.value !== undefined ? o.value : o;
    const label = o.label !== undefined ? o.label : o;
    const on = value === cur;
    const c = chip(on);
    return { label, ...c, go: () => set(value) };
  });

  if (m.kind === 'task') {
    const cap = PRI.filter((p) => p.key === m.priority)[0];
    const used = tracker.tasksOn(m.date).filter((t) => t.priority === m.priority).length;
    return {
      kicker: m.id ? 'Edit task' : 'New task',
      title: m.id ? (m.title || 'Task') : 'What needs doing?',
      cta: m.id ? 'Save task' : 'Add task',
      fields: [
        { label: 'Title', isText: true, value: m.title, placeholder: 'e.g. Finish AI Engineering lesson', onChange: (e) => setModalField('title', e.target.value) },
        { label: 'Priority', isChoice: true, options: opt(PRI.map((p) => ({ label: p.short, value: p.key })), m.priority, (v) => setModalField('priority', v)) },
        { label: 'Date', isText: true, value: m.date, placeholder: 'YYYY-MM-DD', onChange: (e) => setModalField('date', e.target.value) },
        { label: 'Category', isChoice: true, options: opt(CATS, m.category, (v) => setModalField('category', v)) },
        { label: 'Notes', isText: true, value: m.notes, placeholder: 'Optional', onChange: (e) => setModalField('notes', e.target.value) },
        { label: 'Deadline', isText: true, value: m.deadline, placeholder: 'Optional · e.g. 18:00', onChange: (e) => setModalField('deadline', e.target.value) },
      ],
      hasHint: true,
      hint: cap.short + ': ' + used + ' of ' + cap.limit + ' used on ' + pretty(m.date) + (tracker.isFree(m.date) ? ' · free day, nothing is required' : ''),
    };
  }
  if (m.kind === 'habit') {
    return {
      kicker: 'New habit', title: 'What will you practise?', cta: 'Create habit',
      fields: [
        { label: 'Name', isText: true, value: m.name, placeholder: 'e.g. Study AI', onChange: (e) => setModalField('name', e.target.value) },
        { label: 'Badge (2 letters)', isText: true, value: m.icon, placeholder: 'AI', onChange: (e) => setModalField('icon', e.target.value.slice(0, 2)) },
        { label: 'Category', isChoice: true, options: opt(CATS, m.category, (v) => setModalField('category', v)) },
        { label: 'Frequency', isChoice: true, options: opt(['Daily', 'Weekdays', '3× / week'], m.frequency, (v) => setModalField('frequency', v)) },
      ],
      hasHint: true, hint: 'Free days never count against a habit’s rate or streak.',
    };
  }
  // challenge
  const weeks = weeksFor(state.y, state.m);
  return {
    kicker: 'New challenge', title: 'One target for the week', cta: 'Create challenge',
    fields: [
      { label: 'Title', isText: true, value: m.title, placeholder: 'e.g. Build Momentum', onChange: (e) => setModalField('title', e.target.value) },
      { label: 'Goal', isText: true, value: m.goal, placeholder: 'Complete at least 5 productive days.', onChange: (e) => setModalField('goal', e.target.value) },
      { label: 'Target count', isText: true, value: m.target, placeholder: '5', onChange: (e) => setModalField('target', e.target.value) },
      { label: 'Reward', isText: true, value: m.reward, placeholder: 'Momentum Badge', onChange: (e) => setModalField('reward', e.target.value) },
      { label: 'Week', isChoice: true, options: opt(weeks.map((w, i) => ({ label: 'W' + (i + 1), value: i })), +m.week, (v) => setModalField('week', v)) },
    ],
    hasHint: false,
  };
}

export default function Modal() {
  const ctx = useApp();
  const { state, closeModal, submitModal } = ctx;
  const m = state.modal;
  if (!m) return null;
  const def = buildFields(m, ctx);

  return (
    <div onClick={closeModal} style={{ position: 'fixed', inset: 0, background: 'rgba(32,30,29,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', border: '2px solid var(--ink)', width: 'min(520px,100%)', padding: 24, animation: 'riseIn .18s ease-out', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: '#7d7979' }}>{def.kicker}</div>
            <h2 style={{ fontSize: 24, margin: '4px 0 0' }}>{def.title}</h2>
          </div>
          <Interactive as="button" onClick={closeModal} style={{ cursor: 'pointer', fontSize: 18, padding: '2px 8px', color: '#7d7979' }} hoverStyle={{ color: INK }}>✕</Interactive>
        </div>
        <div style={{ height: 1, background: '#eae7e7', margin: '16px 0 18px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {def.fields.map((f, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: '#7d7979' }}>{f.label}</label>
              {f.isText && (
                <Interactive
                  as="input"
                  value={f.value}
                  onChange={f.onChange}
                  placeholder={f.placeholder}
                  style={{ border: '1px solid #d7d3d3', padding: '9px 11px', fontSize: 14, background: '#fff', color: INK }}
                  focusStyle={{ borderColor: GOLD }}
                />
              )}
              {f.isChoice && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {f.options.map((o, oi) => (
                    <Interactive
                      as="button"
                      key={oi}
                      onClick={o.go}
                      style={{ cursor: 'pointer', padding: '7px 12px', fontSize: 12.5, fontWeight: 700, border: '1px solid ' + o.border, background: o.bg, color: o.fg }}
                      hoverStyle={{ borderColor: INK }}
                    >
                      {o.label}
                    </Interactive>
                  ))}
                </div>
              )}
            </div>
          ))}
          {def.hasHint && (
            <div style={{ borderLeft: '3px solid ' + GOLD, background: '#faf4e2', padding: '11px 13px', fontSize: 12.5, color: '#605d5d' }}>{def.hint}</div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <Interactive as="button" onClick={submitModal} style={{ cursor: 'pointer', padding: '10px 18px', background: GOLD, fontWeight: 800, fontSize: 13.5 }} hoverStyle={{ background: 'var(--color-accent-400)' }}>{def.cta}</Interactive>
          <Interactive as="button" onClick={closeModal} style={{ cursor: 'pointer', padding: '10px 18px', border: '1px solid #d7d3d3', fontWeight: 700, fontSize: 13.5 }} hoverStyle={{ background: '#f8f4f4' }}>Cancel</Interactive>
        </div>
      </div>
    </div>
  );
}
