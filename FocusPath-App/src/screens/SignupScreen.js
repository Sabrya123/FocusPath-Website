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
import { getUsers, saveUsers, setSession } from '../utils/storage';

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  async function handleSignup() {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail || !password || !confirm) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    const users = await getUsers();
    if (users[trimmedEmail]) {
      Alert.alert('Error', 'An account with this email already exists.');
      return;
    }

    users[trimmedEmail] = {
      name: trimmedName,
      email: trimmedEmail,
      password,
      identity: null,
      quitDate: null,
      motivations: [],
      vapingYears: null,
      createdAt: new Date().toISOString(),
    };

    await saveUsers(users);
    await setSession(trimmedEmail);
    navigation.replace('Identity');
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
          <Text style={styles.cardTitle}>Create Account</Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor={Colors.textMuted}
            value={name}
            onChangeText={setName}
          />

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
            placeholder="Create a password (6+ chars)"
            placeholderTextColor={Colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            placeholderTextColor={Colors.textMuted}
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
          />

          <TouchableOpacity style={styles.btnPrimary} onPress={handleSignup}>
            <Text style={styles.btnPrimaryText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchRow}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.switchText}>
              Already have an account?{' '}
              <Text style={styles.switchLink}>Log in</Text>
            </Text>
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
    color: Colors.textBright,
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
});
