import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../utils/colors';
import { getPersonalizedTimeline } from '../data/timeline';

const DIFFICULTY_COLORS = {
  hard: { bg: 'rgba(91,168,200,0.15)', text: '#4a96b8' },
  medium: { bg: 'rgba(251,191,36,0.15)', text: '#d4a017' },
  easy: { bg: 'rgba(74,222,128,0.15)', text: '#2da55e' },
  victory: { bg: 'rgba(91,168,200,0.2)', text: '#4a96b8' },
};

const VAPING_LABELS = {
  '<1': 'Less than 1 year',
  '<6m': 'Less than 6 months',
  '6-12m': '6-12 months',
  '1-2': '1-2 years',
  '2-3': '2-3 years',
  '3+': '3+ years',
};

export default function TimelineList({ currentDays, vapingYears = '<1' }) {
  const timeline = getPersonalizedTimeline(vapingYears);
  const label = VAPING_LABELS[vapingYears] || vapingYears;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Your Recovery Timeline</Text>
      <Text style={styles.subtitle}>
        Personalized for {label} of vaping
      </Text>

      <View style={styles.timeline}>
        <View style={styles.line} />
        {timeline.map((item, i) => {
          const nextThreshold = timeline[i + 1]
            ? timeline[i + 1].dayThreshold
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

              {item.advice && (isCurrent || !isReached) && (
                <View style={styles.adviceBox}>
                  <Text style={styles.adviceLabel}>Advice</Text>
                  <Text style={styles.adviceText}>{item.advice}</Text>
                </View>
              )}

              {isReached && (
                <View style={styles.completedTag}>
                  <Text style={styles.completedTagText}>Completed</Text>
                </View>
              )}

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
    opacity: 0.7,
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
  adviceBox: {
    backgroundColor: 'rgba(91,168,200,0.08)',
    borderLeftWidth: 3,
    borderLeftColor: Colors.red,
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  adviceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.redLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  adviceText: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 19,
  },
  completedTag: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: 'rgba(74,222,128,0.15)',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  completedTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.green,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
