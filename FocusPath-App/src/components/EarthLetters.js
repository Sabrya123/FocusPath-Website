import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

/**
 * Lettering for the home earth scene. Three ways of writing, one per band:
 *
 *   sky   — CloudText: the words are cloud masses, scalloped out of puffs
 *   grass — Scratch:   the words are scratched into the dirt by hand
 *   soil  — BoneText:  every stroke of every letter is a bone
 *
 * All three share one monoline alphabet (cap height 100, baseline y=100) that
 * gets sampled or thickened differently per band. Ported from the "Home Earth
 * Themes" design canvas so the app and the mock-up stay the same world.
 */

// ── the alphabet ───────────────────────────────────────────────────────────
// k = skeleton strokes: ['l',x1,y1,x2,y2] line, ['a',cx,cy,rx,ry,a0,a1] arc,
// ['d',x,y] dot. w = advance width before tracking.
const L = (a, b, c, d) => ['l', a, b, c, d];
const A = (cx, cy, rx, ry, a0, a1) => ['a', cx, cy, rx, ry, a0, a1];
const D = (x, y) => ['d', x, y];

const GLYPHS = {
  A: { w: 64, k: [L(2, 100, 32, 0), L(32, 0, 62, 100), L(14, 66, 50, 66)] },
  B: { w: 58, k: [L(8, 0, 8, 100), A(8, 26, 26, 26, -90, 90), A(8, 75, 30, 25, -90, 90)] },
  C: { w: 60, k: [A(32, 50, 28, 50, 50, 310)] },
  D: { w: 60, k: [L(8, 0, 8, 100), A(8, 50, 44, 50, -90, 90)] },
  E: { w: 52, k: [L(8, 0, 8, 100), L(8, 0, 48, 0), L(8, 50, 42, 50), L(8, 100, 48, 100)] },
  F: { w: 50, k: [L(8, 0, 8, 100), L(8, 0, 46, 0), L(8, 50, 40, 50)] },
  G: { w: 68, k: [A(34, 50, 30, 50, 46, 350), L(64, 46, 38, 46)] },
  H: { w: 56, k: [L(8, 0, 8, 100), L(48, 0, 48, 100), L(8, 52, 48, 52)] },
  I: { w: 22, k: [L(10, 0, 10, 100)] },
  J: { w: 44, k: [L(34, 0, 34, 72), A(18, 72, 16, 28, 0, 170)] },
  K: { w: 56, k: [L(8, 0, 8, 100), L(48, 0, 10, 56), L(22, 46, 50, 100)] },
  L: { w: 48, k: [L(8, 0, 8, 100), L(8, 100, 46, 100)] },
  M: { w: 74, k: [L(6, 100, 6, 0), L(6, 0, 37, 64), L(37, 64, 68, 0), L(68, 0, 68, 100)] },
  N: { w: 60, k: [L(8, 100, 8, 0), L(8, 0, 52, 100), L(52, 100, 52, 0)] },
  O: { w: 66, k: [A(33, 50, 29, 50, 0, 360)] },
  P: { w: 54, k: [L(8, 0, 8, 100), A(8, 28, 28, 28, -90, 90)] },
  Q: { w: 68, k: [A(33, 50, 29, 50, 0, 360), L(40, 74, 62, 104)] },
  R: { w: 60, k: [L(8, 0, 8, 100), A(8, 28, 30, 28, -90, 90), L(24, 56, 54, 100)] },
  S: { w: 54, k: [A(27, 27, 22, 27, 340, 140), L(10, 44, 44, 56), A(27, 73, 22, 27, -40, 160)] },
  T: { w: 62, k: [L(2, 0, 58, 0), L(30, 0, 30, 100)] },
  U: { w: 66, k: [L(8, 0, 8, 70), A(33, 70, 25, 30, 180, 0), L(58, 0, 58, 70)] },
  V: { w: 62, k: [L(3, 0, 31, 100), L(31, 100, 59, 0)] },
  W: { w: 88, k: [L(3, 0, 20, 100), L(20, 100, 44, 24), L(44, 24, 68, 100), L(68, 100, 85, 0)] },
  X: { w: 58, k: [L(5, 0, 53, 100), L(53, 0, 5, 100)] },
  Y: { w: 58, k: [L(5, 0, 29, 52), L(53, 0, 29, 52), L(29, 52, 29, 100)] },
  Z: { w: 54, k: [L(6, 0, 48, 0), L(48, 0, 6, 100), L(6, 100, 48, 100)] },
  // Digits are straight-stroke (7-segment) skeletons: arcs break into bone
  // segments too short to survive their own condyle lobes.
  0: { w: 56, k: [L(10, 2, 46, 2), L(10, 2, 10, 98), L(46, 2, 46, 98), L(10, 98, 46, 98)] },
  1: { w: 40, k: [L(24, 2, 24, 98), L(8, 98, 40, 98)] },
  2: { w: 56, k: [L(10, 2, 46, 2), L(46, 2, 46, 48), L(10, 48, 46, 48), L(10, 48, 10, 98), L(10, 98, 46, 98)] },
  3: { w: 56, k: [L(10, 2, 46, 2), L(46, 2, 46, 48), L(14, 48, 46, 48), L(46, 48, 46, 98), L(10, 98, 46, 98)] },
  4: { w: 56, k: [L(10, 2, 10, 48), L(10, 48, 46, 48), L(46, 2, 46, 98)] },
  5: { w: 56, k: [L(10, 2, 46, 2), L(10, 2, 10, 48), L(10, 48, 46, 48), L(46, 48, 46, 98), L(10, 98, 46, 98)] },
  6: { w: 56, k: [L(10, 2, 46, 2), L(10, 2, 10, 98), L(10, 48, 46, 48), L(46, 48, 46, 98), L(10, 98, 46, 98)] },
  7: { w: 52, k: [L(10, 2, 46, 2), L(46, 2, 46, 98)] },
  8: { w: 56, k: [L(10, 2, 46, 2), L(10, 2, 10, 48), L(46, 2, 46, 48), L(10, 48, 46, 48), L(10, 48, 10, 98), L(46, 48, 46, 98), L(10, 98, 46, 98)] },
  9: { w: 56, k: [L(10, 2, 46, 2), L(10, 2, 10, 48), L(46, 2, 46, 98), L(10, 48, 46, 48), L(10, 98, 46, 98)] },
  ':': { w: 24, k: [D(10, 34), D(10, 82)] },
  '+': { w: 46, k: [L(6, 54, 38, 54), L(22, 38, 22, 70)] },
  '&': { w: 58, k: [A(24, 22, 18, 22, 0, 360), L(10, 40, 46, 100)] },
  '/': { w: 46, k: [L(6, 100, 40, 0)] },
  '›': { w: 36, k: [L(8, 30, 26, 56), L(26, 56, 8, 82)] },
  '.': { w: 24, k: [D(10, 96)] },
  ',': { w: 24, k: [L(10, 92, 4, 112)] },
  '!': { w: 24, k: [L(10, 0, 10, 70), D(10, 96)] },
  '?': { w: 52, k: [A(26, 26, 20, 26, 180, 20), L(39, 45, 26, 66), D(26, 96)] },
  '-': { w: 40, k: [L(6, 54, 34, 54)] },
  '’': { w: 20, k: [L(8, 2, 6, 24)] },
  "'": { w: 20, k: [L(8, 2, 6, 24)] },
};

