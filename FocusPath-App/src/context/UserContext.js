import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import {
  getSession,
  setSession,
  clearSession,
  getUsers,
  saveUsers,
  getStreakInfo,
} from '../utils/storage';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [email, setEmail] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mirrors `email` so a queued write can read it without being rebuilt
  // every time the address changes.
  const emailRef = useRef(null);

  // Writes link onto this chain instead of racing. A write is a
  // read-modify-write of the whole users blob, so two landing together used to
  // lose one of them.
  const writeQueue = useRef(Promise.resolve());

  const applySession = useCallback((address) => {
    emailRef.current = address;
    setEmail(address);
  }, []);

  const refresh = useCallback(async () => {
    const address = await getSession();
    applySession(address);
    if (!address) {
      setUser(null);
      return null;
    }
    const users = await getUsers();
    const next = users[address] || null;
    setUser(next);
    return next;
  }, [applySession]);

  useEffect(() => {
    let active = true;
    (async () => {
      await refresh();
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [refresh]);

  const update = useCallback((patch) => {
    setUser((prev) => ({ ...(prev || {}), ...patch }));

    const task = writeQueue.current.then(async () => {
      const address = emailRef.current;
      if (!address) return null;
      const users = await getUsers();
      // Spreading over an absent record creates it. Signup sets a session
      // without writing a user, so the identity step is what brings it into
      // existence.
      users[address] = { ...users[address], ...patch };
      await saveUsers(users);
      return users[address];
    });

    // Keep the chain alive even if this write throws, so one failure doesn't
    // wedge every write after it.
    writeQueue.current = task.then(
      () => undefined,
      () => undefined
    );
    return task;
  }, []);

  const signIn = useCallback(
    async (address) => {
      await setSession(address);
      applySession(address);
      const users = await getUsers();
      const next = users[address] || null;
      setUser(next);
      return next;
    },
    [applySession]
  );

  const signOut = useCallback(async () => {
    // Let anything already queued land before the session goes away.
    await writeQueue.current;
    await clearSession();
    applySession(null);
    setUser(null);
  }, [applySession]);

  const value = useMemo(
    () => ({ email, user, loading, refresh, update, signIn, signOut }),
    [email, user, loading, refresh, update, signIn, signOut]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be called inside a UserProvider');
  }
  return context;
}

// Streak is derived, so it stays out of the context value. It keys on the whole
// user rather than on quitDate because the elapsed day count moves with the
// clock: refresh() hands back a new object, which is what makes a screen
// returning to focus recompute how long it has been.
export function useStreak() {
  const { user } = useUser();
  return useMemo(
    () => (user?.quitDate ? getStreakInfo(user.quitDate) : null),
    [user]
  );
}
