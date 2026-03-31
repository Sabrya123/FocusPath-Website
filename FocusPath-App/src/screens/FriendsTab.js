import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { Colors } from '../utils/colors';
import { supabase } from '../utils/supabase';
import { FireIcon, CheckIcon, CloseIcon } from '../components/Icons';
import { getCurrentUser } from '../utils/storage';
import {
  ensureFriendCode,
  addFriendByCode,
  acceptFriend,
  removeFriend,
  getFriendsList,
  sendUrgeAlert,
  getUnseenAlerts,
  markAlertSeen,
  syncProfileToSupabase,
} from '../utils/friends';

const ALL_RANKS = [
  { name: 'Beginner', minPoints: 0 },
  { name: 'Fighter', minPoints: 200 },
  { name: 'Champion', minPoints: 500 },
  { name: 'Warrior', minPoints: 1000 },
  { name: 'Legend', minPoints: 2000 },
  { name: 'UNCLOUDED', minPoints: 5000 },
];

function getRankName(points) {
  for (let i = ALL_RANKS.length - 1; i >= 0; i--) {
    if (points >= ALL_RANKS[i].minPoints) return ALL_RANKS[i].name;
  }
  return 'Beginner';
}

export default function FriendsTab() {
  const [loading, setLoading] = useState(true);
  const [myCode, setMyCode] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [adding, setAdding] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function ensureSupabaseAuth() {
    // Check if already signed in
    const { data: { user } } = await supabase.auth.getUser();
    if (user) return user;

    // Not signed in — try to create/sign in using local credentials
    const localUser = await getCurrentUser();
    if (!localUser?.email || !localUser?.password) return null;

    // Try sign in first
    const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
      email: localUser.email,
      password: localUser.password,
    });
    if (signInData?.user) return signInData.user;

    // If sign in failed, create account
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email: localUser.email,
      password: localUser.password,
      options: { data: { name: localUser.name } },
    });
    if (signUpData?.user) {
      await supabase.from('profiles').upsert({
        id: signUpData.user.id,
        name: localUser.name || '',
        email: localUser.email,
      });
      return signUpData.user;
    }

    return null;
  }

  async function loadData() {
    try {
      const user = await ensureSupabaseAuth();
      if (!user) {
        setLoading(false);
        return;
      }
      setUserId(user.id);

      // Sync local profile data
      const localUser = await getCurrentUser();
      if (localUser) syncProfileToSupabase(user.id, localUser);

      const code = await ensureFriendCode(user.id);
      setMyCode(code);

      const { friends: f, pending: p, incoming: inc } = await getFriendsList(user.id);
      setFriends(f);
      setPending(p);
      setIncoming(inc);

      const unseenAlerts = await getUnseenAlerts(user.id);
      setAlerts(unseenAlerts);
    } catch (e) {
      // offline or not logged in
    }
    setLoading(false);
  }

  async function handleAddFriend() {
    if (!codeInput.trim()) return;
    setAdding(true);
    const result = await addFriendByCode(userId, codeInput);
    setAdding(false);
    if (result.error) {
      Alert.alert('Oops', result.error);
    } else {
      Alert.alert('Sent!', 'Friend request sent.');
      setCodeInput('');
      loadData();
    }
  }

  async function handleAccept(friendshipId) {
    await acceptFriend(friendshipId);
    loadData();
  }

  async function handleDecline(friendshipId) {
    await removeFriend(friendshipId);
    loadData();
  }

  async function handleRemoveFriend(friendshipId, name) {
    Alert.alert('Remove Friend', `Remove ${name} from your friends?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await removeFriend(friendshipId);
          loadData();
        },
      },
    ]);
  }

  async function handleSendAlert(friendId, name) {
    Alert.alert(
      'Send Alert',
      `Let ${name} know you're struggling right now?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            const ok = await sendUrgeAlert(userId, friendId);
            if (ok) Alert.alert('Sent', `${name} has been notified. Stay strong.`);
            else Alert.alert('Error', 'Could not send alert.');
          },
        },
      ]
    );
  }

  async function handleDismissAlert(alertId) {
    await markAlertSeen(alertId);
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  }

  async function copyCode() {
    await Clipboard.setStringAsync(myCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.red} />
        </View>
      </SafeAreaView>
    );
  }

  if (!userId) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.heading}>Friends</Text>
          <Text style={styles.emptyText}>
            Connect to the internet to add friends and see their progress.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Friends</Text>

        {/* Urge Alerts */}
        {alerts.map((alert) => (
          <View key={alert.id} style={styles.alertCard}>
            <View style={styles.alertContent}>
              <Text style={styles.alertEmoji}>🚨</Text>
              <View style={styles.alertTextWrap}>
                <Text style={styles.alertTitle}>{alert.senderName} needs support</Text>
                <Text style={styles.alertSub}>They're struggling right now</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.alertDismiss} onPress={() => handleDismissAlert(alert.id)}>
              <Text style={styles.alertDismissText}>I'm here 💪</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* My Code */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Friend Code</Text>
          <Text style={styles.cardSub}>Share this code so friends can add you</Text>
          <View style={styles.codeRow}>
            <Text style={styles.codeText}>{myCode}</Text>
            <TouchableOpacity style={styles.copyBtn} onPress={copyCode}>
              <Text style={styles.copyBtnText}>{copied ? 'Copied!' : 'Copy'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Add Friend */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add a Friend</Text>
          <View style={styles.addRow}>
            <TextInput
              style={styles.codeInput}
              placeholder="Enter friend code"
              placeholderTextColor={Colors.textMuted}
              value={codeInput}
              onChangeText={setCodeInput}
              autoCapitalize="characters"
              maxLength={6}
            />
            <TouchableOpacity
              style={[styles.addBtn, !codeInput.trim() && styles.addBtnDisabled]}
              onPress={handleAddFriend}
              disabled={!codeInput.trim() || adding}
            >
              <Text style={styles.addBtnText}>{adding ? '...' : 'Add'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Incoming Requests */}
        {incoming.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Friend Requests</Text>
            {incoming.map((req) => (
              <View key={req.friendshipId} style={styles.requestRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {(req.profile.name || '?')[0].toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.requestName}>{req.profile.name}</Text>
                <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAccept(req.friendshipId)}>
                  <Text style={styles.acceptBtnText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.declineBtn} onPress={() => handleDecline(req.friendshipId)}>
                  <CloseIcon size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Pending */}
        {pending.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Pending</Text>
            {pending.map((req) => (
              <View key={req.friendshipId} style={styles.requestRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {(req.profile.name || '?')[0].toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.requestName}>{req.profile.name}</Text>
                <Text style={styles.pendingLabel}>Waiting...</Text>
              </View>
            ))}
          </View>
        )}

        {/* Friends List */}
        <Text style={styles.sectionHeading}>
          Your Friends {friends.length > 0 ? `(${friends.length})` : ''}
        </Text>
        {friends.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No friends yet. Share your code to get started!</Text>
          </View>
        ) : (
          friends.map((f) => (
            <View key={f.friendshipId} style={styles.friendCard}>
              <View style={styles.friendTop}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {(f.profile.name || '?')[0].toUpperCase()}
                  </Text>
                </View>
                <View style={styles.friendInfo}>
                  <Text style={styles.friendName}>{f.profile.name}</Text>
                  <Text style={styles.friendRank}>{getRankName(f.profile.points || 0)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => handleRemoveFriend(f.friendshipId, f.profile.name)}
                >
                  <CloseIcon size={14} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={styles.friendStats}>
                <View style={styles.friendStat}>
                  <FireIcon size={16} />
                  <Text style={styles.friendStatNum}>{f.profile.streak_days || 0}</Text>
                  <Text style={styles.friendStatLabel}>day streak</Text>
                </View>
                <View style={styles.friendStat}>
                  <Text style={styles.friendStatNum}>{f.profile.points || 0}</Text>
                  <Text style={styles.friendStatLabel}>pts</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.alertBtn}
                onPress={() => handleSendAlert(f.friendId, f.profile.name)}
              >
                <Text style={styles.alertBtnText}>🚨 I Need Support</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 20, paddingBottom: 100 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textBright,
    marginBottom: 16,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textBright,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  codeText: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.red,
    letterSpacing: 4,
    flex: 1,
  },
  copyBtn: {
    backgroundColor: Colors.redDark,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  copyBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  addRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  codeInput: {
    flex: 1,
    backgroundColor: Colors.bgInput,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 14,
    color: Colors.text,
    fontSize: 16,
    letterSpacing: 2,
    fontWeight: '700',
  },
  addBtn: {
    backgroundColor: Colors.red,
    borderRadius: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  addBtnDisabled: {
    opacity: 0.4,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textBright,
    marginTop: 8,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.redDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  requestName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textBright,
  },
  acceptBtn: {
    backgroundColor: Colors.red,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  acceptBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  declineBtn: {
    padding: 8,
  },
  pendingLabel: {
    color: Colors.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
  },
  emptyCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
  },
  friendCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  friendTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textBright,
  },
  friendRank: {
    fontSize: 12,
    color: Colors.redLight,
    fontWeight: '600',
    marginTop: 2,
  },
  removeBtn: {
    padding: 6,
  },
  friendStats: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  friendStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  friendStatNum: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textBright,
  },
  friendStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  alertBtn: {
    backgroundColor: 'rgba(91, 168, 200, 0.15)',
    borderWidth: 1,
    borderColor: Colors.redDark,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  alertBtnText: {
    color: Colors.redLight,
    fontWeight: '700',
    fontSize: 14,
  },
  alertCard: {
    backgroundColor: 'rgba(91, 168, 200, 0.1)',
    borderWidth: 1,
    borderColor: Colors.red,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  alertEmoji: {
    fontSize: 28,
  },
  alertTextWrap: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textBright,
  },
  alertSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  alertDismiss: {
    backgroundColor: Colors.red,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  alertDismissText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
