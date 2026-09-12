import Interactive from '../components/Interactive';
import { useApp } from '../lib/AppContext';
import { GOLD, GOLD_DEEP, OK } from '../lib/constants';

export default function Challenges() {
  const ctx = useApp();
  const { data, state, weeksFor, patch, markChallenge, openModal } = ctx;
  const weeks = weeksFor(state.y, state.m);

  const chList = data.challenges.slice().sort((a, b) => a.week - b.week);
  const challengeCards = chList.map((c) => {
    const pct = Math.min(100, Math.round(((c.progress || 0) / (c.target || 1)) * 100));
    const w = weeks[c.week];
    const set = (k, v) => patch((dd) => { const x = dd.challenges.filter((z) => z.id === c.id)[0]; x[k] = v; });
    return {
      id: c.id, week: c.week + 1, range: w ? w.label : '—', title: c.title, goal: c.goal, target: c.target,
      reward: c.reward, progressLabel: (c.progress || 0) + ' / ' + c.target, pct, done: c.completed,
      edge: c.completed ? OK : GOLD, bg: c.completed ? '#f8faf8' : '#fff', barColor: c.completed ? OK : GOLD,
      celebrate: !!state.celebrate[c.id],
      doneLabel: c.completed ? 'Completed' : 'Mark complete',
      doneBorder: c.completed ? OK : '#d7d3d3', doneBg: c.completed ? OK : '#fff', doneFg: c.completed ? '#fff' : '#605d5d',
      inc: () => { const np = Math.min(c.target, (c.progress || 0) + 1); set('progress', np); if (np >= c.target && !c.completed) markChallenge(c.id, true); },
      dec: () => set('progress', Math.max(0, (c.progress || 0) - 1)),
      setTitle: (e) => set('title', e.target.value),
      setGoal: (e) => set('goal', e.target.value),
      setReward: (e) => set('reward', e.target.value),
      setTarget: (e) => set('target', Math.max(1, parseInt(e.target.value, 10) || 1)),
      toggleDone: () => markChallenge(c.id, !c.completed),
      del: () => patch((dd) => { dd.challenges = dd.challenges.filter((z) => z.id !== c.id); }, 'Challenge deleted.'),
    };
  });

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 14, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: '#7d7979' }}>One target per week</div>
          <h1 style={{ fontSize: 34, margin: '4px 0 0' }}>Weekly challenges</h1>
        </div>
        <Interactive as="button" onClick={() => openModal('challenge')} style={{ cursor: 'pointer', padding: '9px 16px', background: GOLD, fontWeight: 700, fontSize: 13 }} hoverStyle={{ background: 'var(--color-accent-400)' }}>+ New challenge</Interactive>
      </div>
      <div style={{ height: 2, background: 'var(--ink)', margin: '14px 0 24px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(330px,1fr))', gap: 20 }}>
        {challengeCards.map((c) => (
          <div key={c.id} style={{ border: '1px solid #d7d3d3', borderTop: '3px solid ' + c.edge, padding: 20, display: 'flex', flexDirection: 'column', gap: 10, background: c.bg }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: '#7d7979' }}>Week {c.week} · {c.range}</span>
              {c.done && <span style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 800, color: OK }}>Complete</span>}
            </div>
            <Interactive as="input" value={c.title} onChange={c.setTitle} style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-.02em', border: 'none', borderBottom: '1px solid transparent', width: '100%', background: 'transparent', padding: 0 }} focusStyle={{ borderBottomColor: GOLD }} />
            <Interactive as="input" value={c.goal} onChange={c.setGoal} style={{ fontSize: 13, color: '#605d5d', border: 'none', borderBottom: '1px solid transparent', width: '100%', background: 'transparent', padding: 0 }} focusStyle={{ borderBottomColor: GOLD }} />
            <div style={{ height: 14, background: '#eae7e7', border: '1px solid #d7d3d3', marginTop: 4 }}>
              <div style={{ height: '100%', background: c.barColor, width: c.pct + '%', transition: 'width .5s cubic-bezier(.2,.8,.2,1)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#605d5d' }}>
              <span style={{ fontWeight: 700 }}>{c.progressLabel}</span>
              <span>{c.pct}%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
              <Interactive as="button" onClick={c.dec} style={{ cursor: 'pointer', width: 30, height: 28, border: '1px solid #d7d3d3', textAlign: 'center', fontWeight: 800 }} hoverStyle={{ background: '#faf4e2' }}>–</Interactive>
              <Interactive as="button" onClick={c.inc} style={{ cursor: 'pointer', width: 30, height: 28, border: '1px solid #d7d3d3', textAlign: 'center', fontWeight: 800 }} hoverStyle={{ background: '#faf4e2' }}>+</Interactive>
              <span style={{ fontSize: 11, color: '#7d7979' }}>Target</span>
              <Interactive as="input" value={c.target} onChange={c.setTarget} style={{ width: 44, border: '1px solid #d7d3d3', padding: '3px 6px', fontSize: 12, textAlign: 'center', background: '#fff' }} focusStyle={{ borderColor: GOLD }} />
              <span style={{ flex: 1 }} />
              <Interactive as="button" onClick={c.del} style={{ cursor: 'pointer', fontSize: 11, color: '#a33a28', padding: '4px 6px', border: '1px solid transparent' }} hoverStyle={{ borderColor: '#a33a28' }}>Del</Interactive>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid #eae7e7', paddingTop: 12, marginTop: 4 }}>
              <span style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: '#9b9797' }}>Reward</span>
              <Interactive as="input" value={c.reward} onChange={c.setReward} style={{ flex: 1, fontSize: 13, fontWeight: 700, color: GOLD_DEEP, border: 'none', borderBottom: '1px solid transparent', background: 'transparent', padding: 0 }} focusStyle={{ borderBottomColor: GOLD }} />
              <Interactive as="button" onClick={c.toggleDone} style={{ cursor: 'pointer', padding: '6px 11px', border: '1px solid ' + c.doneBorder, background: c.doneBg, color: c.doneFg, fontSize: 11.5, fontWeight: 700 }} hoverStyle={{ borderColor: 'var(--ink)' }}>{c.doneLabel}</Interactive>
            </div>
            {c.celebrate && (
              <div style={{ border: '2px solid ' + GOLD, background: '#faf4e2', padding: 14, display: 'flex', alignItems: 'center', gap: 12, animation: 'badge .5s cubic-bezier(.2,.9,.2,1)' }}>
                <span style={{ width: 38, height: 38, background: GOLD, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800 }}>★</span>
                <span style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: GOLD_DEEP }}>Badge earned</span>
                  <span style={{ fontSize: 15, fontWeight: 800 }}>{c.reward}</span>
                </span>
              </div>
            )}
          </div>
        ))}
        {challengeCards.length === 0 && (
          <div style={{ border: '1px dashed #d7d3d3', padding: 40, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 20, fontWeight: 800 }}>Create a challenge for this week.</span>
            <span style={{ fontSize: 13, color: '#7d7979' }}>Pick one thing to push on. Give it a target and a reward.</span>
          </div>
        )}
      </div>
    </section>
  );
}
