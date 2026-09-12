export function pad(n) {
  return n < 10 ? '0' + n : '' + n;
}
export function ds(y, m, d) {
  return y + '-' + pad(m + 1) + '-' + pad(d);
}
export function parseDate(s) {
  const p = s.split('-');
  return new Date(+p[0], +p[1] - 1, +p[2]);
}
export function dow(s) {
  return parseDate(s).getDay();
}
export function uid() {
  return Math.random().toString(36).slice(2, 9);
}
export function rng(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
