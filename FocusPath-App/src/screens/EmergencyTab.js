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
import Svg, { Path } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../utils/colors';
import { getCurrentUser } from '../utils/storage';

const { width: SCREEN_W } = Dimensions.get('window');
const BREATHE_IN = 4000;
const BREATHE_OUT = 4000;
const TOTAL_SECONDS = 120;

const BASE_SIZE = Math.min(SCREEN_W * 0.6, 230);
const BUTTON_SIZE = BASE_SIZE * 0.58;
const CASE_W = BASE_SIZE * 0.7;
const CASE_H = BUTTON_SIZE * 1.1;

export default function EmergencyTab() {
  const [phase, setPhase] = useState('closed');
  const [breathingText, setBreathingText] = useState('');
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const [user, setUser] = useState(null);

  const caseRotate = useRef(new Animated.Value(0)).current;
  const buttonPress = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const breathScale = useRef(new Animated.Value(1)).current;
  const sceneOpacity = useRef(new Animated.Value(1)).current;
  const breatheOpacity = useRef(new Animated.Value(0)).current;

  const breathingRef = useRef(null);
  const countdownRef = useRef(null);
  const pulseRef = useRef(null);

  useFocusEffect(useCallback(() => { loadUser(); }, []));
  async function loadUser() { setUser(await getCurrentUser()); }
  useEffect(() => () => stopBreathing(), []);

  useEffect(() => {
    if (phase === 'open') {
      pulseRef.current = Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]));
      pulseRef.current.start();
    } else {
      if (pulseRef.current) pulseRef.current.stop();
      pulseAnim.setValue(1);
    }
  }, [phase]);

  function openCase() {
    Animated.spring(caseRotate, { toValue: 1, friction: 7, tension: 28, useNativeDriver: true }).start();
    setPhase('open');
  }

  function pressButton() {
    Animated.sequence([
      Animated.timing(buttonPress, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonPress, { toValue: 0, duration: 80, useNativeDriver: true }),
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
    caseRotate.setValue(0);
    buttonPress.setValue(0);
    pulseAnim.setValue(1);
    breathScale.setValue(1);
    sceneOpacity.setValue(1);
    breatheOpacity.setValue(0);
    setPhase('closed');
    setTimeLeft(TOTAL_SECONDS);
  }

  const fmt = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const hasAllah = user?.motivations?.includes('allah');

  const caseRotateInterp = caseRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-115deg'] });
  const btnScale = buttonPress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.93] });
  const btnSideH = buttonPress.interpolate({ inputRange: [0, 1], outputRange: [BUTTON_SIZE * 0.22, BUTTON_SIZE * 0.1] });

  // ===== COMPLETE =====
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

  // ===== BREATHING =====
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

  // ===== 3D ANGLED BUTTON SCENE =====
  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View style={[styles.center, { opacity: sceneOpacity }]}>
        <Text style={styles.title}>EMERGENCY</Text>

        {/* Perspective wrapper — tilts the whole assembly like looking at it on a table */}
        <View style={styles.perspectiveWrap}>
          <View style={styles.assemblyWrap}>

            {/* ===== HAZARD BASE ===== */}
            <View style={styles.base}>
              {/* Hazard stripes */}
              <View style={styles.baseStripes}>
                {[...Array(14)].map((_, i) => (
                  <View key={i} style={[styles.stripe, { backgroundColor: i % 2 === 0 ? '#D97706' : '#292524' }]} />
                ))}
              </View>
              {/* Inner dark platform */}
              <View style={styles.basePlatform} />
            </View>

            {/* ===== 3D RED BUTTON ===== */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={phase === 'open' ? pressButton : undefined}
              disabled={phase === 'closed'}
              style={styles.buttonPos}
            >
              <Animated.View style={{
                alignItems: 'center',
                transform: [{ scale: phase === 'open' ? Animated.multiply(pulseAnim, btnScale) : btnScale }],
              }}>
                {/* Button top face (ellipse from this angle) */}
                <View style={styles.buttonTop}>
                  <View style={styles.btnShine1} />
                  <View style={styles.btnShine2} />
                </View>
                {/* Button side (cylinder depth) */}
                <Animated.View style={[styles.buttonSide, { height: btnSideH }]} />
                {/* Dark shadow base */}
                <View style={styles.buttonShadow} />
              </Animated.View>
            </TouchableOpacity>

            {/* ===== GLASS CASE ===== */}
            <Animated.View
              style={[
                styles.glassCase,
                {
                  transform: [
                    { perspective: 500 },
                    { rotateX: caseRotateInterp },
                  ],
                },
              ]}
              pointerEvents={phase === 'closed' ? 'auto' : 'none'}
            >
              <TouchableOpacity
                activeOpacity={0.95}
                onPress={phase === 'closed' ? openCase : undefined}
                style={styles.glassTouchable}
              >
                {/* Front glass panel */}
                <View style={styles.glassFront}>
                  <View style={styles.glassShine1} />
                  <View style={styles.glassShine2} />
                </View>
                {/* Left side panel */}
                <View style={styles.glassSideL} />
                {/* Right side panel */}
                <View style={styles.glassSideR} />
                {/* Top bar / frame */}
                <View style={styles.glassFrame} />
                <View style={styles.glassFrameBar} />
              </TouchableOpacity>
            </Animated.View>

          </View>
        </View>

        <Text style={styles.infoText}>
          Cravings go away after 2 minutes.{'\n'}Hit the button and distract yourself.
        </Text>

        {phase === 'closed' && <Text style={styles.hint}>Tap the case to open</Text>}
        {phase === 'open' && (
          <Animated.Text style={[styles.hint, styles.hintActive, { opacity: pulseAnim }]}>
            Press the button
          </Animated.Text>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.redLight, letterSpacing: 6, marginBottom: 30 },

  // Perspective tilt — looking at it from an angle above
  perspectiveWrap: {
    transform: [
      { perspective: 600 },
      { rotateX: '20deg' },
      { rotateZ: '-2deg' },
    ],
  },
  assemblyWrap: {
    width: BASE_SIZE + 30,
    height: BASE_SIZE + CASE_H + 10,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  // ===== HAZARD BASE =====
  base: {
    width: BASE_SIZE,
    height: BASE_SIZE * 0.55,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#78350F',
  },
  baseStripes: {
    flex: 1,
    flexDirection: 'row',
  },
  stripe: {
    flex: 1,
    transform: [{ skewX: '-25deg' }],
    marginHorizontal: -3,
  },
  basePlatform: {
    position: 'absolute',
    top: '15%',
    left: '12%',
    right: '12%',
    bottom: '15%',
    backgroundColor: '#1c1917',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#44403c',
  },

  // ===== 3D BUTTON =====
  buttonPos: {
    position: 'absolute',
    bottom: BASE_SIZE * 0.55 * 0.25,
    zIndex: 3,
    alignItems: 'center',
  },
  buttonTop: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE * 0.7,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: '#ef4444',
    overflow: 'hidden',
    zIndex: 2,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 8,
  },
  btnShine1: {
    position: 'absolute',
    top: '10%',
    left: '15%',
    width: '45%',
    height: '35%',
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.25)',
    transform: [{ rotate: '-15deg' }],
  },
  btnShine2: {
    position: 'absolute',
    top: '22%',
    left: '22%',
    width: '25%',
    height: '12%',
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.12)',
    transform: [{ rotate: '-15deg' }],
  },
  buttonSide: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE * 0.22,
    backgroundColor: '#b91c1c',
    borderBottomLeftRadius: BUTTON_SIZE * 0.15,
    borderBottomRightRadius: BUTTON_SIZE * 0.15,
    marginTop: -4,
    zIndex: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 2,
    borderColor: '#991b1b',
  },
  buttonShadow: {
    width: BUTTON_SIZE + 6,
    height: 8,
    backgroundColor: '#450a0a',
    borderRadius: BUTTON_SIZE / 2,
    marginTop: -2,
    opacity: 0.6,
  },

  // ===== GLASS CASE =====
  glassCase: {
    position: 'absolute',
    bottom: BASE_SIZE * 0.55 * 0.2,
    width: CASE_W,
    height: CASE_H,
    zIndex: 5,
    transformOrigin: 'bottom center',
  },
  glassTouchable: { flex: 1 },
  glassFront: {
    flex: 1,
    backgroundColor: 'rgba(150, 200, 220, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(100, 160, 190, 0.3)',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomWidth: 0,
    overflow: 'hidden',
  },
  glassShine1: {
    position: 'absolute',
    top: '8%',
    left: '10%',
    width: '18%',
    height: '55%',
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    transform: [{ skewX: '-5deg' }],
  },
  glassShine2: {
    position: 'absolute',
    top: '12%',
    left: '26%',
    width: '7%',
    height: '40%',
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.06)',
    transform: [{ skewX: '-5deg' }],
  },
  glassSideL: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 8,
    backgroundColor: 'rgba(100, 160, 190, 0.08)',
    borderTopLeftRadius: 6,
    borderLeftWidth: 2,
    borderColor: 'rgba(100, 160, 190, 0.2)',
  },
  glassSideR: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 8,
    backgroundColor: 'rgba(100, 160, 190, 0.08)',
    borderTopRightRadius: 6,
    borderRightWidth: 2,
    borderColor: 'rgba(100, 160, 190, 0.2)',
  },
  // Frame bars at top of glass (like the metal frame in the reference)
  glassFrame: {
    position: 'absolute',
    top: 0,
    left: -2,
    right: -2,
    height: 6,
    backgroundColor: '#475569',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  glassFrameBar: {
    position: 'absolute',
    top: 0,
    left: '40%',
    width: '20%',
    height: '100%',
    backgroundColor: 'rgba(71, 85, 105, 0.15)',
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: 'rgba(71, 85, 105, 0.2)',
  },

  // ===== INFO TEXT =====
  infoText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 30,
  },
  hint: { color: Colors.textMuted, fontSize: 13, marginTop: 14, letterSpacing: 0.5 },
  hintActive: { color: Colors.redLight },

  // ===== BREATHING =====
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

  // ===== COMPLETE =====
  completeCheck: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: Colors.green, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  completeTitle: { fontSize: 28, fontWeight: '800', color: Colors.green, marginBottom: 12 },
  completeText: { fontSize: 16, color: Colors.text, textAlign: 'center', lineHeight: 24, marginBottom: 12 },
  completeAllah: { fontSize: 15, color: Colors.purpleLight, textAlign: 'center', lineHeight: 24, marginBottom: 20 },
  closeBtn: { backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 50, marginTop: 10 },
  closeBtnText: { color: Colors.textBright, fontSize: 16, fontWeight: '600' },
});
