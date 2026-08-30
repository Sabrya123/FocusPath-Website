import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, {
  Path,
  Circle,
  Ellipse,
  Line,
  Rect,
  G,
  Defs,
  ClipPath,
  LinearGradient,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import * as Haptics from 'expo-haptics';

// ===== SHADED VECTOR REDRAWS OF THE BLENDER RANK RENDERS =====
// Each rank is a scene inside the same circular medallion, so the six read as
// one family. Depth is faked entirely with gradients — no filters, no blur —
// because react-native-svg's filter support is patchy and a soft-edged radial
// gradient does the same job everywhere.
//
// Three rules hold across every scene:
//   1. Light comes from the upper left. Every highlight and every shadow
//      obeys it — one broken form makes the whole set look pasted together.
//   2. Round things get an OFFSET radial gradient (fx/fy pulled toward the
//      light). A centred radial reads flat; an offset one reads as a sphere.
//      This is the single highest-leverage trick here.
//   3. Where two forms meet, darken the seam. Contact shadows sell depth far
//      more than surface shading does.
//
// Grounded  — floating island, the original Blender scene
// Awakened  — sunrise breaking the horizon over open water
// Elevated  — snow-capped peak above the cloud line
// Rising    — eagle in flight above the deck
// Unclouded — the sun, high and whole
// Radiant   — past the sky: corona over the curve of the earth

const CX = 64;
const CY = 64;
const R = 52;

export const SCENES = ['grounded', 'awakened', 'rising', 'elevated', 'radiant', 'unclouded'];

// Order and thresholds mirror ALL_RANKS in HomeTab. Unclouded is the summit —
// the app's namesake and the highest rank, not Radiant.
export const RANKS = [
  {
    key: 'grounded',
    name: 'Grounded',
    points: 0,
    rim: '#bcd9e8',
    vibe: "You've planted your feet and made the choice to start.",
  },
  {
    key: 'awakened',
    name: 'Awakened',
    points: 200,
    rim: '#f2b490',
    vibe: 'The "fog" is lifting, and you\'re starting to see the benefits of focus.',
  },
  {
    key: 'rising',
    name: 'Rising',
    points: 500,
    rim: '#9dbfd8',
    vibe: "You're gaining momentum and building strength in your new habits.",
  },
  {
    key: 'elevated',
    name: 'Elevated',
    points: 1000,
    rim: '#c3d9ea',
    vibe: "You've climbed above the initial struggle and are looking down at how far you've come.",
  },
  {
    key: 'radiant',
    name: 'Radiant',
    points: 2000,
    rim: '#f0b93f',
    vibe: "Your mind is sharp, your spirit is strong, and you're helping others climb.",
  },
  {
    key: 'unclouded',
    name: 'Unclouded',
    points: 5000,
    rim: '#ffd98a',
    vibe: 'The Ultimate Goal. Total clarity, peace, and absolute focus on what matters.',
  },
];

export function rankForPoints(points) {
  let index = 0;
  for (let i = 0; i < RANKS.length; i++) {
    if (points >= RANKS[i].points) index = i;
  }
  return index;
}

// Evenly spaced rays around a centre, alternating long and short so the
// burst reads as light rather than as a gear.
function sunRays(cx, cy, count, inner, outerLong, outerShort) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const rad = ((360 / count) * i * Math.PI) / 180;
    const outer = i % 2 === 0 ? outerLong : outerShort;
    out.push({
      key: i,
      x1: cx + Math.cos(rad) * inner,
      y1: cy + Math.sin(rad) * inner,
      x2: cx + Math.cos(rad) * outer,
      y2: cy + Math.sin(rad) * outer,
    });
  }
  return out;
}

// Low cloud deck. Each puff carries the same offset radial, so they read as
// lit balls rather than flat discs; the base is a soft gradient slab.
function CloudDeck({ y, uid }) {
  const puffs = [
    { cx: 26, cy: y + 3, r: 9 },
    { cx: 44, cy: y, r: 11 },
    { cx: 62, cy: y + 4, r: 9 },
    { cx: 80, cy: y + 1, r: 10 },
    { cx: 99, cy: y + 4, r: 8 },
  ];
  return (
    <G>
      <Rect x={12} y={y + 4} width={104} height={116 - y} fill={'url(#cloudBase' + uid + ')'} />
      {puffs.map((p, i) => (
        <Circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill={'url(#cloudBall' + uid + ')'} />
      ))}
    </G>
  );
}

