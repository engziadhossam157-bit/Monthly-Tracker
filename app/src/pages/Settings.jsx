import { useState } from 'react';
import Interactive from '../components/Interactive';
import { useApp } from '../lib/AppContext';
import { DOWFULL, GOLD, INK } from '../lib/constants';
import { setPassphrase, verifyPassphrase } from '../lib/auth';

const REMINDER_DEFS = [
  ['high', 'Don’t forget your High Priority task.'],
  ['evening', 'Time for your evening habit check.'],
  ['review', 'Weekly review is waiting.'],
  ['challenge', 'Your weekly challenge ends tomorrow.'],
];
const SHORTCUTS = [
  ['N', 'New task'], ['H', 'New habit'], ['C', 'New challenge'], ['T', 'Jump to today'],
  ['A', 'Analytics'], ['G', 'Calendar grid'], ['Esc', 'Close modal'],
];

const inputStyle = { border: '1px solid #d7d3d3', padding: '8px 10px', fontSize: 13, background: '#fff', color: INK, width: '100%' };

function LockCard({ say }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const ok = await verifyPassphrase(current);
    if (!ok) { say('Current passphrase is not correct.'); return; }
    if (next.trim().length < 4) { say('New passphrase needs at least 4 characters.'); return; }
    if (next !== confirm) { say('New passphrase and confirmation don’t match.'); return; }
    await setPassphrase(next);
    setCurrent(''); setNext(''); setConfirm('');
    say('Passphrase updated.');
  };

  return (
    <div style={{ border: '1px solid #d7d3d3', padding: 20 }}>
      <h3 style={{ fontSize: 14, letterSpacing: '.14em', textTransform: 'uppercase', margin: '0 0 6px' }}>Lock</h3>
      <div style={{ fontSize: 12, color: '#9b9797', marginBottom: 14 }}>Change the passphrase required to open this tracker on this device.</div>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Interactive as="input" type="password" placeholder="Current passphrase" value={current} onChange={(e) => setCurrent(e.target.value)} style={inputStyle} focusStyle={{ borderColor: GOLD }} />
        <Interactive as="input" type="password" placeholder="New passphrase" value={next} onChange={(e) => setNext(e.target.value)} style={inputStyle} focusStyle={{ borderColor: GOLD }} />
        <Interactive as="input" type="password" placeholder="Confirm new passphrase" value={confirm} onChange={(e) => setConfirm(e.target.value)} style={inputStyle} focusStyle={{ borderColor: GOLD }} />
        <Interactive as="button" type="submit" style={{ cursor: 'pointer', padding: '8px 14px', background: GOLD, fontWeight: 700, fontSize: 13, marginTop: 4 }} hoverStyle={{ background: 'var(--color-accent-400)' }}>Update passphrase</Interactive>
      </form>
    </div>
  );
}

export default function Settings() {
  const ctx = useApp();
  const { data, freeDay, patch, exportData, importData, resetData, setFreeDay, chip, say } = ctx;

  const reminders = REMINDER_DEFS.map(([key, label]) => {
    const on = !!(data.reminders || {})[key];
    return {
      key, label, trackBg: on ? GOLD : '#d7d3d3', knob: on ? 16 : 0,
      toggle: () => patch((dd) => { dd.reminders[key] = !dd.reminders[key]; }),
    };
  });
  const storageLabel = data.tasks.length + ' tasks · ' + data.habits.length + ' habits · ' + Object.keys(data.completions).length + ' habit check-ins stored locally on this machine.';
  const freeDayOpts = DOWFULL.map((n) => ({ name: n, ...chip(n === freeDay), go: () => setFreeDay(n) }));

  return (
    <section>
      <div>
        <div style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: '#7d7979' }}>Local, offline, yours</div>
        <h1 style={{ fontSize: 34, margin: '4px 0 0' }}>Settings</h1>
      </div>
      <div style={{ height: 2, background: 'var(--ink)', margin: '14px 0 24px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 22 }}>
        <div style={{ border: '1px solid #d7d3d3', padding: 20 }}>
          <h3 style={{ fontSize: 14, letterSpacing: '.14em', textTransform: 'uppercase', margin: '0 0 14px' }}>Reminders</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {reminders.map((r) => (
              <Interactive as="button" key={r.key} onClick={r.toggle} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, border: '1px solid #eae7e7', padding: 11, width: '100%', textAlign: 'left' }} hoverStyle={{ borderColor: INK }}>
                <span style={{ width: 34, height: 18, background: r.trackBg, display: 'inline-flex', alignItems: 'center', padding: 2, flex: 'none' }}>
                  <span style={{ width: 14, height: 14, background: '#fff', display: 'block', transform: 'translateX(' + r.knob + 'px)', transition: 'transform .22s' }} />
                </span>
                <span style={{ fontSize: 13, flex: 1 }}>{r.label}</span>
              </Interactive>
            ))}
          </div>
        </div>
        <div style={{ border: '1px solid #d7d3d3', padding: 20 }}>
          <h3 style={{ fontSize: 14, letterSpacing: '.14em', textTransform: 'uppercase', margin: '0 0 8px' }}>Data</h3>
          <div style={{ fontSize: 12.5, color: '#605d5d', marginBottom: 14 }}>{storageLabel}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <Interactive as="button" onClick={exportData} style={{ cursor: 'pointer', padding: '8px 14px', background: GOLD, fontWeight: 700, fontSize: 13 }} hoverStyle={{ background: 'var(--color-accent-400)' }}>Export backup</Interactive>
            <Interactive as="button" onClick={importData} style={{ cursor: 'pointer', padding: '8px 14px', border: '1px solid #d7d3d3', fontWeight: 700, fontSize: 13 }} hoverStyle={{ background: '#faf4e2' }}>Import backup</Interactive>
            <Interactive as="button" onClick={resetData} style={{ cursor: 'pointer', padding: '8px 14px', border: '1px solid #a33a28', color: '#a33a28', fontWeight: 700, fontSize: 13 }} hoverStyle={{ background: '#a33a28', color: '#fff' }}>Reset all data</Interactive>
          </div>
          <div style={{ height: 1, background: '#eae7e7', margin: '20px 0 14px' }} />
          <h3 style={{ fontSize: 14, letterSpacing: '.14em', textTransform: 'uppercase', margin: '0 0 10px' }}>Free day</h3>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {freeDayOpts.map((d) => (
              <Interactive as="button" key={d.name} onClick={d.go} style={{ cursor: 'pointer', padding: '6px 11px', fontSize: 12, fontWeight: 700, border: '1px solid ' + d.border, background: d.bg, color: d.fg }} hoverStyle={{ borderColor: INK }}>{d.name.slice(0, 3)}</Interactive>
            ))}
          </div>
        </div>
        <LockCard say={say} />
        <div style={{ border: '1px solid #d7d3d3', padding: 20 }}>
          <h3 style={{ fontSize: 14, letterSpacing: '.14em', textTransform: 'uppercase', margin: '0 0 14px' }}>Keyboard</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SHORTCUTS.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #eae7e7', paddingBottom: 7 }}>
                <span style={{ border: '1px solid var(--ink)', padding: '2px 8px', fontSize: 11, fontWeight: 800, minWidth: 26, textAlign: 'center' }}>{s[0]}</span>
                <span style={{ fontSize: 13, color: '#605d5d' }}>{s[1]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
