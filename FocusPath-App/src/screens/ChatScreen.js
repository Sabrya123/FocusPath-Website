import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../utils/colors';
import { supabase } from '../utils/supabase';
import { CloseIcon } from '../components/Icons';
import {
  getConversation,
  sendMessage,
  markMessagesRead,
} from '../utils/friends';

const POLL_INTERVAL_MS = 3000;

function formatTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const hours = d.getHours();
  const mins = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  if (sameDay) return `${h12}:${mins} ${ampm}`;
  return `${d.getMonth() + 1}/${d.getDate()} ${h12}:${mins} ${ampm}`;
}

export default function ChatScreen({ route, navigation }) {
  const { friendId, friendName } = route.params;
  const [myId, setMyId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);
  const pollRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (cancelled) return;
        if (!user) {
          setLoading(false);
          return;
        }
        setMyId(user.id);
        await loadMessages(user.id, true);
        pollRef.current = setInterval(() => loadMessages(user.id, false), POLL_INTERVAL_MS);
      })();
      return () => {
        cancelled = true;
        if (pollRef.current) clearInterval(pollRef.current);
      };
    }, [friendId])
  );

  async function loadMessages(uid, showSpinner) {
    const convo = await getConversation(uid, friendId);
    setMessages((prev) => {
      if (prev.length === convo.length) {
        const lastPrev = prev[prev.length - 1];
        const lastNew = convo[convo.length - 1];
        if (lastPrev?.id === lastNew?.id) return prev;
      }
      return convo;
    });
    if (showSpinner) setLoading(false);
    markMessagesRead(uid, friendId).catch(() => {});
  }

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 60);
    }
  }, [messages.length]);

  async function handleSend() {
    const body = input.trim();
    if (!body || sending || !myId) return;
    setSending(true);
    const optimistic = {
      id: `local-${Date.now()}`,
      sender_id: myId,
      receiver_id: friendId,
      body,
      created_at: new Date().toISOString(),
      _pending: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput('');
    const ok = await sendMessage(myId, friendId, body);
    setSending(false);
    if (ok) {
      loadMessages(myId, false);
    } else {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setInput(body);
    }
  }

  function renderItem({ item, index }) {
    const mine = item.sender_id === myId;
    const prev = messages[index - 1];
    const showTime =
      !prev ||
      new Date(item.created_at).getTime() - new Date(prev.created_at).getTime() >
        5 * 60 * 1000;
    return (
      <View>
        {showTime && (
          <Text style={styles.timestamp}>{formatTime(item.created_at)}</Text>
        )}
        <View
          style={[
            styles.bubbleRow,
            mine ? styles.bubbleRowMine : styles.bubbleRowTheirs,
          ]}
        >
          <View
            style={[
              styles.bubble,
              mine ? styles.bubbleMine : styles.bubbleTheirs,
              item._pending && styles.bubblePending,
            ]}
          >
            <Text
              style={[
                styles.bubbleText,
                mine ? styles.bubbleTextMine : styles.bubbleTextTheirs,
              ]}
            >
              {item.body}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.headerBack}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>
              {(friendName || '?')[0].toUpperCase()}
            </Text>
          </View>
          <Text style={styles.headerName} numberOfLines={1}>
            {friendName}
          </Text>
        </View>
        <View style={styles.headerBtn} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.red} />
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyTitle}>Say hi to {friendName}</Text>
            <Text style={styles.emptySub}>
              Encourage each other. Every clean day matters.
            </Text>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() =>
              listRef.current?.scrollToEnd({ animated: false })
            }
          />
        )}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Type a message…"
            placeholderTextColor={Colors.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || sending}
          >
            <Text style={styles.sendBtnText}>{sending ? '…' : 'Send'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBack: {
    fontSize: 32,
    color: Colors.red,
    fontWeight: '300',
    marginTop: -4,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.redDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textBright,
    maxWidth: 200,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textBright,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  listContent: {
    padding: 14,
    paddingBottom: 8,
  },
  timestamp: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    marginVertical: 10,
    fontWeight: '600',
  },
  bubbleRow: {
    flexDirection: 'row',
    marginVertical: 2,
  },
  bubbleRowMine: {
    justifyContent: 'flex-end',
  },
  bubbleRowTheirs: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  bubbleMine: {
    backgroundColor: Colors.red,
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: Colors.bgCard,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bubblePending: {
    opacity: 0.6,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 20,
  },
  bubbleTextMine: {
    color: '#fff',
  },
  bubbleTextTheirs: {
    color: Colors.text,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.bgCard,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.bgInput,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    color: Colors.text,
    fontSize: 15,
    maxHeight: 120,
  },
  sendBtn: {
    backgroundColor: Colors.red,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  sendBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
