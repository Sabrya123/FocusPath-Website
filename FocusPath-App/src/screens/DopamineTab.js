import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  LayoutAnimation,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../utils/colors';
import { getSession, getCurrentUser, updateUser } from '../utils/storage';
import ProfileButton from '../components/ProfileButton';

// Healthy swaps for the hit a craving is asking for. Kept free of made-up
// numbers, same rule as the AI coach.
const OPTIONS = [
  {
    id: 'cold',
    emoji: '🚿',
    title: 'Cold shower',
    time: '2 min',
    why: 'The shock of cold water snaps you out of the craving and leaves you alert and upbeat.',
    steps: [
      'Turn the shower to cold for 30–60 seconds.',
      'No shower nearby? Splash cold water on your face and wrists.',
      'Breathe slowly through it — the urge fades while your body reacts.',
    ],
  },
  {
    id: 'walk',
    emoji: '🚶',
    title: '10-minute walk',
    time: '10 min',
    why: 'Moving gives you a natural lift and gets you away from where the craving started.',
    steps: [
      'Get up and go — outside if you can.',
      'Walk fast enough to breathe a little harder.',
      "Skip anywhere you'd usually vape.",
    ],
  },
  {
    id: 'sun',
    emoji: '☀️',
    title: 'Sun exposure',
    time: '5–10 min',
    why: 'Daylight lifts your mood and energy — morning light especially.',
    steps: [
      'Step outside. Daylight counts even when it’s cloudy.',
      'Face the sky, but never look straight at the sun.',
      'Pair it with a walk for a double hit.',
    ],
  },
  {
    id: 'workout',
    emoji: '💪',
    title: 'Quick workout',
    time: '3 min',
    why: 'A short burst of hard effort burns off restless energy, and the urge goes with it.',
    steps: [
      'Do 20 push-ups, squats or jumping jacks.',
      'Rest 30 seconds, then do another round.',
      'Keep going until the craving has passed.',
    ],
  },
  {
    id: 'music',
    emoji: '🎧',
    title: 'Favourite song',
    time: '4 min',
    why: 'Music you love is a real feel-good hit, and it keeps your hands and head busy.',
    steps: [
      "Put on a song you can't help moving to.",
      'Sing, dance or drum along — really get into it.',
      'Queue up another if the urge is still there.',
    ],
  },
];

export default function DopamineTab() {
  const [openId, setOpenId] = useState(null);
  const [doneIds, setDoneIds] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadDone();
    }, [])
  );

  // Ticks reset each day, so the list always reads as "what have I done today".
  async function loadDone() {
    const user = await getCurrentUser();
    const log = user?.dopamineDone;
    setDoneIds(log?.date === new Date().toDateString() ? log.ids : []);
  }

  function toggle(id) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId((current) => (current === id ? null : id));
  }

  async function markDone(id) {
    if (doneIds.includes(id)) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    const ids = [...doneIds, id];
    setDoneIds(ids);
    const email = await getSession();
    if (email) await updateUser(email, { dopamineDone: { date: new Date().toDateString(), ids } });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.heading}>Relapse & Dopamine</Text>
            <Text style={styles.subheading}>Swap the craving for a healthy hit</Text>
          </View>
          <ProfileButton />
        </View>

        <View style={styles.introCard}>
          <Text style={styles.introText}>
            A craving is your brain chasing a quick reward. Give it a better one —
            pick one below and start before the urge talks you out of it.
          </Text>
          {doneIds.length > 0 && (
            <Text style={styles.introCount}>
              {doneIds.length} done today
            </Text>
          )}
        </View>

        {OPTIONS.map((option) => {
          const open = openId === option.id;
          const done = doneIds.includes(option.id);
          return (
            <View key={option.id} style={[styles.card, open && styles.cardOpen]}>
              <TouchableOpacity
                style={styles.cardTop}
                onPress={() => toggle(option.id)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityState={{ expanded: open }}
              >
                <View style={[styles.emojiWrap, done && styles.emojiWrapDone]}>
                  <Text style={styles.emoji}>{option.emoji}</Text>
                </View>
                <View style={styles.cardText}>
                  <View style={styles.titleRow}>
                    <Text style={styles.cardTitle}>{option.title}</Text>
                    <Text style={[styles.timeChip, done && styles.doneChip]}>
                      {done ? 'Done ✓' : option.time}
                    </Text>
                  </View>
                  <Text style={styles.why}>{option.why}</Text>
                </View>
              </TouchableOpacity>

              {open && (
                <View style={styles.details}>
                  {option.steps.map((step, i) => (
                    <View key={step} style={styles.stepRow}>
                      <Text style={styles.stepNum}>{i + 1}</Text>
                      <Text style={styles.stepText}>{step}</Text>
                    </View>
                  ))}
                  <TouchableOpacity
                    style={[styles.doneBtn, done && styles.doneBtnDone]}
                    onPress={() => markDone(option.id)}
                    disabled={done}
                  >
                    <Text style={[styles.doneBtnText, done && styles.doneBtnTextDone]}>
                      {done ? 'Done today ✓' : 'I did it'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 20, paddingBottom: 100 },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  headerText: { flex: 1 },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textBright,
  },
  subheading: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  introCard: {
    backgroundColor: Colors.bgInput,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  introText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 21,
  },
  introCount: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.redDark,
    marginTop: 10,
  },

  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardOpen: { borderColor: Colors.redLight },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
  },
  emojiWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiWrapDone: {
    borderColor: Colors.green,
    backgroundColor: 'rgba(74, 222, 128, 0.12)',
  },
  emoji: { fontSize: 24 },
  cardText: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textBright,
  },
  timeChip: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.redDark,
    backgroundColor: Colors.bgInput,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  doneChip: {
    color: '#16a34a',
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
  },
  why: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },

  details: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 14,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.red,
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 22,
    overflow: 'hidden',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 21,
  },
  doneBtn: {
    backgroundColor: Colors.red,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 6,
  },
  doneBtnDone: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
  },
  doneBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  doneBtnTextDone: {
    color: '#16a34a',
  },
});