const TRACK = 18;
const SPACE = 30;

const advance = (c) => (GLYPHS[c] ? GLYPHS[c].w : 40) + TRACK;

/** Greedy word wrap in glyph units. `maxU` is the line box in those units. */
function wrapWords(text, maxU) {
  const words = String(text)
    .toUpperCase()
    .replace(/[“”"]/g, '')
    .split(/\s+/)
    .filter(Boolean);
  const lines = [];
  let cur = [];
  let curW = 0;
  for (const w of words) {
    const ww = [...w].reduce((a, c) => a + advance(c), 0);
    if (cur.length && curW + SPACE + TRACK + ww > maxU) {
      lines.push({ words: cur, w: curW });
      cur = [];
      curW = 0;
    }
    curW += (cur.length ? SPACE + TRACK : 0) + ww;
    cur.push(w);
  }
  if (cur.length) lines.push({ words: cur, w: curW });
  return lines;
}

/** Deterministic noise in [-1,1], so nothing dances between re-renders. */
const noise = (n, salt) => {
  const v = Math.sin((n + 1) * 8.233 + salt * 2.7) * 9137.13;
  return (v - Math.floor(v)) * 2 - 1;
};

/** Overlapping circles as ONE path. Non-zero fill makes the overlaps a union,
 *  so a whole line of cloud text is a single node instead of hundreds. */
function circlesPath(list, grow = 0) {
  let d = '';
  for (const [cx, cy, r] of list) {
    const R = r + grow;
    d +=
      'M' + (cx - R).toFixed(1) + ' ' + cy.toFixed(1) +
      'a' + R.toFixed(1) + ' ' + R.toFixed(1) + ' 0 1 0 ' + (R * 2).toFixed(1) + ' 0' +
      'a' + R.toFixed(1) + ' ' + R.toFixed(1) + ' 0 1 0 ' + (-R * 2).toFixed(1) + ' 0Z';
  }
  return d;
}

// ── sky: words as cloud masses ─────────────────────────────────────────────

/**
 * Samples puff centres along each capital's skeleton and unions them, exactly
 * as the CLOUD in the wordmark is built. Cap height auto-fits the phrase, so a
 * longer affirmation sets smaller across more lines.
 */
export function cloudTextPuffs(text, maxWidth, opts = {}) {
  const capMax = opts.capMax || 30;
  const capMin = opts.capMin || 11;
  const maxLines = opts.maxLines || 2;
  const LH = 178;
  const STEP = 13;
  const PAD = 15; // unit-space breathing room so top/bottom puffs aren't clipped

  let cap = capMax;
  let maxU = (maxWidth / cap) * 100;
  let lines = wrapWords(text, maxU);
  while (cap > capMin && lines.length > maxLines) {
    cap -= 1;
    maxU = (maxWidth / cap) * 100;
    lines = wrapWords(text, maxU);
  }
  if (!lines.length) lines = [{ words: [], w: 0 }];

  const pts = [];
  const line = (x1, y1, x2, y2) => {
    const n = Math.max(1, Math.round(Math.hypot(x2 - x1, y2 - y1) / STEP));
    for (let i = 0; i <= n; i++) pts.push([x1 + ((x2 - x1) * i) / n, y1 + ((y2 - y1) * i) / n]);
  };
  const arc = (cx, cy, rx, ry, a0, a1) => {
    const len = ((Math.abs(a1 - a0) * Math.PI) / 180) * ((rx + ry) / 2);
    const n = Math.max(2, Math.round(len / STEP));
    for (let i = 0; i <= n; i++) {
      const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
      pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
    }
  };

  lines.forEach((ln, li) => {
    let x = (maxU - ln.w) / 2; // centred
    const top = li * LH;
    ln.words.forEach((w, wi) => {
      if (wi) x += SPACE + TRACK;
      for (const c of [...w]) {
        const g = GLYPHS[c];
        if (g) {
          for (const k of g.k) {
            if (k[0] === 'l') line(x + k[1], top + k[2], x + k[3], top + k[4]);
            else if (k[0] === 'a') arc(x + k[1], top + k[2], k[3], k[4], k[5], k[6]);
            else pts.push([x + k[1], top + k[2]]);
          }
        }
        x += advance(c);
      }
    });
  });

  const s = cap / 100;
  const jitter = (i) => {
    const v = Math.sin((i + 1) * 12.9898) * 43758.5453;
    return v - Math.floor(v);
  };
  return {
    d: circlesPath(
      pts.map(([cx, cy], i) => [cx * s, (cy + PAD) * s, (11.5 + jitter(i) * 3.5) * s])
    ),
    width: maxWidth,
    height: +(((lines.length - 1) * LH + 118 + PAD * 2) * s).toFixed(1),
    empty: pts.length === 0,
    cap,
    lines: lines.length,
  };
}

// react-native-svg resolves gradient ids in one global registry, so every
// instance needs its own or the last one mounted wins.
let uidCounter = 0;
function useUid() {
  const ref = React.useRef(null);
  if (ref.current === null) {
    uidCounter += 1;
    ref.current = 'el' + uidCounter;
  }
  return ref.current;
}

/** A phrase written into the sky as cloud. */
export function CloudText({ text, width, capMax, capMin, maxLines, style }) {
  const uid = useUid();
  const set = React.useMemo(
    () => cloudTextPuffs(text || '', width, { capMax, capMin, maxLines }),
    [text, width, capMax, capMin, maxLines]
  );
  if (set.empty) return null;
  return (
    <Svg
      width={width}
      height={set.height}
      viewBox={`0 0 ${width} ${set.height}`}
      style={style}
      pointerEvents="none"
      accessibilityRole="image"
      accessibilityLabel={text}
    >
      <Defs>
        <LinearGradient id={uid} x1="0" y1="0" x2="0" y2={set.height} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#ffffff" />
          <Stop offset="0.58" stopColor="#f5fafe" />
          <Stop offset="1" stopColor="#dceaf5" />
        </LinearGradient>
      </Defs>
      <Path d={set.d} fill={`url(#${uid})`} />
    </Svg>
  );
}

/** The CLOUD of the wordmark: same scalloped puffs, hand-placed skeleton. */
export function CloudWord({ width = 300 }) {
  const uid = useUid();
  const d = React.useMemo(() => {
    const pts = [];
    const line = (x1, y1, x2, y2, step = 5) => {
      const n = Math.max(1, Math.round(Math.hypot(x2 - x1, y2 - y1) / step));
      for (let i = 0; i <= n; i++) pts.push([x1 + ((x2 - x1) * i) / n, y1 + ((y2 - y1) * i) / n]);
    };
    const arc = (cx, cy, rx, ry, a0, a1, step = 5) => {
      const len = ((Math.abs(a1 - a0) * Math.PI) / 180) * ((rx + ry) / 2);
      const n = Math.max(2, Math.round(len / step));
      for (let i = 0; i <= n; i++) {
        const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
        pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
      }
    };
    arc(96, 53, 26, 26, 52, 308); // C
    line(150, 25, 150, 81);
    line(150, 81, 188, 81); // L
    arc(244, 53, 26, 28, 0, 360); // O
    line(300, 25, 300, 52);
    arc(327, 52, 27, 29, 180, 0);
    line(354, 52, 354, 25); // U
    line(380, 25, 380, 81);
    arc(380, 53, 34, 28, -90, 90); // D
    const jitter = (i) => {
      const v = Math.sin((i + 1) * 12.9898) * 43758.5453;
      return v - Math.floor(v);
    };
    return circlesPath(pts.map(([cx, cy], i) => [cx, cy, 6.8 + jitter(i) * 3.0]));
  }, []);
  // the skeleton spans x 70..414, y 0..116 — crop to it so the word fills `width`
  const X = 64;
  const VBW = 356;
  const VBH = 116;
  return (
    <Svg
      width={width}
      height={(width / VBW) * VBH}
      viewBox={`${X} 0 ${VBW} ${VBH}`}
      pointerEvents="none"
      accessibilityRole="image"
      accessibilityLabel="CLOUD"
    >
      <Defs>
        <LinearGradient id={uid} x1="0" y1="0" x2="0" y2={VBH} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#ffffff" />
          <Stop offset="0.56" stopColor="#ffffff" />
          <Stop offset="1" stopColor="#dceaf5" />
        </LinearGradient>
      </Defs>
      <Path d={d} fill={`url(#${uid})`} />
    </Svg>
  );
}

// ── soil: words as bone ────────────────────────────────────────────────────

/**
 * Every stroke of a glyph becomes a bone: a slightly bowed shaft with a pair of
 * condyle lobes at each end. Bones are split into two interleaved groups and
 * each group is drawn outline-then-fill in turn, so group B's dark contour
 * lands on top of group A's cream — that contour is what separates one bone
 * from the next. A whole line of text is eight paths.
 */
export function boneText(text, cap, maxWidth) {
  const LH = 158;
  const PAD = 12;
  const s = cap / 100;
  const lines = wrapWords(text, maxWidth / s);

  const segs = [];
  const dots = [];
  let n = 0;
  let widest = 0;
  lines.forEach((ln, li) => {
    let x = 0;
    const top = li * LH;
    ln.words.forEach((w, wi) => {
      if (wi) x += SPACE + TRACK;
      for (const c of [...w]) {
        const g = GLYPHS[c];
        if (g) {
          const jx = noise(n, String(text).length) * 2.4;
          const jy = noise(n + 91, String(text).length) * 2.8;
          for (const k of g.k) {
            if (k[0] === 'l') {
              segs.push([x + k[1] + jx, top + k[2] + jy, x + k[3] + jx, top + k[4] + jy, n++]);
            } else if (k[0] === 'a') {
              const len = ((Math.abs(k[6] - k[5]) * Math.PI) / 180) * ((k[3] + k[4]) / 2);
              const steps = Math.max(1, Math.round(len / 55));
              for (let i = 0; i < steps; i++) {
                const a0 = ((k[5] + ((k[6] - k[5]) * i) / steps) * Math.PI) / 180;
                const a1 = ((k[5] + ((k[6] - k[5]) * (i + 1)) / steps) * Math.PI) / 180;
                segs.push([
                  x + k[1] + Math.cos(a0) * k[3] + jx, top + k[2] + Math.sin(a0) * k[4] + jy,
                  x + k[1] + Math.cos(a1) * k[3] + jx, top + k[2] + Math.sin(a1) * k[4] + jy,
                  n++,
                ]);
              }
            } else {
              dots.push([x + k[1] + jx, top + k[2] + jy, 8.5]);
            }
          }
          n++;
        }
        x += advance(c);
      }
    });
    widest = Math.max(widest, x - TRACK);
  });

  const P = (x, y) => ((x + PAD) * s).toFixed(1) + ' ' + ((y + PAD) * s).toFixed(1);
  const shafts = ['', ''];
  const knobs = [[], []];
  segs.forEach(([x1, y1, x2, y2, i], si) => {
    const g = si % 2;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const m = Math.hypot(dx, dy) || 1;
    const nx = -dy / m;
    const ny = dx / m;
    const ux = dx / m;
    const uy = dy / m;
    const t = Math.min(3.4, m * 0.13);
    const ax = x1 + ux * t;
    const ay = y1 + uy * t;
    const bx = x2 - ux * t;
    const by = y2 - uy * t;
    const bow = (1.2 + Math.abs(noise(i + 5, 0)) * 1.6) * (noise(i + 61, 0) > 0 ? 1 : -1);
    shafts[g] +=
      'M' + P(ax, ay) +
      'Q' + P((ax + bx) / 2 + nx * bow, (ay + by) / 2 + ny * bow) +
      ' ' + P(bx, by);
    [0, 1].forEach((e) => {
      const px = e ? bx : ax;
      const py = e ? by : ay;
      const back = e ? -1 : 1;
      const kx = px + ux * back * 1.1;
      const ky = py + uy * back * 1.1;
      const off = 3.2 + noise(i + e * 7, 0) * 0.4;
      knobs[g].push([(kx + nx * off + PAD) * s, (ky + ny * off + PAD) * s, (5.2 + noise(i + e * 17, 0) * 0.6) * s]);
      knobs[g].push([(kx - nx * off + PAD) * s, (ky - ny * off + PAD) * s, (5.2 + noise(i + e * 29, 0) * 0.6) * s]);
    });
  });
  // dot marks have no shaft — keep them with group A
  knobs[0] = knobs[0].concat(dots.map(([cx, cy, r]) => [(cx + PAD) * s, (cy + PAD) * s, r * s]));

  return {
    shaftA: shafts[0],
    shaftB: shafts[1],
    knuckleA: circlesPath(knobs[0]),
    knuckleB: circlesPath(knobs[1]),
    knuckleDarkA: circlesPath(knobs[0], 1.6 * s),
    knuckleDarkB: circlesPath(knobs[1], 1.6 * s),
    sw: +(9 * s).toFixed(2),
    swDark: +(9 * s + Math.max(1.6, 5 * s)).toFixed(2),
    w: Math.ceil((widest + PAD * 2) * s),
    h: Math.ceil(((lines.length - 1) * LH + 100 + PAD * 2) * s),
    lines: lines.length,
  };
}

/** A line of text written in bone. `cap` is cap height in px, `maxWidth` wraps. */
export function BoneText({ text, cap = 16, maxWidth = 280, ink = '#f4ecd8', dark = '#231a10', opacity = 1, style }) {
  const b = React.useMemo(() => boneText(text || '', cap, maxWidth), [text, cap, maxWidth]);
  if (!b.shaftA && !b.shaftB && !b.knuckleA) return null;
  return (
    <Svg
      width={b.w}
      height={b.h}
      viewBox={`0 0 ${b.w} ${b.h}`}
      style={style}
      opacity={opacity}
      accessibilityRole="image"
      accessibilityLabel={text}
    >
      <Path d={b.knuckleDarkA} fill={dark} opacity={0.92} />
      <Path d={b.shaftA} fill="none" stroke={dark} strokeWidth={b.swDark} strokeLinecap="round" opacity={0.92} />
      <Path d={b.knuckleA} fill={ink} />
      <Path d={b.shaftA} fill="none" stroke={ink} strokeWidth={b.sw} strokeLinecap="round" />
      <Path d={b.knuckleDarkB} fill={dark} opacity={0.92} />
      <Path d={b.shaftB} fill="none" stroke={dark} strokeWidth={b.swDark} strokeLinecap="round" opacity={0.92} />
      <Path d={b.knuckleB} fill={ink} />
      <Path d={b.shaftB} fill="none" stroke={ink} strokeWidth={b.sw} strokeLinecap="round" />
    </Svg>
  );
}

// ── grass: words scratched into the dirt ───────────────────────────────────

/**
 * Per-letter tilt, size and baseline wobble, so nothing sits on a typeset
 * line. Deterministic per string, and split by word so wrapping still breaks
 * between words.
 */
export function Scratch({ text, style, amount = 1, align = 'left', numberOfLines }) {
  const flat = StyleSheet.flatten(style) || {};
  const size = flat.fontSize || 14;
  const words = React.useMemo(() => {
    const seed = (i, k) => {
      const v = Math.sin((i + 1) * (12.9898 + k) + String(text).length * 4.1) * 43758.5453;
      return (v - Math.floor(v)) * 2 - 1;
    };
    let i = -1;
    return String(text ?? '')
      .split(' ')
      .map((w) => [...w].map((ch) => {
        i += 1;
        return {
          ch,
          rotate: (seed(i, 0) * 7 * amount).toFixed(2) + 'deg',
          dy: +(seed(i, 3) * 2.2 * amount).toFixed(2),
          fontSize: +(size * (1 + seed(i, 7) * 0.13 * amount)).toFixed(2),
          marginRight: +(seed(i, 11) * 0.7 * amount).toFixed(2),
        };
      }));
  }, [text, amount, size]);

  return (
    <View
      style={[letters.row, align === 'center' && letters.rowCenter, align === 'right' && letters.rowRight]}
      accessible
      accessibilityLabel={String(text ?? '')}
    >
      {words.map((chars, wi) => (
        <View key={wi} style={letters.word}>
          {wi > 0 && <Text style={[flat, { fontSize: size }]}> </Text>}
          {chars.map((c, ci) => (
            <Text
              key={ci}
              numberOfLines={numberOfLines}
              style={[
                flat,
                {
                  fontSize: c.fontSize,
                  marginRight: c.marginRight,
                  transform: [{ rotate: c.rotate }, { translateY: c.dy }],
                },
              ]}
            >
              {c.ch}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

const letters = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end' },
  rowCenter: { justifyContent: 'center' },
  rowRight: { justifyContent: 'flex-end' },
  word: { flexDirection: 'row', alignItems: 'flex-end' },
});
