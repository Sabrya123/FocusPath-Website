import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Path, Circle, Line, G, Defs, LinearGradient, Stop, RadialGradient } from 'react-native-svg';

/**
 * Palette for the home "earth scene" — one continuous world you scroll down
 * through: sky at the top, grass at the horizon, soil strata below.
 *
 * Every value is lifted from an existing RankScene gradient (src/components/
 * RankScene.js) so the home tab and the rank medallions stay the same world.
 */
export const Earth = {
  // sky — deepest at the status bar, thinning out toward the horizon
  skyDeep: '#4a96b8',   // Colors.redDark
  skyMid: '#7dc0da',    // Colors.redLight
  skyPale: '#b3d9f2',   // RankScene skyG start
  skyThin: '#e8f5fc',   // RankScene skyG end
  haze: '#fff3cf',      // RankScene sunburst — the warm band at the horizon

  // grass
  grassLight: '#a5d96a', // RankScene grassD 0%
  grassMid: '#79ad4c',   // RankScene grassD 60%
  grassDeep: '#4c7c33',  // RankScene grassD 100%
  canopyDeep: '#2f5622', // RankScene canopyDark 100%

  // dirt — the grass is only the surface; lettering is scratched into what's under it
  dirtInk: '#4a3526',
  dirtInkSoft: '#55402f',
  dirtInkDeep: '#3c2a1c',
  dirtPill: '#f3e7d6',   // packed-earth pill label

  // soil: a cross-section, greying out as it goes down toward bedrock
  soilSurface: '#8d947f', // the cut edge where grass ends
  soilTop: '#5e6656',
  soilUpper: '#4a4038',
  soilMid: '#3a2f26',
  bedrock: '#241f1a',
  bedrockLit: '#4d555d', // RankScene rockD 0%

  // strata of the cross-section, in list order (highest rank first): they
  // lighten on the way down toward the lit bedrock that Grounded sits on
  strata: ['#332b23', '#3a3128', '#42382d', '#4a4038', '#544840', '#5e5145'],
  bone: '#f4ecd8',
  boneSoft: '#ded2bc',
  boneDark: '#231a10',

  // ink
  cream: '#fff3cf',
  cloudWhite: '#ffffff',
  cloudShade: '#f4f9fd', // RankScene cloud gradient mid
  barkInk: '#2f4a1e',    // dark green-brown for lettering on grass
  sun: '#f0b93f',        // RankScene Radiant rim
  sunLight: '#ffd98a',   // RankScene Awakened rim
};

let uidCounter = 0;
function nextUid() {
  uidCounter += 1;
  return 'es' + uidCounter;
}

/**
 * A full-bleed vertical gradient painted behind a zone's content.
 * `stops` is an array of [offset, color] pairs, top to bottom.
 */
