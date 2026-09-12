import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ds, uid, parseDate } from './dateUtils';
import { PRI, INK, GOLD } from './constants';
import { seed, weeksFor } from './seed';
import { loadData, saveData } from './storage';
import { Tracker, pretty } from './logic';

const AppContext = createContext(null);

function now() {
  const n = new Date();
  return { y: n.getFullYear(), m: n.getMonth(), today: ds(n.getFullYear(), n.getMonth(), n.getDate()) };
}

export function AppProvider({ children }) {
  const init = useMemo(now, []);
  const today = init.today;

  const [data, setData] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [y, setY] = useState(init.y);
  const [m, setM] = useState(init.m);
  const [sel, setSel] = useState(today);
  const [week, setWeek] = useState(0);
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [detail, setDetail] = useState(null);
  const [anim, setAnim] = useState({});
  const [celebrate, setCelebrate] = useState({});
  const [toast, setToast] = useState(null);
  const [modal, setModalState] = useState(null);
  const toastTimer = useRef(null);
  const celebrateTimers = useRef({});
  const animTimers = useRef({});
  const dataRef = useRef(null);

  useEffect(() => {
    let d = loadData();
    if (!d || !d.habits) d = seed();
    if (!d.settings) d.settings = { freeDay: 'Friday' };
    dataRef.current = d;
    setData(d);
    const tracker = new Tracker(d, d.settings.freeDay, today);
    setWeek(tracker.weekIndexOf(today));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const freeDay = data?.settings?.freeDay || 'Friday';
  const tracker = useMemo(() => new Tracker(data || { tasks: [], habits: [], completions: {}, challenges: [] }, freeDay, today), [data, freeDay, today]);

  const save = useCallback((d) => {
    saveData(d);
  }, []);

  const patch = useCallback((fn, toastMsg) => {
    const draft = JSON.parse(JSON.stringify(dataRef.current));
    fn(draft);
    dataRef.current = draft;
    save(draft);
    setData(draft);
    if (toastMsg) {
      clearTimeout(toastTimer.current);
      setToast(toastMsg);
      toastTimer.current = setTimeout(() => setToast(null), 2600);
    }
  }, [save]);

  const say = useCallback((msg) => {
    clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const flash = useCallback((k) => {
    setAnim((a) => ({ ...a, [k]: Date.now() }));
    clearTimeout(animTimers.current[k]);
    animTimers.current[k] = setTimeout(() => {
      setAnim((a) => {
        const next = { ...a };
        delete next[k];
        return next;
      });
    }, 400);
  }, []);

  // ---- navigation ----
  const prevMonth = useCallback(() => {
    const dt = new Date(y, m - 1, 1);
    setY(dt.getFullYear()); setM(dt.getMonth()); setWeek(0); setDetail(null);
  }, [y, m]);
  const nextMonth = useCallback(() => {
    const dt = new Date(y, m + 1, 1);
    setY(dt.getFullYear()); setM(dt.getMonth()); setWeek(0); setDetail(null);
  }, [y, m]);
  const goToday = useCallback(() => {
    const dt = parseDate(today);
    setY(dt.getFullYear()); setM(dt.getMonth()); setSel(today); setWeek(tracker.weekIndexOf(today));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today]);
  const goTodayPage = useCallback(() => { setPage('today'); setSel(today); }, [today]);
  const shiftDay = useCallback((n) => {
    const dt = parseDate(sel);
    dt.setDate(dt.getDate() + n);
    const s = ds(dt.getFullYear(), dt.getMonth(), dt.getDate());
    setSel(s); setY(dt.getFullYear()); setM(dt.getMonth());
  }, [sel]);

  // ---- tasks ----
  const toggleTask = useCallback((id) => {
    let done = false;
    patch((d) => {
      const t = d.tasks.filter((x) => x.id === id)[0];
      if (t) {
        t.completed = !t.completed;
        t.completedAt = t.completed ? new Date().toISOString() : null;
        done = t.completed;
      }
    });
    if (done) flash('t' + id);
  }, [patch, flash]);

  const addTask = useCallback((t) => {
    const cap = PRI.filter((p) => p.key === t.priority)[0];
    const n = tracker.tasksOn(t.date).filter((x) => x.priority === t.priority).length;
    if (n >= cap.limit) {
      say('The 1–3–5 rule: only ' + cap.limit + ' ' + cap.short + ' task' + (cap.limit > 1 ? 's' : '') + ' per day. Finish or move one first.');
      return false;
    }
    patch((d) => {
      d.tasks.push(Object.assign({ id: uid(), completed: false, notes: '', deadline: '', createdAt: new Date().toISOString() }, t));
    }, 'Task added to ' + pretty(t.date) + '.');
    return true;
  }, [tracker, patch, say]);

  const cyclePriority = useCallback((id) => {
    const t = dataRef.current.tasks.filter((x) => x.id === id)[0];
    const i = PRI.map((p) => p.key).indexOf(t.priority);
    const next = PRI[(i + 1) % 3];
    const n = tracker.tasksOn(t.date).filter((x) => x.priority === next.key).length;
    if (n >= next.limit) { say(next.short + ' is full for this day (max ' + next.limit + ').'); return; }
    patch((d) => { const x = d.tasks.filter((z) => z.id === id)[0]; x.priority = next.key; }, 'Moved to ' + next.short + '.');
  }, [tracker, patch, say]);

  const toggleHabit = useCallback((id, s) => {
    if (s > today) { say('That day has not happened yet.'); return; }
    const k = id + '|' + s;
    const was = tracker.habitDone(id, s);
    patch((d) => {
      if (d.completions[k]) delete d.completions[k];
      else d.completions[k] = true;
    });
    if (!was) flash('h' + k);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today, tracker, patch, flash, say]);

  // ---- modal ----
  const openModal = useCallback((kind, extra) => {
    const base = { kind };
    if (kind === 'task') setModalState(Object.assign(base, { title: '', priority: 'high', category: 'Personal', date: sel, notes: '', deadline: '' }, extra));
    if (kind === 'habit') setModalState(Object.assign(base, { name: '', icon: '', category: 'Personal', frequency: 'Daily' }, extra));
    if (kind === 'challenge') setModalState(Object.assign(base, { title: '', goal: '', target: '5', reward: '', week }, extra));
  }, [sel, week]);
  const setModalField = useCallback((k, v) => {
    setModalState((m2) => ({ ...m2, [k]: v }));
  }, []);
  const closeModal = useCallback(() => setModalState(null), []);

  const submitModal = useCallback(() => {
    const modalNow = modal;
    if (!modalNow) return;
    const m2 = modalNow;
    if (m2.kind === 'task') {
      if (!m2.title.trim()) { say('Give the task a name.'); return; }
      if (m2.id) {
        patch((d) => {
          const t = d.tasks.filter((x) => x.id === m2.id)[0];
          t.title = m2.title; t.category = m2.category; t.notes = m2.notes; t.deadline = m2.deadline;
        }, 'Task updated.');
        setModalState(null);
        return;
      }
      if (addTask({ title: m2.title.trim(), date: m2.date, priority: m2.priority, category: m2.category, notes: m2.notes, deadline: m2.deadline })) setModalState(null);
      return;
    }
    if (m2.kind === 'habit') {
      if (!m2.name.trim()) { say('Give the habit a name.'); return; }
      const icon = (m2.icon || m2.name.trim().slice(0, 2)).toUpperCase();
      patch((d) => {
        d.habits.push({ id: uid(), name: m2.name.trim(), icon, category: m2.category, frequency: m2.frequency, target: '1 / day', active: true, focus: false });
      }, 'Habit created.');
      setModalState(null);
      return;
    }
    if (m2.kind === 'challenge') {
      if (!m2.title.trim()) { say('Give the challenge a name.'); return; }
      patch((d) => {
        d.challenges.push({ id: uid(), week: +m2.week, title: m2.title.trim(), goal: m2.goal, target: Math.max(1, parseInt(m2.target, 10) || 1), progress: 0, reward: m2.reward || 'Badge', completed: false });
      }, 'Challenge created.');
      setModalState(null);
    }
  }, [modal, patch, say, addTask]);

  const markChallenge = useCallback((id, done) => {
    patch((d) => {
      const c = d.challenges.filter((z) => z.id === id)[0];
      c.completed = done;
      if (done) c.progress = c.target;
    });
    if (done) {
      setCelebrate((c) => ({ ...c, [id]: true }));
      say('Challenge complete. Badge earned.');
      clearTimeout(celebrateTimers.current[id]);
      celebrateTimers.current[id] = setTimeout(() => {
        setCelebrate((c) => {
          const next = { ...c };
          delete next[id];
          return next;
        });
      }, 4000);
    }
  }, [patch, say]);

  // ---- data management ----
  const exportData = useCallback(() => {
    const blob = new Blob([JSON.stringify(dataRef.current, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'tracker-backup-' + today + '.json';
    a.click();
    say('Backup exported.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today, say]);

  const importData = useCallback(() => {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'application/json';
    inp.onchange = () => {
      const f = inp.files[0];
      if (!f) return;
      const rd = new FileReader();
      rd.onload = () => {
        try {
          const d = JSON.parse(rd.result);
          if (d && d.habits) {
            if (!d.settings) d.settings = { freeDay: 'Friday' };
            save(d);
            dataRef.current = d;
            setData(d);
            setToast('Backup restored.');
          } else say('That file is not a tracker backup.');
        } catch (err) {
          say('Could not read that file.');
        }
      };
      rd.readAsText(f);
    };
    inp.click();
  }, [save, say]);

  const resetData = useCallback(() => {
    const fresh = seed();
    fresh.settings = { freeDay: 'Friday' };
    save(fresh);
    dataRef.current = fresh;
    setData(fresh);
    setToast('Data reset to a fresh month.');
  }, [save]);

  const setFreeDay = useCallback((name) => {
    if (name === freeDay) { say(name + ' is already the free day.'); return; }
    patch((d) => { d.settings = d.settings || {}; d.settings.freeDay = name; }, name + ' is now your free day.');
  }, [freeDay, patch, say]);

  // ---- keyboard shortcuts ----
  useEffect(() => {
    const handler = (e) => {
      const tag = (e.target && e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') {
        if (e.key === 'Escape') e.target.blur();
        return;
      }
      const k = e.key.toLowerCase();
      if (k === 'escape') { setModalState(null); setQuery(''); return; }
      if (k === 'n') { e.preventDefault(); openModal('task'); }
      else if (k === 'h') { e.preventDefault(); openModal('habit'); }
      else if (k === 'c') { e.preventDefault(); openModal('challenge'); }
      else if (k === 't') { setPage('today'); setSel(today); }
      else if (k === 'a') setPage('analytics');
      else if (k === 'g') setPage('calendar');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal, today]);

  const chip = useCallback((on) => (on ? { border: INK, bg: INK, fg: '#fff' } : { border: '#d7d3d3', bg: '#fff', fg: '#605d5d' }), []);

  const value = {
    data, tracker, today, freeDay, GOLD,
    state: { page, y, m, sel, week, filter, query, detail, anim, celebrate, toast, modal },
    setPage, setY, setM, setSel, setWeek, setFilter, setQuery, setDetail,
    prevMonth, nextMonth, goToday, goTodayPage, shiftDay, prevDay: () => shiftDay(-1), nextDay: () => shiftDay(1),
    toggleTask, addTask, cyclePriority, toggleHabit,
    openModal, setModalField, closeModal, submitModal,
    markChallenge, exportData, importData, resetData, setFreeDay,
    patch, say, flash, chip,
    weeksFor,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
