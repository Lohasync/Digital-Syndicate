import type { Profile } from '../types';

export interface SchoolUserLookupInput {
  schoolUserId: string;
  password: string;
}

const MOCK_ACCOUNTS: Array<{ schoolUserId: string; password: string; profile: Profile }> = [
  {
    schoolUserId: 'ADMIN-001',
    password: 'demo123',
    profile: {
      id: 'admin-1',
      school_id: 'S-100',
      role: 'school_admin',
      full_name: 'Alicia Rowan',
      email: 'admin@learnloop.local',
      user_id: 'ADMIN-001',
    },
  },
  {
    schoolUserId: 'T-2048',
    password: 'demo123',
    profile: {
      id: 'teacher-1',
      school_id: 'S-100',
      role: 'teacher',
      full_name: 'Mia Carter',
      email: 'mia.carter@learnloop.local',
      user_id: 'T-2048',
    },
  },
  {
    schoolUserId: 'ST-3001',
    password: 'demo123',
    profile: {
      id: 'student-1',
      school_id: 'S-100',
      role: 'student',
      full_name: 'Noah Patel',
      email: 'noah.patel@learnloop.local',
      user_id: 'ST-3001',
    },
  },
];

function findMockAccount(schoolUserId: string, password: string) {
  return MOCK_ACCOUNTS.find(
    (account) =>
      account.schoolUserId.toLowerCase() === schoolUserId.trim().toLowerCase() && account.password === password.trim(),
  );
}

export async function lookupSchoolUserEmail({ schoolUserId, password }: SchoolUserLookupInput) {
  const trimmedId = schoolUserId.trim();
  const trimmedPassword = password.trim();

  if (!trimmedId || !trimmedPassword) {
    throw new Error('Please provide both your school user ID and password.');
  }

  const account = findMockAccount(trimmedId, trimmedPassword);

  if (!account) {
    throw new Error('No matching demo account was found. Use one of the configured school IDs and the shared demo password.');
  }

  return {
    email: account.profile.email ?? `${trimmedId.toLowerCase()}@learnloop.local`,
    user_id: account.profile.user_id ?? trimmedId,
  };
}

export async function signInWithSchoolId({ schoolUserId, password }: SchoolUserLookupInput) {
  const account = findMockAccount(schoolUserId, password);

  if (!account) {
    throw new Error('Invalid school ID or password.');
  }

  return {
    session: {
      user: { id: account.profile.id },
    },
    profile: account.profile,
  };
}

export async function fetchProfileForUser(): Promise<Profile> {
  if (typeof window === 'undefined') {
    throw new Error('Session expired. Please sign in again.');
  }

  const rawProfile = window.localStorage.getItem('learnloop-profile');

  if (!rawProfile) {
    throw new Error('Session expired. Please sign in again.');
  }

  try {
    const parsed = JSON.parse(rawProfile) as Profile;
    return parsed;
  } catch {
    throw new Error('Session expired. Please sign in again.');
  }
}

export function persistAuthState(profile: Profile) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('learnloop-profile', JSON.stringify(profile));
  }
}

export function clearAuthState() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('learnloop-profile');
    window.localStorage.removeItem('learnloop-session');
  }
}
