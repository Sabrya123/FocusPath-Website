import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors } from '../utils/colors';
import { validateHabitCategory } from '../utils/habitValidator';

const CATEGORIES = [
  { key: 'physical', label: 'Physical', icon: '💪', desc: 'Exercise, sports, health' },
  { key: 'spiritual', label: 'Spiritual', icon: '🤲', desc: 'Prayer, Quran, meditation' },
  { key: 'mental', label: 'Mental', icon: '🧠', desc: 'Reading, learning, journaling' },
];

const TIMER_OPTIONS = [
  { label: '5 min', value: 5 },
  { label: '10 min', value: 10 },
  { label: '15 min', value: 15 },
  { label: '20 min', value: 20 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '60 min', value: 60 },
  { label: 'No timer', value: 0 },
];

export default function AddHabitScreen({ navigation, route }) {
  const [category, setCategory] = useState(null);
  const [habitName, setHabitName] = useState('');
  const [timer, setTimer] = useState(null);
  const [validating, setValidating] = useState(false);
  const [mismatchMsg, setMismatchMsg] = useState('');

  const onAdd = route.params?.onAdd;

  async function handleSubmit() {
    if (!category) {
      Alert.alert('Select a Category', 'Choose Physical, Spiritual, or Mental.');
      return;
    }
    if (!habitName.trim()) {
      Alert.alert('Enter a Habit', 'Type what habit you want to build.');
      return;
    }
    if (timer === null) {
      Alert.alert('Set a Timer', 'Choose how long you want to do this habit daily.');
      return;
    }

    setValidating(true);
    setMismatchMsg('');

    const validation = validateHabitCategory(habitName.trim(), category);

    if (!validation.valid) {
      setMismatchMsg(validation.message);
      setValidating(false);
      return;
    }

    // All good — add the habit
    const newHabit = {
      name: habitName.trim(),
      category,
      timer,
      done: false,
    };

    if (onAdd) {
      onAdd(newHabit);
    }
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>New Habit</Text>
            <View style={styles.backBtn} />
          </View>

          {/* Step 1: Category */}
          <Text style={styles.stepLabel}>What kind of habit do you want to build?</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.categoryCard,
                  category === cat.key && styles.categoryCardActive,
                ]}
                onPress={() => {
                  setCategory(cat.key);
                  setMismatchMsg('');
                }}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text style={[
                  styles.categoryLabel,
                  category === cat.key && styles.categoryLabelActive,
                ]}>
                  {cat.label}
                </Text>
                <Text style={styles.categoryDesc}>{cat.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Step 2: Habit name */}
          <Text style={styles.stepLabel}>What's the habit?</Text>
          <TextInput
            style={styles.input}
            placeholder={
              category === 'physical' ? 'e.g., Run 1 mile, Do 20 pushups' :
              category === 'spiritual' ? 'e.g., Read Quran, Pray on time' :
              category === 'mental' ? 'e.g., Read 10 pages, Journal' :
              'e.g., Describe your habit'
            }
            placeholderTextColor={Colors.textMuted}
            value={habitName}
            onChangeText={(text) => {
              setHabitName(text);
              setMismatchMsg('');
            }}
            autoCorrect={false}
          />

          {/* Mismatch warning */}
          {mismatchMsg ? (
            <View style={styles.mismatchBanner}>
              <Text style={styles.mismatchText}>⚠️ {mismatchMsg}</Text>
            </View>
          ) : null}

          {/* Step 3: Timer */}
          <Text style={styles.stepLabel}>Set a daily timer</Text>
          <View style={styles.timerGrid}>
            {TIMER_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.timerChip,
                  timer === opt.value && styles.timerChipActive,
                ]}
                onPress={() => setTimer(opt.value)}
              >
                <Text style={[
                  styles.timerChipText,
                  timer === opt.value && styles.timerChipTextActive,
                ]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom timer input */}
          <View style={styles.customTimerRow}>
            <Text style={styles.customTimerLabel}>Or custom:</Text>
            <TextInput
              style={styles.customTimerInput}
              placeholder="min"
              placeholderTextColor={Colors.textMuted}
              keyboardType="number-pad"
              onChangeText={(val) => {
                const num = parseInt(val, 10);
                if (!isNaN(num) && num > 0) {
                  setTimer(num);
                }
              }}
            />
            <Text style={styles.customTimerLabel}>minutes</Text>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, validating && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={validating}
          >
            <Text style={styles.submitBtnText}>
              {validating ? 'Checking...' : 'Add Habit'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 20, paddingBottom: 60 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backBtn: { width: 60 },
  backText: {
    color: Colors.redLight,
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textBright,
    textAlign: 'center',
  },

  stepLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textBright,
    marginTop: 20,
    marginBottom: 12,
  },

  // Categories
  categoryGrid: {
    gap: 10,
  },
  categoryCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    padding: 18,
    borderWidth: 2,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  categoryCardActive: {
    borderColor: Colors.red,
    backgroundColor: '#1a0a0a',
  },
  categoryIcon: {
    fontSize: 28,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  categoryLabelActive: {
    color: Colors.redLight,
  },
  categoryDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    flex: 1,
    textAlign: 'right',
  },

  // Input
  input: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    color: Colors.text,
    fontSize: 16,
  },

  // Mismatch
  mismatchBanner: {
    backgroundColor: '#1a1a0a',
    borderRadius: 10,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#3a3a1a',
  },
  mismatchText: {
    color: Colors.yellow,
    fontSize: 14,
    lineHeight: 20,
  },

  // Timer
  timerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timerChip: {
    backgroundColor: Colors.bgCard,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timerChipActive: {
    borderColor: Colors.red,
    backgroundColor: '#1a0a0a',
  },
  timerChipText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  timerChipTextActive: {
    color: Colors.redLight,
  },

  // Custom timer
  customTimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  customTimerLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  customTimerInput: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    color: Colors.text,
    fontSize: 16,
    width: 70,
    textAlign: 'center',
  },

  // Submit
  submitBtn: {
    backgroundColor: Colors.red,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 30,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
