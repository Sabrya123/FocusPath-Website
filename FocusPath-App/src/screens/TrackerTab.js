import React, { useState, useCallback } from 'react';
import { ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../utils/colors';
import { getCurrentUser, getStreakInfo } from '../utils/storage';
import StreakRing from '../components/StreakRing';

export default function TrackerTab() {
  const [streak, setStreak] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    const user = await getCurrentUser();
    if (user?.quitDate) {
      setStreak(getStreakInfo(user.quitDate));
    }
  }

  if (!streak) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <StreakRing
          days={streak.days}
          hours={streak.hours}
          weeks={streak.weeks}
          progress={streak.progress}
          message={streak.message}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
});
