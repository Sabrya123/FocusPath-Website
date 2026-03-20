import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../utils/colors';
import { TIMELINE_DATA } from '../data/timeline';

const DIFFICULTY_COLORS = {
  hard: { bg: 'rgba(239,68,68,0.15)', text: '#f87171' },
  medium: { bg: 'rgba(251,191,36,0.15)', text: '#fbbf24' },
  easy: { bg: 'rgba(74,222,128,0.15)', text: '#4ade80' },
  victory: { bg: 'rgba(239,68,68,0.2)', text: '#f87171' },
};

export default function TimelineList({ currentDays }) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Your Recovery Timeline</Text>
      <Text style={styles.subtitle}>
        Here's what happens when you stop vaping
      </Text>

      <View style={styles.timeline}>
        <View style={styles.line} />
        {TIMELINE_DATA.map((item, i) => {
          const nextThreshold = TIMELINE_DATA[i + 1]
            ? TIMELINE_DATA[i + 1].dayThreshold
            : Infinity;
          const isReached = currentDays >= nextThreshold;
          const isCurrent =
            !isReached && currentDays >= item.dayThreshold;
          const dc = DIFFICULTY_COLORS[item.difficulty];

          return (
            <View
              key={i}
              style={[
                styles.item,
                isReached && styles.itemReached,
                isCurrent && styles.itemCurrent,
              ]}
            >
              <View
                style={[
                  styles.dot,
                  isReached && styles.dotReached,
                  isCurrent && styles.dotCurrent,
                ]}
              />
              <Text style={styles.time}>{item.time}</Text>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.desc}>{item.desc}</Text>
              <View style={[styles.badge, { backgroundColor: dc.bg }]}>
                <Text style={[styles.badgeText, { color: dc.text }]}>
                  {item.difficultyLabel}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textBright,
    marginBottom: 4,
  },
  subtitle: {
    color: Colors.textSecondary,
    marginBottom: 20,
    fontSize: 14,
  },
  timeline: {
    paddingLeft: 24,
    position: 'relative',
  },
  line: {
    position: 'absolute',
    left: 8,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: Colors.border,
  },
  item: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  itemReached: {
    borderColor: Colors.red,
  },
  itemCurrent: {
    borderColor: Colors.redLight,
    shadowColor: Colors.red,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  dot: {
    position: 'absolute',
    left: -22,
    top: 18,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.border,
  },
  dotReached: { backgroundColor: Colors.red },
  dotCurrent: {
    backgroundColor: Colors.redLight,
    shadowColor: Colors.red,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 3,
  },
  time: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textBright,
    marginBottom: 4,
  },
  desc: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
