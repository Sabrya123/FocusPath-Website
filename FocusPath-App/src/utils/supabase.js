import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser } from './storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Getting into the app only checks the local account list, so the Supabase
// session can be missing while the app looks logged in — a sign-in that failed
// while the project was paused, or Expo Go starting with fresh storage. Call
// this before anything that needs the server: it reuses the session if there
// is one, otherwise signs in again with the login saved on this phone.
// Returns { user } on success, or { error } with a reason worth showing.
export async function ensureSupabaseSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) return { user: session.user };

  const local = await getCurrentUser();
  if (!local?.email || !local?.password) {
    return { error: 'Not signed in. Log out and log back in.' };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: local.email,
    password: local.password,
  });
  if (data?.session) return { user: data.user };

  if (error?.code === 'email_not_confirmed') {
    return { error: "Couldn't sign in: your email address hasn't been confirmed." };
  }
  if (error?.code !== 'invalid_credentials') {
    return { error: `Couldn't sign in: ${error?.message ?? 'unknown error'}` };
  }

  // "Invalid login credentials" means either no online account or a different
  // password. Creating the account tells the two apart — and fixes the first.
  const { data: created, error: signUpError } = await supabase.auth.signUp({
    email: local.email,
    password: local.password,
    options: { data: { name: local.name } },
  });
  if (created?.session) {
    await supabase.from('profiles').upsert({
      id: created.user.id,
      name: local.name || '',
      email: local.email,
    });
    return { user: created.user };
  }
  if (signUpError?.code === 'user_already_exists') {
    return { error: "Couldn't sign in: the password saved on this phone doesn't match your online account." };
  }
  if (created?.user) {
    return { error: "Couldn't sign in: your email address hasn't been confirmed." };
  }
  return { error: `Couldn't sign in: ${signUpError?.message ?? 'unknown error'}` };
}
