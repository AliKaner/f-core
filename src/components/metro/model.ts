export const CALIB = { t1: 68.41, t2: 22.61, t3: 71.63, t4: 1.13 };

export function Wk(k: number, p = CALIB): number {
  return p.t1 + p.t2 / (1 + p.t3 * Math.exp(-p.t4 * k));
}

export function chooseQueue(W: number, lambda: number, dd: number, q: number[], nhat: number): number {
  let N = 1;
  for (let n = 2; n <= nhat; n++) {
    const dn = dd * (n - 1);
    if (W > dn + lambda * q[n - 1]) N = n;
  }
  return N;
}

export function loadColor(r: number): string {
  if (r < 0.55) return "#33d68a";
  if (r < 0.78) return "#ffb02e";
  return "#ff4d4d";
}

export function loadColorSoft(r: number): string {
  if (r < 0.55) return "rgba(51,214,138,.16)";
  if (r < 0.78) return "rgba(255,176,46,.16)";
  return "rgba(255,77,77,.16)";
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(v: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, v));
}

export function jitter(amp: number): number {
  return (Math.random() - 0.5) * 2 * amp;
}

export function randn(): number {
  let u = 0, v = 0;
  while (!u) u = Math.random();
  while (!v) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
