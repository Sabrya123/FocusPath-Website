import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Path, Circle, Rect, Line, G, Defs, LinearGradient, Stop, Polygon } from 'react-native-svg';
import { Colors } from '../utils/colors';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

// Helper for pulsing animation
function usePulse(enabled = true, duration = 1500) {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!enabled) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1.15, duration: duration / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: duration / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, [enabled]);
  return anim;
}

// Helper for rotation animation
function useSpin(enabled = true, duration = 3000) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!enabled) return;
    Animated.loop(
      Animated.timing(anim, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true }),
    ).start();
  }, [enabled]);
  return anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
}

// Helper for glow/fade animation
function useGlow(enabled = true, duration = 2000) {
  const anim = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    if (!enabled) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: duration / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.6, duration: duration / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, [enabled]);
  return anim;
}

// ===== TAB BAR ICONS =====

export function HomeIcon({ size = 24, color = Colors.red, focused = false }) {
  const scale = usePulse(focused, 1200);
  return (
    <Animated.View style={{ transform: [{ scale: focused ? scale : 1 }] }}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Defs>
          <LinearGradient id="homeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={focused ? Colors.red : color} />
            <Stop offset="100%" stopColor={focused ? Colors.redLight : color} />
          </LinearGradient>
        </Defs>
        <Path
          d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15"
          stroke="url(#homeGrad)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </Animated.View>
  );
}

export function TimelineIcon({ size = 24, color = Colors.red, focused = false }) {
  const opacity = useGlow(focused);
  return (
    <Animated.View style={{ opacity: focused ? opacity : 1 }}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Defs>
          <LinearGradient id="tlGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={focused ? Colors.redDark : color} />
            <Stop offset="100%" stopColor={focused ? Colors.redLight : color} />
          </LinearGradient>
        </Defs>
        <Path
          d="M3 20L7 16L11 18L15 10L21 4"
          stroke="url(#tlGrad)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Circle cx="7" cy="16" r="2" fill={focused ? Colors.red : color} />
        <Circle cx="11" cy="18" r="2" fill={focused ? Colors.red : color} />
        <Circle cx="15" cy="10" r="2" fill={focused ? Colors.redLight : color} />
        <Circle cx="21" cy="4" r="2" fill={focused ? Colors.redLight : color} />
      </Svg>
    </Animated.View>
  );
}

export function EmergencyIcon({ size = 28, color = Colors.red, focused = false }) {
  const scale = usePulse(true, 1000);
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Defs>
          <LinearGradient id="emergGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={Colors.red} />
            <Stop offset="100%" stopColor="#ff6b6b" />
          </LinearGradient>
        </Defs>
        <Circle cx="12" cy="12" r="10" fill="url(#emergGrad)" />
        <Path
          d="M12 7V13M12 16V16.5"
          stroke="#fff"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      </Svg>
    </Animated.View>
  );
}

export function FactsIcon({ size = 24, color = Colors.red, focused = false }) {
  const opacity = useGlow(focused, 2500);
  return (
    <Animated.View style={{ opacity: focused ? opacity : 1 }}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Defs>
          <LinearGradient id="factsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={focused ? Colors.redLight : color} />
            <Stop offset="100%" stopColor={focused ? Colors.red : color} />
          </LinearGradient>
        </Defs>
        {/* Lightbulb */}
        <Path
          d="M9 21H15M12 3C8.68629 3 6 5.68629 6 9C6 11.2208 7.20578 13.1599 9 14.1973V17H15V14.1973C16.7942 13.1599 18 11.2208 18 9C18 5.68629 15.3137 3 12 3Z"
          stroke="url(#factsGrad)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Line x1="9" y1="17" x2="15" y2="17" stroke={focused ? Colors.red : color} strokeWidth={1.5} />
        <Line x1="10" y1="19" x2="14" y2="19" stroke={focused ? Colors.red : color} strokeWidth={1.5} />
      </Svg>
    </Animated.View>
  );
}

export function ProfileIcon({ size = 24, color = Colors.red, focused = false }) {
  const scale = usePulse(focused, 1800);
  return (
    <Animated.View style={{ transform: [{ scale: focused ? scale : 1 }] }}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Defs>
          <LinearGradient id="profGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={focused ? Colors.red : color} />
            <Stop offset="100%" stopColor={focused ? Colors.redLight : color} />
          </LinearGradient>
        </Defs>
        <Circle cx="12" cy="8" r="4" stroke="url(#profGrad)" strokeWidth={2} fill="none" />
        <Path
          d="M4 21C4 17.134 7.13401 14 11 14H13C16.866 14 20 17.134 20 21"
          stroke="url(#profGrad)"
          strokeWidth={2}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    </Animated.View>
  );
}

