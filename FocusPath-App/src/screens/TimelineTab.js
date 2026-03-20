import React, { useState, useCallback } from 'react';
import { ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../utils/colors';
import { getCurrentUser, getStreakInfo } from '../utils/storage';
import TimelineList from '../components/TimelineList';

export default function TimelineTab() {
  const [days, setDays] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    const user = await getCurrentUser();
    if (user?.quitDate) {
      const streak = getStreakInfo(user.quitDate);
      setDays(streak.days);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <TimelineList currentDays={days} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 20, paddingBottom: 40 },
});
