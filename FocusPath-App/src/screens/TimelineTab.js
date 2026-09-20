import React, { useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../utils/colors';
import { useUser, useStreak } from '../context/UserContext';
import TimelineList from '../components/TimelineList';

export default function TimelineTab() {
  const { user, refresh } = useUser();
  const streak = useStreak();

  // The day count is measured against the clock, so returning to this screen
  // has to recompute it rather than reuse what was rendered before.
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <TimelineList
          currentDays={streak?.days || 0}
          vapingYears={user?.vapingYears || '<1'}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 20, paddingBottom: 100 },
});