// ===== CATEGORY ICONS =====

export function PhysicalIcon({ size = 20, color = Colors.redLight }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <LinearGradient id="physGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={Colors.red} />
          <Stop offset="100%" stopColor={Colors.redLight} />
        </LinearGradient>
      </Defs>
      {/* Dumbbell */}
      <Rect x="2" y="9" width="4" height="6" rx="1" fill="url(#physGrad)" />
      <Rect x="18" y="9" width="4" height="6" rx="1" fill="url(#physGrad)" />
      <Rect x="5" y="10.5" width="14" height="3" rx="1" fill={color} />
      <Rect x="5" y="8" width="2" height="8" rx="1" fill="url(#physGrad)" />
      <Rect x="17" y="8" width="2" height="8" rx="1" fill="url(#physGrad)" />
    </Svg>
  );
}

export function SpiritualIcon({ size = 20, color = Colors.redLight }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <LinearGradient id="spiritGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={Colors.red} />
          <Stop offset="100%" stopColor={Colors.redLight} />
        </LinearGradient>
      </Defs>
      {/* Crescent moon + star for spiritual/Islamic */}
      <Path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        stroke="url(#spiritGrad)"
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M17 5L17.5 6.5L19 7L17.5 7.5L17 9L16.5 7.5L15 7L16.5 6.5L17 5Z"
        fill={Colors.redLight}
      />
    </Svg>
  );
}

