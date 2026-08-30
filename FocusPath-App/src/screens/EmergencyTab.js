import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Ellipse, G, Defs, ClipPath, LinearGradient, RadialGradient, Stop } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../utils/colors';
import { getCurrentUser } from '../utils/storage';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_W } = Dimensions.get('window');
const BREATHE_IN = 4000;
const TOTAL_SECONDS = 120;

// The button is one circular medallion, sized off the screen width.
const BTN = Math.min(SCREEN_W * 0.66, 280);
const HALO = BTN * 1.5;

export default function EmergencyTab() {
  const [phase, setPhase] = useState('closed');
  const [breathingText, setBreathingText] = useState('');
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const [user, setUser] = useState(null);

  const pressAnim = useRef(new Animated.Value(0)).current;
  const haloAnim = useRef(new Animated.Value(0)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;
  const boltFlash = useRef(new Animated.Value(0)).current;
  const breathScale = useRef(new Animated.Value(1)).current;
  const sceneOpacity = useRef(new Animated.Value(1)).current;
  const breatheOpacity = useRef(new Animated.Value(0)).current;

  const breathingRef = useRef(null);
  const countdownRef = useRef(null);

  useFocusEffect(useCallback(() => { loadUser(); }, []));
  async function loadUser() { setUser(await getCurrentUser()); }
  useEffect(() => () => stopBreathing(), []);

  // Slow halo breath while the button is waiting to be pressed. Runs on the
  // native driver (transform + opacity only) so it never competes with JS.
  useEffect(() => {
    if (phase !== 'closed') return undefined;
    haloAnim.setValue(0);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(haloAnim, {
          toValue: 1, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true,
        }),
        Animated.timing(haloAnim, {
          toValue: 0, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [phase]);

  // Press and release are separate so the button tracks your finger instead of
  // firing a fixed-length sequence after you let go.
  function onPressIn() {
    Animated.timing(pressAnim, {
      toValue: 1, duration: 90, easing: Easing.out(Easing.quad), useNativeDriver: true,
    }).start();
  }

  function onPressOut() {
    Animated.spring(pressAnim, {
      toValue: 0, friction: 5, tension: 170, useNativeDriver: true,
    }).start();
  }

  function activate() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    flashAnim.setValue(0);
    boltFlash.setValue(0);
    Animated.parallel([
      // The strike lands first, then the storm clears behind it.
      Animated.sequence([
        Animated.timing(boltFlash, {
          toValue: 1, duration: 70, easing: Easing.out(Easing.quad), useNativeDriver: true,
        }),
        Animated.timing(boltFlash, {
          toValue: 0, duration: 260, easing: Easing.in(Easing.quad), useNativeDriver: true,
        }),
      ]),
      Animated.timing(flashAnim, {
        toValue: 1, duration: 620, easing: Easing.out(Easing.quad), useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(160),
        Animated.timing(sceneOpacity, {
          toValue: 0, duration: 320, easing: Easing.inOut(Easing.quad), useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      startBreathing();
      Animated.timing(breatheOpacity, {
        toValue: 1, duration: 360, easing: Easing.out(Easing.quad), useNativeDriver: true,
      }).start();
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
    pressAnim.setValue(0);
    flashAnim.setValue(0);
    boltFlash.setValue(0);
    breathScale.setValue(1);
    sceneOpacity.setValue(1);
    breatheOpacity.setValue(0);
    setPhase('closed');
    setTimeLeft(TOTAL_SECONDS);
  }

  const fmt = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const hasAllah = user?.motivations?.includes('allah');

  const capScale = pressAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.955] });
  const capLift = pressAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 3] });
  const haloScale = haloAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.13] });
  const haloOpacity = haloAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0.14] });
  const flashScale = flashAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.9] });
  const flashOpacity = flashAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] });

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

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View style={[styles.center, { opacity: sceneOpacity }]}>
        <Text style={styles.title}>EMERGENCY</Text>

        <View style={styles.scene}>
          {/* Halo — a slow breath that invites the press. Its own layer so the
              loop never has to restart when the button is pressed. */}
          <Animated.View
            pointerEvents="none"
            style={[styles.halo, { opacity: haloOpacity, transform: [{ scale: haloScale }] }]}
          >
            <Svg width={HALO} height={HALO} viewBox="0 0 200 200">
              <Defs>
                <RadialGradient id="haloG" cx="50%" cy="50%" r="50%">
                  <Stop offset="55%" stopColor="#ffc247" stopOpacity="0" />
                  <Stop offset="78%" stopColor="#ffc247" stopOpacity="0.55" />
                  <Stop offset="100%" stopColor="#ffc247" stopOpacity="0" />
                </RadialGradient>
              </Defs>
              <Circle cx={100} cy={100} r={100} fill="url(#haloG)" />
            </Svg>
          </Animated.View>

          {/* Confirmation ring, fired on activate. */}
          <Animated.View
            pointerEvents="none"
            style={[styles.flash, { opacity: flashOpacity, transform: [{ scale: flashScale }] }]}
          />

          <Animated.View style={{ transform: [{ scale: capScale }, { translateY: capLift }] }}>
            <TouchableOpacity
              activeOpacity={1}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              onPress={activate}
              accessibilityRole="button"
              accessibilityLabel="Start a two minute craving timer"
            >
              <Svg width={BTN} height={BTN} viewBox="0 0 200 200">
                <Defs>
                  {/* Bezel is lit from the upper left, like every medallion. */}
                  <LinearGradient id="bezel" x1="0.15" y1="0" x2="0.85" y2="1">
                    <Stop offset="0" stopColor="#f2f8fc" />
                    <Stop offset="0.55" stopColor="#cfe1ee" />
                    <Stop offset="1" stopColor="#a9c6da" />
                  </LinearGradient>
                  {/* The well inverts that gradient, which is what reads as a
                      recess rather than another dome. */}
                  <LinearGradient id="well" x1="0.2" y1="0" x2="0.8" y2="1">
                    <Stop offset="0" stopColor="#9dbdd3" />
                    <Stop offset="1" stopColor="#dcebf5" />
                  </LinearGradient>
                  <RadialGradient id="storm" cx="50%" cy="50%" r="52%" fx="34%" fy="26%">
                    <Stop offset="0" stopColor="#8ba1b6" />
                    <Stop offset="0.55" stopColor="#5c7188" />
                    <Stop offset="1" stopColor="#36485b" />
                  </RadialGradient>
                  <RadialGradient id="puff" cx="50%" cy="50%" r="50%" fx="36%" fy="26%">
                    <Stop offset="0" stopColor="#7a90a6" />
                    <Stop offset="100%" stopColor="#4a5e73" />
                  </RadialGradient>
                  <RadialGradient id="capGloss" cx="50%" cy="50%" r="50%" fx="32%" fy="24%">
                    <Stop offset="0" stopColor="#ffffff" stopOpacity="0.4" />
                    <Stop offset="45%" stopColor="#ffffff" stopOpacity="0.08" />
                    <Stop offset="70%" stopColor="#ffffff" stopOpacity="0" />
                  </RadialGradient>
                  <RadialGradient id="boltGlow" cx="50%" cy="50%" r="50%">
                    <Stop offset="0" stopColor="#ffe07a" stopOpacity="0.55" />
                    <Stop offset="100%" stopColor="#ffd35e" stopOpacity="0" />
                  </RadialGradient>
                  <ClipPath id="capClip">
                    <Circle cx={100} cy={100} r={68} />
                  </ClipPath>
                </Defs>

                <Circle cx={100} cy={100} r={94} fill="url(#bezel)" />
                <Circle cx={100} cy={100} r={94} fill="none" stroke="#8fb2c9" strokeWidth={1.5} opacity={0.5} />

                <Circle cx={100} cy={100} r={78} fill="url(#well)" />
                <Circle cx={100} cy={100} r={78} fill="none" stroke="#7ea3bd" strokeWidth={1.5} opacity={0.45} />

                {/* Contact shadow so the cap sits in the well. */}
                <Ellipse cx={100} cy={106} rx={70} ry={68} fill="#3c5163" opacity={0.32} />

                <Circle cx={100} cy={100} r={68} fill="url(#storm)" />

                {/* Storm lobes, shaded so they read as volumes not flat discs. */}
                <G clipPath="url(#capClip)">
                  <Circle cx={68} cy={128} r={28} fill="url(#puff)" />
                  <Circle cx={104} cy={138} r={32} fill="url(#puff)" />
                  <Circle cx={136} cy={128} r={24} fill="url(#puff)" />
                </G>

                <Circle cx={100} cy={100} r={44} fill="url(#boltGlow)" />
                <Path d="M108 62 L88 100 L102 100 L94 138 L118 94 L104 94 Z" fill="#ffd35e" />

                <Circle cx={100} cy={100} r={68} fill="url(#capGloss)" />
                <Circle cx={100} cy={100} r={68} fill="none" stroke="#8ba3b8" strokeWidth={1.5} opacity={0.6} />

                {/* Specular catch on the lit side, faint bounce opposite. */}
                <Path
                  d="M45.5 80.2 A58 58 0 0 1 119.8 45.5"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth={5}
                  strokeLinecap="round"
                  opacity={0.3}
                />
                <Path
                  d="M154.5 119.8 A58 58 0 0 1 119.8 154.5"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth={3.5}
                  strokeLinecap="round"
                  opacity={0.12}
                />
              </Svg>
              <Animated.View
                pointerEvents="none"
                style={[styles.strike, { opacity: boltFlash }]}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>

        <Text style={styles.infoText}>
          Cravings go away after 2 minutes.{'\n'}Hit the button and distract yourself.
        </Text>

        <Text style={styles.hint}>Tap to start your two minutes</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.redLight, letterSpacing: 6, marginBottom: 16 },

  scene: {
    width: HALO,
    height: HALO,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  strike: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: BTN / 2,
    backgroundColor: '#fff6d8',
  },
  flash: {
    position: 'absolute',
    width: BTN,
    height: BTN,
    borderRadius: BTN / 2,
    borderWidth: 2,
    borderColor: '#ffd35e',
  },

  // Text
  infoText: {
    fontSize: 15, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 24, marginTop: 16,
  },
  hint: { color: Colors.textMuted, fontSize: 13, marginTop: 10, letterSpacing: 0.5 },

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
