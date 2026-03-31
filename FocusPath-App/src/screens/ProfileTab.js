import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Colors } from '../utils/colors';
import { getCurrentUser, clearSession, getStreakInfo } from '../utils/storage';

export default function ProfileTab() {
  const [user, setUser] = useState(null);
  const [streak, setStreak] = useState(null);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [])
  );

  async function loadUser() {
    const u = await getCurrentUser();
    setUser(u);
    if (u?.quitDate) {
      setStreak(getStreakInfo(u.quitDate));
    }
  }

  async function handleLogout() {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await clearSession();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  }

  if (!user) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        <View style={styles.identityCard}>
          <Text style={styles.identityTitle}>
            Remember Who You're Becoming
          </Text>
          <Text style={styles.identityText}>"{user.identity}"</Text>
        </View>

        {user.motivations?.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Motivations</Text>
            {user.motivations.map((m) => (
              <View key={m} style={styles.motivationRow}>
                <View style={styles.motivationDot} />
                <Text style={styles.motivationText}>
                  {m === 'health' && 'Better health'}
                  {m === 'money' && 'Save money'}
                  {m === 'family' && 'Family & loved ones'}
                  {m === 'fitness' && 'Fitness & athletics'}
                  {m === 'allah' && 'Get closer to Allah'}
                  {m === 'control' && 'Self-control & discipline'}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Stats</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Quit Date</Text>
            <Text style={styles.statValue}>{user.quitDate}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Vaping Duration</Text>
            <Text style={styles.statValue}>{user.vapingYears} years</Text>
          </View>
          {streak && (
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Current Streak</Text>
              <Text style={styles.statValue}>{streak.days} days</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 20, paddingBottom: 100 },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textBright,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  identityCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    marginBottom: 16,
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
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textBright,
    marginBottom: 14,
  },
  motivationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  motivationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.red,
  },
  motivationText: {
    color: Colors.text,
    fontSize: 15,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  statValue: {
    color: Colors.textBright,
    fontSize: 14,
    fontWeight: '600',
  },
  logoutBtn: {
    borderWidth: 1,
    borderColor: Colors.red,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutText: {
    color: Colors.red,
    fontSize: 16,
    fontWeight: '600',
  },
});
