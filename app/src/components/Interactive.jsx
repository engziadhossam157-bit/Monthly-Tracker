import { useState } from 'react';

// Avoids mixing a `border[Side]` shorthand with its longhand `border[Side]Color`
// in the same style object (React warns because the two can't cleanly toggle
// across renders) by folding a hover/focus-only *Color into the base
// shorthand's width/style instead of layering a separate longhand on top.
const BORDER_SIDES = ['border', 'borderTop', 'borderRight', 'borderBottom', 'borderLeft'];
function mergeStyle(base, extra) {
  if (!extra) return base;
  const merged = { ...base, ...extra };
  for (const side of BORDER_SIDES) {
    const colorKey = side + 'Color';
    if (extra[colorKey] && base?.[side] && !base[colorKey]) {
      const parts = String(base[side]).trim().split(/\s+/);
      if (parts.length >= 2) {
        merged[side] = parts[0] + ' ' + parts[1] + ' ' + extra[colorKey];
        delete merged[colorKey];
      }
    }
  }
  return merged;
}

export default function Interactive({
  as: Tag = 'div',
  style,
  hoverStyle,
  focusStyle,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  ...rest
}) {
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  let merged = style;
  if (hover && hoverStyle) merged = mergeStyle(merged, hoverStyle);
  if (focus && focusStyle) merged = mergeStyle(merged, focusStyle);
  return (
    <Tag
      style={merged}
      onMouseEnter={(e) => { setHover(true); onMouseEnter?.(e); }}
      onMouseLeave={(e) => { setHover(false); onMouseLeave?.(e); }}
      onFocus={(e) => { setFocus(true); onFocus?.(e); }}
      onBlur={(e) => { setFocus(false); onBlur?.(e); }}
      {...rest}
    />
  );
}
