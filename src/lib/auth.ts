import type { PostgrestError } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { Profile, Role } from '../types';

export interface SchoolUserLookupInput {
  schoolUserId: string;
  password: string;
}

export async function lookupSchoolUserEmail({ schoolUserId, password }: SchoolUserLookupInput) {
  const trimmedId = schoolUserId.trim();
  const trimmedPassword = password.trim();

  if (!trimmedId || !trimmedPassword) {
    throw new Error('Please provide both your school user ID and password.');
  }

  const attempts = [
    { name: 'resolve_school_login', params: { p_school_user_id: trimmedId, p_password: trimmedPassword } },
    { name: 'authenticate_school_user', params: { school_user_id: trimmedId, password: trimmedPassword } },
    { name: 'school_user_login', params: { school_user_id: trimmedId, password: trimmedPassword } },
    { name: 'lookup_school_user', params: { user_id: trimmedId, password: trimmedPassword } },
  ];

  let lastError: PostgrestError | Error | null = null;

  for (const attempt of attempts) {
    try {
      const { data, error } = await supabase.rpc(attempt.name, attempt.params as Record<string, unknown>);

      if (!error && data) {
        const record = Array.isArray(data) ? data[0] : data;

        if (record && typeof record.email === 'string' && record.email.includes('@')) {
          return {
            email: record.email,
            user_id: typeof record.user_id === 'string' ? record.user_id : undefined,
          };
        }
      }

      lastError = error ?? new Error(`Lookup failed for ${attempt.name}.`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unable to resolve school login.');
    }
  }

  if (lastError) {
    throw new Error(
      'The trusted backend lookup is not configured in this Supabase project. Please connect the approved school-ID mapping before using this login flow.',
    );
  }

  throw new Error('No valid user record was returned by the backend lookup.');
}

export async function signInWithSchoolId({ schoolUserId, password }: SchoolUserLookupInput) {
  const lookup = await lookupSchoolUserEmail({ schoolUserId, password });

  const { data, error } = await supabase.auth.signInWithPassword({
    email: lookup.email,
    password,
  });

  if (error) {
    throw new Error(error.message || 'Sign-in failed.');
  }

  return data;
}

export async function fetchProfileForUser(): Promise<Profile> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Session expired. Please sign in again.');
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || 'Unable to load your profile.');
  }

  if (!data) {
    throw new Error('No profile was found for this account. Please contact the school administrator.');
  }

  return data as Profile;
}
