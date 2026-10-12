import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { fetchProfileForUser, signInWithSchoolId } from '../lib/auth';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  authError: string | null;
  signIn: (schoolUserId: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const hydrateProfile = async (nextSession: Session | null) => {
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
      const {
        data: { session: activeSession },
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      setSession(activeSession);
      await hydrateProfile(activeSession);
      setLoading(false);
    };

    void initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!isMounted) {
        return;
      }

      setSession(nextSession);
      await hydrateProfile(nextSession);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (schoolUserId: string, password: string) => {
    setLoading(true);
    setAuthError(null);

    try {
      const authData = await signInWithSchoolId({ schoolUserId, password });
      const nextSession = authData.session ?? (await supabase.auth.getSession()).data.session;
      setSession(nextSession);
      await hydrateProfile(nextSession);
    } catch (error) {
      setProfile(null);
      setAuthError(error instanceof Error ? error.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
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
