import React, { useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Circle, Rect, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors } from '../utils/colors';
import { getCurrentUser, getSession, updateUser, getUsers, getDayOfYear } from '../utils/storage';
import { StarIcon, CheckIcon, CategoryIcon, CloseIcon, DeleteIcon, MedalIcon, StrengthIcon, SparkleIcon, XIcon, RankIcon, FireIcon, MosqueIcon } from '../components/Icons';
import { NEGATIVE_FACTS, POSITIVE_FACTS, ALLAH_REMINDERS } from '../data/facts';
import FactCard from '../components/FactCard';
import { syncProfileToSupabase } from '../utils/friends';
import { supabase } from '../utils/supabase';

function LockIcon({ size = 18, color = Colors.red }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Shackle (the arc on top) */}
      <Path
        d="M7 10V7a5 5 0 0 1 10 0v3"
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      {/* Lock body */}
      <Rect x="4" y="10" width="16" height="12" rx="3" fill={color} />
      {/* Keyhole */}
      <Circle cx="12" cy="15" r="1.5" fill={Colors.bgCard} />
      <Rect x="11.25" y="15.5" width="1.5" height="3" rx="0.75" fill={Colors.bgCard} />
    </Svg>
  );
}

function GiftIcon({ size = 18 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Ribbon vertical */}
      <Rect x="10.5" y="8" width="3" height="14" fill={Colors.redLight} />
      {/* Box bottom */}
      <Rect x="3" y="12" width="18" height="10" rx="2" fill={Colors.red} />
      {/* Box lid */}
      <Rect x="2" y="8" width="20" height="5" rx="1.5" fill={Colors.redLight} />
      {/* Ribbon horizontal */}
      <Rect x="2" y="9.5" width="20" height="2" fill={Colors.redDark} />
      {/* Ribbon vertical overlay */}
      <Rect x="10.5" y="8" width="3" height="14" fill={Colors.redDark} />
      {/* Bow left */}
      <Path d="M12 8C10 6 7 5.5 7 3.5C7 2 8.5 1 10 2C11 2.7 12 4.5 12 8Z" fill={Colors.redLight} />
      {/* Bow right */}
      <Path d="M12 8C14 6 17 5.5 17 3.5C17 2 15.5 1 14 2C13 2.7 12 4.5 12 8Z" fill={Colors.redLight} />
    </Svg>
  );
}

const RADIUS = 50;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const POINTS_PER_COMPLETION = 50;
const POINTS_LOST_ON_MISS = 30;

// Milestone tiers
const MILESTONES = [
  { days: 30, label: '1 Month', next: '3 Months' },
  { days: 90, label: '3 Months', next: '6 Months' },
  { days: 180, label: '6 Months', next: '1 Year' },
  { days: 365, label: '1 Year', next: null },
];

function getMilestone(streakDays) {
  for (const m of MILESTONES) {
    if (streakDays < m.days) return m;
  }
  return MILESTONES[MILESTONES.length - 1]; // 1 year (keep showing)
}

function getCompletedMilestones(streakDays) {
  return MILESTONES.filter(m => streakDays >= m.days);
}

const REWARDS = [
  { points: 1000, label: 'Reward 1', description: 'Coming soon...' },
  { points: 5000, label: 'Reward 2', description: 'Coming soon...' },
  { points: 10000, label: 'Reward 3', description: 'Coming soon...' },
];