// ---------- GROUNDED ----------
function Grounded({ uid }) {
  return (
    <G>
      <Rect x={12} y={12} width={104} height={104} fill={'url(#skyG' + uid + ')'} />

      {/* Rock underside. The lit facet on the right is a gradient now, and a
          thin rim light along the shadow edge separates it from the sky. */}
      <Path
        d="M28.5 73 C31 88 42 98 54 106 C57 108.5 61 109 63 107 C76 96 96 84 99.5 73 Z"
        fill={'url(#rockD' + uid + ')'}
      />
      <Path d="M64 76 C68 92 76 98 86 88 C93 82 98 77 99.5 73 Z" fill={'url(#rockLit' + uid + ')'} />
      <Path
        d="M28.5 73 C31 88 42 98 54 106"
        fill="none"
        stroke="#8fa6b5"
        strokeWidth={1.6}
        opacity={0.45}
      />

      {/* Soil rim, its own contact shadow, then the domed grass cap. */}
      <Ellipse cx={64} cy={73} rx={35.5} ry={11.5} fill={'url(#soilD' + uid + ')'} />
      <Ellipse cx={64} cy={71.5} rx={34.5} ry={11} fill="#2f3a33" opacity={0.35} />
      <Ellipse cx={64} cy={68} rx={34} ry={11} fill={'url(#grassD' + uid + ')'} />

      {/* Tree. Canopy balls are shaded spheres; the trunk gets a side gradient. */}
      <Path d="M56 67 L56 50" stroke={'url(#trunkD' + uid + ')'} strokeWidth={3} strokeLinecap="round" />
      <Path d="M56 57 L51 51" stroke="#6b4a33" strokeWidth={2} strokeLinecap="round" />
      <Path d="M56 55 L61 50" stroke="#6b4a33" strokeWidth={2} strokeLinecap="round" />
      <Ellipse cx={57} cy={66} rx={9} ry={2.6} fill="#33502a" opacity={0.3} />
      <Circle cx={50} cy={44} r={8} fill={'url(#canopyDark' + uid + ')'} />
      <Circle cx={61} cy={43} r={8} fill={'url(#canopyDark' + uid + ')'} />
      <Circle cx={55} cy={38} r={8.5} fill={'url(#canopyD' + uid + ')'} />
      <Circle cx={56} cy={47} r={7} fill={'url(#canopyD' + uid + ')'} />

      {/* Waterfall, in front of the rock it spills over. */}
      <Path d="M85 76 C87 86 86 94 83 101 L93 102 C96 94 96.5 85 95 76 Z" fill={'url(#waterD' + uid + ')'} />
      <Path d="M87 77 C89 86 88 93 86 99 L91 99.5 C93 93 94 85 93 77 Z" fill="#f0fbff" opacity={0.75} />

      {/* Cloud caught under the falls, and a wisp on the far side. */}
      <Circle cx={80} cy={98} r={7} fill={'url(#cloudBall' + uid + ')'} />
      <Circle cx={88} cy={96} r={8.5} fill={'url(#cloudBall' + uid + ')'} />
      <Circle cx={95} cy={99} r={6} fill={'url(#cloudBall' + uid + ')'} />
      <Circle cx={34} cy={96} r={6} fill={'url(#cloudBall' + uid + ')'} />
      <Circle cx={42} cy={98} r={5} fill={'url(#cloudBall' + uid + ')'} />

      <Circle cx={38} cy={84} r={2.2} fill="#8a9199" opacity={0.75} />
      <Circle cx={100} cy={62} r={1.8} fill="#8a9199" opacity={0.6} />
    </G>
  );
}

