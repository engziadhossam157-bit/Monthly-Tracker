import { ds, dow, parseDate } from './dateUtils';
import { PRI, DOWFULL, DOW, MONTHS } from './constants';
import { weeksFor } from './seed';

export function pretty(s) {
  const d = parseDate(s);
  return DOW[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()].slice(0, 3);
}

export class Tracker {
  constructor(data, freeDayName, today) {
    this.data = data;
    this.freeDayName = freeDayName || 'Friday';
    this.today = today;
  }

  freeDow() {
    const i = DOWFULL.indexOf(this.freeDayName);
    return i < 0 ? 5 : i;
  }
  isFree(s) {
    return dow(s) === this.freeDow();
  }

  tasksOn(s) {
    return this.data.tasks.filter((t) => t.date === s);
  }
  habitDone(id, s) {
    return !!this.data.completions[id + '|' + s];
  }

  dayStats(s) {
    const d = this.data;
    const free = this.isFree(s);
    const ts = this.tasksOn(s);
    const out = { free, date: s, parts: [] };
    let wSum = 0;
    let sSum = 0;
    PRI.forEach((p) => {
      const set = ts.filter((t) => t.priority === p.key);
      const done = set.filter((t) => t.completed).length;
      out[p.key] = { total: set.length, done };
      if (set.length) {
        const r = done / set.length;
        wSum += p.weight;
        sSum += p.weight * r;
      }
      out.parts.push({ key: p.key, done, total: set.length });
    });
    const hs = d.habits.filter((h) => h.active);
    const hDone = hs.filter((h) => this.habitDone(h.id, s)).length;
    out.habits = { total: free ? 0 : hs.length, done: hDone };
    if (!free && hs.length) {
      wSum += 25;
      sSum += 25 * (hDone / hs.length);
    }
    out.score = free ? null : wSum ? Math.round((sSum / wSum) * 100) : 0;
    return out;
  }

  monthDays(y, m) {
    const dim = new Date(y, m + 1, 0).getDate();
    const out = [];
    for (let d = 1; d <= dim; d++) out.push(ds(y, m, d));
    return out;
  }
  pastDays(y, m) {
    return this.monthDays(y, m).filter((s) => s <= this.today);
  }

  monthAgg(y, m) {
    const days = this.pastDays(y, m).filter((s) => !this.isFree(s));
    const agg = { high: [0, 0], medium: [0, 0], low: [0, 0], habits: [0, 0] };
    days.forEach((s) => {
      const st = this.dayStats(s);
      PRI.forEach((p) => {
        agg[p.key][0] += st[p.key].done;
        agg[p.key][1] += st[p.key].total;
      });
      agg.habits[0] += st.habits.done;
      agg.habits[1] += st.habits.total;
    });
    return agg;
  }
  rate(a) {
    return a[1] ? a[0] / a[1] : 0;
  }

  weekIndexOf(s) {
    const d = parseDate(s);
    const ws = weeksFor(d.getFullYear(), d.getMonth());
    for (let i = 0; i < ws.length; i++) if (ws[i].days.indexOf(s) >= 0) return i;
    return 0;
  }

  monthScore(y, m) {
    const a = this.monthAgg(y, m);
    const d = this.data;
    const ch = d.challenges.filter((c) => c.week < this.weekIndexOf(this.today) + 1);
    const chRate = ch.length ? ch.filter((c) => c.completed).length / ch.length : 0;
    const s = 40 * this.rate(a.high) + 25 * this.rate(a.medium) + 10 * this.rate(a.low) + 15 * this.rate(a.habits) + 10 * chRate;
    return Math.round(s);
  }

  streak(y, m) {
    const days = this.pastDays(y, m).slice().reverse();
    let n = 0;
    for (let i = 0; i < days.length; i++) {
      const s = days[i];
      if (this.isFree(s)) continue;
      const st = this.dayStats(s);
      if (st.score >= 60) n++;
      else if (i === 0) continue;
      else break;
    }
    return n;
  }
  bestStreak(y, m) {
    const days = this.pastDays(y, m);
    let best = 0;
    let cur = 0;
    days.forEach((s) => {
      if (this.isFree(s)) return;
      if (this.dayStats(s).score >= 60) {
        cur++;
        best = Math.max(best, cur);
      } else cur = 0;
    });
    return best;
  }
  habitStats(h, y, m) {
    const days = this.pastDays(y, m).filter((s) => !this.isFree(s));
    const done = days.filter((s) => this.habitDone(h.id, s)).length;
    let best = 0;
    let cur = 0;
    let streak = 0;
    days.forEach((s) => {
      if (this.habitDone(h.id, s)) {
        cur++;
        best = Math.max(best, cur);
      } else cur = 0;
    });
    const rev = days.slice().reverse();
    for (let i = 0; i < rev.length; i++) {
      if (this.habitDone(h.id, rev[i])) streak++;
      else if (i === 0) continue;
      else break;
    }
    return { pct: days.length ? Math.round((done / days.length) * 100) : 0, done, missed: days.length - done, streak, best };
  }
  weekStats(i, y, m) {
    const w = weeksFor(y, m)[i];
    if (!w) return null;
    const days = w.days.filter((s) => s <= this.today);
    const work = days.filter((s) => !this.isFree(s));
    const agg = { high: [0, 0], medium: [0, 0], low: [0, 0], habits: [0, 0] };
    work.forEach((s) => {
      const st = this.dayStats(s);
      PRI.forEach((p) => {
        agg[p.key][0] += st[p.key].done;
        agg[p.key][1] += st[p.key].total;
      });
      agg.habits[0] += st.habits.done;
      agg.habits[1] += st.habits.total;
    });
    const ch = this.data.challenges.filter((c) => c.week === i)[0];
    const chRate = ch ? Math.min(1, (ch.progress || 0) / (ch.target || 1)) : 0;
    const score = Math.round(40 * this.rate(agg.high) + 25 * this.rate(agg.medium) + 10 * this.rate(agg.low) + 15 * this.rate(agg.habits) + 10 * chRate);
    const prod = work.filter((s) => this.dayStats(s).score >= 60).length;
    return { week: w, agg, score, chRate, productive: prod, days, work, ch };
  }

  curve(vals, w, h, base) {
    if (!vals.length) return '';
    const step = vals.length > 1 ? w / (vals.length - 1) : w;
    const ys = vals.map((v) => base - (v / 100) * h);
    let d = 'M 0 ' + ys[0].toFixed(1);
    for (let i = 1; i < ys.length; i++) {
      const x0 = (i - 1) * step;
      const x1 = i * step;
      const cx = (x0 + x1) / 2;
      d += ' C ' + cx.toFixed(1) + ' ' + ys[i - 1].toFixed(1) + ' ' + cx.toFixed(1) + ' ' + ys[i].toFixed(1) + ' ' + x1.toFixed(1) + ' ' + ys[i].toFixed(1);
    }
    return d;
  }
}
