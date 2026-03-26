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

// Sizes
const BASE_W = Math.min(SCREEN_W * 0.75, 280);
const BASE_H = BASE_W * 0.35;
const BUTTON_W = BASE_W * 0.55;
const BUTTON_H = BUTTON_W * 0.55;
const CASE_W = BASE_W * 0.65;
const CASE_H = BUTTON_H + 40;

export default function EmergencyTab() {
  const [phase, setPhase] = useState('closed'); // closed | open | breathing | complete
  const [breathingText, setBreathingText] = useState('');
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const [user, setUser] = useState(null);

  // Animations
  const caseRotate = useRef(new Animated.Value(0)).current;
  const buttonPress = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const breathScale = useRef(new Animated.Value(1)).current;
  const sceneOpacity = useRef(new Animated.Value(1)).current;
  const breatheOpacity = useRef(new Animated.Value(0)).current;

  const breathingRef = useRef(null);
  const countdownRef = useRef(null);
  const pulseRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [])
  );

  async function loadUser() {
    const u = await getCurrentUser();
    setUser(u);
  }

  useEffect(() => {
    return () => stopBreathing();
  }, []);

  // Pulse glow when open
  useEffect(() => {
    if (phase === 'open') {
      pulseRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.06, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      );
      pulseRef.current.start();
    } else {
      if (pulseRef.current) pulseRef.current.stop();
      pulseAnim.setValue(1);
    }
  }, [phase]);

  function openCase() {
    Animated.spring(caseRotate, {
      toValue: 1,
      friction: 8,
      tension: 30,
      useNativeDriver: true,
    }).start(() => {
      setPhase('open');
    });
    setPhase('open');
  }

  function pressButton() {
    // Animate button press down
    Animated.sequence([
      Animated.timing(buttonPress, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(buttonPress, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start(() => {
      // Transition to breathing
      Animated.parallel([
        Animated.timing(sceneOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(breatheOpacity, { toValue: 1, duration: 400, delay: 300, useNativeDriver: true }),
      ]).start(() => {
        startBreathing();
      });
    });
  }

  function startBreathing() {
    setPhase('breathing');
    setTimeLeft(TOTAL_SECONDS);
    let seconds = TOTAL_SECONDS;
    let isInhale = true;

    function breatheCycle() {
      if (isInhale) {
        setBreathingText('Breathe In');
        Animated.timing(breathScale, {
          toValue: 1.5,
          duration: BREATHE_IN,
          useNativeDriver: true,
        }).start();
      } else {
        setBreathingText('Breathe Out');
        Animated.timing(breathScale, {
          toValue: 1,
          duration: BREATHE_OUT,
          useNativeDriver: true,
        }).start();
      }
      isInhale = !isInhale;
    }

    breatheCycle();
    breathingRef.current = setInterval(breatheCycle, BREATHE_IN);
    countdownRef.current = setInterval(() => {
      seconds--;
      setTimeLeft(seconds);
      if (seconds <= 0) {
        stopBreathing();
        setPhase('complete');
      }
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

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const hasAllah = user?.motivations?.includes('allah');

  // Case rotates from bottom edge upward (hinge at bottom)
  const caseRotateInterp = caseRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-110deg'],
  });

  // Button presses down slightly
  const buttonPressY = buttonPress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 6],
  });
  const buttonShadowH = buttonPress.interpolate({
    inputRange: [0, 1],
    outputRange: [BUTTON_H * 0.2, BUTTON_H * 0.08],
  });

  // ===== COMPLETE =====
  if (phase === 'complete') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <View style={styles.completeCheckCircle}>
            <Svg width={48} height={48} viewBox="0 0 24 24">
              <Path d="M5 13L9 17L19 7" stroke={Colors.green} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </Svg>
          </View>
          <Text style={styles.completeTitle}>You Made It</Text>
          <Text style={styles.completeText}>
            The craving has passed. You stayed in control.{'\n'}That took real strength.
          </Text>
          {hasAllah && (
            <Text style={styles.completeAllah}>
              Allah sees your patience. This resistance is worship.
            </Text>
          )}
          <TouchableOpacity style={styles.resetBtn} onPress={reset}>
            <Text style={styles.resetBtnText}>Close</Text>
          </TouchableOpacity>
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
            <Animated.View style={[styles.breatheRingOuter, { transform: [{ scale: breathScale }] }]} />
            <Animated.View style={[styles.breatheCircle, { transform: [{ scale: breathScale }] }]}>
              <Text style={styles.breatheLabel}>{breathingText}</Text>
            </Animated.View>
          </View>

          <Text style={styles.timer}>{formatTime(timeLeft)}</Text>

          <TouchableOpacity style={styles.endBtn} onPress={reset}>
            <Text style={styles.endBtnText}>End Early</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // ===== CLOSED & OPEN — 3D BUTTON WITH GLASS CASE =====
  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View style={[styles.center, { opacity: sceneOpacity }]}>
        <Text style={styles.title}>EMERGENCY</Text>
        <Text style={styles.subtitle}>
          {phase === 'closed'
            ? 'Having a craving? Open the case.'
            : 'Hit the button. Start breathing.'}
        </Text>

        <View style={styles.scene}>
          {/* ===== HAZARD BASE ===== */}
          <View style={styles.baseOuter}>
            {/* Hazard stripes */}
            <View style={styles.hazardStripes}>
              {[...Array(12)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.hazardStripe,
                    { backgroundColor: i % 2 === 0 ? '#D97706' : '#1a1a1a' },
                  ]}
                />
              ))}
            </View>
            {/* Base top surface (dark platform) */}
            <View style={styles.basePlatform} />
          </View>

          {/* ===== 3D RED BUTTON ===== */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={phase === 'open' ? pressButton : undefined}
            disabled={phase === 'closed'}
            style={styles.buttonArea}
          >
            {/* Button shadow/base (dark cylinder underneath) */}
            <Animated.View style={[styles.buttonShadow, { height: buttonShadowH }]} />

            {/* Button cylinder */}
            <Animated.View
              style={[
                styles.buttonCylinder,
                {
                  transform: [
                    { translateY: buttonPressY },
                    { scale: phase === 'open' ? pulseAnim : 1 },
                  ],
                },
              ]}
            >
              {/* Top face of button */}
              <View style={styles.buttonTop}>
                <View style={styles.buttonShine} />
                <View style={styles.buttonShine2} />
              </View>
              {/* Side face of button (gives 3D depth) */}
              <View style={styles.buttonSide} />
            </Animated.View>
          </TouchableOpacity>

          {/* ===== CLEAR GLASS CASE ===== */}
          <Animated.View
            style={[
              styles.glassCase,
              {
                transform: [
                  { perspective: 600 },
                  { rotateX: caseRotateInterp },
                ],
              },
            ]}
            pointerEvents={phase === 'closed' ? 'auto' : 'none'}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={phase === 'closed' ? openCase : undefined}
              style={styles.glassCaseTouch}
            >
              {/* Glass front panel */}
              <View style={styles.glassFront}>
                <View style={styles.glassReflection} />
                <View style={styles.glassReflection2} />
              </View>
              {/* Glass left side */}
              <View style={styles.glassSideLeft} />
              {/* Glass right side */}
              <View style={styles.glassSideRight} />
              {/* Glass top */}
              <View style={styles.glassTop} />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {phase === 'closed' && (
          <Text style={styles.hint}>Tap the case to open</Text>
        )}
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.redLight,
    letterSpacing: 6,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },

  // ===== SCENE =====
  scene: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: BASE_W + 20,
    height: BASE_H + BUTTON_H + CASE_H + 30,
  },

  // ===== HAZARD BASE =====
  baseOuter: {
    width: BASE_W,
    height: BASE_H,
    position: 'absolute',
    bottom: 0,
  },
  hazardStripes: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: BASE_H * 0.6,
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#92400E',
  },
  hazardStripe: {
    flex: 1,
    transform: [{ skewX: '-20deg' }],
    marginHorizontal: -2,
  },
  basePlatform: {
    position: 'absolute',
    top: 0,
    left: BASE_W * 0.08,
    right: BASE_W * 0.08,
    height: BASE_H * 0.5,
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: '#333',
  },

  // ===== 3D BUTTON =====
  buttonArea: {
    position: 'absolute',
    bottom: BASE_H * 0.35,
    alignItems: 'center',
    zIndex: 2,
  },
  buttonShadow: {
    position: 'absolute',
    bottom: -4,
    width: BUTTON_W + 8,
    height: BUTTON_H * 0.2,
    backgroundColor: '#5c0a0a',
    borderBottomLeftRadius: BUTTON_W * 0.3,
    borderBottomRightRadius: BUTTON_W * 0.3,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  buttonCylinder: {
    alignItems: 'center',
  },
  buttonTop: {
    width: BUTTON_W,
    height: BUTTON_W * 0.65,
    borderRadius: BUTTON_W * 0.5,
    backgroundColor: '#ef4444',
    overflow: 'hidden',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonShine: {
    position: 'absolute',
    top: 6,
    left: BUTTON_W * 0.15,
    width: BUTTON_W * 0.5,
    height: BUTTON_W * 0.2,
    borderRadius: BUTTON_W * 0.15,
    backgroundColor: 'rgba(255,255,255,0.25)',
    transform: [{ rotate: '-10deg' }],
  },
  buttonShine2: {
    position: 'absolute',
    top: BUTTON_W * 0.12,
    left: BUTTON_W * 0.2,
    width: BUTTON_W * 0.3,
    height: BUTTON_W * 0.08,
    borderRadius: BUTTON_W * 0.05,
    backgroundColor: 'rgba(255,255,255,0.12)',
    transform: [{ rotate: '-10deg' }],
  },
  buttonSide: {
    width: BUTTON_W,
    height: BUTTON_H * 0.35,
    backgroundColor: '#b91c1c',
    borderBottomLeftRadius: BUTTON_W * 0.15,
    borderBottomRightRadius: BUTTON_W * 0.15,
    marginTop: -2,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#991b1b',
  },

  // ===== GLASS CASE =====
  glassCase: {
    position: 'absolute',
    bottom: BASE_H * 0.35,
    width: CASE_W,
    height: CASE_H,
    zIndex: 5,
    transformOrigin: 'bottom center',
  },
  glassCaseTouch: {
    flex: 1,
  },
  glassFront: {
    flex: 1,
    backgroundColor: 'rgba(180, 220, 240, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(180, 220, 240, 0.3)',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 0,
    overflow: 'hidden',
  },
  glassReflection: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: CASE_W * 0.15,
    height: CASE_H * 0.6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 4,
    transform: [{ skewX: '-5deg' }],
  },
  glassReflection2: {
    position: 'absolute',
    top: 12,
    left: CASE_W * 0.22,
    width: CASE_W * 0.06,
    height: CASE_H * 0.4,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 3,
    transform: [{ skewX: '-5deg' }],
  },
  glassSideLeft: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    top: 0,
    width: 6,
    backgroundColor: 'rgba(180, 220, 240, 0.08)',
    borderLeftWidth: 1.5,
    borderColor: 'rgba(180, 220, 240, 0.2)',
    borderTopLeftRadius: 8,
  },
  glassSideRight: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    top: 0,
    width: 6,
    backgroundColor: 'rgba(180, 220, 240, 0.08)',
    borderRightWidth: 1.5,
    borderColor: 'rgba(180, 220, 240, 0.2)',
    borderTopRightRadius: 8,
  },
  glassTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: 'rgba(180, 220, 240, 0.15)',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: 'rgba(180, 220, 240, 0.25)',
  },

  // Hints
  hint: {
    color: Colors.textMuted,
    fontSize: 14,
    marginTop: 30,
    letterSpacing: 1,
  },
  hintActive: {
    color: Colors.redLight,
  },

  // ===== BREATHING =====
  breatheHeading: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textBright,
    marginBottom: 8,
  },
  breatheSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 40,
  },
  breatheArea: {
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  breatheCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.red,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 10,
  },
  breatheRingOuter: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: Colors.redLight,
    opacity: 0.3,
  },
  breatheLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  timer: {
    fontSize: 42,
    fontWeight: '700',
    color: Colors.redLight,
    fontVariant: ['tabular-nums'],
    marginBottom: 20,
  },
  endBtn: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  endBtnText: {
    color: Colors.textMuted,
    fontSize: 15,
  },

  // ===== COMPLETE =====
  completeCheckCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  completeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.green,
    marginBottom: 12,
  },
  completeText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
  },
  completeAllah: {
    fontSize: 15,
    color: Colors.purpleLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  resetBtn: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 50,
    marginTop: 10,
  },
  resetBtnText: {
    color: Colors.textBright,
    fontSize: 16,
    fontWeight: '600',
  },
});
