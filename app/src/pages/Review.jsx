import Interactive from '../components/Interactive';
import { useApp } from '../lib/AppContext';
import { BAD, DOW, GOLD, GOLD_DEEP, INK, OK, PRI } from '../lib/constants';
import { dow } from '../lib/dateUtils';

export default function Review() {
  const ctx = useApp();
  const { data, tracker, today, state, weeksFor, setWeek, chip, patch } = ctx;
  const weeks = weeksFor(state.y, state.m);
  const ws = tracker.weekStats(state.week, state.y, state.m) || tracker.weekStats(0, state.y, state.m);
  const rev = data.reviews[state.week] || { good: '', bad: '', lessons: '' };
  const setRev = (k) => (e) => {
    const v = e.target.value;
    patch((dd) => {
      dd.reviews[state.week] = Object.assign({ good: '', bad: '', lessons: '' }, dd.reviews[state.week], { [k]: v });
    });
  };

  const weekHabitBars = data.habits.filter((h) => h.active).map((h) => {
    const w2 = ws.work;
    const done = w2.filter((s) => tracker.habitDone(h.id, s)).length;
    const pct = w2.length ? Math.round((done / w2.length) * 100) : 0;
    return { label: h.name, pct, val: pct + '%', color: pct >= 70 ? GOLD : '#bab6b6' };
  }).sort((a, b) => b.pct - a.pct);

  const wkDays = ws.week.days;
  const wkVals = wkDays.map((s) => {
    if (s > today) return 0;
    const x = tracker.dayStats(s);
    return x.score === null ? 0 : x.score;
  });
  const weekCurve = tracker.curve(wkVals, 320, 90, 110);
  const stepX = wkDays.length > 1 ? 320 / (wkDays.length - 1) : 320;
  const weekPoints = wkDays.map((s, i) => {
    const fr = tracker.isFree(s);
    return {
      key: s, x: (i * stepX).toFixed(1), y: (110 - (wkVals[i] / 100) * 90).toFixed(1),
      fill: fr ? '#9b9797' : GOLD, label: fr ? 'FREE' : DOW[dow(s)].toUpperCase(), labelColor: fr ? GOLD_DEEP : '#9b9797',
    };
  });

  const weekKpis = [
    { label: 'Weekly score', value: ws.score, sub: 'high 40 · med 25 · low 10 · habits 15 · challenge 10', color: GOLD_DEEP },
    { label: 'Productive days', value: ws.productive, sub: 'of ' + ws.work.length + ' working days', color: INK },
    { label: 'High priority', value: Math.round(tracker.rate(ws.agg.high) * 100) + '%', sub: ws.agg.high[0] + ' of ' + ws.agg.high[1], color: INK },
    { label: 'Habits kept', value: Math.round(tracker.rate(ws.agg.habits) * 100) + '%', sub: ws.agg.habits[0] + ' of ' + ws.agg.habits[1], color: INK },
    { label: 'Challenge', value: Math.round(ws.chRate * 100) + '%', sub: ws.ch ? ws.ch.title : 'none set', color: INK },
  ];
  const weekTaskBars = PRI.map((p) => {
    const a = ws.agg[p.key];
    const pct = a[1] ? Math.round((a[0] / a[1]) * 100) : 0;
    return { label: p.short, pct, val: a[0] + ' / ' + a[1] + ' · ' + pct + '%', color: p.color };
  });
  const weekTabs = weeks.map((w, i) => ({ label: 'W' + (i + 1), ...chip(state.week === i), go: () => setWeek(i) }));
  const reviewFields = [
    { key: 'good', label: 'Good', hint: 'What went well?', color: OK, value: rev.good, placeholder: 'Held the High Priority task every day…', onChange: setRev('good') },
    { key: 'bad', label: 'Bad', hint: 'What didn’t go well?', color: BAD, value: rev.bad, placeholder: 'Missed morning habits twice…', onChange: setRev('bad') },
    { key: 'lessons', label: 'Lessons', hint: 'What did I learn?', color: GOLD, value: rev.lessons, placeholder: 'I work better in the morning…', onChange: setRev('lessons') },
  ];

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 14, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: '#7d7979' }}>Reflect · {ws.week.label}</div>
          <h1 style={{ fontSize: 34, margin: '4px 0 0' }}>Week {state.week + 1} review</h1>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {weekTabs.map((w, i) => (
            <Interactive as="button" key={i} onClick={w.go} style={{ cursor: 'pointer', padding: '7px 13px', fontSize: 12, fontWeight: 700, border: '1px solid ' + w.border, background: w.bg, color: w.fg }} hoverStyle={{ borderColor: INK }}>{w.label}</Interactive>
          ))}
        </div>
      </div>
      <div style={{ height: 2, background: 'var(--ink)', margin: '14px 0 0' }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))' }}>
        {weekKpis.map((k, i) => (
          <div key={i} style={{ borderRight: '1px solid #d7d3d3', borderBottom: '1px solid #d7d3d3', padding: '14px 16px', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: '#7d7979' }}>{k.label}</span>
            <span style={{ fontSize: 27, fontWeight: 800, letterSpacing: '-.03em', color: k.color }}>{k.value}</span>
            <span style={{ fontSize: 11, color: '#9b9797' }}>{k.sub}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 24, marginTop: 26 }}>
        <div style={{ border: '1px solid #d7d3d3', padding: 18 }}>
          <div style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: '#7d7979', marginBottom: 14 }}>Task completion</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {weekTaskBars.map((b, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 4 }}><span style={{ letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700 }}>{b.label}</span><span style={{ color: '#605d5d' }}>{b.val}</span></div>
                <div style={{ height: 10, background: '#eae7e7' }}><div style={{ height: '100%', background: b.color, width: b.pct + '%', transition: 'width .4s' }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ border: '1px solid #d7d3d3', padding: 18 }}>
          <div style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: '#7d7979', marginBottom: 14 }}>Habit performance</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {weekHabitBars.map((b, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '118px minmax(0,1fr) 42px', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.label}</span>
                <span style={{ display: 'block', height: 10, background: '#eae7e7' }}><span style={{ display: 'block', height: '100%', background: b.color, width: b.pct + '%' }} /></span>
                <span style={{ fontSize: 11.5, color: '#605d5d', textAlign: 'right' }}>{b.val}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ border: '1px solid #d7d3d3', padding: 18 }}>
          <div style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: '#7d7979', marginBottom: 10 }}>Productivity curve</div>
          <svg viewBox="0 0 320 130" style={{ width: '100%', height: 140, display: 'block' }}>
            <line x1="0" y1="110" x2="320" y2="110" stroke="#d7d3d3" />
            <path d={weekCurve} fill="none" stroke="#c9a227" strokeWidth="2.5" />
            {weekPoints.map((p) => <circle key={p.key} cx={p.x} cy={p.y} r="3.5" fill={p.fill} />)}
          </svg>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', fontSize: 10, color: '#9b9797' }}>
            {weekPoints.map((p) => <span key={p.key} style={{ textAlign: 'center', color: p.labelColor }}>{p.label}</span>)}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 0, marginTop: 26, borderTop: '2px solid var(--ink)' }}>
        {reviewFields.map((f) => (
          <div key={f.key} style={{ borderRight: '1px solid #d7d3d3', borderBottom: '1px solid #d7d3d3', padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ width: 10, height: 10, background: f.color }} />
              <h3 style={{ fontSize: 15, letterSpacing: '.14em', textTransform: 'uppercase', margin: 0 }}>{f.label}</h3>
            </div>
            <div style={{ fontSize: 12, color: '#9b9797', marginBottom: 10 }}>{f.hint}</div>
            <Interactive
              as="textarea" value={f.value} onChange={f.onChange} placeholder={f.placeholder}
              style={{ width: '100%', minHeight: 150, border: '1px solid #d7d3d3', padding: 11, fontSize: 13.5, lineHeight: 1.6, resize: 'vertical', background: '#fff', color: INK }}
              focusStyle={{ borderColor: GOLD }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
