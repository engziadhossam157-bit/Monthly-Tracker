import Interactive from '../components/Interactive';
import CheckBox from '../components/CheckBox';
import { useApp } from '../lib/AppContext';
import { groupsFor, habitCard } from '../lib/builders';
import { pretty } from '../lib/logic';
import { GOLD, GOLD_DEEP, INK, MONTHS, DOWFULL } from '../lib/constants';
import { parseDate, dow } from '../lib/dateUtils';

export default function Today() {
  const ctx = useApp();
  const { data, tracker, state, prevDay, nextDay } = ctx;
  const sel = state.sel;

  const selStats = tracker.dayStats(sel);
  const selWeights = [
    { label: 'High', weight: '40%', a: selStats.high, color: GOLD },
    { label: 'Medium', weight: '25%', a: selStats.medium, color: '#7d7979' },
    { label: 'Low', weight: '10%', a: selStats.low, color: '#bab6b6' },
    { label: 'Habits', weight: '25%', a: selStats.habits, color: GOLD_DEEP },
  ].map((w) => ({
    label: w.label, weight: w.weight, color: w.color,
    val: w.a.done + ' / ' + w.a.total, pct: w.a.total ? Math.round((w.a.done / w.a.total) * 100) : 0,
  }));

  const selDateLabel = DOWFULL[dow(sel)] + ', ' + MONTHS[parseDate(sel).getMonth()] + ' ' + parseDate(sel).getDate();
  const selDayScoreLabel = selStats.free ? 'Free day · excluded from all scores' : 'Weighted: high 40 · medium 25 · low 10 · habits 25';
  const selDayScore = selStats.score === null ? 'FREE' : selStats.score;
  const selScoreUnit = selStats.score === null ? 'day' : '/ 100';
  const selScoreColor = selStats.score === null ? GOLD_DEEP : selStats.score >= 60 ? GOLD_DEEP : INK;
  const dayGroups = groupsFor(ctx, sel);
  const selHabitChecks = data.habits.filter((h) => h.active).map((h) => habitCard(ctx, h, sel));

  return (
    <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)', gap: 26 }}>
      <div>
        <div style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: '#7d7979' }}>Daily view</div>
        <h1 style={{ fontSize: 36, margin: '4px 0 0' }}>{selDateLabel}</h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 10 }}>
          <Interactive as="button" onClick={prevDay} style={{ cursor: 'pointer', padding: '5px 10px', border: '1px solid #d7d3d3', fontSize: 12, fontWeight: 700 }} hoverStyle={{ background: '#faf4e2' }}>‹ Prev</Interactive>
          <Interactive as="button" onClick={nextDay} style={{ cursor: 'pointer', padding: '5px 10px', border: '1px solid #d7d3d3', fontSize: 12, fontWeight: 700 }} hoverStyle={{ background: '#faf4e2' }}>Next ›</Interactive>
          <span style={{ fontSize: 12, color: '#7d7979' }}>{selDayScoreLabel}</span>
        </div>
        <div style={{ height: 2, background: 'var(--ink)', margin: '16px 0 22px' }} />

        {selStats.free && (
          <div style={{ border: '2px dashed ' + GOLD, padding: 28, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 22 }}>
            <span style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: GOLD_DEEP }}>Free day</span>
            <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.02em' }}>No 1–3–5 required.</span>
            <span style={{ fontSize: 13.5, color: '#605d5d', maxWidth: '50ch' }}>Anything you add today is optional. Free days are excluded from completion rates, streaks, weekly and monthly scores.</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {dayGroups.map((g) => (
            <div key={g.key}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '2px solid var(--ink)', paddingBottom: 8 }}>
                <span style={{ width: 11, height: 11, background: g.color }} />
                <h3 style={{ fontSize: 14, letterSpacing: '.14em', textTransform: 'uppercase', margin: 0 }}>{g.label}</h3>
                <span style={{ fontSize: 12, color: '#7d7979' }}>{g.countLabel}</span>
                <span style={{ flex: 1 }} />
                <Interactive as="button" onClick={g.add} style={{ cursor: 'pointer', fontSize: 12, fontWeight: 700, color: g.addColor }} hoverStyle={{ color: INK }}>{g.addLabel}</Interactive>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
                {g.items.map((t) => (
                  <Interactive
                    key={t.id}
                    style={{ border: '1px solid #eae7e7', borderLeft: '3px solid ' + t.edge, background: t.bg, padding: '11px 13px', display: 'flex', gap: 12, alignItems: 'flex-start' }}
                    hoverStyle={{ borderColor: '#bab6b6' }}
                  >
                    <Interactive as="button" onClick={t.toggle} style={{ cursor: 'pointer', flex: 'none', marginTop: 1 }}>
                      <CheckBox size={19} fontSize={12} boxBorder={t.boxBorder} boxFill={t.boxFill} mark={t.mark} anim={t.anim} />
                    </Interactive>
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 14.5, fontWeight: 600, textDecoration: t.deco, color: t.fg }}>{t.title}</span>
                      <span style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 11, color: '#7d7979' }}>
                        <span style={{ border: '1px solid #d7d3d3', padding: '1px 6px' }}>{t.category}</span>
                        {t.hasDeadline && <span>Due {t.deadline}</span>}
                        {t.hasNotes && <span style={{ color: '#605d5d' }}>{t.notes}</span>}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 4, flex: 'none' }}>
                      <Interactive as="button" onClick={t.edit} title="Edit" style={{ cursor: 'pointer', padding: '3px 7px', fontSize: 11, color: '#7d7979', border: '1px solid transparent' }} hoverStyle={{ borderColor: '#d7d3d3', color: INK }}>Edit</Interactive>
                      <Interactive as="button" onClick={t.cycle} title="Move priority" style={{ cursor: 'pointer', padding: '3px 7px', fontSize: 11, color: '#7d7979', border: '1px solid transparent' }} hoverStyle={{ borderColor: '#d7d3d3', color: INK }}>Move</Interactive>
                      <Interactive as="button" onClick={t.del} title="Delete" style={{ cursor: 'pointer', padding: '3px 7px', fontSize: 11, color: '#a33a28', border: '1px solid transparent' }} hoverStyle={{ borderColor: '#a33a28' }}>Del</Interactive>
                    </div>
                  </Interactive>
                ))}
                {g.empty && (
                  <Interactive as="button" onClick={g.add} style={{ cursor: 'pointer', border: '1px dashed #d7d3d3', padding: 16, fontSize: 13, color: '#9b9797', textAlign: 'left' }} hoverStyle={{ borderColor: GOLD, color: GOLD_DEEP }}>{g.emptyLabel}</Interactive>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ border: '1px solid #d7d3d3', borderTop: '3px solid ' + GOLD, padding: 18 }}>
          <div style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: '#7d7979' }}>Day score</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '6px 0 12px' }}>
            <span style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-.04em', color: selScoreColor }}>{selDayScore}</span>
            <span style={{ fontSize: 13, color: '#7d7979' }}>{selScoreUnit}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {selWeights.map((w, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#605d5d' }}>
                  <span style={{ letterSpacing: '.1em', textTransform: 'uppercase' }}>{w.label} · {w.weight}</span>
                  <span style={{ fontWeight: 700 }}>{w.val}</span>
                </div>
                <div style={{ height: 6, background: '#eae7e7' }}><div style={{ height: '100%', background: w.color, width: w.pct + '%', transition: 'width .4s' }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ border: '1px solid #d7d3d3', padding: 18 }}>
          <div style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: '#7d7979', marginBottom: 12 }}>Habits · {pretty(sel)}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {selHabitChecks.map((h) => (
              <Interactive
                as="button"
                key={h.id}
                onClick={h.toggle}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', border: '1px solid ' + h.border, background: h.bg, width: '100%', textAlign: 'left' }}
                hoverStyle={{ borderColor: INK }}
              >
                <CheckBox size={16} fontSize={10} boxBorder={h.boxBorder} boxFill={h.boxFill} mark={h.mark} anim={h.anim} />
                <span style={{ fontSize: 13, fontWeight: 600, flex: 1, color: h.fg }}>{h.name}</span>
                <span style={{ fontSize: 11, color: '#9b9797' }}>{h.streak}</span>
              </Interactive>
            ))}
          </div>
        </div>
      </aside>
    </section>
  );
}