// ---------- AWAKENED ----------
function Awakened({ uid }) {
  return (
    <G>
      <Rect x={12} y={12} width={104} height={64} fill={'url(#skyA' + uid + ')'} />
      <Rect x={12} y={76} width={104} height={40} fill={'url(#seaA' + uid + ')'} />

      <Path d="M12 76 L12 73.5 C26 71.5 40 74 52 75.2 L52 76 Z" fill="#e28f68" opacity={0.8} />
      <Path d="M116 76 L116 72.5 C104 71 92 73.5 80 75 L80 76 Z" fill="#e28f68" opacity={0.8} />

      <Circle cx={64} cy={76} r={24} fill={'url(#glowA' + uid + ')'} />
      <Circle cx={64} cy={74} r={11} fill={'url(#sunA' + uid + ')'} />

      <Path d="M57 76 L48 116 L80 116 L71 76 Z" fill="#ffffff" opacity={0.33} />
      <Path d="M61 76 L57 116 L71 116 L67 76 Z" fill="#ffffff" opacity={0.5} />

      {/* Swell. Paired light/dark lines give each wave a crest and a trough. */}
      <Line x1={22} y1={86} x2={44} y2={86} stroke="#fddcbb" strokeWidth={1.6} strokeLinecap="round" opacity={0.6} />
      <Line x1={22} y1={87.6} x2={44} y2={87.6} stroke="#c25f3f" strokeWidth={1.2} strokeLinecap="round" opacity={0.3} />
      <Line x1={84} y1={88} x2={104} y2={88} stroke="#fddcbb" strokeWidth={1.6} strokeLinecap="round" opacity={0.6} />
      <Line x1={84} y1={89.6} x2={104} y2={89.6} stroke="#c25f3f" strokeWidth={1.2} strokeLinecap="round" opacity={0.3} />
      <Line x1={26} y1={98} x2={46} y2={98} stroke="#fddcbb" strokeWidth={1.8} strokeLinecap="round" opacity={0.5} />
      <Line x1={26} y1={100} x2={46} y2={100} stroke="#b8543a" strokeWidth={1.4} strokeLinecap="round" opacity={0.28} />
      <Line x1={86} y1={101} x2={104} y2={101} stroke="#fddcbb" strokeWidth={1.8} strokeLinecap="round" opacity={0.5} />
      <Line x1={30} y1={109} x2={44} y2={109} stroke="#fddcbb" strokeWidth={2} strokeLinecap="round" opacity={0.4} />
    </G>
  );
}

// ---------- ELEVATED ----------
function Elevated({ uid }) {
  return (
    <G>
      <Rect x={12} y={12} width={104} height={104} fill={'url(#skyE' + uid + ')'} />

      <Path d="M34 60 L22 84 L50 84 Z" fill={'url(#farPeak' + uid + ')'} />

      {/* Peak faces are gradients, so each plane falls off away from the light. */}
      <Path d="M64 30 L54 54 L48 49 L36 82 L94 82 L80 50 L73 55 Z" fill={'url(#peakLit' + uid + ')'} />
      <Path d="M64 30 L73 55 L80 50 L94 82 L64 82 Z" fill={'url(#peakShad' + uid + ')'} />
      <Path d="M38 82 L44 71 L51 76 L59 69 L67 74 L75 68 L83 75 L94 82 Z" fill={'url(#rockBand' + uid + ')'} />
      <Path d="M64 77 L67 74 L75 68 L83 75 L94 82 L64 82 Z" fill="#4d5c6a" opacity={0.75} />

      {/* Ridge highlight — a bright edge where the two faces meet. */}
      <Path d="M64 30 L73 55 L80 50" fill="none" stroke="#ffffff" strokeWidth={1.6} opacity={0.8} />

      <Path
        d="M12 84 C30 78 48 82 64 81 C84 80 100 85 116 83 L116 116 L12 116 Z"
        fill={'url(#snowFar' + uid + ')'}
      />

      {/* Peak's shadow thrown across the snowfield, away from the light. */}
      <Path d="M78 82 L116 94 L116 84 L88 80 Z" fill="#7f9cb5" opacity={0.3} />

      <Path
        d="M12 92 C32 86 50 92 68 90 C88 88 102 93 116 91 L116 116 L12 116 Z"
        fill={'url(#snowNear' + uid + ')'}
      />
      <Ellipse cx={46} cy={99} rx={16} ry={4.6} fill={'url(#pool' + uid + ')'} />
    </G>
  );
}

