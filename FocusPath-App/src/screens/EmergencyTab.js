import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  SafeAreaView,
} from 'react-native';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../utils/colors';
import { getCurrentUser } from '../utils/storage';

const BREATHE_IN = 4000;
const BREATHE_OUT = 4000;
const TOTAL_SECONDS = 120;

export default function EmergencyTab() {
  const [phase, setPhase] = useState('closed'); // closed | open | breathing | complete
  const [breathingText, setBreathingText] = useState('');
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const [user, setUser] = useState(null);

  // Animations
  const coverRotate = useRef(new Animated.Value(0)).current;
  const coverOpacity = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;
  const buttonGlow = useRef(new Animated.Value(0.3)).current;
  const breathScale = useRef(new Animated.Value(1)).current;
  const breathOpacity = useRef(new Animated.Value(0)).current;
  const ringProgress = useRef(new Animated.Value(0)).current;
  const labelFade = useRef(new Animated.Value(1)).current;

  const breathingRef = useRef(null);
  const countdownRef = useRef(null);

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

  // Pulse the button when cover is open
  useEffect(() => {
    if (phase === 'open') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(buttonGlow, { toValue: 0.8, duration: 800, useNativeDriver: true }),
          Animated.timing(buttonGlow, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      buttonGlow.stopAnimation();
      buttonGlow.setValue(0.3);
    }
  }, [phase]);

  function openCover() {
    // Animate cover flipping open (rotate up like a hinge)
    Animated.parallel([
      Animated.spring(coverRotate, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(coverOpacity, {
        toValue: 0,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 5,
        tension: 50,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setPhase('open');
    });
    setPhase('open');
  }

  function startBreathing() {
    setPhase('breathing');
    setTimeLeft(TOTAL_SECONDS);
    let seconds = TOTAL_SECONDS;
    let isInhale = true;

    // Fade in breathing circle
    Animated.parallel([
      Animated.timing(breathOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();

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

    // Progress ring
    Animated.timing(ringProgress, {
      toValue: 1,
      duration: TOTAL_SECONDS * 1000,
      useNativeDriver: false,
    }).start();

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
    coverRotate.setValue(0);
    coverOpacity.setValue(1);
    buttonScale.setValue(0);
    breathScale.setValue(1);
    breathOpacity.setValue(0);
    ringProgress.setValue(0);
    buttonGlow.setValue(0.3);
    setPhase('closed');
    setTimeLeft(TOTAL_SECONDS);
  }

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const hasAllah = user?.motivations?.includes('allah');

  const coverRotateInterp = coverRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-120deg'],
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
            The craving has passed. You stayed in control. That took real strength.
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
        <View style={styles.center}>
          <Text style={styles.breatheHeading}>Focus on your breath</Text>
          <Text style={styles.breatheSub}>Follow the circle. Let everything else go.</Text>

          <View style={styles.breatheArea}>
            <Animated.View
              style={[
                styles.breatheCircle,
                {
                  transform: [{ scale: breathScale }],
                  opacity: breathOpacity,
                },
              ]}
            >
              <Animated.Text style={[styles.breatheLabel, { opacity: labelFade }]}>
                {breathingText}
              </Animated.Text>
            </Animated.View>

            {/* Outer ring pulses */}
            <Animated.View
              style={[
                styles.breatheRing,
                {
                  transform: [{ scale: breathScale }],
                  opacity: breathOpacity,
                },
              ]}
            />
          </View>

          <Text style={styles.timer}>{formatTime(timeLeft)}</Text>

          <TouchableOpacity style={styles.endBtn} onPress={reset}>
            <Text style={styles.endBtnText}>End Early</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ===== CLOSED & OPEN STATE (Button with cover) =====
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Text style={styles.title}>Emergency</Text>
        <Text style={styles.subtitle}>
          {phase === 'closed'
            ? 'Having a craving? Lift the cover.'
            : 'Press the button to start breathing.'}
        </Text>

        <View style={styles.buttonContainer}>
          {/* The big red button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={phase === 'closed' ? openCover : startBreathing}
            style={styles.buttonTouchArea}
          >
            {/* Button base/shadow */}
            <View style={styles.buttonBase}>
              {/* Main button */}
              <Animated.View
                style={[
                  styles.mainButton,
                  {
                    transform: [{ scale: phase === 'open' ? Animated.add(buttonScale, new Animated.Value(0)) : new Animated.Value(1) }],
                  },
                ]}
              >
                <View style={styles.buttonInner}>
                  <View style={styles.buttonShine} />
                  {phase === 'open' && (
                    <Animated.View style={[styles.buttonGlowRing, { opacity: buttonGlow }]} />
                  )}
                  <Text style={styles.buttonText}>
                    {phase === 'closed' ? '' : 'BREATHE'}
                  </Text>
                </View>
              </Animated.View>
            </View>

            {/* Safety cover (only visible when closed/animating) */}
            {phase === 'closed' && (
              <Animated.View
                style={[
                  styles.cover,
                  {
                    transform: [
                      { perspective: 800 },
                      { rotateX: coverRotateInterp },
                    ],
                    opacity: coverOpacity,
                  },
                ]}
              >
                <View style={styles.coverFront}>
                  <View style={styles.coverStripes}>
                    {[0, 1, 2, 3, 4, 5].map(i => (
                      <View key={i} style={[styles.coverStripe, i % 2 === 0 ? styles.coverStripeRed : styles.coverStripeBlack]} />
                    ))}
                  </View>
                  <View style={styles.coverLabelBox}>
                    <Text style={styles.coverLabel}>LIFT</Text>
                  </View>
                </View>
              </Animated.View>
            )}
          </TouchableOpacity>
        </View>

        {phase === 'open' && (
          <Animated.Text style={[styles.hint, { opacity: buttonGlow }]}>
            Press the button
          </Animated.Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const BUTTON_SIZE = 160;
const COVER_WIDTH = 170;
const COVER_HEIGHT = 100;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textBright,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 50,
    lineHeight: 24,
  },

  // Button container
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: BUTTON_SIZE + COVER_HEIGHT + 20,
  },
  buttonTouchArea: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: BUTTON_SIZE + COVER_HEIGHT + 20,
  },
  buttonBase: {
    width: BUTTON_SIZE + 16,
    height: BUTTON_SIZE / 2 + 16,
    borderRadius: (BUTTON_SIZE + 16) / 2,
    borderTopLeftRadius: BUTTON_SIZE / 2 + 8,
    borderTopRightRadius: BUTTON_SIZE / 2 + 8,
    backgroundColor: '#1a0808',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8,
    borderWidth: 2,
    borderColor: '#2a1010',
    borderBottomWidth: 6,
    borderBottomColor: '#0a0404',
  },
  mainButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    overflow: 'hidden',
  },
  buttonInner: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: Colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.red,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 10,
  },
  buttonShine: {
    position: 'absolute',
    top: 8,
    left: 20,
    width: BUTTON_SIZE * 0.55,
    height: BUTTON_SIZE * 0.3,
    borderRadius: BUTTON_SIZE * 0.3,
    backgroundColor: 'rgba(255,255,255,0.15)',
    transform: [{ rotate: '-15deg' }],
  },
  buttonGlowRing: {
    position: 'absolute',
    width: BUTTON_SIZE + 20,
    height: BUTTON_SIZE + 20,
    borderRadius: (BUTTON_SIZE + 20) / 2,
    borderWidth: 3,
    borderColor: Colors.redLight,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 3,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Safety cover
  cover: {
    position: 'absolute',
    bottom: BUTTON_SIZE / 2 - 10,
    width: COVER_WIDTH,
    height: COVER_HEIGHT,
    transformOrigin: 'bottom center',
  },
  coverFront: {
    flex: 1,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#8B0000',
    borderBottomWidth: 0,
  },
  coverStripes: {
    flex: 1,
    flexDirection: 'column',
  },
  coverStripe: {
    flex: 1,
  },
  coverStripeRed: {
    backgroundColor: '#B91C1C',
  },
  coverStripeBlack: {
    backgroundColor: '#1a0808',
  },
  coverLabelBox: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverLabel: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 6,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  hint: {
    color: Colors.textMuted,
    fontSize: 14,
    marginTop: 30,
    letterSpacing: 1,
  },

  // Breathing phase
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

  // Complete phase
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
