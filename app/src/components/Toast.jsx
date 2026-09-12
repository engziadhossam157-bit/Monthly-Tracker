import { GOLD } from '../lib/constants';
import { useApp } from '../lib/AppContext';

export default function Toast() {
  const { state } = useApp();
  if (!state.toast) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 26, left: '50%', transform: 'translateX(-50%)', background: 'var(--ink)', color: '#fff',
      padding: '13px 20px', display: 'flex', alignItems: 'center', gap: 12, zIndex: 80, animation: 'riseIn .2s ease-out', boxShadow: 'var(--shadow-lg)',
    }}>
      <span style={{ width: 8, height: 8, background: GOLD, flex: 'none' }} />
      <span style={{ fontSize: 13 }}>{state.toast}</span>
    </div>
  );
}
