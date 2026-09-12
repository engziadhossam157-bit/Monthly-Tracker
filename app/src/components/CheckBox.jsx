export default function CheckBox({ size = 16, boxBorder, boxFill, mark, anim, fontSize = 11 }) {
  return (
    <span style={{
      width: size, height: size, border: '2px solid ' + boxBorder, background: boxFill,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize, fontWeight: 800,
      color: '#fff', animation: anim, flex: 'none',
    }}>
      {mark}
    </span>
  );
}
