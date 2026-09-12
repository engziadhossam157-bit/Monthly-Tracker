import Interactive from '../components/Interactive';
import CheckBox from '../components/CheckBox';
import { useApp } from '../lib/AppContext';
import { groupsFor, habitCard } from '../lib/builders';
import { GOLD, GOLD_DEEP, INK, MONTHS, DOWFULL } from '../lib/constants';
import { parseDate, pad, dow } from '../lib/dateUtils';

export default function Dashboard() {
  const ctx = useApp();
  const { data, tracker, today, state, weeksFor, goTodayPage } = ctx;
  const { y, m } = state;

  const agg = tracker.monthAgg(y, m);
  const days = tracker.monthDays(y, m);
  const allTasks = data.tasks.filter((t) => t.date.indexOf(y + '-' + pad(m + 1)) === 0);
  const doneCount = allTasks.filter((t) => t.completed).length;
  const overall = allTasks.length ? Math.round((doneCount / allTasks.length) * 100) : 0;
  const streak = tracker.streak(y, m);
  const bestStreak = tracker.bestStreak(y, m);
  const curWeek = tracker.weekIndexOf(today);
  const weeks = weeksFor(y, m);
  const curWS = tracker.weekStats(curWeek, y, m);
  const monthLabel = MONTHS[m] + ' ' + y;
  const monthScore = tracker.monthScore(y, m);

  const kpis = [
    { label: 'Overall completion', value: overall + '%', sub: doneCount + ' of ' + allTasks.length + ' tasks', color: GOLD_DEEP },
    { label: 'Days this month', value: days.length, sub: days.filter((s) => tracker.isFree(s)).length + ' free days', color: INK },
    { label: 'Active habits', value: data.habits.filter((h) => h.active).length, sub: Math.round(tracker.rate(agg.habits) * 100) + '% kept', color: INK },
    { label: 'High priority', value: Math.round(tracker.rate(agg.high) * 100) + '%', sub: agg.high[0] + ' of ' + agg.high[1] + ' done', color: GOLD_DEEP },
    { label: 'Current streak', value: streak, sub: 'best ' + bestStreak + ' days', color: INK },
    { label: 'Weekly score', value: curWS ? curWS.score : 0, sub: 'week ' + (curWeek + 1) + ' of ' + weeks.length, color: INK },
  ];

  const todayStats = tracker.dayStats(today);
  const todayFree = tracker.isFree(today);
  const todayGroups = groupsFor(ctx, today);
  const activeHabits = data.habits.filter((h) => h.active);
  const todayHabits = activeHabits.map((h) => habitCard(ctx, h, today));
  const todayHabitLabel = todayStats.habits.done + ' of ' + activeHabits.length + ' kept' + (todayFree ? ' · optional today' : '');
  const todayLabel = DOWFULL[dow(today)] + ', ' + MONTHS[parseDate(today).getMonth()] + ' ' + parseDate(today).getDate();

  const chList = data.challenges.slice().sort((a, b) => a.week - b.week);
  const curCh = chList.filter((c) => c.week === state.week)[0] || chList.filter((c) => c.week === curWeek)[0];
  const curWeekLabel = weeks[curWeek] ? weeks[curWeek].label : '';
  const curChPct = curCh ? Math.min(100, Math.round(((curCh.progress || 0) / (curCh.target || 1)) * 100)) : 0;

  const dayVals = days.map((s) => (s <= today ? (tracker.dayStats(s).score === null ? null : tracker.dayStats(s).score) : null));
  const plotted = dayVals.map((v) => (v === null ? 0 : v));
  const monthCurve = tracker.curve(plotted, 480, 110, 120);
  const monthArea = monthCurve ? monthCurve + ' L 480 120 L 0 120 Z' : '';
  const monthFreeMarks = days.map((s, i) => ({ x: (i * (480 / Math.max(1, days.length - 1))).toFixed(1), free: tracker.isFree(s) })).filter((x) => x.free);

  const incChallenge = () => {
    const np = Math.min(curCh.target, (curCh.progress || 0) + 1);
    ctx.patch((dd) => { dd.challenges.filter((z) => z.id === curCh.id)[0].progress = np; });
    if (np >= curCh.target) ctx.markChallenge(curCh.id, true);
  };

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: '#7d7979' }}>Monthly overview</div>
            <h1 style={{ fontSize: 40, margin: '4px 0 0' }}>{monthLabel}</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
            <div style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: '#7d7979', paddingBottom: 8 }}>Monthly score</div>
            <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: '-.04em', lineHeight: 0.9, color: GOLD_DEEP }}>{monthScore}</div>
            <div style={{ fontSize: 15, color: '#7d7979', paddingBottom: 10 }}>/ 100</div>
          </div>
        </div>
        <div style={{ height: 2, background: 'var(--ink)', marginTop: 14 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))' }}>
          {kpis.map((k, i) => (
            <div key={i} style={{ borderRight: '1px solid #d7d3d3', borderBottom: '1px solid #d7d3d3', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: '#7d7979' }}>{k.label}</span>
              <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-.03em', color: k.color }}>{k.value}</span>
              <span style={{ fontSize: 11, color: '#9b9797' }}>{k.sub}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 22 }}>
        <div style={{ border: '1px solid #d7d3d3', borderTop: '3px solid ' + GOLD, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h3 style={{ fontSize: 15, letterSpacing: '.1em', textTransform: 'uppercase', margin: 0 }}>Today · {todayLabel}</h3>
            <Interactive as="button" onClick={goTodayPage} style={{ cursor: 'pointer', fontSize: 12, fontWeight: 700, color: GOLD_DEEP }} hoverStyle={{ color: INK }}>Open day →</Interactive>
          </div>
          {todayFree ? (
            <div style={{ marginTop: 18, border: '2px dashed ' + GOLD, padding: 22, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: GOLD_DEEP }}>Free day</span>
              <span style={{ fontSize: 20, fontWeight: 800 }}>Nothing is required of you.</span>
              <span style={{ fontSize: 13, color: '#605d5d' }}>Rest, catch up, or plan. Today cannot lower any score or break your streak.</span>
            </div>
          ) : (
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {todayGroups.map((g) => (
                <div key={g.key}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ width: 9, height: 9, background: g.color, display: 'inline-block' }} />
                    <span style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700 }}>{g.label}</span>
                    <span style={{ fontSize: 11, color: '#7d7979' }}>{g.countLabel}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {g.items.map((t) => (
                      <Interactive
                        as="button"
                        key={t.id}
                        onClick={t.toggle}
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', border: '1px solid #eae7e7', background: t.bg, width: '100%', textAlign: 'left' }}
                        hoverStyle={{ borderColor: GOLD }}
                      >
                        <CheckBox size={16} boxBorder={t.boxBorder} boxFill={t.boxFill} mark={t.mark} anim={t.anim} />
                        <span style={{ fontSize: 13.5, textDecoration: t.deco, color: t.fg }}>{t.title}</span>
                      </Interactive>
                    ))}
                    {g.empty && <span style={{ fontSize: 12.5, color: '#9b9797', padding: '6px 2px' }}>Nothing here yet.</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ border: '1px solid #d7d3d3', borderTop: '3px solid var(--ink)', padding: 20 }}>
          <h3 style={{ fontSize: 15, letterSpacing: '.1em', textTransform: 'uppercase', margin: '0 0 4px' }}>Habits today</h3>
          <div style={{ fontSize: 12, color: '#7d7979', marginBottom: 14 }}>{todayHabitLabel}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 8 }}>
            {todayHabits.map((h) => (
              <Interactive
                as="button"
                key={h.id}
                onClick={h.toggle}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, padding: '9px 11px', border: '1px solid ' + h.border, background: h.bg, textAlign: 'left' }}
                hoverStyle={{ borderColor: INK }}
              >
                <span style={{ width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, background: h.chipBg, color: h.chipFg, animation: h.anim, flex: 'none' }}>{h.icon}</span>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: h.fg }}>{h.name}</span>
              </Interactive>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 22 }}>
        <div style={{ border: '1px solid #d7d3d3', padding: 20 }}>
          <div style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: '#7d7979' }}>This week · {curWeekLabel}</div>
          {curCh ? (
            <div>
              <h3 style={{ fontSize: 24, margin: '8px 0 2px' }}>{curCh.title}</h3>
              <div style={{ fontSize: 13, color: '#605d5d' }}>{curCh.goal}</div>
              <div style={{ marginTop: 16, height: 14, background: '#eae7e7', border: '1px solid #d7d3d3' }}>
                <div style={{ height: '100%', background: GOLD, width: curChPct + '%', transition: 'width .5s cubic-bezier(.2,.8,.2,1)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: '#605d5d' }}>
                <span>{(curCh.progress || 0) + ' / ' + curCh.target}</span>
                <span style={{ color: GOLD_DEEP, fontWeight: 700 }}>{curCh.reward}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <Interactive as="button" onClick={incChallenge} style={{ cursor: 'pointer', padding: '7px 12px', border: '1px solid #d7d3d3', fontSize: 12, fontWeight: 700 }} hoverStyle={{ background: '#faf4e2' }}>+1 progress</Interactive>
                <Interactive as="button" onClick={() => ctx.setPage('challenges')} style={{ cursor: 'pointer', padding: '7px 12px', fontSize: 12, fontWeight: 700, color: GOLD_DEEP }} hoverStyle={{ color: INK }}>All challenges →</Interactive>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 18, fontWeight: 800 }}>Create a challenge for this week.</span>
              <span style={{ fontSize: 13, color: '#7d7979' }}>One target, one reward. Seven days.</span>
              <Interactive as="button" onClick={() => ctx.openModal('challenge', { week: state.week })} style={{ cursor: 'pointer', padding: '8px 14px', background: GOLD, fontWeight: 700, fontSize: 13 }} hoverStyle={{ background: 'var(--color-accent-400)' }}>+ New challenge</Interactive>
            </div>
          )}
        </div>

        <div style={{ border: '1px solid #d7d3d3', padding: 20 }}>
          <div style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: '#7d7979', marginBottom: 12 }}>Productivity · this month</div>
          <svg viewBox="0 0 480 140" style={{ width: '100%', height: 150, display: 'block' }}>
            <line x1="0" y1="120" x2="480" y2="120" stroke="#d7d3d3" strokeWidth="1" />
            <line x1="0" y1="60" x2="480" y2="60" stroke="#eae7e7" strokeWidth="1" strokeDasharray="3 4" />
            <path d={monthArea} fill="#faf4e2" />
            <path d={monthCurve} fill="none" stroke="#c9a227" strokeWidth="2.5" />
            {monthFreeMarks.map((f, i) => <circle key={i} cx={f.x} cy="120" r="2.6" fill="#9b9797" />)}
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9b9797', marginTop: 4 }}>
            <span>Day 1</span><span>Free days marked below the line</span><span>Day {days.length}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
