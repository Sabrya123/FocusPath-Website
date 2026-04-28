import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../utils/colors';
import { getSession, getUsers, saveUsers } from '../utils/storage';

const PROMPTS = [
  "What you took from me...",
  "Why I'm done with you...",
  "Who I'm becoming without you...",
  "The lies you told me...",
  "What I'll spend my breath on now...",
];

const STARTER_TEMPLATE =
  "Dear vape,\n\nFor too long I let you control me. You took my breath, my money, and pieces of who I want to be. Today I'm taking it all back.\n\n";

const BLOCKED_WORDS = [
  'fuck', 'shit', 'bitch', 'cunt', 'dick', 'pussy', 'cock', 'nigga', 'nigger',
  'fag', 'retard', 'kill myself', 'suicide',
];

function getWordCount(text) {
  return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
}

function validateLetter(text) {
  const words = text.trim().split(/\s+/).filter((w) => w.length > 0);

  if (words.length < 30) {
    return {
      valid: false,
      message: `Your letter needs at least 30 words. You have ${words.length}.`,
    };
  }

  const lower = text.toLowerCase();
  for (const bad of BLOCKED_WORDS) {
    if (lower.includes(bad)) {
      return {
        valid: false,
        message: 'Please keep the language clean. This letter is for you, not against yourself.',
      };
    }
  }

  if (/(.)\1{4,}/.test(text)) {
    return {
      valid: false,
      message: 'Please write a real letter — no keyboard smashing.',
    };
  }

  const uniqueWords = new Set(words.map((w) => w.toLowerCase()));
  if (uniqueWords.size < words.length * 0.4) {
    return {
      valid: false,
      message: "It looks like you're repeating words. Write something honest from your heart.",
    };
  }

  const letterRatio = (text.match(/[a-zA-Z]/g) || []).length / text.length;
  if (letterRatio < 0.6) {
    return {
      valid: false,
      message: 'Too many numbers or symbols. Write a real letter.',
    };
  }

  return {
    valid: true,
    message: 'This is the moment everything changes. You are ready.',
  };
}

export default function GoodbyeLetterScreen({ navigation }) {
  const [letter, setLetter] = useState('');
  const [validation, setValidation] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const wordCount = getWordCount(letter);

  function handleUseTemplate() {
    if (letter.trim().length > 0) {
      Alert.alert(
        'Replace your letter?',
        'This will overwrite what you have written so far.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Replace',
            style: 'destructive',
            onPress: () => {
              setLetter(STARTER_TEMPLATE);
              setValidation(null);
            },
          },
        ]
      );
    } else {
      setLetter(STARTER_TEMPLATE);
      setValidation(null);
    }
  }

  function handleCheck() {
    setIsValidating(true);
    setTimeout(() => {
      const result = validateLetter(letter);
      setValidation(result);
      setIsValidating(false);
    }, 600);
  }

  async function handleSubmit() {
    const result = validateLetter(letter);
    if (!result.valid) {
      setValidation(result);
      Alert.alert('Hold on', result.message);
      return;
    }

    setIsSaving(true);
    try {
      const email = await getSession();
      const users = await getUsers();
      users[email] = {
        ...users[email],
        goodbyeLetter: letter.trim(),
        goodbyeLetterDate: new Date().toISOString(),
      };
      await saveUsers(users);
      navigation.replace('Dashboard');
    } catch (e) {
      setIsSaving(false);
      Alert.alert('Error', 'Could not save your letter. Please try again.');
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.eyebrow}>One last thing</Text>
      <Text style={styles.title}>Say Goodbye</Text>
      <Text style={styles.subtitle}>
        Write a goodbye letter to your vape. Tell it what it took from you, why
        you're done, and who you're becoming without it. This is the moment you
        take back control.
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Your letter</Text>
        <Text style={styles.hint}>At least 30 words. Speak from the heart.</Text>

        <TouchableOpacity style={styles.templateBtn} onPress={handleUseTemplate}>
          <Text style={styles.templateBtnText}>Use a starter template</Text>
        </TouchableOpacity>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={"Dear vape,\n\nYou took my mornings, my breath, and my focus. Today I'm taking them back..."}
          placeholderTextColor={Colors.textMuted}
          value={letter}
          onChangeText={(text) => {
            setLetter(text);
            setValidation(null);
          }}
          multiline
          numberOfLines={10}
          textAlignVertical="top"
        />

        <View style={styles.wordCountRow}>
          <Text
            style={[
              styles.wordCount,
              wordCount >= 30 ? styles.wordCountGood : styles.wordCountBad,
            ]}
          >
            {wordCount}/30 words
          </Text>
          {wordCount >= 30 && !validation && (
            <TouchableOpacity style={styles.validateBtn} onPress={handleCheck}>
              {isValidating ? (
                <ActivityIndicator size="small" color={Colors.red} />
              ) : (
                <Text style={styles.validateBtnText}>✓ Check letter</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {validation && (
          <View
            style={[
              styles.validationBox,
              validation.valid ? styles.validationGood : styles.validationBad,
            ]}
          >
            <Text style={styles.validationIcon}>
              {validation.valid ? '✓' : '✗'}
            </Text>
            <Text
              style={[
                styles.validationText,
                validation.valid
                  ? styles.validationTextGood
                  : styles.validationTextBad,
              ]}
            >
              {validation.message}
            </Text>
          </View>
        )}

        <Text style={[styles.label, { marginTop: 24 }]}>Stuck? Try one of these</Text>
        <View style={styles.promptList}>
          {PROMPTS.map((p) => (
            <View key={p} style={styles.promptRow}>
              <View style={styles.promptDot} />
              <Text style={styles.promptText}>{p}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.btnPrimary, isSaving && styles.btnPrimaryDisabled]}
          onPress={handleSubmit}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.btnPrimaryText}>Send Letter & Begin</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footnote}>
          Your letter is saved on your device. You can revisit it anytime in your
          profile.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  eyebrow: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.red,
    textAlign: 'center',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.textBright,
    textAlign: 'center',
    marginBottom: 10,
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
  },
  hint: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
    marginBottom: 8,
  },
  templateBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(91, 168, 200, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(91, 168, 200, 0.3)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  templateBtnText: {
    color: Colors.redLight,
    fontSize: 13,
    fontWeight: '600',
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
    minHeight: 200,
    textAlignVertical: 'top',
    lineHeight: 22,
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
    backgroundColor: 'rgba(91, 168, 200, 0.1)',
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
  promptList: {
    gap: 10,
    marginTop: 4,
  },
  promptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  promptDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.red,
  },
  promptText: {
    color: Colors.textSecondary,
    fontSize: 14,
    flex: 1,
  },
  btnPrimary: {
    backgroundColor: Colors.red,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 28,
  },
  btnPrimaryDisabled: {
    opacity: 0.6,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  footnote: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
});
