import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { supabase } from './lib/supabase';
import type { Profile } from './types';
import { Sidebar } from './components/Sidebar';
import { StatCard } from './components/StatCard';
import { EmptyState } from './components/EmptyState';
import { useEffect, useState } from 'react';

function AppLayout({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { profile, signOut } = useAuth();

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="flex min-h-screen flex-col xl:flex-row">
        <Sidebar profile={profile} />

        <main className="flex-1 bg-[#0b1020]">
          <header className="flex flex-col gap-4 border-b border-line bg-[#0f1729] px-4 py-4 sm:px-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-green">LearnLoop</p>
              <h1 className="mt-1 text-2xl font-bold text-text">{title}</h1>
            </div>

            <div className="flex items-center gap-3">
              {actions}
              <button
                type="button"
                onClick={signOut}
                className="rounded-lg border border-line bg-[#172339] px-3 py-2 text-sm font-semibold text-text transition hover:border-accent hover:text-white"
              >
                Log out
              </button>
            </div>
          </header>

          <div className="p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

function DashboardSwitch() {
  const { profile } = useAuth();

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  if (profile.role === 'school_admin') {
    return <AdminOverviewPage />;
  }

  if (profile.role === 'teacher') {
    return <TeacherOverviewPage />;
  }

  return <StudentOverviewPage />;
}

function AdminOverviewPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ students: 0, teachers: 0, classes: 0, announcements: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!profile?.school_id) {
        setLoading(false);
        return;
      }

      try {
        const [studentsResult, teachersResult, classesResult, announcementsResult] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact' }).eq('school_id', profile.school_id).eq('role', 'student'),
          supabase.from('profiles').select('*', { count: 'exact' }).eq('school_id', profile.school_id).eq('role', 'teacher'),
          supabase.from('classes').select('*', { count: 'exact' }).eq('school_id', profile.school_id),
          supabase.from('announcements').select('*', { count: 'exact' }).eq('school_id', profile.school_id),
        ]);

        setStats({
          students: studentsResult.data?.length ?? 0,
          teachers: teachersResult.data?.length ?? 0,
          classes: classesResult.data?.length ?? 0,
          announcements: announcementsResult.data?.length ?? 0,
        });
      } catch {
        setStats({ students: 0, teachers: 0, classes: 0, announcements: 0 });
      } finally {
        setLoading(false);
      }
    };

    void loadStats();
  }, [profile]);

  return (
    <AppLayout title="Admin dashboard">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Students" value={loading ? '...' : String(stats.students)} accent="bg-violet-500" />
          <StatCard label="Teachers" value={loading ? '...' : String(stats.teachers)} accent="bg-sky-500" />
          <StatCard label="Classes" value={loading ? '...' : String(stats.classes)} accent="bg-emerald-500" />
          <StatCard label="Announcements" value={loading ? '...' : String(stats.announcements)} accent="bg-amber-500" />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-2xl border border-line bg-panel p-5">
            <h2 className="mb-4 text-lg font-semibold text-text">School summary</h2>
            <ul className="space-y-3 text-sm text-muted">
              <li>• School separation is enforced through Supabase RLS.</li>
              <li>• Admin actions are limited to the current school context.</li>
              <li>• Role-based permissions are enforced by profile role checks.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-line bg-panel p-5">
            <h2 className="mb-4 text-lg font-semibold text-text">Recent notice</h2>
            <p className="text-sm text-muted">
              Keep your student roster, class plans, and announcements aligned with your school calendar.
            </p>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}