export function ZoneGradient({ stops }) {
  const uid = React.useRef(null);
  if (uid.current === null) uid.current = nextUid();
  return (
    <Svg
      style={StyleSheet.absoluteFill}
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      pointerEvents="none"
    >
      <Defs>
        <LinearGradient id={uid.current} x1="0" y1="0" x2="0" y2="1">
          {stops.map(([offset, color]) => (
            <Stop key={offset} offset={offset} stopColor={color} />
          ))}
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${uid.current})`} />
    </Svg>
  );
}

/**
 * Lobes around the perimeter of a rect: full-size along the top, shallow
 * scallops underneath, so the silhouette reads as a cloud lit from above
 * rather than a rounded box. Deterministic jitter keeps the lobes from
 * looking stamped, and stops them moving between renders.
 */
export function cloudLobes(x, y, w, h, r) {
  const out = [];
  const jitter = (i, salt) => {
    const v = Math.sin((i + 7) * (7.1234 + salt)) * 24634.123;
    return v - Math.floor(v);
  };
  // `rise` lifts a lobe off its edge, so the top reads as billowing rather
  // than as evenly spaced bumps along a straight line.
  const edge = (x1, y1, x2, y2, scale, step, spread, rise) => {
    const n = Math.max(2, Math.round(Math.hypot(x2 - x1, y2 - y1) / step));
    for (let i = 0; i < n; i++) {
      out.push([
        x1 + ((x2 - x1) * i) / n,
        y1 + ((y2 - y1) * i) / n,
        scale,
        spread,
        rise,
      ]);
    }
  };
  // Lobes ride the top and the upper flanks only. The base is left to the
  // rounded rect, exactly as the mock-up's masks do it — scalloping the
  // bottom turns the cloud into a fringe of beads.
  const flank = h * 0.42;
  // Kept within 1.34r out / 0.27r up — Cloud insets its body by exactly that.
  edge(x, y, x + w, y, 1, r * 1.15, 0.34, -0.18); // top: big lobes, billowing up
  edge(x + w, y, x + w, y + flank, 0.72, r * 1.0, 0.24, 0); // right flank
  edge(x, y + flank, x, y, 0.72, r * 1.0, 0.24, 0); // left flank
  return out
    .map(([cx, cy, scale, spread, rise], i) => {
      const rr = r * scale * (1 - spread + jitter(i, 0) * spread * 2);
      const dy = rise * r * (0.5 + jitter(i, 3.1));
      return (
        'M' + (cx - rr).toFixed(1) + ' ' + (cy + dy).toFixed(1) +
        'a' + rr.toFixed(1) + ' ' + rr.toFixed(1) + ' 0 1 0 ' + (rr * 2).toFixed(1) + ' 0' +
        'a' + rr.toFixed(1) + ' ' + rr.toFixed(1) + ' 0 1 0 ' + (-rr * 2).toFixed(1) + ' 0Z'
      );
    })
    .join('');
}

/**
 * Cloud-shaped surface. Stats live on these instead of on rectangular cards.
 *
 * The body is a rounded rect ringed by scalloped lobes, drawn as one union so
 * there are no seams, and shaded top-to-bottom like the mock-up. The cast
 * shadow is three stacked translucent copies rather than an SVG filter —
 * react-native-svg does not expose FeDropShadow natively, and a cloud that
 * fails to draw at all is a worse trade than a slightly cheaper shadow.
 */
export function Cloud({ width, height, children, contentStyle, style }) {
  const uid = React.useRef(null);
  if (uid.current === null) uid.current = nextUid();

  // A lobe reaches at most 1.34r out and 0.27r further up, so the body is
  // inset by that much or the billow clips against the viewBox edge.
  const r = height * 0.2;
  const SHADOW_DROP = 11; // room kept inside the viewBox for the cast copies
  const bx = r * 1.34;
  const by = r * 1.62;
  const bw = width - bx * 2;
  const bh = height - by - SHADOW_DROP;
  const rx = Math.min(bh / 2, 48);
  const d = cloudLobes(bx, by, bw, bh, r);

  const body = (fill, dy) => (
    <G translateY={dy}>
      <Path d={d} fill={fill} />
      <Rect x={bx} y={by} width={bw} height={bh} rx={rx} fill={fill} />
    </G>
  );

  return (
    <View style={[{ width, height }, style]}>
      <Svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        <Defs>
          <LinearGradient id={uid.current} x1="0" y1="0" x2="0" y2={height} gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#ffffff" />
            <Stop offset="0.46" stopColor="#fdfeff" />
            <Stop offset="1" stopColor="#d4e6f4" />
          </LinearGradient>
        </Defs>
        {body('rgba(33,90,125,0.10)', SHADOW_DROP)}
        {body('rgba(33,90,125,0.12)', SHADOW_DROP * 0.64)}
        {body('rgba(33,90,125,0.14)', SHADOW_DROP * 0.33)}
        {body(`url(#${uid.current})`, 0)}
      </Svg>
      {/* the lobes are part of the surface, so content spans most of the
          cloud rather than being boxed into the inner rect */}
      <View
        style={[
          {
            position: 'absolute',
            left: 0,
            right: 0,
            top: by * 0.62,
            bottom: SHADOW_DROP,
            paddingHorizontal: bx * 0.8,
            alignItems: 'center',
            justifyContent: 'center',
          },
          contentStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

/** The sun in the top-right of the sky. */
export function SunBadge({ size = 46 }) {
  const uid = React.useRef(null);
  if (uid.current === null) uid.current = nextUid();
  const rays = [];
  const cx = 32;
  const cy = 32;
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI * 2) / 12;
    rays.push(
      <Line
        key={i}
        x1={cx + Math.cos(angle) * 17}
        y1={cy + Math.sin(angle) * 17}
        x2={cx + Math.cos(angle) * 28}
        y2={cy + Math.sin(angle) * 28}
        stroke={Earth.sunLight}
        strokeWidth={2.6}
        strokeLinecap="round"
        opacity={0.9}
      />
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        <RadialGradient id={uid.current} cx="38%" cy="32%" r="70%">
          <Stop offset="0%" stopColor="#fff8e2" />
          <Stop offset="55%" stopColor={Earth.sunLight} />
          <Stop offset="100%" stopColor={Earth.sun} />
        </RadialGradient>
      </Defs>
      {rays}
      <Circle cx={cx} cy={cy} r={14} fill={`url(#${uid.current})`} />
    </Svg>
  );
}

/**
 * The horizon. Paints a wavy band of `topColor` over the zone behind it, so
 * the grass appears to rise into the sky rather than butting against it.
 */
export function HillEdge({ height = 34, topColor = Earth.haze, highlight = Earth.grassLight }) {
  return (
    <Svg
      width="100%"
      height={height}
      viewBox="0 0 400 34"
      preserveAspectRatio="none"
      pointerEvents="none"
    >
      <Path
        d="M0,0 L400,0 L400,12 C340,4 300,22 240,17 C180,12 130,27 70,20 C44,17 20,12 0,16 Z"
        fill={topColor}
      />
      <Path
        d="M0,16 C20,12 44,17 70,20 C130,27 180,12 240,17 C300,22 340,4 400,12 L400,22 C340,14 300,32 240,27 C180,22 130,37 70,30 C44,27 20,22 0,26 Z"
        fill={highlight}
        opacity={0.45}
      />
    </Svg>
  );
}

/**
 * Each rank's sky, lifted from the RankScene medallion gradients. A full
 * medallion is illegible at chip size, so the strata list carries just the sky.
 */
export const RANK_SKY = {
  Grounded: { rim: '#bcd9e8', from: '#b3d9f2', to: '#a5d96a' },
  Awakened: { rim: '#f2b490', from: '#f79b85', to: '#fcd49b' },
  Rising: { rim: '#9dbfd8', from: '#6aa9d8', to: '#d3e8f6' },
  Elevated: { rim: '#c3d9ea', from: '#77b1d9', to: '#f6e3cd' },
  Radiant: { rim: '#f0b93f', from: '#1a3068', to: '#5d86bf' },
  Unclouded: { rim: '#ffd98a', from: '#3f93cf', to: '#d7eefb' },
};

/** A rank as one stratum chip: its sky behind a soil-cut rim. */
export function StratumChip({ rank, size = 28, locked = false }) {
  const uid = React.useRef(null);
  if (uid.current === null) uid.current = nextUid();
  const sky = RANK_SKY[rank] || RANK_SKY.Grounded;
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" opacity={locked ? 0.45 : 1}>
      <Defs>
        <LinearGradient id={uid.current} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={locked ? '#4a4038' : sky.from} />
          <Stop offset="1" stopColor={locked ? '#332b23' : sky.to} />
        </LinearGradient>
      </Defs>
      <Circle cx="14" cy="14" r="12.2" fill={`url(#${uid.current})`} />
      {/* the inset lip of the cut, lit from above */}
      <Path
        d="M4.4 9.6 A12.2 12.2 0 0 1 22.4 6.6"
        fill="none"
        stroke="#ffffff"
        strokeOpacity={locked ? 0.12 : 0.4}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M24 18.6 A12.2 12.2 0 0 1 8.6 25.4"
        fill="none"
        stroke="#0b2a3d"
        strokeOpacity={0.28}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <Circle
        cx="14"
        cy="14"
        r="12.2"
        fill="none"
        stroke={locked ? 'rgba(255,255,255,0.16)' : sky.rim}
        strokeWidth={2.4}
      />
    </Svg>
  );
}
