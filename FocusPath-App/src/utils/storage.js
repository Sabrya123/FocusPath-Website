import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = 'fp_users';
const SESSION_KEY = 'fp_session';

export async function getUsers() {
  const data = await AsyncStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : {};
}

export async function saveUsers(users) {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function getSession() {
  return await AsyncStorage.getItem(SESSION_KEY);
}

export async function setSession(email) {
  await AsyncStorage.setItem(SESSION_KEY, email);
}

export async function clearSession() {
  await AsyncStorage.removeItem(SESSION_KEY);
}

export async function clearAllData() {
  await AsyncStorage.removeItem(USERS_KEY);
  await AsyncStorage.removeItem(SESSION_KEY);
}

export async function getCurrentUser() {
  const email = await getSession();
  if (!email) return null;
  const users = await getUsers();
  return users[email] || null;
}

export async function updateUser(email, updates) {
  const users = await getUsers();
  if (users[email]) {
    users[email] = { ...users[email], ...updates };
    await saveUsers(users);
    return users[email];
  }
  return null;
}

export function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function getStreakInfo(quitDateStr) {
  const quitDate = new Date(quitDateStr);
  const now = new Date();
  const diffMs = now - quitDate;
  const hours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
  const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const weeks = Math.max(0, Math.floor(days / 7));

  let message = '';
  if (days === 0) message = "Today is day one. The most important day.";
  else if (days === 1) message = "You've survived the first 24 hours. That's huge.";
  else if (days < 7) message = "The first week is the hardest. You're doing it.";
  else if (days < 30) message = "Over a week strong. Your body is healing every day.";
  else if (days < 90) message = "Over a month! Your lungs and heart are thanking you.";
  else if (days < 365) message = "Months of freedom. You've built a new you.";
  else message = "Over a year vape-free. You are unstoppable.";

  return { hours, days, weeks, message, progress: Math.min(days / 365, 1) };
}
