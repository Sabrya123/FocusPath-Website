import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Colors } from '../utils/colors';
import { getSession, getUsers, saveUsers } from '../utils/storage';

const MOTIVATIONS = [
  { key: 'health', label: 'Better health' },
  { key: 'money', label: 'Save money' },
  { key: 'family', label: 'Family & loved ones' },
  { key: 'fitness', label: 'Fitness & athletics' },
  { key: 'allah', label: 'Get closer to Allah' },
  { key: 'control', label: 'Self-control & discipline' },
];

const YEARS_OPTIONS = [
  { key: '<1', label: 'Less than 1 year' },
  { key: '1-2', label: '1-2 years' },
  { key: '2-3', label: '2-3 years' },
  { key: '3+', label: '3+ years' },
];

export default function IdentityScreen({ navigation }) {
  const [identity, setIdentity] = useState('');
  const [selectedMotivations, setSelectedMotivations] = useState([]);
  const [years, setYears] = useState('');
  const [quitDate, setQuitDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  function toggleMotivation(key) {
    setSelectedMotivations((prev) =>
      prev.includes(key) ? prev.filter((m) => m !== key) : [...prev, key]
    );
  }

  async function handleSubmit() {
    if (!identity.trim() || !years || !quitDate) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const email = await getSession();
    const users = await getUsers();
    users[email] = {
      ...users[email],
      identity: identity.trim(),
      motivations: selectedMotivations,
      vapingYears: years,
      quitDate,
    };
    await saveUsers(users);
    navigation.replace('Dashboard');
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Who Do You Want to Be?</Text>
      <Text style={styles.subtitle}>
        Tell us about the person you're becoming. This helps us personalise your
        journey.
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Who do you want to become?</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="e.g. A healthier, more disciplined version of myself..."
          placeholderTextColor={Colors.textMuted}
          value={identity}
          onChangeText={setIdentity}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>What motivates you to quit?</Text>
        <View style={styles.checkboxGrid}>
          {MOTIVATIONS.map((m) => (
            <TouchableOpacity
              key={m.key}
              style={[
                styles.checkbox,
                selectedMotivations.includes(m.key) && styles.checkboxActive,
              ]}
              onPress={() => toggleMotivation(m.key)}
            >
              <View
                style={[
                  styles.checkDot,
                  selectedMotivations.includes(m.key) && styles.checkDotActive,
                ]}
              />
              <Text
                style={[
                  styles.checkboxText,
                  selectedMotivations.includes(m.key) &&
                    styles.checkboxTextActive,
                ]}
              >
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>How long have you been vaping?</Text>
        <View style={styles.optionGrid}>
          {YEARS_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.optionBtn,
                years === opt.key && styles.optionBtnActive,
              ]}
              onPress={() => setYears(opt.key)}
            >
              <Text
                style={[
                  styles.optionText,
                  years === opt.key && styles.optionTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>
          When did you quit (or when do you want to start)?
        </Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={Colors.textMuted}
          value={quitDate}
          onChangeText={setQuitDate}
          keyboardType={Platform.OS === 'ios' ? 'default' : 'default'}
        />
        <Text style={styles.hint}>
          Format: YYYY-MM-DD (e.g. 2026-03-19)
        </Text>

        <TouchableOpacity style={styles.btnPrimary} onPress={handleSubmit}>
          <Text style={styles.btnPrimaryText}>Begin My Journey</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textBright,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
    marginTop: 18,
  },
  input: {
    backgroundColor: Colors.bgInput,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 14,
    color: Colors.text,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
  checkboxGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgInput,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 8,
  },
  checkboxActive: {
    borderColor: Colors.redLight,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
  },
  checkDot: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  checkDotActive: {
    backgroundColor: Colors.blue,
    borderColor: Colors.red,
  },
  checkboxText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  checkboxTextActive: {
    color: Colors.textBright,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionBtn: {
    backgroundColor: Colors.bgInput,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  optionBtnActive: {
    borderColor: Colors.red,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  optionText: { color: Colors.textSecondary, fontSize: 14 },
  optionTextActive: { color: Colors.redLight, fontWeight: '600' },
  btnPrimary: {
    backgroundColor: Colors.red,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 28,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