function StudentsPage() {
  const { profile } = useAuth();
  const [rows, setRows] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!profile?.school_id) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('school_id', profile.school_id)
        .eq('role', 'student')
        .order('full_name');

      if (!error) {
        setRows((data ?? []) as Profile[]);
      }
      setIsLoading(false);
    };

    void load();
  }, [profile]);

  return (
    <AppLayout title="Students">
      <section className="rounded-2xl border border-line bg-panel p-5">
        {isLoading ? (
          <p className="text-sm text-muted">Loading students...</p>
        ) : rows.length === 0 ? (
          <EmptyState title="No students found" message="Student records will appear here once they are assigned to this school." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-line text-muted">
                <tr>
                  <th className="px-3 py-3 font-medium">Name</th>
                  <th className="px-3 py-3 font-medium">User ID</th>
                  <th className="px-3 py-3 font-medium">Role</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((student) => (
                  <tr key={student.id} className="border-b border-line last:border-b-0">
                    <td className="px-3 py-3 text-text">{student.full_name ?? 'Unknown student'}</td>
                    <td className="px-3 py-3 text-muted">{student.user_id ?? student.id}</td>
                    <td className="px-3 py-3 text-muted">{student.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppLayout>
  );
}

function TeachersPage() {
  const { profile } = useAuth();
  const [rows, setRows] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!profile?.school_id) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('school_id', profile.school_id)
        .eq('role', 'teacher');

      if (!error) {
        setRows((data ?? []) as Profile[]);
      }
      setIsLoading(false);
    };

    void load();
  }, [profile]);

  return (
    <AppLayout title="Teachers">
      <section className="rounded-2xl border border-line bg-panel p-5">
        {isLoading ? (
          <p className="text-sm text-muted">Loading teachers...</p>
        ) : rows.length === 0 ? (
          <EmptyState title="No teachers found" message="Teacher profiles will appear here once they are assigned to this school." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-line text-muted">
                <tr>
                  <th className="px-3 py-3 font-medium">Name</th>
                  <th className="px-3 py-3 font-medium">Email</th>
                  <th className="px-3 py-3 font-medium">Role</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((teacher) => (
                  <tr key={teacher.id} className="border-b border-line last:border-b-0">
                    <td className="px-3 py-3 text-text">{teacher.full_name ?? 'Unknown teacher'}</td>
                    <td className="px-3 py-3 text-muted">{teacher.email ?? 'Not available'}</td>
                    <td className="px-3 py-3 text-muted">{teacher.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppLayout>
  );
}

function ClassesPage() {
  const { profile } = useAuth();
  const [rows, setRows] = useState<Array<{ id: string; name?: string; school_id?: string | number }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!profile?.school_id) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.from('classes').select('*').eq('school_id', profile.school_id);
      if (!error) {
        setRows((data ?? []) as Array<{ id: string; name?: string; school_id?: string | number }>);
      }
      setIsLoading(false);
    };

    void load();
  }, [profile]);

  return (
    <AppLayout title="Classes">
      <section className="rounded-2xl border border-line bg-panel p-5">
        {isLoading ? (
          <p className="text-sm text-muted">Loading classes...</p>
        ) : rows.length === 0 ? (
          <EmptyState title="No classes found" message="Classes for this school will appear here after they are created." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((row) => (
              <div key={row.id} className="rounded-xl border border-line bg-[#121d33] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-green">Class</p>
                <h3 className="mt-2 text-lg font-semibold text-text">{row.name ?? 'Unnamed class'}</h3>
                <p className="mt-2 text-sm text-muted">School ID: {String(row.school_id)}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </AppLayout>
  );
}

function AttendancePage() {
  const { profile } = useAuth();
  const [rows, setRows] = useState<Array<{ id: string; student_id?: string; status?: string; date?: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!profile?.school_id) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.from('attendance').select('*').eq('school_id', profile.school_id).limit(20);
      if (!error) {
        setRows((data ?? []) as Array<{ id: string; student_id?: string; status?: string; date?: string }>);
      }
      setIsLoading(false);
    };

    void load();
  }, [profile]);

  return (
    <AppLayout title="Attendance">
      <section className="rounded-2xl border border-line bg-panel p-5">
        {isLoading ? (
          <p className="text-sm text-muted">Loading attendance...</p>
        ) : rows.length === 0 ? (
          <EmptyState title="No attendance records" message="Attendance data for this school will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-line text-muted">
                <tr>
                  <th className="px-3 py-3 font-medium">Student</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-line last:border-b-0">
                    <td className="px-3 py-3 text-text">{row.student_id ?? 'Unknown'}</td>
                    <td className="px-3 py-3 text-muted">{row.status ?? 'Pending'}</td>
                    <td className="px-3 py-3 text-muted">{row.date ?? 'Unknown date'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppLayout>
  );
}

function ResultsPage() {
  const { profile } = useAuth();
  const [rows, setRows] = useState<Array<{ id: string; student_id?: string; score?: number; subject?: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!profile?.school_id) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.from('results').select('*').eq('school_id', profile.school_id).limit(20);
      if (!error) {
        setRows((data ?? []) as Array<{ id: string; student_id?: string; score?: number; subject?: string }>);
      }
      setIsLoading(false);
    };

    void load();
  }, [profile]);

  return (
    <AppLayout title="Results">
      <section className="rounded-2xl border border-line bg-panel p-5">
        {isLoading ? (
          <p className="text-sm text-muted">Loading results...</p>
        ) : rows.length === 0 ? (
          <EmptyState title="No results yet" message="Assessment results will appear once students are graded." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-line text-muted">
                <tr>
                  <th className="px-3 py-3 font-medium">Student</th>
                  <th className="px-3 py-3 font-medium">Subject</th>
                  <th className="px-3 py-3 font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-line last:border-b-0">
                    <td className="px-3 py-3 text-text">{row.student_id ?? 'Unknown'}</td>
                    <td className="px-3 py-3 text-muted">{row.subject ?? 'General'}</td>
                    <td className="px-3 py-3 text-muted">{row.score ?? 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppLayout>
  );
}

function AnnouncementsPage() {
  const { profile } = useAuth();
  const [rows, setRows] = useState<Array<{ id: string; title?: string; message?: string; created_at?: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!profile?.school_id) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.from('announcements').select('*').eq('school_id', profile.school_id).order('created_at', { ascending: false });
      if (!error) {
        setRows((data ?? []) as Array<{ id: string; title?: string; message?: string; created_at?: string }>);
      }
      setIsLoading(false);
    };

    void load();
  }, [profile]);

  return (
    <AppLayout title="Announcements">
      <section className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted">Loading announcements...</p>
        ) : rows.length === 0 ? (
          <EmptyState title="No announcements" message="School-wide notices will appear here when published." />
        ) : (
          rows.map((announcement) => (
            <article key={announcement.id} className="rounded-2xl border border-line bg-panel p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-green">Announcement</p>
              <h3 className="mt-2 text-xl font-semibold text-text">{announcement.title ?? 'School update'}</h3>
              <p className="mt-2 text-sm text-muted">{announcement.message ?? 'No details provided.'}</p>
              <p className="mt-3 text-xs text-muted">{announcement.created_at ? new Date(announcement.created_at).toLocaleString() : 'Date unavailable'}</p>
            </article>
          ))
        )}
      </section>
    </AppLayout>
  );
}

