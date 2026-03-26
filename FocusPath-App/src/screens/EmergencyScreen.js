import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  SafeAreaView,
} from 'react-native';
import { Colors } from '../utils/colors';
import { REINFORCEMENTS, ALLAH_REMINDERS } from '../data/facts';
import { StrengthIcon } from '../components/Icons';

function shufflePick(arr, n) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

export default function EmergencyScreen({ route, navigation }) {
  const user = route.params?.user;
  const hasAllah = user?.motivations?.includes('allah');

  const [phase, setPhase] = useState('reinforcement'); // reinforcement | breathing | complete
  const [messages] = useState(shufflePick(REINFORCEMENTS, 3));
  const [allahMsg] = useState(
    hasAllah
      ? ALLAH_REMINDERS[Math.floor(Math.random() * ALLAH_REMINDERS.length)]
      : null
  );

  // Breathing state
  const [breathingText, setBreathingText] = useState('Ready');
  const [timeLeft, setTimeLeft] = useState(120);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const breathingRef = useRef(null);
  const countdownRef = useRef(null);

  // Fade in animations for messages
  const fade1 = useRef(new Animated.Value(0)).current;
  const fade2 = useRef(new Animated.Value(0)).current;
  const fade3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(300, [
      Animated.timing(fade1, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(fade2, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(fade3, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  function startBreathing() {
    setPhase('breathing');
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

  useEffect(() => {
    return () => stopBreathing();
  }, []);

  function goBack() {
    stopBreathing();
    navigation.goBack();
  }

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ===== PHASE: REINFORCEMENT =====
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

          {hasAllah && (
            <View style={styles.allahBox}>
              <Text style={styles.allahText}>{allahMsg}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.btnPrimary} onPress={startBreathing}>
            <Text style={styles.btnPrimaryText}>
              Start 2-Min Breathing Exercise
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnSecondary} onPress={goBack}>
            <Text style={styles.btnSecondaryText}>I'm Feeling Better</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ===== PHASE: BREATHING =====
  if (phase === 'breathing') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Text style={styles.heading}>Breathe With Me</Text>
          <Text style={styles.sub}>Follow the circle. 2 minutes to calm.</Text>

          <View style={styles.circleWrap}>
            <Animated.View
              style={[
                styles.breathingCircle,
                { transform: [{ scale: scaleAnim }] },
              ]}
            >
              <Text style={styles.breathingLabel}>{breathingText}</Text>
            </Animated.View>
          </View>

          <Text style={styles.timer}>{formatTime(timeLeft)}</Text>

          <TouchableOpacity style={styles.btnSecondary} onPress={goBack}>
            <Text style={styles.btnSecondaryText}>End Early</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ===== PHASE: COMPLETE =====
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.completeIcon}><StrengthIcon size={48} /></View>
        <Text style={styles.completeTitle}>You Made It!</Text>
        <Text style={styles.completeText}>
          The craving has passed. You are in control. Every moment you resist
          makes you stronger.
        </Text>
        {hasAllah && (
          <Text style={styles.completeAllah}>
            Allah is proud of your strength. This patience is worship.
          </Text>
        )}
        <TouchableOpacity style={styles.btnPrimary} onPress={goBack}>
          <Text style={styles.btnPrimaryText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
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
  // Breathing
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
  // Complete
  completeIcon: {
    alignItems: 'center',
    marginBottom: 16,
  },
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
