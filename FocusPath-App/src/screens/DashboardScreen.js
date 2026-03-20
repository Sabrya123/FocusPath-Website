import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../utils/colors';
import { getCurrentUser, clearSession, getStreakInfo, getDayOfYear } from '../utils/storage';
import { NEGATIVE_FACTS, POSITIVE_FACTS, ALLAH_REMINDERS } from '../data/facts';
import StreakRing from '../components/StreakRing';
import FactCard from '../components/FactCard';
import TimelineList from '../components/TimelineList';

export default function DashboardScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [streak, setStreak] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [])
  );

  async function loadUser() {
    const u = await getCurrentUser();
    if (!u) {
      navigation.replace('Login');
      return;
    }
    setUser(u);
    setStreak(getStreakInfo(u.quitDate));
  }

  async function handleLogout() {
    await clearSession();
    navigation.replace('Login');
  }

  if (!user || !streak) return null;

  const dayOfYear = getDayOfYear();
  const negFact = NEGATIVE_FACTS[dayOfYear % NEGATIVE_FACTS.length];
  const posFact = POSITIVE_FACTS[dayOfYear % POSITIVE_FACTS.length];
  const hasAllah = user.motivations && user.motivations.includes('allah');
  const allahReminder = hasAllah
    ? ALLAH_REMINDERS[dayOfYear % ALLAH_REMINDERS.length]
    : null;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top Nav */}
      <View style={styles.nav}>
        <View style={styles.navLeft}>
          <Text style={styles.navTitle}>Unclouded</Text>
        </View>
        <View style={styles.navRight}>
          <Text style={styles.navName}>{user.name}</Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Streak */}
        <StreakRing
          days={streak.days}
          hours={streak.hours}
          weeks={streak.weeks}
          progress={streak.progress}
          message={streak.message}
        />

        {/* Emergency Button */}
        <TouchableOpacity
          style={styles.emergencyBtn}
          onPress={() => navigation.navigate('Emergency', { user })}
          activeOpacity={0.8}
        >
          <Text style={styles.emergencyIcon}>🆘</Text>
          <Text style={styles.emergencyText}>I Want to Vape — HELP</Text>
        </TouchableOpacity>

        {/* Daily Facts */}
        <FactCard type="negative" title="Daily Vaping Fact" text={negFact} />
        <FactCard type="positive" title="Daily Quitting Win" text={posFact} />

        {/* Allah Reminder */}
        {hasAllah && (
          <View style={styles.allahCard}>
            <Text style={styles.allahIcon}>🕌</Text>
            <Text style={styles.allahTitle}>DAILY REMINDER</Text>
            <Text style={styles.allahText}>{allahReminder}</Text>
          </View>
        )}

        {/* Timeline */}
        <TimelineList currentDays={streak.days} />

        {/* Identity Reminder */}
        <View style={styles.identityCard}>
          <Text style={styles.identityTitle}>
            Remember Who You're Becoming
          </Text>
          <Text style={styles.identityText}>"{user.identity}"</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  navLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  navLogo: { fontSize: 24 },
  navTitle: { fontSize: 16, fontWeight: '700', color: Colors.textBright },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  navName: { color: Colors.textSecondary, fontSize: 13 },
  logoutBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
  },
  logoutText: { color: Colors.textSecondary, fontSize: 13 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  emergencyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.red,
    borderRadius: 16,
    padding: 20,
    marginVertical: 20,
    gap: 12,
    shadowColor: Colors.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  emergencyIcon: { fontSize: 24 },
  emergencyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
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
    marginBottom: 24,
  },
  allahIcon: { fontSize: 32, marginBottom: 8 },
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
  identityCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    marginBottom: 20,
  },
  identityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.redLight,
    marginBottom: 10,
  },
  identityText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
