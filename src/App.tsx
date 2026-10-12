import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import type { Profile } from './types';
import { Sidebar } from './components/Sidebar';
import { StatCard } from './components/StatCard';
import { EmptyState } from './components/EmptyState';

const MOCK_PROFILES: Profile[] = [
  {
    id: 'admin-1',
    school_id: 'S-100',
    role: 'school_admin',
    full_name: 'Alicia Rowan',
    email: 'admin@learnloop.local',
    user_id: 'ADMIN-001',
  },
  {
    id: 'teacher-1',
    school_id: 'S-100',
    role: 'teacher',
    full_name: 'Mia Carter',
    email: 'mia.carter@learnloop.local',
    user_id: 'T-2048',
  },
  {
    id: 'teacher-2',
    school_id: 'S-100',
    role: 'teacher',
    full_name: 'Liam Brooks',
    email: 'liam.brooks@learnloop.local',
    user_id: 'T-2051',
  },
  {
    id: 'student-1',
    school_id: 'S-100',
    role: 'student',
    full_name: 'Noah Patel',
    email: 'noah.patel@learnloop.local',
    user_id: 'ST-3001',
  },
  {
    id: 'student-2',
    school_id: 'S-100',
    role: 'student',
    full_name: 'Priya Shah',
    email: 'priya.shah@learnloop.local',
    user_id: 'ST-3002',
  },
  {
    id: 'student-3',
    school_id: 'S-100',
    role: 'student',
    full_name: 'Ethan Walker',
    email: 'ethan.walker@learnloop.local',
    user_id: 'ST-3003',
  },
];

const MOCK_CLASSES = [
  { id: 'class-1', school_id: 'S-100', name: 'Algebra I', teacher_id: 'teacher-1' },
  { id: 'class-2', school_id: 'S-100', name: 'English Literature', teacher_id: 'teacher-2' },
  { id: 'class-3', school_id: 'S-100', name: 'Biology', teacher_id: 'teacher-1' },
];

const MOCK_ATTENDANCE = [
  { id: 'attendance-1', school_id: 'S-100', student_id: 'student-1', status: 'Present', date: '2026-10-12' },
  { id: 'attendance-2', school_id: 'S-100', student_id: 'student-1', status: 'Late', date: '2026-10-11' },
  { id: 'attendance-3', school_id: 'S-100', student_id: 'student-2', status: 'Present', date: '2026-10-12' },
  { id: 'attendance-4', school_id: 'S-100', student_id: 'student-3', status: 'Absent', date: '2026-10-12' },
];

const MOCK_RESULTS = [
  { id: 'result-1', school_id: 'S-100', student_id: 'student-1', subject: 'Math', score: 92 },
  { id: 'result-2', school_id: 'S-100', student_id: 'student-2', subject: 'English', score: 88 },
  { id: 'result-3', school_id: 'S-100', student_id: 'student-3', subject: 'Science', score: 81 },
];

const MOCK_ANNOUNCEMENTS = [
  { id: 'announcement-1', school_id: 'S-100', title: 'Parent conference day', message: 'We are hosting a parent conference day on Friday.', created_at: '2026-10-12T09:00:00Z' },
  { id: 'announcement-2', school_id: 'S-100', title: 'Library hours', message: 'The library is extending hours for exam week.', created_at: '2026-10-10T14:00:00Z' },
];

function AppLayout({ title, actions, children }: { title: string; actions?: React.ReactNode; children: React.ReactNode }) {
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

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  const stats = {
    students: MOCK_PROFILES.filter((entry) => entry.school_id === profile.school_id && entry.role === 'student').length,
    teachers: MOCK_PROFILES.filter((entry) => entry.school_id === profile.school_id && entry.role === 'teacher').length,
    classes: MOCK_CLASSES.filter((entry) => entry.school_id === profile.school_id).length,
    announcements: MOCK_ANNOUNCEMENTS.filter((entry) => entry.school_id === profile.school_id).length,
  };

  return (
    <AppLayout title="Admin dashboard">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Students" value={String(stats.students)} accent="bg-violet-500" />
          <StatCard label="Teachers" value={String(stats.teachers)} accent="bg-sky-500" />
          <StatCard label="Classes" value={String(stats.classes)} accent="bg-emerald-500" />
          <StatCard label="Announcements" value={String(stats.announcements)} accent="bg-amber-500" />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-2xl border border-line bg-panel p-5">
            <h2 className="mb-4 text-lg font-semibold text-text">School summary</h2>
            <ul className="space-y-3 text-sm text-muted">
              <li>• This demo build no longer connects to the Supabase database.</li>
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

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  const rows = MOCK_PROFILES.filter((entry) => entry.school_id === profile.school_id && entry.role === 'student');

  return (
    <AppLayout title="Students">
      <section className="rounded-2xl border border-line bg-panel p-5">
        {rows.length === 0 ? (
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

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  const rows = MOCK_PROFILES.filter((entry) => entry.school_id === profile.school_id && entry.role === 'teacher');

  return (
    <AppLayout title="Teachers">
      <section className="rounded-2xl border border-line bg-panel p-5">
        {rows.length === 0 ? (
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

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  const rows = MOCK_CLASSES.filter((entry) => entry.school_id === profile.school_id);

  return (
    <AppLayout title="Classes">
      <section className="rounded-2xl border border-line bg-panel p-5">
        {rows.length === 0 ? (
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

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  const rows = MOCK_ATTENDANCE.filter((entry) => entry.school_id === profile.school_id);

  return (
    <AppLayout title="Attendance">
      <section className="rounded-2xl border border-line bg-panel p-5">
        {rows.length === 0 ? (
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

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  const rows = MOCK_RESULTS.filter((entry) => entry.school_id === profile.school_id);

  return (
    <AppLayout title="Results">
      <section className="rounded-2xl border border-line bg-panel p-5">
        {rows.length === 0 ? (
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

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  const rows = MOCK_ANNOUNCEMENTS.filter((entry) => entry.school_id === profile.school_id);

  return (
    <AppLayout title="Announcements">
      <section className="space-y-4">
        {rows.length === 0 ? (
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

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  const assignedClasses = MOCK_CLASSES.filter((entry) => entry.teacher_id === profile.id && entry.school_id === profile.school_id);

  return (
    <AppLayout title="Teacher dashboard">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Assigned classes" value={String(assignedClasses.length)} accent="bg-violet-500" />
          <StatCard label="Students" value="-" accent="bg-sky-500" />
          <StatCard label="Assessments" value="-" accent="bg-emerald-500" />
        </div>

        <section className="rounded-2xl border border-line bg-panel p-5">
          <h2 className="mb-4 text-lg font-semibold text-text">My classes</h2>
          {assignedClasses.length === 0 ? (
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

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  const attendance = MOCK_ATTENDANCE.filter((entry) => entry.student_id === profile.id);
  const results = MOCK_RESULTS.filter((entry) => entry.student_id === profile.id);

  return (
    <AppLayout title="Student dashboard">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Attendance" value={String(attendance.length)} accent="bg-violet-500" />
          <StatCard label="Results" value={String(results.length)} accent="bg-sky-500" />
          <StatCard label="Profile" value={profile?.full_name ?? 'Student'} accent="bg-emerald-500" />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-2xl border border-line bg-panel p-5">
            <h2 className="mb-4 text-lg font-semibold text-text">Recent attendance</h2>
            {attendance.length === 0 ? (
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
            {results.length === 0 ? (
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
              placeholder="e.g. T-2048"
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
            Demo credentials: ADMIN-001, T-2048, or ST-3001 with password <strong>demo123</strong>.
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