// ---------- RISING ----------
function Rising({ uid }) {
  return (
    <G>
      <Rect x={12} y={12} width={104} height={104} fill={'url(#skyR' + uid + ')'} />

      {/* Wings: the far wing sits darker, which reads as one being turned away. */}
      <Path
        d="M56 54 C46 46 34 40 24 39 C22 39 21 41 23 43 C28 47 33 51 37 56 L34 57 L40 60 L37 62 L44 63 L43 66 L50 65 C53 64 55 63 56 62 Z"
        fill={'url(#wingNear' + uid + ')'}
      />
      <Path
        d="M72 54 C82 46 94 40 104 39 C106 39 107 41 105 43 C100 47 95 51 91 56 L94 57 L88 60 L91 62 L84 63 L85 66 L78 65 C75 64 73 63 72 62 Z"
        fill={'url(#wingFar' + uid + ')'}
      />

      <Path
        d="M64 46 C61 46 59.5 49 59.5 53 L59.5 64 C59.5 68 60.5 71 61.5 74 L66.5 74 C67.5 71 68.5 68 68.5 64 L68.5 53 C68.5 49 67 46 64 46 Z"
        fill={'url(#bodyD' + uid + ')'}
      />
      <Path d="M61.5 72 L58 82 L64 78.5 L70 82 L66.5 72 Z" fill={'url(#tailD' + uid + ')'} />
      <Circle cx={64} cy={47} r={5.5} fill={'url(#headD' + uid + ')'} />
      <Path d="M59.5 45.5 L54 48 L59.5 50.5 Z" fill="#f0a830" />

      <CloudDeck y={101} uid={uid} />
    </G>
  );
}

// ---------- UNCLOUDED ----------
function Unclouded({ uid }) {
  // Two ray passes — a wide pale corona behind a tighter gold one. Layering
  // them is what lets this out-shine Radiant without going dark: Radiant gets
  // its drama from contrast, this one from sheer brightness.
  const corona = sunRays(64, 54, 16, 25, 37, 31);
  const rays = sunRays(64, 54, 16, 24, 34, 29);
  return (
    <G>
      <Rect x={12} y={12} width={104} height={104} fill={'url(#skyU' + uid + ')'} />

      <Circle cx={64} cy={54} r={38} fill="none" stroke="#ffd98a" strokeWidth={1.6} opacity={0.5} />

      {corona.map((r) => (
        <Line
          key={'c' + r.key}
          x1={r.x1}
          y1={r.y1}
          x2={r.x2}
          y2={r.y2}
          stroke="#fff3cf"
          strokeWidth={4.5}
          strokeLinecap="round"
          opacity={0.55}
        />
      ))}
      {rays.map((r) => (
        <Line
          key={r.key}
          x1={r.x1}
          y1={r.y1}
          x2={r.x2}
          y2={r.y2}
          stroke="#ffc94d"
          strokeWidth={3.2}
          strokeLinecap="round"
        />
      ))}

      <Circle cx={64} cy={54} r={33} fill={'url(#glowU' + uid + ')'} />
      <Circle cx={64} cy={54} r={17} fill={'url(#sunU' + uid + ')'} />

      <CloudDeck y={106} uid={uid} />
    </G>
  );
}

// ---------- RADIANT ----------
function Radiant({ uid }) {
  const rays = sunRays(64, 52, 16, 21, 35, 28);
  return (
    <G>
      <Rect x={12} y={12} width={104} height={104} fill={'url(#skyRd' + uid + ')'} />

      <Circle cx={30} cy={36} r={1.6} fill="#ffffff" opacity={0.9} />
      <Circle cx={98} cy={30} r={1.3} fill="#ffffff" opacity={0.8} />
      <Circle cx={104} cy={54} r={1.1} fill="#ffffff" opacity={0.7} />
      <Circle cx={22} cy={60} r={1.2} fill="#ffffff" opacity={0.7} />
      <Circle cx={44} cy={24} r={1} fill="#ffffff" opacity={0.6} />

      <Circle cx={64} cy={52} r={38} fill="none" stroke="#ffd98a" strokeWidth={1.4} opacity={0.4} />

      {rays.map((r) => (
        <Line
          key={r.key}
          x1={r.x1}
          y1={r.y1}
          x2={r.x2}
          y2={r.y2}
          stroke="#ffd15c"
          strokeWidth={3}
          strokeLinecap="round"
        />
      ))}

      <Circle cx={64} cy={52} r={30} fill={'url(#glowRd' + uid + ')'} />
      <Circle cx={64} cy={52} r={12} fill={'url(#coreRd' + uid + ')'} />

      {/* Earth's limb, lit from the same upper left as everything else. */}
      <Path d="M12 116 C30 98 48 92 64 92 C80 92 98 98 116 116 Z" fill={'url(#earthD' + uid + ')'} />
      <Path
        d="M12 116 C30 98 48 92 64 92 C80 92 98 98 116 116"
        fill="none"
        stroke="#7fd0f5"
        strokeWidth={5}
        opacity={0.45}
      />
      <Path
        d="M12 116 C30 98 48 92 64 92 C80 92 98 98 116 116"
        fill="none"
        stroke="#ffffff"
        strokeWidth={1.8}
        opacity={0.95}
      />
    </G>
  );
}

