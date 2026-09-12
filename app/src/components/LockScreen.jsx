import { useState } from 'react';
import Interactive from './Interactive';
import { GOLD, GOLD_DEEP, INK } from '../lib/constants';
import { STORAGE_KEY } from '../lib/constants';
import { hasPassphrase, setPassphrase, verifyPassphrase, clearPassphrase } from '../lib/auth';

const inputStyle = { border: '1px solid #d7d3d3', padding: '10px 12px', fontSize: 14, background: '#fff', color: INK, width: '100%' };
const cardStyle = { background: '#fff', border: '2px solid var(--ink)', width: 'min(420px,100%)', padding: 32, boxShadow: 'var(--shadow-lg)' };

function Shell({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', padding: 24 }}>
      <div style={cardStyle}>
        <div style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: '#7d7979' }}>My productivity</div>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1.1, margin: '6px 0 24px' }}>
          1 · 3 · 5<span style={{ color: GOLD }}> TRACKER</span>
        </div>
        {children}
      </div>
    </div>
  );
}

function SetupForm({ onDone }) {
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (pass.trim().length < 4) { setError('Use at least 4 characters.'); return; }
    if (pass !== confirm) { setError('Passphrases don’t match.'); return; }
    await setPassphrase(pass);
    onDone();
  };

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: '#7d7979', marginBottom: 4 }}>First run</div>
        <h1 style={{ fontSize: 22, margin: 0 }}>Set a passphrase</h1>
        <p style={{ fontSize: 13, color: '#605d5d', lineHeight: 1.5, marginTop: 8 }}>
          This stays on this device only — there is no account and no server, so there is no password reset either. Choose something you will remember.
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <label style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: '#7d7979' }}>Passphrase</label>
        <Interactive as="input" type="password" autoFocus value={pass} onChange={(e) => { setPass(e.target.value); setError(''); }} style={inputStyle} focusStyle={{ borderColor: GOLD }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <label style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: '#7d7979' }}>Confirm passphrase</label>
        <Interactive as="input" type="password" value={confirm} onChange={(e) => { setConfirm(e.target.value); setError(''); }} style={inputStyle} focusStyle={{ borderColor: GOLD }} />
      </div>
      {error && <div style={{ fontSize: 12.5, color: '#a33a28' }}>{error}</div>}
      <Interactive as="button" type="submit" style={{ cursor: 'pointer', padding: '11px 18px', background: GOLD, fontWeight: 800, fontSize: 14 }} hoverStyle={{ background: 'var(--color-accent-400)' }}>
        Set passphrase &amp; continue
      </Interactive>
    </form>
  );
}

function UnlockForm({ onDone }) {
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [confirmingWipe, setConfirmingWipe] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const ok = await verifyPassphrase(pass);
    if (!ok) { setError('That passphrase is not correct.'); return; }
    onDone();
  };

  const wipe = () => {
    clearPassphrase();
    try { localStorage.removeItem(STORAGE_KEY); } catch (err) { /* storage unavailable */ }
    window.location.reload();
  };

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: '#7d7979', marginBottom: 4 }}>Locked</div>
        <h1 style={{ fontSize: 22, margin: 0 }}>Enter your passphrase</h1>
        <p style={{ fontSize: 13, color: '#605d5d', lineHeight: 1.5, marginTop: 8 }}>This tracker is locked to this device.</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <label style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: '#7d7979' }}>Passphrase</label>
        <Interactive as="input" type="password" autoFocus value={pass} onChange={(e) => { setPass(e.target.value); setError(''); }} style={inputStyle} focusStyle={{ borderColor: GOLD }} />
      </div>
      {error && <div style={{ fontSize: 12.5, color: '#a33a28' }}>{error}</div>}
      <Interactive as="button" type="submit" style={{ cursor: 'pointer', padding: '11px 18px', background: GOLD, fontWeight: 800, fontSize: 14 }} hoverStyle={{ background: 'var(--color-accent-400)' }}>
        Unlock
      </Interactive>

      <div style={{ borderTop: '1px solid #eae7e7', paddingTop: 14, marginTop: 4 }}>
        {!confirmingWipe ? (
          <Interactive as="button" type="button" onClick={() => setConfirmingWipe(true)} style={{ cursor: 'pointer', fontSize: 12, color: '#9b9797' }} hoverStyle={{ color: GOLD_DEEP }}>
            Forgot your passphrase?
          </Interactive>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 12.5, color: '#605d5d', lineHeight: 1.5 }}>
              There is no recovery — the only option is to erase all local tracker data and start over. This cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Interactive as="button" type="button" onClick={wipe} style={{ cursor: 'pointer', padding: '7px 12px', border: '1px solid #a33a28', color: '#a33a28', fontWeight: 700, fontSize: 12.5 }} hoverStyle={{ background: '#a33a28', color: '#fff' }}>
                Erase &amp; start over
              </Interactive>
              <Interactive as="button" type="button" onClick={() => setConfirmingWipe(false)} style={{ cursor: 'pointer', padding: '7px 12px', border: '1px solid #d7d3d3', fontWeight: 700, fontSize: 12.5 }} hoverStyle={{ background: '#faf4e2' }}>
                Cancel
              </Interactive>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}

export default function LockScreen({ onUnlock }) {
  const [needsSetup] = useState(() => !hasPassphrase());
  return <Shell>{needsSetup ? <SetupForm onDone={onUnlock} /> : <UnlockForm onDone={onUnlock} />}</Shell>;
}
