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
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../utils/colors';
import { getSession, getUsers, saveUsers } from '../utils/storage';

function getWordCount(text) {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

// Profanity / inappropriate content filter
const BLOCKED_WORDS = [
  'fuck', 'shit', 'ass', 'bitch', 'damn', 'hell', 'dick', 'pussy', 'cock',
  'cunt', 'bastard', 'slut', 'whore', 'nigga', 'nigger', 'fag', 'retard',
  'kill', 'murder', 'suicide', 'die ', 'death', 'hate', 'destroy', 'weapon',
  'drug', 'weed', 'cocaine', 'heroin', 'meth', 'drunk', 'alcohol', 'beer',
  'wine', 'liquor', 'porn', 'sex', 'naked', 'nude',
];

// Negative / toxic sentiment patterns
const NEGATIVE_PATTERNS = [
  /i\s+(don'?t|dont)\s+care/i,
  /this\s+is\s+(stupid|dumb|trash|garbage|waste)/i,
  /i\s+(hate|despise)\s/i,
  /who\s+cares/i,
  /doesn'?t\s+matter/i,
  /whatever/i,
  /leave\s+me\s+alone/i,
  /shut\s+up/i,
  /go\s+away/i,
  /none\s+of\s+your\s+business/i,
  /not\s+your\s+(business|concern)/i,
  /mind\s+your\s+own/i,
  /waste\s+of\s+time/i,
  /don'?t\s+want\s+to/i,
  /forced\s+to/i,
];

function validateIdentityText(text) {
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);

  // Check minimum word count
  if (words.length < 50) {
    return { valid: false, message: `You need at least 50 words. You have ${words.length} so far.` };
  }

  // Check for profanity / inappropriate content
  const lower = text.toLowerCase();
  for (const bad of BLOCKED_WORDS) {
    if (lower.includes(bad)) {
      return { valid: false, message: "Your response contains inappropriate language. Please keep it clean and positive — this is about who you want to become." };
    }
  }

  // Check for negative / toxic sentiment
  for (const pattern of NEGATIVE_PATTERNS) {
    if (pattern.test(text)) {
      return { valid: false, message: "Your response seems negative or dismissive. This is your chance to envision your best self — try to write something positive and meaningful." };
    }
  }

  // Check it's not just random/repeated words
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  if (uniqueWords.size < words.length * 0.35) {
    return { valid: false, message: "It looks like you're repeating the same words. Please write something meaningful about who you want to become." };
  }

  // Check for gibberish - words should have vowels
  const gibberishCount = words.filter(w => {
    const cleaned = w.toLowerCase().replace(/[^a-z]/g, '');
    return cleaned.length > 2 && !/[aeiou]/i.test(cleaned);
  }).length;
  if (gibberishCount > words.length * 0.3) {
    return { valid: false, message: "Some of what you wrote doesn't seem to make sense. Please write a clear paragraph about who you want to become." };
  }

  // Check for spam / lazy text (same character repeated, keyboard smashing)
  if (/(.)\1{4,}/.test(text)) {
    return { valid: false, message: "Please write a real response — no repeated characters or keyboard smashing." };
  }

  // Check for copy-paste of numbers or random characters
  const letterRatio = (text.match(/[a-zA-Z]/g) || []).length / text.length;
  if (letterRatio < 0.6) {
    return { valid: false, message: "Your response has too many numbers or symbols. Write naturally about who you want to become." };
  }

  // Check for relevant content - must mention personal growth / identity topics
  const relevantKeywords = ['i ', 'me ', 'my ', 'want', 'become', 'person', 'better', 'life',
    'health', 'strong', 'discipline', 'quit', 'stop', 'free', 'family', 'future', 'goal',
    'change', 'improve', 'grow', 'faith', 'allah', 'god', 'body', 'mind', 'clean',
    'happy', 'peace', 'success', 'respect', 'love', 'care', 'breath', 'lung', 'fit',
    'money', 'save', 'proud', 'confident', 'energy', 'sport', 'gym', 'pray', 'focus',
    'control', 'myself', 'overcome', 'addiction', 'vape', 'smoke', 'nicotine',
    'purpose', 'dream', 'achieve', 'strength', 'courage', 'hope', 'inspire',
    'resilient', 'determined', 'brave', 'capable', 'worthy', 'deserve',
    'heal', 'recover', 'transform', 'restart', 'new', 'begin', 'journey',
    'responsible', 'mature', 'independent', 'leader', 'role model', 'example'];
  const matchCount = relevantKeywords.filter(kw => lower.includes(kw)).length;

  if (matchCount < 3) {
    return { valid: false, message: "Your response doesn't seem to be about personal growth or your quitting journey. Tell us about who you truly want to become and why it matters to you." };
  }

  // Check sentence structure - needs proper sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);
  if (sentences.length < 3) {
    return { valid: false, message: "Write at least 3 proper sentences describing your vision for yourself." };
  }

  // Check average word length (gibberish tends to have weird lengths)
  const avgWordLen = words.reduce((sum, w) => sum + w.length, 0) / words.length;
  if (avgWordLen < 2.5 || avgWordLen > 12) {
    return { valid: false, message: "Something seems off with your writing. Please write naturally about who you want to become." };
  }

  return { valid: true, message: "Your vision is powerful and clear. Let's make it happen." };
}

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
  const [identityValidation, setIdentityValidation] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [selectedMotivations, setSelectedMotivations] = useState([]);
  const [years, setYears] = useState('');
  const [quitDate, setQuitDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const wordCount = getWordCount(identity);

  function toggleMotivation(key) {
    setSelectedMotivations((prev) =>
      prev.includes(key) ? prev.filter((m) => m !== key) : [...prev, key]
    );
  }

  function handleValidateIdentity() {
    setIsValidating(true);
    // Small delay to simulate AI checking
    setTimeout(() => {
      const result = validateIdentityText(identity);
      setIdentityValidation(result);
      setIsValidating(false);
    }, 800);
  }

  async function handleSubmit() {
    const quitDateStr = quitDate.toISOString().split('T')[0];
    if (!identity.trim() || !years || !quitDateStr) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    // Validate identity text
    const validation = validateIdentityText(identity);
    if (!validation.valid) {
      setIdentityValidation(validation);
      Alert.alert('Hold on', validation.message);
      return;
    }

    const email = await getSession();
    const users = await getUsers();
    users[email] = {
      ...users[email],
      identity: identity.trim(),
      motivations: selectedMotivations,
      vapingYears: years,
      quitDate: quitDateStr,
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
        <Text style={styles.hint}>Write at least 50 words about the person you want to be.</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="e.g. I want to become a healthier, more disciplined version of myself. Someone who doesn't rely on nicotine to get through the day..."
          placeholderTextColor={Colors.textMuted}
          value={identity}
          onChangeText={(text) => {
            setIdentity(text);
            setIdentityValidation(null);
          }}
          multiline
          numberOfLines={5}
        />
        <View style={styles.wordCountRow}>
          <Text style={[styles.wordCount, wordCount >= 50 ? styles.wordCountGood : styles.wordCountBad]}>
            {wordCount}/50 words
          </Text>
          {wordCount >= 50 && !identityValidation && (
            <TouchableOpacity style={styles.validateBtn} onPress={handleValidateIdentity}>
              {isValidating ? (
                <ActivityIndicator size="small" color={Colors.red} />
              ) : (
                <Text style={styles.validateBtnText}>✓ Check with AI</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
        {identityValidation && (
          <View style={[styles.validationBox, identityValidation.valid ? styles.validationGood : styles.validationBad]}>
            <Text style={styles.validationIcon}>{identityValidation.valid ? '✓' : '✗'}</Text>
            <Text style={[styles.validationText, identityValidation.valid ? styles.validationTextGood : styles.validationTextBad]}>
              {identityValidation.message}
            </Text>
          </View>
        )}

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
              >
                {selectedMotivations.includes(m.key) && (
                  <Text style={styles.checkMark}>✓</Text>
                )}
              </View>
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
        {Platform.OS === 'ios' ? (
          <DateTimePicker
            value={quitDate}
            mode="date"
            display="spinner"
            onChange={(event, date) => { if (date) setQuitDate(date); }}
                        style={styles.datePicker}
            textColor={Colors.textBright}
            themeVariant="dark"
          />
        ) : (
          <>
            <TouchableOpacity
              style={styles.dateBtn}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateBtnText}>
                {quitDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={quitDate}
                mode="date"
                display="default"
                                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) setQuitDate(date);
                }}
              />
            )}
          </>
        )}

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
    minHeight: 120,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
    marginBottom: 8,
  },
  wordCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  wordCount: {
    fontSize: 13,
    fontWeight: '600',
  },
  wordCountGood: {
    color: '#22c55e',
  },
  wordCountBad: {
    color: Colors.textMuted,
  },
  validateBtn: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderWidth: 1,
    borderColor: Colors.red,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  validateBtnText: {
    color: Colors.red,
    fontSize: 13,
    fontWeight: '600',
  },
  validationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    gap: 8,
  },
  validationGood: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  validationBad: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },
  validationIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textBright,
  },
  validationText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  validationTextGood: {
    color: '#22c55e',
  },
  validationTextBad: {
    color: Colors.redLight,
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
    backgroundColor: Colors.red,
    borderColor: Colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
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
  datePicker: {
    height: 150,
    marginTop: 4,
  },
  dateBtn: {
    backgroundColor: Colors.bgInput,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 14,
  },
  dateBtnText: {
    color: Colors.text,
    fontSize: 16,
  },
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
