import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../utils/colors';
import { getCurrentUser, getDayOfYear } from '../utils/storage';
import { NEGATIVE_FACTS, POSITIVE_FACTS, ALLAH_REMINDERS } from '../data/facts';
import FactCard from '../components/FactCard';

export default function FactsTab() {
  const [user, setUser] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [])
  );

  async function loadUser() {
    const u = await getCurrentUser();
    setUser(u);
  }

  const dayOfYear = getDayOfYear();
  const negFact = NEGATIVE_FACTS[dayOfYear % NEGATIVE_FACTS.length];
  const posFact = POSITIVE_FACTS[dayOfYear % POSITIVE_FACTS.length];
  const hasAllah = user?.motivations?.includes('allah');
  const allahReminder = hasAllah
    ? ALLAH_REMINDERS[dayOfYear % ALLAH_REMINDERS.length]
    : null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Daily Facts</Text>
        <Text style={styles.subtitle}>New facts every day to keep you informed</Text>

        <FactCard type="negative" title="Daily Vaping Fact" text={negFact} />
        <FactCard type="positive" title="Daily Quitting Win" text={posFact} />

        {hasAllah && (
          <View style={styles.allahCard}>
            <Text style={styles.allahIcon}>🕌</Text>
            <Text style={styles.allahTitle}>DAILY REMINDER</Text>
            <Text style={styles.allahText}>{allahReminder}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 20, paddingBottom: 40 },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textBright,
    marginBottom: 4,
  },
  subtitle: {
    color: Colors.textSecondary,
    marginBottom: 20,
    fontSize: 14,
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
});