function ProgressCard({ streakDays, allDone }) {
  const [showDetail, setShowDetail] = useState(false);

  const milestone = getMilestone(streakDays);
  const progress = Math.min(streakDays / milestone.days, 1);
  const offset = CIRCUMFERENCE * (1 - progress);
  const daysLeft = milestone.days - streakDays;

  // Big ring for modal
  const BIG_RADIUS = 90;
  const BIG_CIRC = 2 * Math.PI * BIG_RADIUS;
  const bigOffset = BIG_CIRC * (1 - progress);

  return (
    <>
      <TouchableOpacity style={styles.gridCard} onPress={() => setShowDetail(true)} activeOpacity={0.7}>
        <Text style={styles.cardTitle}>Progress</Text>
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
              cx="55" cy="55" r={RADIUS} fill="none"
              stroke="url(#miniGrad)" strokeWidth={8} strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE} strokeDashoffset={offset}
              rotation="-90" origin="55, 55"
            />
          </Svg>
          <View style={styles.miniRingOverlay}>
            <Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
            <Text style={styles.miniRingLabel}>{milestone.label}</Text>
          </View>
        </View>
        {allDone ? (
          <View style={styles.completedBanner}>
            <Text style={styles.completedText}>All done today!</Text>
          </View>
        ) : (
          <Text style={styles.streakMsg}>{daysLeft} days to {milestone.label}</Text>
        )}
      </TouchableOpacity>

      {/* Expanded Progress Modal */}
      <Modal visible={showDetail} animationType="slide" transparent>
        <View style={styles.progressModalOverlay}>
          <View style={styles.progressModalContent}>
            <View style={styles.progressModalHeader}>
              <Text style={styles.progressModalTitle}>Your Journey</Text>
              <TouchableOpacity onPress={() => setShowDetail(false)}>
                <CloseIcon size={22} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Big progress ring */}
            <View style={styles.bigRingWrap}>
              <Svg width={200} height={200} viewBox="0 0 200 200">
                <Defs>
                  <LinearGradient id="bigGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <Stop offset="0%" stopColor={Colors.redDark} />
                    <Stop offset="100%" stopColor={Colors.redLight} />
                  </LinearGradient>
                </Defs>
                <Circle cx="100" cy="100" r={BIG_RADIUS} fill="none" stroke={Colors.border} strokeWidth={12} />
                <Circle
                  cx="100" cy="100" r={BIG_RADIUS} fill="none"
                  stroke="url(#bigGrad)" strokeWidth={12} strokeLinecap="round"
                  strokeDasharray={BIG_CIRC} strokeDashoffset={bigOffset}
                  rotation="-90" origin="100, 100"
                />
              </Svg>
              <View style={styles.bigRingOverlay}>
                <Text style={styles.bigRingPercent}>{Math.round(progress * 100)}%</Text>
                <Text style={styles.bigRingDays}>{streakDays} days</Text>
                <Text style={styles.bigRingTarget}>of {milestone.days}</Text>
              </View>
            </View>

            <Text style={styles.currentMilestoneLabel}>
              Current goal: {milestone.label}
            </Text>
            {daysLeft > 0 && (
              <Text style={styles.daysLeftText}>{daysLeft} days remaining</Text>
            )}

            {/* Milestone timeline */}
            <View style={styles.milestoneTimeline}>
              {MILESTONES.map((m, i) => {
                const completed = streakDays >= m.days;
                const isCurrent = milestone === m;
                return (
                  <View key={m.days} style={styles.milestoneRow}>
                    <View style={[
                      styles.milestoneDot,
                      completed && styles.milestoneDotDone,
                      isCurrent && !completed && styles.milestoneDotCurrent,
                    ]}>
                      {completed && <CheckIcon size={14} color="#fff" />}
                    </View>
                    <View style={styles.milestoneInfo}>
                      <Text style={[
                        styles.milestoneLabel,
                        completed && styles.milestoneLabelDone,
                        isCurrent && styles.milestoneLabelCurrent,
                      ]}>
                        {m.label}
                      </Text>
                      <Text style={styles.milestoneDaysLabel}>{m.days} days</Text>
                    </View>
                    {completed && <Text style={styles.milestoneCompleted}>Completed!</Text>}
                    {isCurrent && !completed && (
                      <Text style={styles.milestoneInProgress}>In progress</Text>
                    )}
                    {!completed && !isCurrent && (
                      <Text style={styles.milestoneLocked}>Locked</Text>
                    )}
                  </View>
                );
              })}
            </View>

            {streakDays >= 365 && (
              <View style={styles.legendBanner}>
                <Text style={styles.legendText}>You made it. 1 full year. You're a legend.</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

    </>
  );
}

function PointsStatsCard({ points, onPress }) {
  return (
    <TouchableOpacity style={[styles.gridCard, styles.topRightCard]} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.cardTitle}>Points</Text>
      <View style={styles.pointsDisplayRow}>
        <StarIcon size={20} />
        <Text style={styles.pointsDisplayNum}>{points.toLocaleString()}</Text>
      </View>
      <Text style={styles.pointsDisplayLabel}>pts earned</Text>
    </TouchableOpacity>
  );
}

function StreakStatsCard({ streakDays, onPress }) {
  return (
    <TouchableOpacity style={[styles.gridCard, styles.topRightCard]} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.cardTitle}>Streak</Text>
      <View style={styles.streakDisplayRow}>
        <FireIcon size={24} />
        <Text style={styles.streakDisplayNum}>{streakDays}</Text>
      </View>
      <Text style={styles.streakDisplayLabel}>day{streakDays !== 1 ? 's' : ''} strong</Text>
    </TouchableOpacity>
  );
}

// Category icons now use custom SVG components

