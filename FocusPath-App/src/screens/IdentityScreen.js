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
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../utils/colors';
import { getSession, getUsers, saveUsers } from '../utils/storage';
import { SparkleIcon, CloseIcon } from '../components/Icons';

// AI Identity Generator
function generateIdentityFromAnswers(motivators, tenYearVision, nonNegotiables) {
  const m = motivators.map(s => s.toLowerCase());
  const vision = tenYearVision.trim();
  const nn = nonNegotiables;

  // Build opening based on motivators
  const parts = [];

  const hasFamily = m.some(x => x.includes('family') || x.includes('role model') || x.includes('children'));
  const hasFaith = m.some(x => x.includes('faith') || x.includes('allah'));
  const hasHealth = m.some(x => x.includes('health') || x.includes('fitness') || x.includes('longevity') || x.includes('energy'));
  const hasMoney = m.some(x => x.includes('money') || x.includes('career'));
  const hasMind = m.some(x => x.includes('mental') || x.includes('clarity') || x.includes('confidence') || x.includes('self-worth'));
  const hasDiscipline = m.some(x => x.includes('discipline') || x.includes('freedom') || x.includes('self-respect'));
  const hasRelationships = m.some(x => x.includes('relationship'));

  if (hasFaith) {
    parts.push('I want to become someone whose actions reflect my faith — someone who honours the body and mind that Allah has given me. I refuse to let nicotine stand between me and my Creator.');
  } else if (hasFamily) {
    parts.push('I want to become the kind of person my family can truly be proud of — someone who shows up fully for the people who matter most, not someone chained to a vape.');
  } else if (hasHealth) {
    parts.push('I want to become someone who takes their health seriously — someone who respects their body and treats it as the powerful instrument it is, free from the poison of nicotine.');
  } else if (hasMoney) {
    parts.push('I want to become someone who is financially free and mentally sharp — someone who invests in themselves and their future instead of burning money on a toxic habit.');
  } else if (hasMind) {
    parts.push('I want to become someone with a clear mind and unshakeable confidence — someone who doesn\'t need a chemical to feel okay, because they know their worth without it.');
  } else if (hasDiscipline) {
    parts.push('I want to become someone who is truly free — free from cravings, free from dependency, and free from the version of myself that chose comfort over growth.');
  } else {
    parts.push('I want to become someone who lives with purpose and intention — someone who has taken back control of their life and refuses to let addiction define them.');
  }

  // Add secondary motivator sentences
  if (hasHealth && !m[0]?.includes('health')) {
    parts.push('I want to breathe deeply without hesitation, to feel my lungs clean and strong, and to give my body the respect it deserves.');
  }
  if (hasDiscipline && !m[0]?.includes('discipline')) {
    parts.push('I want to prove to myself that I have the discipline to overcome anything — that my willpower is stronger than any craving.');
  }
  if (hasRelationships) {
    parts.push('I want to be fully present in my relationships — not stepping away to hit a vape, but being there, truly there, for the people I love.');
  }
  if (hasMind && !m[0]?.includes('mental')) {
    parts.push('I want mental clarity and the kind of confidence that comes from knowing I conquered one of the hardest battles — beating an addiction.');
  }

  // 10-year vision
  if (vision.length > 10) {
    parts.push(`In 10 years, I see myself ${vision.charAt(0).toLowerCase()}${vision.slice(1)}${vision.endsWith('.') ? '' : '.'} Every day without nicotine brings me one step closer to that reality.`);
  } else {
    parts.push('I see a future where I am free from addiction, living each day with clarity, energy, and purpose. Every choice I make today shapes the person I will be tomorrow.');
  }

  // Non-negotiables
  if (nn.length >= 1) {
    const nnFormatted = nn.map((n, i) => {
      if (i === nn.length - 1 && nn.length > 1) return `and ${n.toLowerCase()}`;
      return n.toLowerCase();
    }).join(nn.length > 2 ? ', ' : ' ');
    parts.push(`My non-negotiables are ${nnFormatted} — these are the things I will never sacrifice, no matter how hard it gets. Vaping has no place in the life I am building.`);
  }

  // Closing based on faith
  if (hasFaith) {
    parts.push('I want to stand before Allah knowing I did everything I could to honour the body He entrusted to me. This journey is not just about quitting — it is about becoming who I was always meant to be.');
  } else if (hasFamily) {
    parts.push('I want my family to see someone who fought for change and won — not someone controlled by nicotine. I choose to be the example, not the warning.');
  } else {
    parts.push('I choose discipline over comfort, growth over stagnation, and freedom over dependency. This is my journey, and I will see it through.');
  }

  return parts.join(' ');
}

