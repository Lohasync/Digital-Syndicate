import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { clearAuthState, fetchProfileForUser, persistAuthState, signInWithSchoolId } from '../lib/auth';
import type { Profile } from '../types';

interface AuthSession {
  user: {
    id: string;
  } | null;
}

interface AuthContextValue {
  session: AuthSession | null;
  profile: Profile | null;
  loading: boolean;
  authError: string | null;
  signIn: (schoolUserId: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawSession = window.localStorage.getItem('learnloop-session');
    return rawSession ? (JSON.parse(rawSession) as AuthSession) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const hydrateProfile = async (nextSession: AuthSession | null) => {
    if (!nextSession) {
      setProfile(null);
      return;
    }

    try {
      const nextProfile = await fetchProfileForUser();
      setProfile(nextProfile);
      setAuthError(null);
    } catch (error) {
      setProfile(null);
      setAuthError(error instanceof Error ? error.message : 'Unable to load profile.');
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      const activeSession = readStoredSession();

      if (!isMounted) {
        return;
      }

      setSession(activeSession);
      await hydrateProfile(activeSession);
      setLoading(false);
    };

    void initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = async (schoolUserId: string, password: string) => {
    setLoading(true);
    setAuthError(null);

    try {
      const authData = await signInWithSchoolId({ schoolUserId, password });
      const nextSession = authData.session ?? { user: { id: authData.profile.id } };

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('learnloop-session', JSON.stringify(nextSession));
      }

      persistAuthState(authData.profile);
      setSession(nextSession);
      setProfile(authData.profile);
    } catch (error) {
      setProfile(null);
      setAuthError(error instanceof Error ? error.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    clearAuthState();
    setSession(null);
    setProfile(null);
    setLoading(false);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      loading,
      authError,
      signIn,
      signOut,
    }),
    [authError, loading, profile, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider.');
  }

  return context;
}
