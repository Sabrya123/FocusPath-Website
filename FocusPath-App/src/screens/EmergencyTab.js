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

const BUTTON_SIZE = Math.min(SCREEN_W * 0.52, 200);
const CASE_SIZE = BUTTON_SIZE + 40;

export default function EmergencyTab() {
  const [phase, setPhase] = useState('closed'); // closed | open | breathing | complete
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

  async function loadUser() {
    const u = await getCurrentUser();
    setUser(u);
  }

  useEffect(() => () => stopBreathing(), []);

  useEffect(() => {
    if (phase === 'open') {
      pulseRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.04, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
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
    }).start();
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

    function breatheCycle() {
      if (isInhale) {
        setBreathingText('Breathe In');
        Animated.timing(breathScale, { toValue: 1.5, duration: BREATHE_IN, useNativeDriver: true }).start();
      } else {
        setBreathingText('Breathe Out');
        Animated.timing(breathScale, { toValue: 1, duration: BREATHE_OUT, useNativeDriver: true }).start();
      }
      isInhale = !isInhale;
    }

    breatheCycle();
    breathingRef.current = setInterval(breatheCycle, BREATHE_IN);
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

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const hasAllah = user?.motivations?.includes('allah');

  const caseRotateInterp = caseRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-115deg'],
  });

  const buttonPressScale = buttonPress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.94],
  });

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
          {hasAllah && (
            <Text style={styles.completeAllah}>
              Allah sees your patience. This resistance is worship.
            </Text>
          )}
          <TouchableOpacity style={styles.closeBtn} onPress={reset}>
            <Text style={styles.closeBtnText}>Close</Text>
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
            <Animated.View style={[styles.breatheRing, { transform: [{ scale: breathScale }] }]} />
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

  // ===== BUTTON SCENE (top-down view) =====
  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View style={[styles.center, { opacity: sceneOpacity }]}>
        <Text style={styles.title}>EMERGENCY</Text>

        <View style={styles.scene}>
          {/* Outer shadow ring (table surface shadow) */}
          <View style={styles.outerShadow} />

          {/* 3D Button — top-down perspective (concentric circles) */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={phase === 'open' ? pressButton : undefined}
            disabled={phase === 'closed'}
          >
            <Animated.View
              style={[
                styles.buttonOuter,
                {
                  transform: [
                    { scale: phase === 'open' ? Animated.multiply(pulseAnim, buttonPressScale) : buttonPressScale },
                  ],
                },
              ]}
            >
              {/* Dark rim */}
              <View style={styles.buttonRim}>
                {/* Red top surface */}
                <View style={styles.buttonFace}>
                  {/* Radial highlight (top-down light) */}
                  <View style={styles.buttonHighlight} />
                  <View style={styles.buttonHighlight2} />
                </View>
              </View>
            </Animated.View>
          </TouchableOpacity>

          {/* Glass case overlay */}
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
              {/* Glass dome / box from top-down */}
              <View style={styles.glassDome}>
                <View style={styles.glassShine1} />
                <View style={styles.glassShine2} />
                <View style={styles.glassEdge} />
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <Text style={styles.infoText}>
          Cravings go away after 5 minutes.{'\n'}Hit the button and distract yourself.
        </Text>

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
    fontSize: 22,
    fontWeight: '800',
    color: Colors.redLight,
    letterSpacing: 6,
    marginBottom: 40,
  },

  // ===== SCENE =====
  scene: {
    width: CASE_SIZE + 60,
    height: CASE_SIZE + 60,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Soft shadow underneath
  outerShadow: {
    position: 'absolute',
    width: BUTTON_SIZE + 50,
    height: BUTTON_SIZE + 50,
    borderRadius: (BUTTON_SIZE + 50) / 2,
    backgroundColor: 'rgba(239,68,68,0.06)',
  },

  // ===== 3D BUTTON (top-down) =====
  buttonOuter: {
    width: BUTTON_SIZE + 20,
    height: BUTTON_SIZE + 20,
    borderRadius: (BUTTON_SIZE + 20) / 2,
    backgroundColor: '#1a0808',
    alignItems: 'center',
    justifyContent: 'center',
    // Outer shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 12,
  },
  buttonRim: {
    width: BUTTON_SIZE + 10,
    height: BUTTON_SIZE + 10,
    borderRadius: (BUTTON_SIZE + 10) / 2,
    backgroundColor: '#7f1d1d',
    alignItems: 'center',
    justifyContent: 'center',
    // Dark ring around the button
    borderWidth: 3,
    borderColor: '#450a0a',
  },
  buttonFace: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: '#ef4444',
    overflow: 'hidden',
    // Red glow
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 25,
    elevation: 8,
  },
  // Top-down circular highlight (light source from above-left)
  buttonHighlight: {
    position: 'absolute',
    top: BUTTON_SIZE * 0.12,
    left: BUTTON_SIZE * 0.15,
    width: BUTTON_SIZE * 0.45,
    height: BUTTON_SIZE * 0.35,
    borderRadius: BUTTON_SIZE * 0.25,
    backgroundColor: 'rgba(255,255,255,0.22)',
    transform: [{ rotate: '-20deg' }],
  },
  buttonHighlight2: {
    position: 'absolute',
    top: BUTTON_SIZE * 0.2,
    left: BUTTON_SIZE * 0.22,
    width: BUTTON_SIZE * 0.25,
    height: BUTTON_SIZE * 0.12,
    borderRadius: BUTTON_SIZE * 0.1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    transform: [{ rotate: '-20deg' }],
  },

  // ===== GLASS CASE (top-down dome) =====
  glassCase: {
    position: 'absolute',
    width: CASE_SIZE,
    height: CASE_SIZE,
    borderRadius: CASE_SIZE / 2,
    zIndex: 10,
    transformOrigin: 'bottom center',
  },
  glassTouchable: {
    flex: 1,
  },
  glassDome: {
    flex: 1,
    borderRadius: CASE_SIZE / 2,
    backgroundColor: 'rgba(200, 230, 250, 0.07)',
    borderWidth: 2,
    borderColor: 'rgba(200, 230, 250, 0.18)',
    overflow: 'hidden',
  },
  glassShine1: {
    position: 'absolute',
    top: CASE_SIZE * 0.1,
    left: CASE_SIZE * 0.12,
    width: CASE_SIZE * 0.2,
    height: CASE_SIZE * 0.45,
    borderRadius: CASE_SIZE * 0.12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    transform: [{ rotate: '-25deg' }],
  },
  glassShine2: {
    position: 'absolute',
    top: CASE_SIZE * 0.15,
    left: CASE_SIZE * 0.28,
    width: CASE_SIZE * 0.08,
    height: CASE_SIZE * 0.3,
    borderRadius: CASE_SIZE * 0.06,
    backgroundColor: 'rgba(255,255,255,0.06)',
    transform: [{ rotate: '-25deg' }],
  },
  glassEdge: {
    position: 'absolute',
    bottom: 0,
    left: CASE_SIZE * 0.1,
    right: CASE_SIZE * 0.1,
    height: 3,
    backgroundColor: 'rgba(200, 230, 250, 0.15)',
    borderRadius: 2,
  },

  // ===== INFO TEXT =====
  infoText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 35,
    paddingHorizontal: 10,
  },

  // Hints
  hint: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 16,
    letterSpacing: 0.5,
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
  breatheRing: {
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
  completeCheck: {
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
  closeBtn: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 50,
    marginTop: 10,
  },
  closeBtnText: {
    color: Colors.textBright,
    fontSize: 16,
    fontWeight: '600',
  },
});