function HabitBlock({ habits, onStart, onDelete, onPressAdd, canAddHabit, maxHabits, journeyMonth }) {
  const doneCount = habits.filter(h => h.done).length;

  return (
    <View style={styles.gridCard}>
      <View style={styles.habitHeader}>
        <View>
          <Text style={styles.cardTitle}>Daily Habits</Text>
          <Text style={styles.cardSubtitle}>
            Month {journeyMonth} — {maxHabits} habit{maxHabits > 1 ? 's' : ''} required
          </Text>
        </View>
        {habits.length > 0 && (
          <Text style={styles.habitProgress}>{doneCount}/{habits.length}</Text>
        )}
      </View>

      {habits.map((h, i) => (
        <View key={i} style={styles.habitRow}>
          <View style={[styles.habitCheck, h.done && styles.habitCheckDone]}>
            {h.done && <CheckIcon size={12} color="#fff" />}
          </View>
          <View style={styles.habitCategoryIcon}>
            <CategoryIcon category={h.category} size={18} />
          </View>
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
            <View style={styles.doneLabelRow}><CheckIcon size={12} color="#22c55e" /><Text style={styles.doneLabel}> Done</Text></View>
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
            <DeleteIcon size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
      ))}

      {habits.length === 0 && (
        <Text style={styles.emptyHabits}>Tap + to add your first habit!</Text>
      )}

      {canAddHabit ? (
        <TouchableOpacity style={styles.addHabitBtn} onPress={onPressAdd}>
          <Text style={styles.addBtnText}>+ Add Habit ({habits.length}/{maxHabits})</Text>
        </TouchableOpacity>
      ) : maxHabits < 3 ? (
        <View style={styles.lockedHabitMsg}>
          <LockIcon size={14} color={Colors.textMuted} />
          <Text style={styles.lockedHabitText}>
            New habit slot unlocks in month {maxHabits + 1}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const ALL_RANKS = [
  { name: 'Grounded', vibe: "You've planted your feet and made the choice to start.", minPoints: 0 },
  { name: 'Awakened', vibe: 'The "fog" is lifting, and you\'re starting to see the benefits of focus.', minPoints: 200 },
  { name: 'Rising', vibe: "You're gaining momentum and building strength in your new habits.", minPoints: 500 },
  { name: 'Elevated', vibe: "You've climbed above the initial struggle and are looking down at how far you've come.", minPoints: 1000 },
  { name: 'Radiant', vibe: "Your mind is sharp, your spirit is strong, and you're helping others climb.", minPoints: 2000 },
  { name: 'Unclouded', vibe: 'The Ultimate Goal. Total clarity, peace, and absolute focus on what matters.', minPoints: 5000 },
];

function getRank(points) {
  for (let i = ALL_RANKS.length - 1; i >= 0; i--) {
    if (points >= ALL_RANKS[i].minPoints) return i;
  }
  return 0;
}

function RanksModal({ visible, onClose, points }) {
  const currentIndex = getRank(points);
  const currentRank = ALL_RANKS[currentIndex];
  const nextRank = currentIndex < ALL_RANKS.length - 1 ? ALL_RANKS[currentIndex + 1] : null;

  const progressInRank = nextRank
    ? (points - currentRank.minPoints) / (nextRank.minPoints - currentRank.minPoints)
    : 1;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>The 6 Ranks of Ascension</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalClose}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.currentRankBanner}>
              <View style={styles.currentRankIcon}><RankIcon rank={currentRank.name} size={56} /></View>
              <Text style={styles.currentRankName}>{currentRank.name}</Text>
              <Text style={styles.currentRankPts}>{points} pts</Text>
            </View>

            {nextRank && (
              <View style={styles.progressSection}>
                <View style={styles.progressLabels}>
                  <Text style={styles.progressFrom}>{currentRank.name}</Text>
                  <Text style={styles.progressTo}>{nextRank.name}</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${Math.min(progressInRank * 100, 100)}%` }]} />
                </View>
                <Text style={styles.progressPts}>
                  {nextRank.minPoints - points} pts to {nextRank.name}
                </Text>
              </View>
            )}

            <View style={styles.ranksList}>
              {ALL_RANKS.map((r, i) => {
                const unlocked = i <= currentIndex;
                const isCurrent = i === currentIndex;
                return (
                  <View key={r.name} style={[styles.rankRow, isCurrent && styles.rankRowCurrent]}>
                    <View style={styles.rankRowIcon}><RankIcon rank={r.name} size={28} /></View>
                    <View style={styles.rankRowInfo}>
                      <Text style={[styles.rankRowName, unlocked && styles.rankRowNameUnlocked, isCurrent && styles.rankRowNameCurrent]}>
                        {r.name}
                      </Text>
                      <Text style={styles.rankRowVibe}>{r.vibe}</Text>
                      <Text style={styles.rankRowPts}>{r.minPoints} pts</Text>
                    </View>
                    {unlocked && (
                      <Text style={styles.rankRowCheck}>✓</Text>
                    )}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function PointsInfoCard({ points, streakDays, onPress }) {
  const currentIndex = getRank(points);
  const rank = ALL_RANKS[currentIndex];
  const nextRank = currentIndex < ALL_RANKS.length - 1 ? ALL_RANKS[currentIndex + 1] : null;

  return (
    <TouchableOpacity style={styles.gridCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rankHeader}>
        <Text style={styles.cardTitle}>Your Rank</Text>
        <Text style={styles.rankTap}>Tap to view all ›</Text>
      </View>
      <View style={styles.rankDisplay}>
        <RankIcon rank={rank.name} size={32} />
        <Text style={styles.rankText}>{rank.name}</Text>
      </View>
      {nextRank && (
        <Text style={styles.nextRankText}>
          {nextRank.minPoints - points} pts to {nextRank.name}
        </Text>
      )}
      <View style={styles.pointsRules}>
        <View style={styles.ruleRow}><CheckIcon size={12} color="#22c55e" /><Text style={styles.ruleText}> Write daily affirmation: +25 pts</Text></View>
        <View style={styles.ruleRow}><CheckIcon size={12} color="#22c55e" /><Text style={styles.ruleText}> Complete habits + affirmation: +{POINTS_PER_COMPLETION} pts</Text></View>
        <View style={styles.ruleRow}><XIcon size={12} color={Colors.red} /><Text style={styles.ruleText}> Miss a day: -{POINTS_LOST_ON_MISS} pts & streak resets</Text></View>
      </View>
    </TouchableOpacity>
  );
}

function MantraCard({ mantra, mantraInput, onChangeMantra, onSubmitMantra, mantraDone, onEditMantra }) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(mantra || '');

  if (!mantra) return null;

  const isMatch = mantraInput.trim().toLowerCase() === mantra.trim().toLowerCase();

  return (
    <View style={styles.gridCard}>
      <View style={styles.mantraHeader}>
        <Text style={styles.cardTitle}>Daily Affirmation</Text>
        <TouchableOpacity onPress={() => { setEditText(mantra); setEditing(true); }}>
          <Text style={styles.editMantraBtn}>Edit ✎</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.mantraSubtitle}>Write your affirmation to earn points & keep your streak</Text>

      {editing ? (
        <View style={styles.editMantraBox}>
          <TextInput
            style={styles.editMantraInput}
            value={editText}
            onChangeText={setEditText}
            multiline
            autoFocus
          />
          <View style={styles.editMantraBtns}>
            <TouchableOpacity style={styles.editMantraCancelBtn} onPress={() => setEditing(false)}>
              <Text style={styles.editMantraCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.editMantraSaveBtn}
              onPress={() => {
                if (editText.trim().length > 5) {
                  onEditMantra(editText.trim());
                  setEditing(false);
                } else {
                  Alert.alert('Too short', 'Your affirmation should be at least a few words.');
                }
              }}
            >
              <Text style={styles.editMantraSaveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.mantraBox}>
          <Text style={styles.mantraText}>"{mantra}"</Text>
        </View>
      )}
      {mantraDone ? (
        <View style={styles.completedBanner}>
          <Text style={styles.completedText}>Affirmation written today!</Text>
        </View>
      ) : (
        <>
          <TextInput
            style={[styles.mantraInput, isMatch && styles.mantraInputMatch]}
            placeholder="Type your affirmation exactly..."
            placeholderTextColor={Colors.textMuted}
            value={mantraInput}
            onChangeText={onChangeMantra}
            multiline
          />
          <TouchableOpacity
            style={[styles.mantraSubmitBtn, !isMatch && styles.mantraSubmitDisabled]}
            onPress={onSubmitMantra}
            disabled={!isMatch}
          >
            <Text style={styles.mantraSubmitText}>
              {isMatch ? '✓ Submit Affirmation' : 'Type your affirmation to unlock'}
            </Text>
          </TouchableOpacity>
        </>
      )}
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
  const [mantra, setMantra] = useState('');
  const [mantraInput, setMantraInput] = useState('');
  const [mantraDone, setMantraDone] = useState(false);
  const [email, setEmail] = useState('');
  const [showRanks, setShowRanks] = useState(false);
  const [journeyMonth, setJourneyMonth] = useState(1);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(0);
  const [hasAllah, setHasAllah] = useState(false);

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
    setMantra(user.mantra || '');
    setPoints(user.points || 0);
    setStreakDays(user.streakDays || 0);
    setHasAllah(user.motivations?.includes('allah') || false);

    // Sync profile to Supabase for friends feature
    try {
      const { data: { user: sbUser } } = await supabase.auth.getUser();
      if (sbUser) syncProfileToSupabase(sbUser.id, user);
    } catch (e) {}

    // Calculate journey month (how many months since they started)
    if (user.journeyStartDate) {
      const start = new Date(user.journeyStartDate);
      const now = new Date();
      const monthsDiff = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
      setJourneyMonth(Math.max(1, monthsDiff + 1));
    }

    // Load leaderboard
    const allUsers = await getUsers();
    const lb = Object.values(allUsers)
      .filter(u => u.name && u.streakDays != null)
      .map(u => ({ name: u.name, streakDays: u.streakDays || 0 }))
      .sort((a, b) => b.streakDays - a.streakDays);
    setLeaderboard(lb);
    const rank = lb.findIndex(u => u.name === user.name) + 1;
    setUserRank(rank || lb.length + 1);

    const today = new Date().toDateString();
    const lastHabitDate = user.habitsDate;

    if (lastHabitDate === today) {
      // Same day — load habits as-is
      setHabits(user.habits || []);
      setAllDone(user.todayCompleted || false);
      setMantraDone(user.mantraDoneToday || false);
    } else {
      // New day — check if yesterday was completed
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      let newStreak = user.streakDays || 0;
      let newPoints = user.points || 0;
      const pendingPts = user.pendingPoints || 0;
      const pendingStreak = user.pendingStreak || 0;

      if (lastHabitDate === yesterdayStr && user.todayCompleted) {
        // Yesterday was completed — lock in pending points & streak
        newPoints = newPoints + pendingPts;
        newStreak = newStreak + pendingStreak;
      } else if (lastHabitDate && lastHabitDate !== yesterdayStr) {
        // Missed a day — reset streak, lose points, discard pending
        newStreak = 0;
        newPoints = Math.max(0, newPoints - POINTS_LOST_ON_MISS);
      }

      // Reset habits and mantra for new day
      const resetHabits = (user.habits || []).map(h => ({ ...h, done: false }));
      setHabits(resetHabits);
      setAllDone(false);
      setMantraDone(false);
      setMantraInput('');
      setStreakDays(newStreak);
      setPoints(newPoints);

      await updateUser(sessionEmail, {
        habits: resetHabits,
        habitsDate: today,
        todayCompleted: false,
        mantraDoneToday: false,
        streakDays: newStreak,
        points: newPoints,
        pendingPoints: 0,
        pendingStreak: 0,
      });
    }
  }

  // Max habits based on journey month (1 for month 1, 2 for month 2, 3 for month 3+)
  const maxHabits = Math.min(journeyMonth, 3);
  const canAddHabit = habits.length < maxHabits;

  // Check if everything is done (mantra + all habits)
  function checkAllComplete(habitsArr, mantraDoneVal) {
    const habitsComplete = habitsArr.length > 0 && habitsArr.every(h => h.done);
    return habitsComplete && mantraDoneVal;
  }

  async function saveHabits(updated) {
    setHabits(updated);
    const today = new Date().toDateString();

    const nowComplete = checkAllComplete(updated, mantraDone);
    const wasCompleted = allDone;

    let displayStreak = streakDays;
    let displayPoints = points;
    let pendingPts = 0;
    let pendingStr = 0;

    if (nowComplete && !wasCompleted) {
      // Show the progress to user but store as pending
      pendingStr = 1;
      pendingPts = POINTS_PER_COMPLETION;
      displayStreak = streakDays + 1;
      displayPoints = points + POINTS_PER_COMPLETION;
      setStreakDays(displayStreak);
      setPoints(displayPoints);
      setAllDone(true);
    }

    await updateUser(email, {
      habits: updated,
      habitsDate: today,
      todayCompleted: nowComplete,
      pendingPoints: pendingPts || undefined,
      pendingStreak: pendingStr || undefined,
    });
  }

  async function handleMantraSubmit() {
    if (mantraInput.trim().toLowerCase() !== mantra.trim().toLowerCase()) return;

    setMantraDone(true);
    const today = new Date().toDateString();

    const habitsComplete = habits.length > 0 && habits.every(h => h.done);
    const nowComplete = habitsComplete;
    let displayStreak = streakDays;
    let displayPoints = points;

    const MANTRA_POINTS = 25;
    displayPoints += MANTRA_POINTS;
    let pendingPts = MANTRA_POINTS;
    let pendingStr = 0;

    if (nowComplete && !allDone) {
      displayStreak += 1;
      displayPoints += POINTS_PER_COMPLETION;
      pendingPts += POINTS_PER_COMPLETION;
      pendingStr = 1;
      setAllDone(true);
    }

    setStreakDays(displayStreak);
    setPoints(displayPoints);

    await updateUser(email, {
      mantraDoneToday: true,
      habitsDate: today,
      todayCompleted: nowComplete,
      pendingPoints: pendingPts,
      pendingStreak: pendingStr,
    });

    Alert.alert('Affirmation Written!', `+${MANTRA_POINTS} points${nowComplete ? ` and +${POINTS_PER_COMPLETION} bonus for completing everything!` : '. Complete your habits to earn your streak!'}\n\nPoints lock in when you continue tomorrow!`);
  }

  async function handleEditMantra(newMantra) {
    setMantra(newMantra);
    setMantraInput('');
    await updateUser(email, { mantra: newMantra });
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
    const habit = habits[index];
    // Can't delete completed habits (prevents gaming the system)
    if (habit.done) {
      Alert.alert("Can't Remove", "You've already completed this habit today. You can remove it tomorrow.");
      return;
    }
    // Can't delete your only habit
    if (habits.length <= 1) {
      Alert.alert("Can't Remove", "You need at least one daily habit.");
      return;
    }
    Alert.alert('Remove Habit', `Remove "${habit.name}"?`, [
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
          {/* Top row: Progress left, Points + Streak right */}
          <View style={styles.topRow}>
            <View style={styles.topLeft}>
              <ProgressCard streakDays={streakDays} allDone={allDone} />
            </View>
            <View style={styles.topRight}>
              <PointsStatsCard points={points} onPress={() => setShowRanks(true)} />
              <StreakStatsCard streakDays={streakDays} onPress={() => setShowLeaderboard(true)} />
            </View>
          </View>

          <MantraCard
            mantra={mantra}
            mantraInput={mantraInput}
            onChangeMantra={setMantraInput}
            onSubmitMantra={handleMantraSubmit}
            mantraDone={mantraDone}
            onEditMantra={handleEditMantra}
          />
          <HabitBlock
            habits={habits}
            onStart={startHabit}
            onDelete={deleteHabit}
            onPressAdd={openAddHabit}
            canAddHabit={canAddHabit}
            maxHabits={maxHabits}
            journeyMonth={journeyMonth}
          />

          {/* Daily Facts — under habits */}
          <Text style={styles.factsHeading}>Daily Facts</Text>
          <FactCard type="negative" title="Daily Vaping Fact" text={NEGATIVE_FACTS[getDayOfYear() % NEGATIVE_FACTS.length]} />
          <FactCard type="positive" title="Daily Quitting Win" text={POSITIVE_FACTS[getDayOfYear() % POSITIVE_FACTS.length]} />
          {hasAllah && (
            <View style={styles.allahCard}>
              <View style={styles.allahIconWrap}><MosqueIcon size={28} /></View>
              <Text style={styles.allahTitle}>DAILY REMINDER</Text>
              <Text style={styles.allahText}>{ALLAH_REMINDERS[getDayOfYear() % ALLAH_REMINDERS.length]}</Text>
            </View>
          )}

          <PointsInfoCard points={points} streakDays={streakDays} onPress={() => setShowRanks(true)} />
          <RanksModal visible={showRanks} onClose={() => setShowRanks(false)} points={points} />
          <MotivationCard identity={identity} />
        </View>
      </ScrollView>

      {/* Leaderboard Modal */}
      <Modal visible={showLeaderboard} animationType="slide" transparent>
        <View style={styles.progressModalOverlay}>
          <View style={styles.progressModalContent}>
            <View style={styles.progressModalHeader}>
              <Text style={styles.progressModalTitle}>Leaderboard</Text>
              <TouchableOpacity onPress={() => setShowLeaderboard(false)}>
                <CloseIcon size={22} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Your rank */}
            <View style={styles.yourRankCard}>
              <Text style={styles.yourRankLabel}>Your Rank</Text>
              <Text style={styles.yourRankNum}>#{userRank}</Text>
              <Text style={styles.yourRankStreak}>{streakDays} day streak</Text>
            </View>

            {/* Leaderboard list */}
            <ScrollView style={styles.leaderboardList} showsVerticalScrollIndicator={false}>
              {leaderboard.map((user, i) => {
                const isYou = i === userRank - 1;
                const medalRank = i < 3 ? i + 1 : null;
                return (
                  <View key={i} style={[styles.leaderboardRow, isYou && styles.leaderboardRowYou]}>
                    <View style={styles.leaderboardRank}>
                      {medalRank ? <MedalIcon rank={medalRank} size={22} /> : <Text style={styles.leaderboardRankText}>#{i + 1}</Text>}
                    </View>
                    <Text style={[styles.leaderboardName, isYou && styles.leaderboardNameYou]}>
                      {user.name}{isYou ? ' (You)' : ''}
                    </Text>
                    <View style={styles.leaderboardStreakBadge}>
                      <Text style={styles.leaderboardStreakNum}>{user.streakDays}</Text>
                      <Text style={styles.leaderboardStreakLabel}>days</Text>
                    </View>
                  </View>
                );
              })}
              {leaderboard.length === 0 && (
                <Text style={styles.emptyHabits}>No users yet. Start your streak!</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 20, paddingBottom: 100 },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#A8D8EA',
    marginBottom: 20,
    textAlign: 'center',
  },
  grid: {
    gap: 16,
  },
  topRow: {
    flexDirection: 'row',
    gap: 12,
  },
  topLeft: {
    flex: 3,
  },
  topRight: {
    flex: 2,
    gap: 12,
  },
  topRightCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  pointsDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  pointsDisplayNum: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textBright,
  },
  pointsDisplayLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  streakDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  streakDisplayNum: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.red,
  },
  streakDisplayLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
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
  progressPercent: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textBright,
  },
  miniRingLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: -2,
  },
  streakBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.red,
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    minWidth: 40,
  },
  streakBadgeNum: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
  streakBadgeLabel: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    marginTop: -2,
  },
  // Progress Modal
  progressModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressModalContent: {
    backgroundColor: Colors.bgCard,
    borderRadius: 24,
    padding: 24,
    width: '90%',
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressModalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textBright,
  },
  progressModalClose: {
    fontSize: 22,
    color: Colors.textMuted,
    padding: 4,
  },
  bigRingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  bigRingOverlay: {
    position: 'absolute',
    alignItems: 'center',
  },
  bigRingPercent: {
    fontSize: 42,
    fontWeight: '800',
    color: Colors.textBright,
  },
  bigRingDays: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.redLight,
    marginTop: -4,
  },
  bigRingTarget: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  currentMilestoneLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textBright,
    textAlign: 'center',
    marginTop: 8,
  },
  daysLeftText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  milestoneTimeline: {
    gap: 12,
    marginTop: 8,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  milestoneDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.bgInput,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneDotDone: {
    backgroundColor: Colors.red,
    borderColor: Colors.red,
  },
  milestoneDotCurrent: {
    borderColor: Colors.redLight,
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
  },
  milestoneDotCheck: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  milestoneLabelDone: {
    color: Colors.textBright,
  },
  milestoneLabelCurrent: {
    color: Colors.redLight,
  },
  milestoneDaysLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  milestoneCompleted: {
    fontSize: 12,
    fontWeight: '700',
    color: '#22c55e',
  },
  milestoneInProgress: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.redLight,
  },
  milestoneLocked: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  legendBanner: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderWidth: 1,
    borderColor: Colors.red,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  legendText: {
    color: Colors.redLight,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  // Rewards
  rewardsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardsModalContent: {
    backgroundColor: Colors.bgCard,
    borderRadius: 24,
    padding: 24,
    width: '90%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rewardsPointsNum: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textBright,
    textAlign: 'center',
    marginBottom: 24,
  },
  rewardsBarContainer: {
    height: 80,
    marginBottom: 24,
    justifyContent: 'center',
  },
  rewardsBarTrack: {
    height: 14,
    backgroundColor: Colors.border,
    borderRadius: 7,
    overflow: 'hidden',
    position: 'relative',
  },
  rewardsBarGlow: {
    position: 'absolute',
    height: '100%',
    borderRadius: 7,
    backgroundColor: 'rgba(91, 168, 200, 0.3)',
    top: 0,
    left: 0,
  },
  rewardsBarFill: {
    height: '100%',
    borderRadius: 7,
    backgroundColor: Colors.red,
  },
  rewardMarker: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -16 }],
    top: 0,
  },
  rewardMarkerDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.bgInput,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  rewardMarkerDotUnlocked: {
    borderColor: Colors.red,
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
  },
  rewardMarkerIcon: {
    fontSize: 14,
  },
  rewardMarkerPts: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  rewardMarkerPtsUnlocked: {
    color: Colors.redLight,
  },
  rewardsList: {
    gap: 10,
  },
  rewardDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgInput,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  rewardDetailRowUnlocked: {
    borderColor: Colors.red,
    backgroundColor: 'rgba(220, 38, 38, 0.06)',
  },
  rewardDetailIconWrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardDetailInfo: {
    flex: 1,
  },
  rewardDetailName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  rewardDetailNameUnlocked: {
    color: Colors.textBright,
  },
  rewardDetailDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  rewardDetailPts: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textMuted,
  },
  rewardDetailPtsUnlocked: {
    color: Colors.redLight,
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
  rankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rankTap: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  rankDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  rankText: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.redLight,
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
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ruleText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  doneLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Ranks Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textBright,
  },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    color: Colors.textBright,
    fontSize: 16,
    fontWeight: '700',
  },
  currentRankBanner: {
    alignItems: 'center',
    marginBottom: 20,
  },
  currentRankIcon: {
    marginBottom: 8,
    alignItems: 'center',
  },
  currentRankName: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.redLight,
  },
  currentRankPts: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  progressSection: {
    marginBottom: 24,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressFrom: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  progressTo: {
    fontSize: 12,
    color: Colors.redLight,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 10,
    backgroundColor: Colors.border,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.red,
    borderRadius: 5,
  },
  progressPts: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  ranksList: {
    gap: 8,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rankRowCurrent: {
    borderColor: Colors.red,
    backgroundColor: Colors.bgInput,
  },
  rankRowIcon: {
    width: 28,
    marginRight: 14,
  },
  rankRowInfo: {
    flex: 1,
  },
  rankRowName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  rankRowNameUnlocked: {
    color: Colors.text,
  },
  rankRowNameCurrent: {
    color: Colors.redLight,
  },
  rankRowVibe: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  rankRowPts: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  rankRowCheck: {
    fontSize: 16,
    color: Colors.green,
    fontWeight: '700',
  },

  // Identity
  identityText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  // Mantra styles
  mantraSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
    marginBottom: 12,
  },
  mantraBox: {
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.25)',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  mantraText: {
    color: Colors.redLight,
    fontSize: 15,
    fontWeight: '600',
    fontStyle: 'italic',
    lineHeight: 22,
    textAlign: 'center',
  },
  mantraInput: {
    backgroundColor: Colors.bgInput,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    color: Colors.text,
    fontSize: 14,
    minHeight: 50,
    textAlignVertical: 'top',
  },
  mantraInputMatch: {
    borderColor: '#22c55e',
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
  },
  mantraSubmitBtn: {
    backgroundColor: Colors.red,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  mantraSubmitDisabled: {
    backgroundColor: Colors.border,
    opacity: 0.5,
  },
  mantraSubmitText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  // Mantra/Affirmation edit
  mantraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editMantraBtn: {
    color: Colors.redLight,
    fontSize: 13,
    fontWeight: '600',
  },
  editMantraBox: {
    marginBottom: 8,
  },
  editMantraInput: {
    backgroundColor: Colors.bgInput,
    borderWidth: 1,
    borderColor: Colors.red,
    borderRadius: 10,
    padding: 12,
    color: Colors.text,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  editMantraBtns: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  editMantraCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editMantraCancelText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  editMantraSaveBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.red,
  },
  editMantraSaveText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  // Locked habit message
  lockedHabitMsg: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.bgInput,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 12,
  },
  lockedHabitText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  // Leaderboard
  yourRankCard: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderWidth: 1,
    borderColor: Colors.red,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  yourRankLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  yourRankNum: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.textBright,
  },
  yourRankStreak: {
    fontSize: 14,
    color: Colors.redLight,
    fontWeight: '600',
    marginTop: -2,
  },
  leaderboardList: {
    maxHeight: 320,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgInput,
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  leaderboardRowYou: {
    borderColor: Colors.red,
    backgroundColor: 'rgba(220, 38, 38, 0.06)',
  },
  leaderboardRank: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderboardRankText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  leaderboardName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  leaderboardNameYou: {
    color: Colors.textBright,
  },
  leaderboardStreakBadge: {
    backgroundColor: Colors.red,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
  },
  leaderboardStreakNum: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
  leaderboardStreakLabel: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.7)',
    marginTop: -2,
  },
  factsHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textBright,
    marginTop: 8,
    marginBottom: 4,
  },
  allahCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
    borderLeftColor: Colors.purple,
    alignItems: 'center',
  },
  allahIconWrap: { marginBottom: 8 },
  allahTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.purple,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  allahText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 24,
    textAlign: 'center',
  },
});
