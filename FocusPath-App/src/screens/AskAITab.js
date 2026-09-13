import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../utils/colors';
import { supabase, ensureSupabaseSession } from '../utils/supabase';
import { getCurrentUser, getStreakInfo } from '../utils/storage';
import ProfileButton from '../components/ProfileButton';

// Things the coach can't know from the server: habits, identity, and how often
// they've hit the Emergency button. The server reads points/streak itself so a
// modified client can't inflate them.
async function buildLocalContext() {
  try {
    const user = await getCurrentUser();
    if (!user) return {};
    const streak = user.quitDate ? getStreakInfo(user.quitDate) : null;
    return {
      rank: user.rank,
      longestStreak: user.longestStreak,
      identity: user.identity,
      habits: Array.isArray(user.habits)
        ? user.habits.map((h) => ({ name: h.name, done: h.completedThisWeek, target: h.target }))
        : undefined,
      emergencyPresses7d: user.emergencyPresses7d,
      currentStreak: streak?.days,
    };
  } catch {
    return {};
  }
}

// The tab bar floats over the screen (position: absolute in App.js), so the
// composer has to sit above it — 16 float gap + 60 bar + the raised Emergency
// button — or the text box ends up hidden behind it.
const TAB_BAR_CLEARANCE = 104;

const STARTERS = [
  "I'm craving right now",
  'Why do I feel so irritable?',
  'I slipped yesterday',
  'How long until this gets easier?',
];

export default function AskAITab() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const listRef = useRef(null);

  // With the keyboard up the tab bar is covered anyway, so drop the clearance
  // and let the composer sit right on top of the keyboard.
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, () => setKeyboardOpen(true));
    const hide = Keyboard.addListener(hideEvent, () => setKeyboardOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      setError(null);
    }, [])
  );

  async function send(text) {
    const question = (text ?? input).trim();
    if (!question || sending) return;

    setInput('');
    setError(null);
    setSending(true);

    // Snapshot the history BEFORE adding this turn — the server appends the
    // question itself, so sending it twice would duplicate it.
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, { id: `u${Date.now()}`, role: 'user', content: question }]);

    try {
      // The coach reads this user's row server-side, so it needs a real
      // Supabase session — without one it can only answer "Not signed in."
      const { error: authError } = await ensureSupabaseSession();
      if (authError) throw new Error(authError);

      const local = await buildLocalContext();
      const { data, error: fnError } = await supabase.functions.invoke('coach', {
        body: { mode: 'ask', question, history, local },
      });

      // On a non-2xx, supabase-js throws FunctionsHttpError whose message is
      // just "Edge Function returned a non-2xx status code" — the useful
      // message is in the response body, so read it before giving up.
      if (fnError) {
        let detail = fnError.message;
        const res = fnError.context;
        if (res && typeof res.json === 'function') {
          try {
            const parsed = await res.json();
            if (parsed?.error) detail = parsed.error;
          } catch {
            /* body wasn't JSON — keep the generic message */
          }
        }
        throw new Error(detail);
      }
      if (data?.error) throw new Error(data.error);

      setMessages((prev) => [
        ...prev,
        {
          id: `a${Date.now()}`,
          role: 'assistant',
          content: data?.reply ?? 'No answer came back. Try again.',
          crisis: !!data?.crisis,
        },
      ]);
    } catch (e) {
      setError(e?.message || 'Could not reach the coach. Check your connection.');
    } finally {
      setSending(false);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    }
  }

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.bubble,
        item.role === 'user' ? styles.bubbleUser : styles.bubbleAI,
        item.crisis && styles.bubbleCrisis,
      ]}
    >
      <Text style={item.role === 'user' ? styles.textUser : styles.textAI}>{item.content}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Ask AI</Text>
          <Text style={styles.subtitle}>Anything about quitting — it knows your progress</Text>
        </View>
        <ProfileButton />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {messages.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>What's on your mind?</Text>
            {STARTERS.map((s) => (
              <TouchableOpacity key={s} style={styles.starter} onPress={() => send(s)}>
                <Text style={styles.starterText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        {sending && (
          <View style={styles.thinking}>
            <ActivityIndicator size="small" color={Colors.redLight} />
            <Text style={styles.thinkingText}>Thinking…</Text>
          </View>
        )}

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={[styles.composer, !keyboardOpen && { paddingBottom: TAB_BAR_CLEARANCE }]}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask anything…"
            placeholderTextColor={Colors.textMuted}
            multiline
            maxLength={2000}
            editable={!sending}
            onSubmitEditing={() => send()}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnOff]}
            onPress={() => send()}
            disabled={!input.trim() || sending}
          >
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12,
  },
  headerText: { flex: 1 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.textBright },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },

  empty: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  emptyText: {
    fontSize: 16, color: Colors.textSecondary, textAlign: 'center', marginBottom: 20,
  },
  starter: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  starterText: { color: Colors.text, fontSize: 15 },

  list: { padding: 16, paddingBottom: 8 },
  bubble: {
    maxWidth: '86%', borderRadius: 16, paddingVertical: 11, paddingHorizontal: 14, marginBottom: 10,
  },
  bubbleUser: { alignSelf: 'flex-end', backgroundColor: Colors.red },
  bubbleAI: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bubbleCrisis: { borderColor: Colors.yellow, borderWidth: 2 },
  textUser: { color: '#fff', fontSize: 15, lineHeight: 21 },
  textAI: { color: Colors.text, fontSize: 15, lineHeight: 21 },

  thinking: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingBottom: 6 },
  thinkingText: { color: Colors.textMuted, fontSize: 13 },
  error: { color: Colors.red, fontSize: 13, paddingHorizontal: 20, paddingBottom: 6 },

  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    backgroundColor: Colors.bgInput,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 11,
    paddingBottom: 11,
    fontSize: 15,
    color: Colors.text,
  },
  sendBtn: {
    backgroundColor: Colors.red, borderRadius: 18, paddingHorizontal: 18, paddingVertical: 12,
  },
  sendBtnOff: { opacity: 0.4 },
  sendText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
