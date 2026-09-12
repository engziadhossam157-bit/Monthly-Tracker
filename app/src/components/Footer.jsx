import { GOLD } from '../lib/constants';

export default function Footer() {
  return (
    <footer style={{ marginTop: 44, borderTop: '1px solid #d7d3d3', padding: '20px 0 4px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <span style={{ width: 26, height: 2, background: GOLD, marginTop: 11, flex: 'none' }} />
      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: '#7d7979', maxWidth: '78ch', fontStyle: 'italic' }}>
        “Monthly planning is exactly like carving a path through the wilderness of your goals; it helps you stay on track and avoid getting lost.”
      </p>
    </footer>
  );
}