function getWordCount(text) {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

function generateMantra(identityText, motivations) {
  const lower = identityText.toLowerCase();
  const mots = (motivations || []).map(m => m.toLowerCase());

  // Faith-based mantras
  if (mots.includes('allah') || lower.includes('allah') || lower.includes('faith') || lower.includes('deen')) {
    const options = [
      "I honour my body as a trust from Allah — I am free.",
      "My strength comes from Allah, and I choose to be clean.",
      "I am becoming who Allah created me to be — free and faithful.",
    ];
    return options[Math.floor(Math.random() * options.length)];
  }

  // Family-based mantras
  if (mots.includes('family') || lower.includes('family') || lower.includes('kids') || lower.includes('children')) {
    const options = [
      "I am the person my family deserves — strong, present, and free.",
      "I quit for them, I stay clean for me.",
      "My family sees a fighter, not an addict — that is who I am.",
    ];
    return options[Math.floor(Math.random() * options.length)];
  }

  // Health-based mantras
  if (mots.includes('health') || mots.includes('fitness') || lower.includes('health') || lower.includes('lungs') || lower.includes('body')) {
    const options = [
      "My body is my weapon — I refuse to poison it.",
      "Every breath I take clean makes me stronger than yesterday.",
      "I choose health over habit, strength over slavery.",
    ];
    return options[Math.floor(Math.random() * options.length)];
  }

  // Discipline / self-respect mantras
  if (mots.includes('control') || lower.includes('discipline') || lower.includes('self-respect') || lower.includes('control')) {
    const options = [
      "I am in control — no chemical decides my day.",
      "Discipline is my identity, freedom is my reward.",
      "I am stronger than any craving that comes my way.",
    ];
    return options[Math.floor(Math.random() * options.length)];
  }

  // Money/career mantras
  if (mots.includes('money') || lower.includes('money') || lower.includes('career') || lower.includes('success')) {
    const options = [
      "I invest in my future, not in my addiction.",
      "Every dollar saved from vaping builds the life I deserve.",
      "I am building wealth and health — nicotine gets neither.",
    ];
    return options[Math.floor(Math.random() * options.length)];
  }

  // Default mantras
  const defaults = [
    "I am becoming the person I was always meant to be — free.",
    "I choose who I become — and I choose freedom over addiction.",
    "Today I am stronger than yesterday, and tomorrow I will be unstoppable.",
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
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
  const [firstHabitCategory, setFirstHabitCategory] = useState('');
  const [firstHabitName, setFirstHabitName] = useState('');
  const [firstHabitTimer, setFirstHabitTimer] = useState('10');

  // AI Helper state
  const [showAiHelper, setShowAiHelper] = useState(false);
  const [aiMotivators, setAiMotivators] = useState([]);
  const [aiVision, setAiVision] = useState('');
  const [aiNonNegs, setAiNonNegs] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const wordCount = getWordCount(identity);

  const AI_MOTIVATOR_OPTIONS = [
    'Family', 'Health', 'Faith / Allah', 'Fitness', 'Money',
    'Career', 'Self-respect', 'Mental clarity', 'Confidence',
    'Discipline', 'Freedom', 'Longevity', 'Relationships',
    'Being a role model', 'Self-worth', 'Energy',
  ];

  const AI_NON_NEG_OPTIONS = [
    'My faith', 'My health', 'My family', 'My self-respect',
    'My mental peace', 'My integrity', 'My discipline',
    'My future', 'My body', 'My goals', 'My dignity',
    'My independence', 'My sobriety', 'My children',
    'My relationship with Allah', 'My word',
  ];

  function toggleAiMotivator(item) {
    setAiMotivators(prev =>
      prev.includes(item) ? prev.filter(m => m !== item) :
      prev.length < 3 ? [...prev, item] : prev
    );
  }

  function toggleAiNonNeg(item) {
    setAiNonNegs(prev =>
      prev.includes(item) ? prev.filter(n => n !== item) :
      prev.length < 3 ? [...prev, item] : prev
    );
  }

  function handleAiGenerate() {
    if (aiMotivators.length === 0) {
      Alert.alert('Hold on', 'Please select at least one motivator.');
      return;
    }
    if (aiNonNegs.length === 0) {
      Alert.alert('Hold on', 'Please select at least one non-negotiable.');
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      const result = generateIdentityFromAnswers(
        aiMotivators,
        aiVision,
        aiNonNegs
      );
      setIdentity(result);
      setIdentityValidation(null);
      setIsGenerating(false);
      setShowAiHelper(false);
    }, 1200);
  }

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
    if (!identity.trim() || !years) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (!firstHabitCategory || !firstHabitName.trim()) {
      Alert.alert('Error', 'Please choose a category and name for your first habit.');
      return;
    }

    // Validate identity text
    const validation = validateIdentityText(identity);
    if (!validation.valid) {
      setIdentityValidation(validation);
      Alert.alert('Hold on', validation.message);
      return;
    }

    // Generate 1-line mantra from identity
    const mantra = generateMantra(identity.trim(), selectedMotivations);

    const firstHabit = {
      name: firstHabitName.trim(),
      category: firstHabitCategory,
      timer: parseInt(firstHabitTimer) || 10,
      done: false,
    };

    const email = await getSession();
    const users = await getUsers();
    users[email] = {
      ...users[email],
      identity: identity.trim(),
      mantra,
      motivations: selectedMotivations,
      vapingYears: years,
      habits: [firstHabit],
      habitsDate: new Date().toDateString(),
      journeyStartDate: new Date().toISOString(),
      streakDays: 0,
      points: 0,
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

      {/* AI Helper Modal */}
      <Modal visible={showAiHelper} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContainer}>
            <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent} keyboardShouldPersistTaps="handled">
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>AI Identity Builder</Text>
                <TouchableOpacity onPress={() => setShowAiHelper(false)}>
                  <CloseIcon size={22} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalSubtitle}>Answer these 3 questions and AI will craft your identity statement.</Text>

              <Text style={styles.modalLabel}>1. What are your 3 main motivators?</Text>
              <Text style={styles.modalHint}>Select up to 3 ({aiMotivators.length}/3)</Text>
              <View style={styles.chipGrid}>
                {AI_MOTIVATOR_OPTIONS.map(item => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.chip, aiMotivators.includes(item) && styles.chipActive]}
                    onPress={() => toggleAiMotivator(item)}
                  >
                    <Text style={[styles.chipText, aiMotivators.includes(item) && styles.chipTextActive]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>2. Where do you see yourself in 10 years?</Text>
              <Text style={styles.modalHint}>Describe the life you want to be living</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                placeholder="e.g. Living healthy, running my own business, being a great father..."
                placeholderTextColor={Colors.textMuted}
                value={aiVision}
                onChangeText={setAiVision}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.modalLabel}>3. What are your 3 non-negotiables?</Text>
              <Text style={styles.modalHint}>Things you will never sacrifice ({aiNonNegs.length}/3)</Text>
              <View style={styles.chipGrid}>
                {AI_NON_NEG_OPTIONS.map(item => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.chip, aiNonNegs.includes(item) && styles.chipActive]}
                    onPress={() => toggleAiNonNeg(item)}
                  >
                    <Text style={[styles.chipText, aiNonNegs.includes(item) && styles.chipTextActive]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.aiGenerateBtn} onPress={handleAiGenerate} disabled={isGenerating}>
                {isGenerating ? (
                  <View style={styles.aiGeneratingRow}>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.aiGenerateBtnText}>  AI is writing your identity...</Text>
                  </View>
                ) : (
                  <Text style={styles.aiGenerateBtnText}>Generate My Identity</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <View style={styles.card}>
        <Text style={styles.label}>Who do you want to become?</Text>
        <Text style={styles.hint}>Write at least 50 words about the person you want to be.</Text>

        <TouchableOpacity style={styles.aiHelperBtn} onPress={() => setShowAiHelper(true)}>
          <SparkleIcon size={18} color={Colors.red} />
          <Text style={styles.aiHelperText}>Need help? Let AI build your identity</Text>
        </TouchableOpacity>

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

        <Text style={styles.label}>Choose your first daily habit</Text>
        <Text style={styles.hint}>
          Replace vaping with one positive habit. You'll unlock more habits as you progress.
        </Text>

        <Text style={[styles.hint, { marginTop: 8, marginBottom: 4 }]}>Category</Text>
        <View style={styles.optionGrid}>
          {[
            { key: 'physical', label: 'Physical' },
            { key: 'spiritual', label: 'Spiritual' },
            { key: 'mental', label: 'Mental' },
          ].map(cat => (
            <TouchableOpacity
              key={cat.key}
              style={[styles.optionBtn, firstHabitCategory === cat.key && styles.optionBtnActive]}
              onPress={() => setFirstHabitCategory(cat.key)}
            >
              <Text style={[styles.optionText, firstHabitCategory === cat.key && styles.optionTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.hint, { marginTop: 12, marginBottom: 4 }]}>What habit?</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Read Quran, Go for a run, Journal..."
          placeholderTextColor={Colors.textMuted}
          value={firstHabitName}
          onChangeText={setFirstHabitName}
        />

        <Text style={[styles.hint, { marginTop: 12, marginBottom: 4 }]}>Timer (minutes)</Text>
        <TextInput
          style={[styles.input, { width: 100 }]}
          placeholder="10"
          placeholderTextColor={Colors.textMuted}
          value={firstHabitTimer}
          onChangeText={setFirstHabitTimer}
          keyboardType="number-pad"
        />

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
  // AI Helper Button
  aiHelperBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.3)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  aiHelperIcon: {
    fontSize: 18,
    color: Colors.red,
  },
  aiHelperText: {
    color: Colors.redLight,
    fontSize: 14,
    fontWeight: '600',
  },
  // AI Helper Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    maxHeight: '90%',
  },
  modalScroll: {
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalScrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textBright,
  },
  modalClose: {
    fontSize: 22,
    color: Colors.textMuted,
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  modalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textBright,
    marginTop: 16,
    marginBottom: 4,
  },
  modalHint: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: Colors.bgInput,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    color: Colors.text,
    fontSize: 15,
    marginBottom: 8,
  },
  modalTextArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  chip: {
    backgroundColor: Colors.bgInput,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  chipActive: {
    backgroundColor: Colors.red,
    borderColor: Colors.red,
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  aiGenerateBtn: {
    backgroundColor: Colors.red,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  aiGeneratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiGenerateBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