const SCENE_COMPONENTS = {
  grounded: Grounded,
  awakened: Awakened,
  elevated: Elevated,
  rising: Rising,
  unclouded: Unclouded,
  radiant: Radiant,
};

/**
 * RankScene
 *
 * @param rank    0-5, index into RANKS (or pass `scene` by key)
 * @param size    rendered square size in pt (default 96)
 * @param locked  ghost a rank not yet reached
 * @param unlock  play the promotion animation on mount
 * @param haptic  fire a success haptic with the unlock (default true)
 */
export default function RankScene({
  rank = 0,
  scene,
  size = 96,
  locked = false,
  unlock = false,
  haptic = true,
}) {
  const index = Math.max(0, Math.min(RANKS.length - 1, rank));
  const key = scene || RANKS[index].key;
  const meta = RANKS.find((r) => r.key === key) || RANKS[index];
  const Scene = SCENE_COMPONENTS[key] || Grounded;

  // Gradient ids must be unique per scene or several medallions on one screen
  // will share whichever <Defs> mounted last.
  const uid = key;
  const clipId = 'rsClip' + uid;

  const scaleAnim = useRef(new Animated.Value(unlock ? 0.6 : 1)).current;
  const opacityAnim = useRef(new Animated.Value(unlock ? 0 : 1)).current;
  const flash = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!unlock) return;
    if (haptic) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.08,
          duration: 420,
          easing: Easing.out(Easing.back(2)),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 280,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(flash, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [unlock]);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {unlock && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            width: size * 0.82,
            height: size * 0.82,
            borderRadius: size,
            borderWidth: 2,
            borderColor: meta.rim,
            opacity: flash.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
            transform: [
              { scale: flash.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] }) },
            ],
          }}
        />
      )}

      <Animated.View style={{ opacity: opacityAnim, transform: [{ scale: scaleAnim }] }}>
        <Svg width={size} height={size} viewBox="0 0 128 128">
          <Defs>
            <ClipPath id={clipId}>
              <Circle cx={CX} cy={CY} r={R} />
            </ClipPath>

            {/* --- the cabochon: what turns a flat disc into a glass dome --- */}
            <RadialGradient id={'dome' + uid} cx="50%" cy="50%" r="50%" fx="30%" fy="24%">
              <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.32" />
              <Stop offset="28%" stopColor="#ffffff" stopOpacity="0.10" />
              <Stop offset="58%" stopColor="#ffffff" stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id={'edge' + uid} cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#0b2a3d" stopOpacity="0" />
              <Stop offset="62%" stopColor="#0b2a3d" stopOpacity="0" />
              <Stop offset="100%" stopColor="#0b2a3d" stopOpacity="0.34" />
            </RadialGradient>

            {/* --- shared cloud shading --- */}
            <RadialGradient id={'cloudBall' + uid} cx="50%" cy="50%" r="50%" fx="36%" fy="26%">
              <Stop offset="0%" stopColor="#ffffff" />
              <Stop offset="62%" stopColor="#f4f9fd" />
              <Stop offset="100%" stopColor="#c9dced" />
            </RadialGradient>
            <LinearGradient id={'cloudBase' + uid} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#ffffff" />
              <Stop offset="100%" stopColor="#d5e6f2" />
            </LinearGradient>

            {/* --- grounded --- */}
            <LinearGradient id={'skyG' + uid} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#b3d9f2" />
              <Stop offset="100%" stopColor="#e8f5fc" />
            </LinearGradient>
            <RadialGradient id={'grassD' + uid} cx="50%" cy="50%" r="55%" fx="32%" fy="26%">
              <Stop offset="0%" stopColor="#a5d96a" />
              <Stop offset="60%" stopColor="#79ad4c" />
              <Stop offset="100%" stopColor="#4c7c33" />
            </RadialGradient>
            <LinearGradient id={'soilD' + uid} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#8d947f" />
              <Stop offset="100%" stopColor="#5e6656" />
            </LinearGradient>
            <LinearGradient id={'rockD' + uid} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#4d555d" />
              <Stop offset="100%" stopColor="#272c31" />
            </LinearGradient>
            <LinearGradient id={'rockLit' + uid} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#68727c" />
              <Stop offset="100%" stopColor="#414951" />
            </LinearGradient>
            <RadialGradient id={'canopyD' + uid} cx="50%" cy="50%" r="55%" fx="32%" fy="26%">
              <Stop offset="0%" stopColor="#96cf68" />
              <Stop offset="70%" stopColor="#6a9f45" />
              <Stop offset="100%" stopColor="#42702c" />
            </RadialGradient>
            <RadialGradient id={'canopyDark' + uid} cx="50%" cy="50%" r="55%" fx="32%" fy="26%">
              <Stop offset="0%" stopColor="#6b9f45" />
              <Stop offset="100%" stopColor="#2f5622" />
            </RadialGradient>
            <LinearGradient id={'trunkD' + uid} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor="#8a6446" />
              <Stop offset="100%" stopColor="#513625" />
            </LinearGradient>
            <LinearGradient id={'waterD' + uid} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor="#6fbcdd" />
              <Stop offset="45%" stopColor="#bfe8f7" />
              <Stop offset="100%" stopColor="#79c3e2" />
            </LinearGradient>

            {/* --- awakened --- */}
            <LinearGradient id={'skyA' + uid} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#f79b85" />
              <Stop offset="100%" stopColor="#fcd49b" />
            </LinearGradient>
            <LinearGradient id={'seaA' + uid} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#f0a274" />
              <Stop offset="100%" stopColor="#c9613f" />
            </LinearGradient>
            <RadialGradient id={'glowA' + uid} cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <Stop offset="55%" stopColor="#ffe6b8" stopOpacity="0.45" />
              <Stop offset="100%" stopColor="#ffd9a0" stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id={'sunA' + uid} cx="50%" cy="50%" r="50%" fx="38%" fy="30%">
              <Stop offset="0%" stopColor="#ffffff" />
              <Stop offset="100%" stopColor="#ffeec2" />
            </RadialGradient>

            {/* --- elevated --- */}
            <LinearGradient id={'skyE' + uid} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#77b1d9" />
              <Stop offset="70%" stopColor="#cfe4f3" />
              <Stop offset="100%" stopColor="#f6e3cd" />
            </LinearGradient>
            <LinearGradient id={'farPeak' + uid} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#e6f0f8" />
              <Stop offset="100%" stopColor="#c2d6e6" />
            </LinearGradient>
            <LinearGradient id={'peakLit' + uid} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#ffffff" />
              <Stop offset="100%" stopColor="#ccdeeb" />
            </LinearGradient>
            <LinearGradient id={'peakShad' + uid} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#b0c6da" />
              <Stop offset="100%" stopColor="#7793ad" />
            </LinearGradient>
            <LinearGradient id={'rockBand' + uid} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#8496a5" />
              <Stop offset="100%" stopColor="#4b5a68" />
            </LinearGradient>
            <LinearGradient id={'snowFar' + uid} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#dfebf4" />
              <Stop offset="100%" stopColor="#f2f8fc" />
            </LinearGradient>
            <LinearGradient id={'snowNear' + uid} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#ffffff" />
              <Stop offset="100%" stopColor="#dfeaf3" />
            </LinearGradient>
            <RadialGradient id={'pool' + uid} cx="50%" cy="50%" r="50%" fx="35%" fy="30%">
              <Stop offset="0%" stopColor="#e2f1fa" />
              <Stop offset="100%" stopColor="#a9cde3" />
            </RadialGradient>

            {/* --- rising --- */}
            <LinearGradient id={'skyR' + uid} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#6aa9d8" />
              <Stop offset="100%" stopColor="#d3e8f6" />
            </LinearGradient>
            <LinearGradient id={'wingNear' + uid} x1="0" y1="0" x2="0.3" y2="1">
              <Stop offset="0%" stopColor="#5d5147" />
              <Stop offset="100%" stopColor="#332c26" />
            </LinearGradient>
            <LinearGradient id={'wingFar' + uid} x1="1" y1="0" x2="0.7" y2="1">
              <Stop offset="0%" stopColor="#4a4038" />
              <Stop offset="100%" stopColor="#241f1a" />
            </LinearGradient>
            <LinearGradient id={'bodyD' + uid} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor="#5f5349" />
              <Stop offset="100%" stopColor="#2e2822" />
            </LinearGradient>
            <LinearGradient id={'tailD' + uid} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor="#ffffff" />
              <Stop offset="100%" stopColor="#c9d2d8" />
            </LinearGradient>
            <RadialGradient id={'headD' + uid} cx="50%" cy="50%" r="50%" fx="32%" fy="28%">
              <Stop offset="0%" stopColor="#ffffff" />
              <Stop offset="100%" stopColor="#cdd6dd" />
            </RadialGradient>

            {/* --- unclouded --- */}
            <LinearGradient id={'skyU' + uid} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#3f93cf" />
              <Stop offset="100%" stopColor="#d7eefb" />
            </LinearGradient>
            <RadialGradient id={'sunU' + uid} cx="50%" cy="50%" r="50%" fx="34%" fy="28%">
              <Stop offset="0%" stopColor="#ffffff" />
              <Stop offset="45%" stopColor="#ffe89f" />
              <Stop offset="100%" stopColor="#f0a01f" />
            </RadialGradient>
            <RadialGradient id={'glowU' + uid} cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#fff6dd" stopOpacity="0.85" />
              <Stop offset="50%" stopColor="#ffe3a4" stopOpacity="0.4" />
              <Stop offset="100%" stopColor="#ffd98a" stopOpacity="0" />
            </RadialGradient>

            {/* --- radiant --- */}
            <LinearGradient id={'skyRd' + uid} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#1a3068" />
              <Stop offset="100%" stopColor="#5d86bf" />
            </LinearGradient>
            <RadialGradient id={'glowRd' + uid} cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#fff6dd" stopOpacity="0.95" />
              <Stop offset="45%" stopColor="#ffd98a" stopOpacity="0.5" />
              <Stop offset="100%" stopColor="#ffc94d" stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id={'coreRd' + uid} cx="50%" cy="50%" r="50%" fx="34%" fy="28%">
              <Stop offset="0%" stopColor="#ffffff" />
              <Stop offset="100%" stopColor="#ffe9ae" />
            </RadialGradient>
            <LinearGradient id={'earthD' + uid} x1="0" y1="0" x2="0.4" y2="1">
              <Stop offset="0%" stopColor="#eaf6fc" />
              <Stop offset="100%" stopColor="#9dc3da" />
            </LinearGradient>
          </Defs>

          <G clipPath={'url(#' + clipId + ')'} opacity={locked ? 0.4 : 1}>
            <Scene uid={uid} />
            {/* Edge darkening then dome highlight, both clipped to the disc. */}
            <Circle cx={CX} cy={CY} r={R} fill={'url(#edge' + uid + ')'} />
            <Circle cx={CX} cy={CY} r={R} fill={'url(#dome' + uid + ')'} />
          </G>

          {/* Rim last, so it sits cleanly over the clipped edge. */}
          <Circle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke={locked ? '#dceaf3' : meta.rim}
            strokeWidth={3}
          />
          {/* Specular catch on the lit side of the rim, and a faint bounce
              on the opposite side — the pair is what makes it read as glass. */}
          {!locked && (
            <>
              <Path
                d="M13.8 50.5 A52 52 0 0 1 77.5 13.8"
                fill="none"
                stroke="#ffffff"
                strokeWidth={2.6}
                strokeLinecap="round"
                opacity={0.6}
              />
              <Path
                d="M110 82 A52 52 0 0 1 76 114"
                fill="none"
                stroke="#ffffff"
                strokeWidth={2}
                strokeLinecap="round"
                opacity={0.25}
              />
            </>
          )}
        </Svg>
      </Animated.View>
    </View>
  );
}
