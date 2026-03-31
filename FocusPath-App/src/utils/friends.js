import { supabase } from './supabase';

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function ensureFriendCode(userId) {
  // Check if user already has a code
  const { data: existing } = await supabase
    .from('friend_codes')
    .select('code')
    .eq('user_id', userId)
    .single();

  if (existing) return existing.code;

  // Generate a unique code
  let code = generateCode();
  let attempts = 0;
  while (attempts < 10) {
    const { error } = await supabase
      .from('friend_codes')
      .insert({ user_id: userId, code });

    if (!error) return code;
    code = generateCode();
    attempts++;
  }
  throw new Error('Could not generate unique friend code');
}

export async function addFriendByCode(myUserId, code) {
  // Look up the code
  const { data: codeRow, error: lookupErr } = await supabase
    .from('friend_codes')
    .select('user_id')
    .eq('code', code.toUpperCase().trim())
    .single();

  if (lookupErr || !codeRow) {
    return { error: 'Friend code not found.' };
  }

  const friendId = codeRow.user_id;
  if (friendId === myUserId) {
    return { error: "That's your own code!" };
  }

  // Order IDs for the unique constraint
  const user_a = myUserId < friendId ? myUserId : friendId;
  const user_b = myUserId < friendId ? friendId : myUserId;

  // Check if friendship already exists
  const { data: existing } = await supabase
    .from('friendships')
    .select('id, status')
    .eq('user_a', user_a)
    .eq('user_b', user_b)
    .single();

  if (existing) {
    if (existing.status === 'accepted') return { error: 'Already friends!' };
    return { error: 'Friend request already sent.' };
  }

  const { error: insertErr } = await supabase
    .from('friendships')
    .insert({ user_a, user_b, requested_by: myUserId, status: 'pending' });

  if (insertErr) return { error: 'Could not send request.' };
  return { success: true };
}

export async function acceptFriend(friendshipId) {
  const { error } = await supabase
    .from('friendships')
    .update({ status: 'accepted' })
    .eq('id', friendshipId);
  return !error;
}

export async function removeFriend(friendshipId) {
  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('id', friendshipId);
  return !error;
}

export async function getFriendsList(userId) {
  // Get accepted friendships
  const { data: friendships, error } = await supabase
    .from('friendships')
    .select('id, user_a, user_b, status, requested_by')
    .or(`user_a.eq.${userId},user_b.eq.${userId}`);

  if (error) return { friends: [], pending: [], incoming: [] };

  const friendIds = new Set();
  const accepted = [];
  const pending = [];
  const incoming = [];

  for (const f of friendships || []) {
    const otherId = f.user_a === userId ? f.user_b : f.user_a;
    friendIds.add(otherId);

    if (f.status === 'accepted') {
      accepted.push({ friendshipId: f.id, friendId: otherId });
    } else if (f.requested_by === userId) {
      pending.push({ friendshipId: f.id, friendId: otherId });
    } else {
      incoming.push({ friendshipId: f.id, friendId: otherId });
    }
  }

  // Fetch profiles for all related users
  const allIds = [...friendIds];
  let profiles = {};
  if (allIds.length > 0) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, name, streak_days, points, quit_date')
      .in('id', allIds);

    for (const p of profileData || []) {
      profiles[p.id] = p;
    }
  }

  const mapWithProfile = (list) =>
    list.map((item) => ({
      ...item,
      profile: profiles[item.friendId] || { name: 'Unknown', streak_days: 0, points: 0 },
    }));

  return {
    friends: mapWithProfile(accepted),
    pending: mapWithProfile(pending),
    incoming: mapWithProfile(incoming),
  };
}

export async function sendUrgeAlert(senderId, receiverId) {
  const { error } = await supabase
    .from('urge_alerts')
    .insert({ sender_id: senderId, receiver_id: receiverId });
  return !error;
}

export async function getUnseenAlerts(userId) {
  const { data, error } = await supabase
    .from('urge_alerts')
    .select('id, sender_id, created_at')
    .eq('receiver_id', userId)
    .eq('seen', false)
    .order('created_at', { ascending: false });

  if (error) return [];

  // Fetch sender names
  const senderIds = [...new Set(data.map((a) => a.sender_id))];
  let names = {};
  if (senderIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name')
      .in('id', senderIds);
    for (const p of profiles || []) names[p.id] = p.name;
  }

  return data.map((a) => ({
    id: a.id,
    senderName: names[a.sender_id] || 'A friend',
    createdAt: a.created_at,
  }));
}

export async function markAlertSeen(alertId) {
  await supabase
    .from('urge_alerts')
    .update({ seen: true })
    .eq('id', alertId);
}

export async function syncProfileToSupabase(userId, userData) {
  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    name: userData.name || '',
    email: userData.email || '',
    identity: userData.identity || null,
    mantra: userData.mantra || null,
    motivations: userData.motivations || [],
    vaping_years: userData.vapingYears || null,
    quit_date: userData.quitDate || null,
    journey_start_date: userData.journeyStartDate || null,
    streak_days: userData.streakDays || 0,
    points: userData.points || 0,
    updated_at: new Date().toISOString(),
  });
  return !error;
}
