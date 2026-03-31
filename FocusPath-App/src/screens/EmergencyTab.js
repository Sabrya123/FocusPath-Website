import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import Svg, { Path, Polygon, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../utils/colors';
import { getCurrentUser } from '../utils/storage';

const { width: SCREEN_W } = Dimensions.get('window');
const BREATHE_IN = 4000;
const TOTAL_SECONDS = 120;

// Canvas size for the SVG
const W = Math.min(SCREEN_W * 0.88, 360);
const H = W * 1.15;

export default function EmergencyTab() {
  const [phase, setPhase] = useState('closed');
  const [breathingText, setBreathingText] = useState('');
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const [user, setUser] = useState(null);

  const caseAnim = useRef(new Animated.Value(0)).current;
  const buttonPress = useRef(new Animated.Value(0)).current;
  const breathScale = useRef(new Animated.Value(1)).current;
  const sceneOpacity = useRef(new Animated.Value(1)).current;
  const breatheOpacity = useRef(new Animated.Value(0)).current;

  const breathingRef = useRef(null);
  const countdownRef = useRef(null);

  useFocusEffect(useCallback(() => { loadUser(); }, []));
  async function loadUser() { setUser(await getCurrentUser()); }
  useEffect(() => () => stopBreathing(), []);

  function openCase() {
    Animated.spring(caseAnim, { toValue: 1, friction: 9, tension: 18, useNativeDriver: true }).start();
    setPhase('open');
  }

  function pressButton() {
    Animated.sequence([
      Animated.timing(buttonPress, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(buttonPress, { toValue: 0, duration: 140, useNativeDriver: true }),
    ]).start(() => {
      Animated.parallel([
        Animated.timing(sceneOpacity, { toValue: 0, duration: 350, useNativeDriver: true }),
        Animated.timing(breatheOpacity, { toValue: 1, duration: 350, delay: 250, useNativeDriver: true }),
      ]).start(() => startBreathing());
    });
  }

  function startBreathing() {
    setPhase('breathing');
    setTimeLeft(TOTAL_SECONDS);
    let seconds = TOTAL_SECONDS;
    let isInhale = true;
    function cycle() {
      setBreathingText(isInhale ? 'Breathe In' : 'Breathe Out');
      Animated.timing(breathScale, { toValue: isInhale ? 1.5 : 1, duration: BREATHE_IN, useNativeDriver: true }).start();
      isInhale = !isInhale;
    }
    cycle();
    breathingRef.current = setInterval(cycle, BREATHE_IN);
    countdownRef.current = setInterval(() => {
      seconds--;
      setTimeLeft(seconds);
      if (seconds <= 0) { stopBreathing(); setPhase('complete'); }
    }, 1000);
  }

  function stopBreathing() {
    if (breathingRef.current) clearInterval(breathingRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }

  function reset() {
    stopBreathing();
    caseAnim.setValue(0);
    buttonPress.setValue(0);
    breathScale.setValue(1);
    sceneOpacity.setValue(1);
    breatheOpacity.setValue(0);
    setPhase('closed');
    setTimeLeft(TOTAL_SECONDS);
  }

  const fmt = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const hasAllah = user?.motivations?.includes('allah');

  const btnTopScale = buttonPress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.95] });
  const btnSideScale = buttonPress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.35] });
  const caseSwing = caseAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-140deg'] });

  if (phase === 'complete') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <View style={styles.completeCheck}>
            <Svg width={48} height={48} viewBox="0 0 24 24">
              <Path d="M5 13L9 17L19 7" stroke={Colors.green} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </Svg>
          </View>
          <Text style={styles.completeTitle}>You Made It</Text>
          <Text style={styles.completeText}>
            The craving has passed. You stayed in control.{'\n'}That took real strength.
          </Text>
          {hasAllah && <Text style={styles.completeAllah}>Allah sees your patience. This resistance is worship.</Text>}
          <TouchableOpacity style={styles.closeBtn} onPress={reset}><Text style={styles.closeBtnText}>Close</Text></TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (phase === 'breathing') {
    return (
      <SafeAreaView style={styles.safe}>
        <Animated.View style={[styles.center, { opacity: breatheOpacity }]}>
          <Text style={styles.breatheHeading}>Focus on your breath</Text>
          <Text style={styles.breatheSub}>Follow the circle. Let everything else go.</Text>
          <View style={styles.breatheArea}>
            <Animated.View style={[styles.breatheRing, { transform: [{ scale: breathScale }] }]} />
            <Animated.View style={[styles.breatheCircle, { transform: [{ scale: breathScale }] }]}>
              <Text style={styles.breatheLabel}>{breathingText}</Text>
            </Animated.View>
          </View>
          <Text style={styles.timer}>{fmt(timeLeft)}</Text>
          <TouchableOpacity style={styles.endBtn} onPress={reset}><Text style={styles.endBtnText}>End Early</Text></TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // ============================================
  // ISOMETRIC COORDINATES for the platform
  // ============================================
  // The platform is drawn in SVG as a 3D box.
  // Top face is a parallelogram, front face below it.
  const cx = W / 2;
  const topY = H * 0.22;    // where top face starts
  const topW = W * 0.82;    // width of top face
  const topH = W * 0.52;    // depth of top face (foreshortened)
  const frontH = W * 0.16;  // front face height (thickness)
  const stripeW = topW * 0.11; // hazard stripe width
  const skew = W * 0.06;    // how much the top face skews for perspective

  // Top face corners (trapezoid — wider at bottom, narrower at top)
  const tl = { x: cx - topW / 2 + skew, y: topY };
  const tr = { x: cx + topW / 2 - skew, y: topY };
  const br = { x: cx + topW / 2, y: topY + topH };
  const bl = { x: cx - topW / 2, y: topY + topH };

  // Front face (below top face bottom edge)
  const fbl = { x: bl.x, y: bl.y + frontH };
  const fbr = { x: br.x, y: br.y + frontH };

  // Inner platform (dark area)
  const inl = lerp(tl, bl, stripeW / topH);
  const inr = lerp(tr, br, stripeW / topH);
  const inbl2 = lerp(bl, tl, stripeW / topH);
  const inbr2 = lerp(br, tr, stripeW / topH);
  // Also inset horizontally
  const innerTL = offsetH(inl, inr, stripeW / topW);
  const innerTR = offsetH(inr, inl, stripeW / topW);
  const innerBL = offsetH(inbl2, inbr2, stripeW / topW);
  const innerBR = offsetH(inbr2, inbl2, stripeW / topW);

  // Button center on top face
  const btnCx = cx;
  const btnCy = topY + topH * 0.48;
  const btnRx = topW * 0.22;
  const btnRy = topH * 0.22;
  const btnSideH2 = W * 0.08;

  // Glass case dimensions on top face
  const gw = topW * 0.42;
  const gh = topH * 0.56;
  const gfh = topH * 0.48; // glass front panel height
  const gth = topH * 0.18; // glass top panel depth

  // Generate hazard stripe polygons for top face edges
  const topStripes = generateStripes(tl, tr, bl, br, stripeW, 14);
  // Front face stripes
  const frontStripes = generateFrontStripes(bl, br, fbl, fbr, 14);

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View style={[styles.center, { opacity: sceneOpacity }]}>
        <Text style={styles.title}>EMERGENCY</Text>

        <View style={styles.scene}>
          {/* SVG draws the 3D platform */}
          <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
            <Defs>
              <LinearGradient id="btnGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#f87171" />
                <Stop offset="0.4" stopColor="#ef4444" />
                <Stop offset="1" stopColor="#dc2626" />
              </LinearGradient>
              <LinearGradient id="btnSide" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#b91c1c" />
                <Stop offset="1" stopColor="#7f1d1d" />
              </LinearGradient>
              <LinearGradient id="frontGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#2d3a4a" />
                <Stop offset="1" stopColor="#1a2332" />
              </LinearGradient>
              <LinearGradient id="glassGrad" x1="0" y1="0" x2="0.3" y2="1">
                <Stop offset="0" stopColor="rgba(180,220,245,0.18)" />
                <Stop offset="1" stopColor="rgba(140,200,235,0.06)" />
              </LinearGradient>
              <LinearGradient id="glassSide" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="rgba(160,210,240,0.12)" />
                <Stop offset="1" stopColor="rgba(120,190,225,0.04)" />
              </LinearGradient>
            </Defs>

            {/* ===== FRONT FACE ===== */}
            <Polygon
              points={`${bl.x},${bl.y} ${br.x},${br.y} ${fbr.x},${fbr.y} ${fbl.x},${fbl.y}`}
              fill="url(#frontGrad)"
              stroke="#151d2b"
              strokeWidth={1.5}
            />
            {/* Front face hazard stripes */}
            {frontStripes.map((pts, i) => (
              <Polygon key={`fs${i}`} points={pts} fill={i % 2 === 0 ? '#ca8a04' : '#1c1917'} />
            ))}

            {/* ===== TOP FACE ===== */}
            <Polygon
              points={`${tl.x},${tl.y} ${tr.x},${tr.y} ${br.x},${br.y} ${bl.x},${bl.y}`}
              fill="#374151"
              stroke="#1f2937"
              strokeWidth={1.5}
            />

            {/* Top face hazard stripes */}
            {topStripes.map((pts, i) => (
              <Polygon key={`ts${i}`} points={pts} fill={i % 2 === 0 ? '#eab308' : '#292524'} />
            ))}

            {/* Inner dark platform */}
            <Polygon
              points={`${innerTL.x},${innerTL.y} ${innerTR.x},${innerTR.y} ${innerBR.x},${innerBR.y} ${innerBL.x},${innerBL.y}`}
              fill="#1a2234"
              stroke="#2a3650"
              strokeWidth={1.5}
            />

            {/* ===== BUTTON SHADOW ===== */}
            <Rect
              x={btnCx - btnRx * 1.05}
              y={btnCy + btnSideH2 - 2}
              rx={btnRx}
              ry={btnRy * 0.4}
              width={btnRx * 2.1}
              height={btnRy * 0.8}
              fill="rgba(0,0,0,0.3)"
            />

            {/* ===== BUTTON CYLINDER SIDE ===== */}
            <Rect
              x={btnCx - btnRx}
              y={btnCy}
              rx={4}
              ry={0}
              width={btnRx * 2}
              height={btnSideH2}
              fill="url(#btnSide)"
              stroke="#6b1010"
              strokeWidth={1}
            />
            {/* Rounded bottom of cylinder */}
            <Rect
              x={btnCx - btnRx}
              y={btnCy + btnSideH2 - btnRy * 0.5}
              rx={btnRx}
              ry={btnRy * 0.5}
              width={btnRx * 2}
              height={btnRy}
              fill="url(#btnSide)"
            />

            {/* ===== BUTTON TOP FACE (ellipse) ===== */}
            <Rect
              x={btnCx - btnRx}
              y={btnCy - btnRy}
              rx={btnRx}
              ry={btnRy}
              width={btnRx * 2}
              height={btnRy * 2}
              fill="url(#btnGrad)"
              stroke="#fca5a5"
              strokeWidth={2}
            />
            {/* Highlight on button */}
            <Rect
              x={btnCx - btnRx * 0.55}
              y={btnCy - btnRy * 0.65}
              rx={btnRx * 0.45}
              ry={btnRy * 0.35}
              width={btnRx * 0.9}
              height={btnRy * 0.6}
              fill="rgba(255,255,255,0.2)"
            />
          </Svg>

          {/* ===== GLASS CASE (RN Views for animation) ===== */}
          <Animated.View
            style={[styles.glassAnchor, {
              top: topY - gth * 0.2,
              left: (W - gw - 20) / 2,
              width: gw + 20,
              height: gfh + gth,
              transform: [
                { perspective: 500 },
                { rotateX: caseSwing },
              ],
            }]}
            pointerEvents={phase === 'closed' ? 'auto' : 'none'}
          >
            <TouchableOpacity
              activeOpacity={0.97}
              onPress={phase === 'closed' ? openCase : undefined}
              style={{ flex: 1 }}
            >
              {/* Top panel */}
              <View style={[styles.gTop, { height: gth }]} />
              {/* Front panel */}
              <View style={[styles.gFront, { height: gfh }]}>
                <View style={styles.gShine1} />
                <View style={styles.gShine2} />
              </View>
              {/* Left side */}
              <View style={styles.gSideL} />
              {/* Right side */}
              <View style={styles.gSideR} />
            </TouchableOpacity>
          </Animated.View>

          {/* Invisible button press area over the SVG button */}
          {phase === 'open' && (
            <TouchableOpacity
              activeOpacity={0.95}
              onPress={pressButton}
              style={[styles.btnHitArea, {
                top: btnCy - btnRy - 10,
                left: (W / 2) - btnRx - 10,
                width: btnRx * 2 + 20,
                height: btnRy * 2 + btnSideH2 + 20,
              }]}
            />
          )}
        </View>

        <Text style={styles.infoText}>
          Cravings go away after 2 minutes.{'\n'}Hit the button and distract yourself.
        </Text>

        {phase === 'closed' && <Text style={styles.hint}>Lift the glass case</Text>}
        {phase === 'open' && (
          <Text style={[styles.hint, styles.hintActive]}>Press the button!</Text>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

// ===== HELPER FUNCTIONS =====
function lerp(a, b, t) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function offsetH(p, other, t) {
  return { x: p.x + (other.x - p.x) * t, y: p.y + (other.y - p.y) * t };
}

function generateStripes(tl, tr, bl, br, stripeW, count) {
  const polys = [];
  // Top edge stripes
  for (let i = 0; i < count; i++) {
    const t0 = i / count;
    const t1 = (i + 1) / count;
    const p1 = lerp(tl, tr, t0);
    const p2 = lerp(tl, tr, t1);
    const frac = stripeW / Math.hypot(bl.x - tl.x, bl.y - tl.y);
    const p3 = lerp(lerp(tl, tr, t1), lerp(bl, br, t1), frac);
    const p4 = lerp(lerp(tl, tr, t0), lerp(bl, br, t0), frac);
    polys.push(`${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y}`);
  }
  // Bottom edge stripes
  for (let i = 0; i < count; i++) {
    const t0 = i / count;
    const t1 = (i + 1) / count;
    const p1 = lerp(bl, br, t0);
    const p2 = lerp(bl, br, t1);
    const frac = stripeW / Math.hypot(bl.x - tl.x, bl.y - tl.y);
    const p3 = lerp(lerp(bl, br, t1), lerp(tl, tr, t1), frac);
    const p4 = lerp(lerp(bl, br, t0), lerp(tl, tr, t0), frac);
    polys.push(`${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y}`);
  }
  // Left edge stripes
  for (let i = 0; i < 8; i++) {
    const t0 = i / 8;
    const t1 = (i + 1) / 8;
    const p1 = lerp(tl, bl, t0);
    const p2 = lerp(tl, bl, t1);
    const frac = stripeW / Math.hypot(tr.x - tl.x, tr.y - tl.y);
    const p3 = lerp(lerp(tl, bl, t1), lerp(tr, br, t1), frac);
    const p4 = lerp(lerp(tl, bl, t0), lerp(tr, br, t0), frac);
    polys.push(`${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y}`);
  }
  // Right edge stripes
  for (let i = 0; i < 8; i++) {
    const t0 = i / 8;
    const t1 = (i + 1) / 8;
    const p1 = lerp(tr, br, t0);
    const p2 = lerp(tr, br, t1);
    const frac = stripeW / Math.hypot(tr.x - tl.x, tr.y - tl.y);
    const p3 = lerp(lerp(tr, br, t1), lerp(tl, bl, t1), frac);
    const p4 = lerp(lerp(tr, br, t0), lerp(tl, bl, t0), frac);
    polys.push(`${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y}`);
  }
  return polys;
}

function generateFrontStripes(bl, br, fbl, fbr, count) {
  const polys = [];
  for (let i = 0; i < count; i++) {
    const t0 = i / count;
    const t1 = (i + 1) / count;
    const p1 = lerp(bl, br, t0);
    const p2 = lerp(bl, br, t1);
    const p3 = lerp(fbl, fbr, t1);
    const p4 = lerp(fbl, fbr, t0);
    polys.push(`${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y}`);
  }
  return polys;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.redLight, letterSpacing: 6, marginBottom: 16 },

  scene: {
    width: W,
    height: H,
  },

  // Glass case
  glassAnchor: {
    position: 'absolute',
    zIndex: 20,
    transformOrigin: 'top center',
  },
  gTop: {
    backgroundColor: 'rgba(160, 220, 245, 0.10)',
    borderWidth: 2,
    borderColor: 'rgba(140, 210, 240, 0.28)',
    borderBottomWidth: 0,
  },
  gFront: {
    backgroundColor: 'rgba(140, 200, 235, 0.08)',
    borderWidth: 2,
    borderColor: 'rgba(120, 190, 225, 0.25)',
    borderTopWidth: 0,
    overflow: 'hidden',
  },
  gShine1: {
    position: 'absolute', top: '4%', left: '10%',
    width: 4, height: '80%',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 2,
  },
  gShine2: {
    position: 'absolute', top: '8%', left: '18%',
    width: 2, height: '60%',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 1,
  },
  gSideL: {
    position: 'absolute', top: 0, left: -8, bottom: 0, width: 10,
    backgroundColor: 'rgba(150, 210, 235, 0.07)',
    borderLeftWidth: 2,
    borderColor: 'rgba(130, 200, 230, 0.22)',
  },
  gSideR: {
    position: 'absolute', top: 0, right: -8, bottom: 0, width: 10,
    backgroundColor: 'rgba(110, 170, 200, 0.04)',
    borderRightWidth: 2,
    borderColor: 'rgba(100, 160, 190, 0.18)',
  },

  // Invisible hit area for button press
  btnHitArea: {
    position: 'absolute',
    zIndex: 25,
  },

  // Text
  infoText: {
    fontSize: 15, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 24, marginTop: 16,
  },
  hint: { color: Colors.textMuted, fontSize: 13, marginTop: 10, letterSpacing: 0.5 },
  hintActive: { color: Colors.redLight, fontWeight: '600' },

  // Breathing
  breatheHeading: { fontSize: 24, fontWeight: '800', color: Colors.textBright, marginBottom: 8 },
  breatheSub: { fontSize: 14, color: Colors.textSecondary, marginBottom: 40 },
  breatheArea: { width: 260, height: 260, alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
  breatheCircle: {
    width: 160, height: 160, borderRadius: 80, backgroundColor: Colors.red,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.red, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 40, elevation: 10,
  },
  breatheRing: { position: 'absolute', width: 200, height: 200, borderRadius: 100, borderWidth: 2, borderColor: Colors.redLight, opacity: 0.3 },
  breatheLabel: { color: '#fff', fontSize: 16, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2 },
  timer: { fontSize: 42, fontWeight: '700', color: Colors.redLight, fontVariant: ['tabular-nums'], marginBottom: 20 },
  endBtn: { borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 40 },
  endBtnText: { color: Colors.textMuted, fontSize: 15 },

  // Complete
  completeCheck: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: Colors.green, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  completeTitle: { fontSize: 28, fontWeight: '800', color: Colors.green, marginBottom: 12 },
  completeText: { fontSize: 16, color: Colors.text, textAlign: 'center', lineHeight: 24, marginBottom: 12 },
  completeAllah: { fontSize: 15, color: Colors.purpleLight, textAlign: 'center', lineHeight: 24, marginBottom: 20 },
  closeBtn: { backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 50, marginTop: 10 },
  closeBtnText: { color: Colors.textBright, fontSize: 16, fontWeight: '600' },
});
