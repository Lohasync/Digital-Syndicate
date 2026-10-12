export type Role = 'school_admin' | 'teacher' | 'student';

export interface Profile {
  id: string;
  school_id: string | number;
  role: Role;
  full_name?: string;
  email?: string;
  user_id?: string;
  status?: string;
}
