import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors } from '../utils/colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const RADIUS = 80;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function StreakRing({ days, hours, weeks, progress, message }) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, 0],
  });

  return (
    <View style={styles.card}>
      <View style={styles.ringContainer}>
        <Svg width={180} height={180} viewBox="0 0 180 180">
          <Defs>
            <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={Colors.redDark} />
              <Stop offset="100%" stopColor={Colors.redLight} />
            </LinearGradient>
          </Defs>
          <Circle
            cx="90"
            cy="90"
            r={RADIUS}
            fill="none"
            stroke={Colors.border}
            strokeWidth={10}
          />
          <AnimatedCircle
            cx="90"
            cy="90"
            r={RADIUS}
            fill="none"
            stroke="url(#grad)"
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            rotation="-90"
            origin="90, 90"
          />
        </Svg>
        <View style={styles.numberOverlay}>
          <Text style={styles.number}>{days}</Text>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.label}>Days Vape-Free</Text>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{hours}</Text>
            <Text style={styles.statLabel}>HOURS</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{days}</Text>
            <Text style={styles.statLabel}>DAYS</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{weeks}</Text>
            <Text style={styles.statLabel}>WEEKS</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  ringContainer: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  numberOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  number: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.textBright,
  },
  info: { alignItems: 'center' },
  label: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textBright,
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  stats: {
    flexDirection: 'row',
    gap: 32,
  },
  stat: { alignItems: 'center' },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.redLight,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginTop: 2,
  },
});
