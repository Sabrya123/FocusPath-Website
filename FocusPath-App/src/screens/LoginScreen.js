import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Colors } from '../utils/colors';
import { getUsers, saveUsers, setSession, clearAllData } from '../utils/storage';
import { supabase } from '../utils/supabase';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin() {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const users = await getUsers();
    if (!users[trimmedEmail]) {
      Alert.alert('Error', 'No account found with this email.');
      return;
    }
    if (users[trimmedEmail].password !== password) {
      Alert.alert('Error', 'Incorrect password.');
      return;
    }

    // Sign into Supabase. Local auth above is the source of truth for getting
    // into the app, so a failure here must not block login — but it must not be
    // invisible either: without a Supabase session, friends, chat and the AI
    // coach all silently 401.
    const { error: sbError } = await supabase.auth
      .signInWithPassword({ email: trimmedEmail, password })
      .catch((e) => ({ error: e }));

    if (sbError) {
      // Accounts made before Supabase auth was wired in — or whose signUp
      // silently failed — exist locally but not in Supabase, so sign-in returns
      // invalid_credentials. The local password was already verified above, so
      // create the Supabase account now. Without a session, friends, chat and
      // the AI coach all 401.
      const { error: signUpErr } = await supabase.auth
        .signUp({ email: trimmedEmail, password })
        .catch((e) => ({ error: e }));

      if (signUpErr) {
        // Two very different failures land here, so name them. "already
        // registered" means the Supabase account exists with a DIFFERENT
        // password than the local one — the app can't repair that itself, it
        // needs a password reset on the Supabase side.
        const mismatch = /already registered|already exists/i.test(signUpErr.message);
        console.warn(
          mismatch
            ? `[supabase] ${trimmedEmail} exists in Supabase with a different password. ` +
              'Reset it in Dashboard > Authentication > Users so it matches the app password.'
            : `[supabase] no session — sign-in: ${sbError.message} | sign-up: ${signUpErr.message}`
        );
      }
    }

    await setSession(trimmedEmail);
    const user = users[trimmedEmail];

    if (!user.identity) {
      navigation.replace('Identity');
    } else {
      navigation.replace('Dashboard');
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Unclouded</Text>
        <Text style={styles.tagline}>Your journey to freedom starts here</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome Back</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={Colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Your password"
            placeholderTextColor={Colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            textContentType="none"
            autoComplete="off"
            autoCorrect={false}
          />

          <TouchableOpacity style={styles.btnPrimary} onPress={handleLogin}>
            <Text style={styles.btnPrimaryText}>Log In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchRow}
            onPress={() => navigation.navigate('Signup')}
          >
            <Text style={styles.switchText}>
              Don't have an account?{' '}
              <Text style={styles.switchLink}>Sign up</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.clearRow}
            onPress={() => {
              Alert.alert(
                'Clear all accounts?',
                'This deletes every saved account on this device. This cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Clear all',
                    style: 'destructive',
                    onPress: async () => {
                      await clearAllData();
                      setEmail('');
                      setPassword('');
                      Alert.alert('Cleared', 'All accounts on this device have been deleted.');
                    },
                  },
                ]
              );
            }}
          >
            <Text style={styles.clearText}>Clear all accounts</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoIcon: { fontSize: 56, textAlign: 'center', marginBottom: 8 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#A8D8EA',
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 36,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 28,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textBright,
    textAlign: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
    marginTop: 12,
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
  btnPrimary: {
    backgroundColor: Colors.red,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  switchRow: { marginTop: 20, alignItems: 'center' },
  switchText: { color: Colors.textSecondary, fontSize: 14 },
  switchLink: { color: Colors.redLight },
  clearRow: { marginTop: 16, alignItems: 'center' },
  clearText: { color: Colors.textMuted, fontSize: 12, textDecorationLine: 'underline' },
});