export function MentalIcon({ size = 20, color = Colors.redLight }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <LinearGradient id="mentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={Colors.red} />
          <Stop offset="100%" stopColor={Colors.redLight} />
        </LinearGradient>
      </Defs>
      {/* Brain / Book */}
      <Path
        d="M4 19.5C4 18.1193 5.11929 17 6.5 17H20"
        stroke="url(#mentGrad)"
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M6.5 2H20V22H6.5C5.11929 22 4 20.8807 4 19.5V4.5C4 3.11929 5.11929 2 6.5 2Z"
        stroke="url(#mentGrad)"
        strokeWidth={2}
        fill="none"
      />
      <Line x1="9" y1="7" x2="16" y2="7" stroke={Colors.redLight} strokeWidth={1.5} strokeLinecap="round" />
      <Line x1="9" y1="11" x2="14" y2="11" stroke={Colors.red} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

// ===== UTILITY ICONS =====

export function StarIcon({ size = 16, color = Colors.yellow || '#fbbf24' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill={color}
        stroke={color}
        strokeWidth={1}
      />
    </Svg>
  );
}

export function CheckIcon({ size = 14, color = '#fff' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M5 13L9 17L19 7"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function XIcon({ size = 14, color = Colors.textMuted }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M6 6L18 18M18 6L6 18"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

export function CloseIcon({ size = 22, color = Colors.textMuted }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={1.5} fill="none" />
      <Path
        d="M8 8L16 16M16 8L8 16"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

export function DeleteIcon({ size = 18, color = Colors.textMuted }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M3 6H5H21"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

export function SparkleIcon({ size = 18, color = Colors.red }) {
  const opacity = useGlow(true, 1500);
  return (
    <Animated.View style={{ opacity }}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
          fill={color}
        />
        <Path
          d="M19 14L19.75 16.25L22 17L19.75 17.75L19 20L18.25 17.75L16 17L18.25 16.25L19 14Z"
          fill={Colors.redLight}
        />
      </Svg>
    </Animated.View>
  );
}

export function MedalIcon({ rank, size = 22 }) {
  const colors = {
    1: { ribbon: '#fbbf24', medal: '#fbbf24', shine: '#fde68a' },
    2: { ribbon: '#94a3b8', medal: '#94a3b8', shine: '#cbd5e1' },
    3: { ribbon: '#cd7f32', medal: '#cd7f32', shine: '#dda15e' },
  };
  const c = colors[rank] || colors[3];

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Ribbon */}
      <Path d="M8 2L12 10L16 2" stroke={c.ribbon} strokeWidth={2} fill="none" strokeLinejoin="round" />
      {/* Medal circle */}
      <Circle cx="12" cy="15" r="6" fill={c.medal} />
      <Circle cx="12" cy="15" r="4" fill={c.shine} opacity={0.3} />
      {/* Number */}
      <Rect x="10.5" y="12.5" width="3" height="5" rx="0.5" fill="none" stroke="#fff" strokeWidth={1.5} />
    </Svg>
  );
}

export function StrengthIcon({ size = 24, color = Colors.redLight }) {
  const scale = usePulse(true, 1500);
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Defs>
          <LinearGradient id="strGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={Colors.red} />
            <Stop offset="100%" stopColor={Colors.redLight} />
          </LinearGradient>
        </Defs>
        {/* Fist / power symbol */}
        <Path
          d="M13 3L4 14H11L10 21L20 10H13L13 3Z"
          fill="url(#strGrad)"
          stroke={Colors.redDark}
          strokeWidth={0.5}
        />
      </Svg>
    </Animated.View>
  );
}

// Warning triangle icon (replaces ⚠️)
export function WarningIcon({ size = 24, color = Colors.yellow || '#fbbf24' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2L1 21h22L12 2z" fill={color} opacity={0.15} />
      <Path d="M12 2L1 21h22L12 2z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <Line x1="12" y1="9" x2="12" y2="15" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Circle cx="12" cy="18" r="1" fill={color} />
    </Svg>
  );
}

// Success/check circle icon (replaces ✅)
export function SuccessIcon({ size = 24, color = Colors.green || '#4ade80' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill={color} opacity={0.15} />
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} />
      <Path d="M8 12l3 3 5-5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Alert/SOS icon (replaces 🆘)
export function AlertIcon({ size = 28, color = Colors.red }) {
  const pulse = usePulse(true, 2000);
  return (
    <Animated.View style={{ transform: [{ scale: pulse }] }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="2" y="2" width="20" height="20" rx="4" fill={color} opacity={0.2} />
        <Rect x="2" y="2" width="20" height="20" rx="4" stroke={color} strokeWidth={2} />
        <Path d="M12 7v6" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
        <Circle cx="12" cy="16.5" r="1.5" fill={color} />
      </Svg>
    </Animated.View>
  );
}

// Mosque/crescent icon (replaces 🕌)
export function MosqueIcon({ size = 24, color = Colors.purple || '#a78bfa' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2c-2 2-3 4-3 6 0 2.5 1.5 4 3 4s3-1.5 3-4c0-2-1-4-3-6z" fill={color} opacity={0.3} />
      <Path d="M12 2c-2 2-3 4-3 6 0 2.5 1.5 4 3 4s3-1.5 3-4c0-2-1-4-3-6z" stroke={color} strokeWidth={1.5} />
      <Rect x="4" y="12" width="16" height="10" rx="1" fill={color} opacity={0.15} />
      <Rect x="4" y="12" width="16" height="10" rx="1" stroke={color} strokeWidth={1.5} />
      <Rect x="10" y="16" width="4" height="6" rx="1" fill={color} opacity={0.3} />
      <Circle cx="19" cy="5" r="2" fill={color} opacity={0.5} />
      <Path d="M19 3.5c-0.8 0-1.5 0.7-1.5 1.5s0.7 1.5 1.5 1.5c-1 0-2-0.5-2-1.5s1-1.5 2-1.5z" fill={color} />
    </Svg>
  );
}

// Camera icon (replaces 📸)
export function CameraIcon({ size = 24, color = Colors.textMuted }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <Circle cx="12" cy="13" r="4" stroke={color} strokeWidth={2} />
    </Svg>
  );
}

// Fire icon (replaces 🔥)
export function FireIcon({ size = 20, color = Colors.red }) {
  const pulse = usePulse(true, 1200);
  return (
    <Animated.View style={{ transform: [{ scale: pulse }] }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 23c-4.97 0-9-3.58-9-8 0-4 3-7.5 4-8.5 0 3 2 4 3 2C11 6.5 12 2 12 2s1 4.5 2 6.5c1 2 3 1 3-2 1 1 4 4.5 4 8.5 0 4.42-4.03 8-9 8z" fill={color} opacity={0.3} />
        <Path d="M12 23c-4.97 0-9-3.58-9-8 0-4 3-7.5 4-8.5 0 3 2 4 3 2C11 6.5 12 2 12 2s1 4.5 2 6.5c1 2 3 1 3-2 1 1 4 4.5 4 8.5 0 4.42-4.03 8-9 8z" stroke={color} strokeWidth={1.5} />
      </Svg>
    </Animated.View>
  );
}

// Category icon picker
export function CategoryIcon({ category, size = 20 }) {
  switch (category) {
    case 'physical': return <PhysicalIcon size={size} />;
    case 'spiritual': return <SpiritualIcon size={size} />;
    case 'mental': return <MentalIcon size={size} />;
    default: return <SparkleIcon size={size} color={Colors.textMuted} />;
  }
}
