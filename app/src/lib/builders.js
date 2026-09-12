import { PRI, GOLD, GOLD_DEEP, INK } from './constants';
import { pretty } from './logic';

export function taskRow(ctx, t) {
  const p = PRI.filter((x) => x.key === t.priority)[0];
  return {
    id: t.id, title: t.title, priority: p.short, color: p.color, edge: t.completed ? '#d7d3d3' : p.color,
    category: t.category || 'Personal', notes: t.notes, hasNotes: !!t.notes, deadline: t.deadline, hasDeadline: !!t.deadline,
    bg: t.completed ? '#f8f4f4' : '#fff', fg: t.completed ? '#9b9797' : INK, deco: t.completed ? 'line-through' : 'none',
    mark: t.completed ? '✓' : '', boxBorder: t.completed ? GOLD : '#bab6b6', boxFill: t.completed ? GOLD : 'transparent',
    anim: ctx.state.anim['t' + t.id] ? 'pop .32s cubic-bezier(.2,.9,.2,1)' : 'none',
    dateLabel: pretty(t.date),
    toggle: () => ctx.toggleTask(t.id),
    del: () => ctx.patch((dd) => { dd.tasks = dd.tasks.filter((x) => x.id !== t.id); }, 'Task deleted.'),
    edit: () => ctx.openModal('task', { id: t.id, title: t.title, priority: t.priority, category: t.category, date: t.date, notes: t.notes || '', deadline: t.deadline || '' }),
    cycle: () => ctx.cyclePriority(t.id),
  };
}

export function groupsFor(ctx, date) {
  return PRI.map((p) => {
    const items = ctx.tracker.tasksOn(date).filter((t) => t.priority === p.key);
    const full = items.length >= p.limit;
    return {
      key: p.key, label: p.label, color: p.color, countLabel: items.filter((t) => t.completed).length + ' / ' + p.limit,
      items: items.map((t) => taskRow(ctx, t)), empty: items.length === 0,
      emptyLabel: p.key === 'high' ? '+ What is the one thing that matters today?' : '+ Add a ' + p.short.toLowerCase() + ' priority task',
      addLabel: full ? 'Limit reached' : '+ Add',
      addColor: full ? '#bab6b6' : GOLD_DEEP,
      add: () => (full ? ctx.say('The 1–3–5 rule: only ' + p.limit + ' ' + p.short + ' task' + (p.limit > 1 ? 's' : '') + ' per day.') : ctx.openModal('task', { date, priority: p.key })),
    };
  });
}

export function habitCard(ctx, h, date) {
  const on = ctx.tracker.habitDone(h.id, date);
  return {
    id: h.id, name: h.name, icon: h.icon, streak: ctx.tracker.habitStats(h, ctx.state.y, ctx.state.m).streak + 'd',
    border: on ? GOLD : '#eae7e7', bg: on ? '#faf4e2' : '#fff', fg: on ? INK : '#605d5d',
    chipBg: on ? GOLD : '#eae7e7', chipFg: on ? INK : '#7d7979',
    mark: on ? '✓' : '', boxBorder: on ? GOLD : '#bab6b6', boxFill: on ? GOLD : 'transparent',
    anim: ctx.state.anim['h' + h.id + '|' + date] ? 'pop .32s cubic-bezier(.2,.9,.2,1)' : 'none',
    toggle: () => ctx.toggleHabit(h.id, date),
  };
}
