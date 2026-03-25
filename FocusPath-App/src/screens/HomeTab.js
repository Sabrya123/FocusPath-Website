import React, { useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors } from '../utils/colors';
import { getCurrentUser, getSession, updateUser } from '../utils/storage';

const RADIUS = 50;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const POINTS_PER_COMPLETION = 50;
const POINTS_LOST_ON_MISS = 30;

function StreakCard({ streakDays, points, allDone }) {
  // Ring fills based on streak progress toward 30-day milestone
  const progress = Math.min(streakDays / 30, 1);
  const offset = CIRCUMFERENCE * (1 - progress);

  return (
    <View style={styles.gridCard}>
      <View style={styles.streakHeader}>
        <Text style={styles.cardTitle}>Your Streak</Text>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsIcon}>⭐</Text>
          <Text style={styles.pointsText}>{points} pts</Text>
        </View>
      </View>
      <View style={styles.miniRingWrap}>
        <Svg width={110} height={110} viewBox="0 0 110 110">
          <Defs>
            <LinearGradient id="miniGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={Colors.redDark} />
              <Stop offset="100%" stopColor={Colors.redLight} />
            </LinearGradient>
          </Defs>
          <Circle cx="55" cy="55" r={RADIUS} fill="none" stroke={Colors.border} strokeWidth={8} />
          <Circle
            cx="55"
            cy="55"
            r={RADIUS}
            fill="none"
            stroke="url(#miniGrad)"
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            rotation="-90"
            origin="55, 55"
          />
        </Svg>
        <View style={styles.miniRingOverlay}>
          <Text style={styles.miniRingNum}>{streakDays}</Text>
          <Text style={styles.miniRingLabel}>day streak</Text>
        </View>
      </View>
      {allDone ? (
        <View style={styles.completedBanner}>
          <Text style={styles.completedText}>✓ Today's habits complete! +{POINTS_PER_COMPLETION} pts</Text>
        </View>
      ) : (
        <Text style={styles.streakMsg}>Complete all habits to keep your streak</Text>
      )}
    </View>
  );
}

const CATEGORY_ICONS = { physical: '💪', spiritual: '🤲', mental: '🧠' };

function HabitBlock({ habits, onStart, onDelete, onPressAdd }) {
  const doneCount = habits.filter(h => h.done).length;

  return (
    <View style={styles.gridCard}>
      <View style={styles.habitHeader}>
        <View>
          <Text style={styles.cardTitle}>Daily Habits</Text>
          <Text style={styles.cardSubtitle}>Replace vaping with positivity</Text>
        </View>
        {habits.length > 0 && (
          <Text style={styles.habitProgress}>{doneCount}/{habits.length}</Text>
        )}
      </View>

      {habits.map((h, i) => (
        <View key={i} style={styles.habitRow}>
          <View style={[styles.habitCheck, h.done && styles.habitCheckDone]}>
            {h.done && <Text style={styles.habitCheckmark}>✓</Text>}
          </View>
          <Text style={styles.habitCategoryIcon}>
            {CATEGORY_ICONS[h.category] || '📌'}
          </Text>
          <View style={styles.habitInfo}>
            <Text style={[styles.habitText, h.done && styles.habitTextDone]}>
              {h.name}
            </Text>
            {h.pausedTimeLeft != null ? (
              <Text style={styles.habitTimerPaused}>
                {Math.floor(h.pausedTimeLeft / 60)}:{(h.pausedTimeLeft % 60).toString().padStart(2, '0')} left
              </Text>
            ) : h.timer > 0 ? (
              <Text style={styles.habitTimer}>{h.timer} min</Text>
            ) : null}
          </View>
          {h.done ? (
            <Text style={styles.doneLabel}>Done ✓</Text>
          ) : h.pausedTimeLeft != null ? (
            <TouchableOpacity style={styles.resumeBtn} onPress={() => onStart(i)}>
              <Text style={styles.resumeBtnText}>Resume</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.startBtn} onPress={() => onStart(i)}>
              <Text style={styles.startBtnText}>Start</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => onDelete(i)} style={styles.habitDelete}>
            <Text style={styles.habitDeleteText}>×</Text>
          </TouchableOpacity>
        </View>
      ))}

      {habits.length === 0 && (
        <Text style={styles.emptyHabits}>Tap + to add your first habit!</Text>
      )}

      <TouchableOpacity style={styles.addHabitBtn} onPress={onPressAdd}>
        <Text style={styles.addBtnText}>+ Add Habit</Text>
      </TouchableOpacity>
    </View>
  );
}