function TeacherOverviewPage() {
  const { profile } = useAuth();
  const [assignedClasses, setAssignedClasses] = useState<Array<{ id: string; name?: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!profile) {
        setLoading(false);
        return;
      }

      try {
        const { data: assignmentRows } = await supabase
          .from('teacher_class_assignments')
          .select('class_id')
          .eq('teacher_id', profile.id);

        const classIds = (assignmentRows ?? []).map((row) => row.class_id).filter(Boolean);

        let classResult;
        if (classIds.length > 0) {
          classResult = await supabase.from('classes').select('*').in('id', classIds).eq('school_id', profile.school_id);
        } else {
          classResult = await supabase.from('classes').select('*').eq('teacher_id', profile.id).eq('school_id', profile.school_id);
        }

        setAssignedClasses((classResult?.data ?? []) as Array<{ id: string; name?: string }>);
      } catch {
        setAssignedClasses([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [profile]);

  return (
    <AppLayout title="Teacher dashboard">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Assigned classes" value={loading ? '...' : String(assignedClasses.length)} accent="bg-violet-500" />
          <StatCard label="Students" value="-" accent="bg-sky-500" />
          <StatCard label="Assessments" value="-" accent="bg-emerald-500" />
        </div>

        <section className="rounded-2xl border border-line bg-panel p-5">
          <h2 className="mb-4 text-lg font-semibold text-text">My classes</h2>
          {loading ? (
            <p className="text-sm text-muted">Loading assigned classes...</p>
          ) : assignedClasses.length === 0 ? (
            <EmptyState title="No assigned classes" message="You have not been assigned a class in this school yet." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {assignedClasses.map((entry) => (
                <div key={entry.id} className="rounded-xl border border-line bg-[#121d33] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-green">Class</p>
                  <h3 className="mt-2 text-lg font-semibold text-text">{entry.name ?? 'Untitled class'}</h3>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}

function StudentOverviewPage() {
  const { profile } = useAuth();
  const [attendance, setAttendance] = useState<Array<{ id: string; status?: string; date?: string }>>([]);
  const [results, setResults] = useState<Array<{ id: string; subject?: string; score?: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!profile) {
        setLoading(false);
        return;
      }

      try {
        const [attendanceResult, resultResult] = await Promise.all([
          supabase.from('attendance').select('*').eq('student_id', profile.id).order('date', { ascending: false }).limit(5),
          supabase.from('results').select('*').eq('student_id', profile.id).limit(5),
        ]);

        setAttendance((attendanceResult.data ?? []) as Array<{ id: string; status?: string; date?: string }>);
        setResults((resultResult.data ?? []) as Array<{ id: string; subject?: string; score?: number }>);
      } catch {
        setAttendance([]);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [profile]);

  return (
    <AppLayout title="Student dashboard">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Attendance" value={loading ? '...' : String(attendance.length)} accent="bg-violet-500" />
          <StatCard label="Results" value={loading ? '...' : String(results.length)} accent="bg-sky-500" />
          <StatCard label="Profile" value={profile?.full_name ?? 'Student'} accent="bg-emerald-500" />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-2xl border border-line bg-panel p-5">
            <h2 className="mb-4 text-lg font-semibold text-text">Recent attendance</h2>
            {loading ? (
              <p className="text-sm text-muted">Loading attendance...</p>
            ) : attendance.length === 0 ? (
              <EmptyState title="No attendance records" message="Your attendance history will show here as it is recorded." />
            ) : (
              <ul className="space-y-3 text-sm text-muted">
                {attendance.map((entry) => (
                  <li key={entry.id} className="flex items-center justify-between rounded-lg border border-line bg-[#121d33] px-3 py-2">
                    <span>{entry.date ?? 'Unknown date'}</span>
                    <span className="font-medium text-text">{entry.status ?? 'Pending'}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-line bg-panel p-5">
            <h2 className="mb-4 text-lg font-semibold text-text">Recent marks</h2>
            {loading ? (
              <p className="text-sm text-muted">Loading marks...</p>
            ) : results.length === 0 ? (
              <EmptyState title="No marks yet" message="Your assessment results will appear here once available." />
            ) : (
              <ul className="space-y-3 text-sm text-muted">
                {results.map((entry) => (
                  <li key={entry.id} className="flex items-center justify-between rounded-lg border border-line bg-[#121d33] px-3 py-2">
                    <span>{entry.subject ?? 'Assessment'}</span>
                    <span className="font-medium text-text">{entry.score ?? 'N/A'}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </AppLayout>
  );
}

function LoginPage() {
  const { signIn, loading, authError, profile } = useAuth();
  const [schoolUserId, setSchoolUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (profile) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    await signIn(schoolUserId, password);
    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b1020] p-4 text-text">
      <div className="w-full max-w-md rounded-3xl border border-line bg-panel shadow-2xl shadow-slate-950/30">
        <div className="border-b border-line px-6 py-5">
          <p className="text-xs uppercase tracking-[0.22em] text-green">LearnLoop</p>
          <h1 className="mt-2 text-3xl font-bold text-text">Sign in</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          <div>
            <label htmlFor="schoolUserId" className="mb-2 block text-sm font-medium text-muted">
              School-issued user ID
            </label>
            <input
              id="schoolUserId"
              value={schoolUserId}
              onChange={(event) => setSchoolUserId(event.target.value)}
              placeholder="e.g. S-2048"
              className="w-full rounded-xl border border-line bg-[#0d1425] px-3 py-3 text-text outline-none transition focus:border-accent"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-muted">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-line bg-[#0d1425] px-3 py-3 text-text outline-none transition focus:border-accent"
            />
          </div>

          {authError ? (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {authError}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading || isSubmitting || !schoolUserId.trim() || !password.trim()}
            className="w-full rounded-xl bg-accent px-4 py-3 font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading || isSubmitting ? 'Signing in...' : 'Continue'}
          </button>

          <p className="text-center text-xs text-muted">
            Your school must configure the trusted backend mapping before this sign-in flow can complete.
          </p>
        </form>
      </div>
    </div>
  );
}

function ProtectedRoute({ requiredRole, children }: { requiredRole?: 'school_admin' | 'teacher' | 'student'; children: React.ReactNode }) {
  const { profile, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-bg text-text">Loading...</div>;
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && profile.role !== requiredRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-4 text-center text-text">
        <div className="max-w-md rounded-2xl border border-line bg-panel p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-green">Permission denied</p>
          <h1 className="mt-3 text-2xl font-bold">You do not have access to this page.</h1>
          <p className="mt-3 text-sm text-muted">Your role is {profile.role}. Please use the correct dashboard for your account.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardSwitch /></ProtectedRoute>} />
      <Route path="/students" element={<ProtectedRoute requiredRole="school_admin"><StudentsPage /></ProtectedRoute>} />
      <Route path="/teachers" element={<ProtectedRoute requiredRole="school_admin"><TeachersPage /></ProtectedRoute>} />
      <Route path="/classes" element={<ProtectedRoute requiredRole="school_admin"><ClassesPage /></ProtectedRoute>} />
      <Route path="/attendance" element={<ProtectedRoute requiredRole="school_admin"><AttendancePage /></ProtectedRoute>} />
      <Route path="/results" element={<ProtectedRoute requiredRole="school_admin"><ResultsPage /></ProtectedRoute>} />
      <Route path="/announcements" element={<ProtectedRoute requiredRole="school_admin"><AnnouncementsPage /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
