import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../utils/colors';
import { getCurrentUser } from '../utils/storage';
import { REINFORCEMENTS, ALLAH_REMINDERS } from '../data/facts';

function shufflePick(arr, n) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

export default function EmergencyTab() {
  const [user, setUser] = useState(null);
  const [phase, setPhase] = useState('ready'); // ready | reinforcement | breathing | complete
  const [messages, setMessages] = useState([]);
  const [allahMsg, setAllahMsg] = useState(null);
  const [breathingText, setBreathingText] = useState('Ready');
  const [timeLeft, setTimeLeft] = useState(120);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const breathingRef = useRef(null);
  const countdownRef = useRef(null);
  const fade1 = useRef(new Animated.Value(0)).current;
  const fade2 = useRef(new Animated.Value(0)).current;
  const fade3 = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [])
  );

  async function loadUser() {
    const u = await getCurrentUser();
    setUser(u);
  }

  function startEmergency() {
    const msgs = shufflePick(REINFORCEMENTS, 3);
    setMessages(msgs);
    const hasAllah = user?.motivations?.includes('allah');
    if (hasAllah) {
      setAllahMsg(ALLAH_REMINDERS[Math.floor(Math.random() * ALLAH_REMINDERS.length)]);
    }
    setPhase('reinforcement');
    fade1.setValue(0);
    fade2.setValue(0);
    fade3.setValue(0);
    Animated.stagger(300, [
      Animated.timing(fade1, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(fade2, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(fade3, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }

  function startBreathing() {
    setPhase('breathing');
    setTimeLeft(120);
    let seconds = 120;
    let isInhale = true;

    function breatheCycle() {
      if (isInhale) {
        setBreathingText('Breathe In');
        Animated.timing(scaleAnim, {
          toValue: 1.4,
          duration: 4000,
          useNativeDriver: true,
        }).start();
      } else {
        setBreathingText('Breathe Out');
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }).start();
      }
      isInhale = !isInhale;
    }

    breatheCycle();
    breathingRef.current = setInterval(breatheCycle, 4000);
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
    scaleAnim.setValue(1);
    setPhase('ready');
  }

  useEffect(() => {
    return () => stopBreathing();
  }, []);

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const hasAllah = user?.motivations?.includes('allah');

  // ===== READY STATE =====
  if (phase === 'ready') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.readyIcon}>🆘</Text>
          <Text style={styles.readyTitle}>Emergency Help</Text>
          <Text style={styles.readyText}>
            Feeling the urge to vape? Press the button below for instant support.
          </Text>
          <TouchableOpacity style={styles.emergencyBtn} onPress={startEmergency}>
            <Text style={styles.emergencyBtnText}>I Want to Vape — HELP</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ===== REINFORCEMENT =====
  if (phase === 'reinforcement') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Text style={styles.heading}>You're Stronger Than This</Text>
          <Animated.View style={[styles.msgCard, { opacity: fade1 }]}>
            <Text style={styles.msgText}>{messages[0]}</Text>
          </Animated.View>
          <Animated.View style={[styles.msgCard, { opacity: fade2 }]}>
            <Text style={styles.msgText}>{messages[1]}</Text>
          </Animated.View>
          <Animated.View style={[styles.msgCard, { opacity: fade3 }]}>
            <Text style={styles.msgText}>{messages[2]}</Text>
          </Animated.View>
          {hasAllah && allahMsg && (
            <View style={styles.allahBox}>
              <Text style={styles.allahText}>{allahMsg}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.btnPrimary} onPress={startBreathing}>
            <Text style={styles.btnPrimaryText}>Start 2-Min Breathing Exercise</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSecondary} onPress={reset}>
            <Text style={styles.btnSecondaryText}>I'm Feeling Better</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ===== BREATHING =====
  if (phase === 'breathing') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Text style={styles.heading}>Breathe With Me</Text>
          <Text style={styles.sub}>Follow the circle. 2 minutes to calm.</Text>
          <View style={styles.circleWrap}>
            <Animated.View
              style={[styles.breathingCircle, { transform: [{ scale: scaleAnim }] }]}
            >
              <Text style={styles.breathingLabel}>{breathingText}</Text>
            </Animated.View>
          </View>
          <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
          <TouchableOpacity style={styles.btnSecondary} onPress={reset}>
            <Text style={styles.btnSecondaryText}>End Early</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ===== COMPLETE =====
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.completeIcon}>💪</Text>
        <Text style={styles.completeTitle}>You Made It!</Text>
        <Text style={styles.completeText}>
          The craving has passed. You are in control. Every moment you resist makes you stronger.
        </Text>
        {hasAllah && (
          <Text style={styles.completeAllah}>
            Allah is proud of your strength. This patience is worship.
          </Text>
        )}
        <TouchableOpacity style={styles.btnPrimary} onPress={reset}>
          <Text style={styles.btnPrimaryText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
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
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  readyIcon: { fontSize: 64, marginBottom: 20 },
  readyTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textBright,
    marginBottom: 12,
  },
  readyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emergencyBtn: {
    backgroundColor: Colors.red,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 40,
    shadowColor: Colors.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  emergencyBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textBright,
    textAlign: 'center',
    marginBottom: 24,
  },
  sub: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    fontSize: 15,
  },
  msgCard: {
    backgroundColor: Colors.bgInput,
    borderLeftWidth: 3,
    borderLeftColor: Colors.red,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  msgText: {
    color: Colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  allahBox: {
    borderWidth: 1,
    borderColor: Colors.purple,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  allahText: {
    color: Colors.purpleLight,
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
  },
  btnPrimary: {
    backgroundColor: Colors.red,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  btnSecondary: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  btnSecondaryText: {
    color: Colors.textSecondary,
    fontSize: 15,
  },
  circleWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 260,
    marginBottom: 10,
  },
  breathingCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: Colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.red,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 8,
  },
  breathingLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timer: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.redLight,
    textAlign: 'center',
    marginBottom: 10,
  },
  completeIcon: { fontSize: 64, textAlign: 'center', marginBottom: 16 },
  completeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.green,
    textAlign: 'center',
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
    marginBottom: 12,
  },
});