function PointsInfoCard({ points, streakDays }) {
  // Determine rank based on points
  let rank = 'Beginner';
  let nextRank = 'Fighter';
  let nextRankPoints = 200;
  if (points >= 2000) { rank = 'Legend'; nextRank = null; nextRankPoints = null; }
  else if (points >= 1000) { rank = 'Warrior'; nextRank = 'Legend'; nextRankPoints = 2000; }
  else if (points >= 500) { rank = 'Champion'; nextRank = 'Warrior'; nextRankPoints = 1000; }
  else if (points >= 200) { rank = 'Fighter'; nextRank = 'Champion'; nextRankPoints = 500; }

  return (
    <View style={styles.gridCard}>
      <Text style={styles.cardTitle}>Your Rank</Text>
      <Text style={styles.rankText}>{rank}</Text>
      {nextRank && (
        <Text style={styles.nextRankText}>
          {nextRankPoints - points} pts to {nextRank}
        </Text>
      )}
      <View style={styles.pointsRules}>
        <Text style={styles.ruleText}>✓ Complete all habits: +{POINTS_PER_COMPLETION} pts</Text>
        <Text style={styles.ruleText}>✗ Miss a day: -{POINTS_LOST_ON_MISS} pts & streak resets</Text>
      </View>
    </View>
  );
}

function MotivationCard({ identity }) {
  return (
    <View style={styles.gridCard}>
      <Text style={styles.cardTitle}>Your Identity</Text>
      <Text style={styles.identityText}>{identity || 'Set your identity in your profile'}</Text>
    </View>
  );
}

export default function HomeTab({ navigation }) {
  const [streakDays, setStreakDays] = useState(0);
  const [points, setPoints] = useState(0);
  const [habits, setHabits] = useState([]);
  const [allDone, setAllDone] = useState(false);
  const [identity, setIdentity] = useState('');
  const [email, setEmail] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    const sessionEmail = await getSession();
    const user = await getCurrentUser();
    if (!user) return;

    setEmail(sessionEmail);
    setIdentity(user.identity || '');
    setPoints(user.points || 0);
    setStreakDays(user.streakDays || 0);

    const today = new Date().toDateString();
    const lastHabitDate = user.habitsDate;

    if (lastHabitDate === today) {
      // Same day — load habits as-is
      setHabits(user.habits || []);
      setAllDone(user.todayCompleted || false);
    } else {
      // New day — check if yesterday was completed
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      let newStreak = user.streakDays || 0;
      let newPoints = user.points || 0;

      if (lastHabitDate && lastHabitDate !== yesterdayStr && !user.todayCompleted) {
        // Missed a day — reset streak, lose points
        newStreak = 0;
        newPoints = Math.max(0, newPoints - POINTS_LOST_ON_MISS);
      }

      // Reset habits for new day
      const resetHabits = (user.habits || []).map(h => ({ ...h, done: false }));
      setHabits(resetHabits);
      setAllDone(false);
      setStreakDays(newStreak);
      setPoints(newPoints);

      await updateUser(sessionEmail, {
        habits: resetHabits,
        habitsDate: today,
        todayCompleted: false,
        streakDays: newStreak,
        points: newPoints,
      });
    }
  }

  async function saveHabits(updated) {
    setHabits(updated);
    const today = new Date().toDateString();

    // Check if all habits are now done
    const completed = updated.length > 0 && updated.every(h => h.done);
    const wasCompleted = allDone;

    let newStreak = streakDays;
    let newPoints = points;

    if (completed && !wasCompleted) {
      // Just completed all habits — award streak + points
      newStreak = streakDays + 1;
      newPoints = points + POINTS_PER_COMPLETION;
      setStreakDays(newStreak);
      setPoints(newPoints);
      setAllDone(true);
    } else if (!completed && wasCompleted) {
      // Unchecked something — revert today's reward
      newStreak = Math.max(0, streakDays - 1);
      newPoints = Math.max(0, points - POINTS_PER_COMPLETION);
      setStreakDays(newStreak);
      setPoints(newPoints);
      setAllDone(false);
    }

    await updateUser(email, {
      habits: updated,
      habitsDate: today,
      todayCompleted: completed && !wasCompleted ? true : (wasCompleted && !completed ? false : allDone),
      streakDays: newStreak,
      points: newPoints,
    });
  }

  function addHabit(newHabit) {
    saveHabits([...habits, newHabit]);
  }

  function openAddHabit() {
    navigation.getParent()?.navigate('AddHabit', { onAdd: addHabit });
  }

  function startHabit(index) {
    const habit = habits[index];
    if (habit.done) return;

    const isResume = habit.pausedTimeLeft != null;

    navigation.getParent()?.navigate('HabitSession', {
      habit,
      resumeTimeLeft: isResume ? habit.pausedTimeLeft : undefined,
      resumeBeforePhoto: isResume ? habit.pausedBeforePhoto : undefined,
      onPause: ({ timeLeft, beforePhoto }) => {
        // Save paused state back to the habit
        const updated = [...habits];
        updated[index] = {
          ...updated[index],
          pausedTimeLeft: timeLeft,
          pausedBeforePhoto: beforePhoto,
        };
        setHabits(updated);
        const today = new Date().toDateString();
        updateUser(email, { habits: updated, habitsDate: today });
      },
      onComplete: ({ extraPoints }) => {
        const updated = [...habits];
        // Clear paused state and mark done
        updated[index] = {
          ...updated[index],
          done: true,
          pausedTimeLeft: undefined,
          pausedBeforePhoto: undefined,
        };

        const allCompleted = updated.every(h => h.done);
        let newStreak = streakDays;
        let newPoints = points;

        newPoints += POINTS_PER_COMPLETION;
        if (extraPoints > 0) {
          newPoints += extraPoints;
        }
        if (allCompleted && !allDone) {
          newStreak += 1;
          setAllDone(true);
        }

        setStreakDays(newStreak);
        setPoints(newPoints);
        setHabits(updated);

        const today = new Date().toDateString();
        updateUser(email, {
          habits: updated,
          habitsDate: today,
          todayCompleted: allCompleted,
          streakDays: newStreak,
          points: newPoints,
        });
      },
    });
  }

  function deleteHabit(index) {
    Alert.alert('Remove Habit', `Remove "${habits[index].name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          const updated = habits.filter((_, i) => i !== index);
          saveHabits(updated);
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.greeting}>Unclouded</Text>

        <View style={styles.grid}>
          <StreakCard streakDays={streakDays} points={points} allDone={allDone} />
          <HabitBlock
            habits={habits}
            onStart={startHabit}
            onDelete={deleteHabit}
            onPressAdd={openAddHabit}
          />
          <PointsInfoCard points={points} streakDays={streakDays} />
          <MotivationCard identity={identity} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 20, paddingBottom: 40 },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textBright,
    marginBottom: 20,
    textAlign: 'center',
  },
  grid: {
    gap: 16,
  },
  gridCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textBright,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 12,
  },

  // Streak
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a0a',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#3a3a1a',
  },
  pointsIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.yellow,
  },
  miniRingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  miniRingOverlay: {
    position: 'absolute',
    alignItems: 'center',
  },
  miniRingNum: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textBright,
  },
  miniRingLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: -2,
  },
  streakMsg: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  completedBanner: {
    backgroundColor: '#0a1a0a',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1a3a1a',
    marginTop: 4,
  },
  completedText: {
    color: Colors.green,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Habits
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  habitProgress: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.red,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  habitCheck: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  habitCheckDone: {
    backgroundColor: Colors.red,
  },
  habitCheckmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  habitText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  habitTextDone: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  habitDelete: {
    padding: 4,
  },
  habitDeleteText: {
    color: Colors.textMuted,
    fontSize: 20,
    fontWeight: '300',
  },
  emptyHabits: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingVertical: 16,
    fontStyle: 'italic',
  },
  habitCategoryIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  habitInfo: {
    flex: 1,
  },
  habitTimer: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  startBtn: {
    backgroundColor: Colors.red,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
  },
  startBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  resumeBtn: {
    backgroundColor: Colors.yellow,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
  },
  resumeBtnText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
  },
  habitTimerPaused: {
    fontSize: 11,
    color: Colors.yellow,
    marginTop: 2,
    fontWeight: '600',
  },
  doneLabel: {
    color: Colors.green,
    fontSize: 12,
    fontWeight: '700',
    marginRight: 8,
  },
  addHabitBtn: {
    backgroundColor: Colors.red,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  // Points / Rank
  rankText: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.redLight,
    marginTop: 8,
  },
  nextRankText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  pointsRules: {
    marginTop: 16,
    gap: 6,
  },
  ruleText: {
    fontSize: 12,
    color: Colors.textMuted,
  },

  // Identity
  identityText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
});
