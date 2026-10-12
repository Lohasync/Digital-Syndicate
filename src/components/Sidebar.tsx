import { useAuth } from '../context/AuthContext';

export function Sidebar({ profile }: { profile: { full_name?: string; role: string } }) {
  const navItems =
    profile.role === 'school_admin'
      ? [
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Students', to: '/students' },
          { label: 'Teachers', to: '/teachers' },
          { label: 'Classes', to: '/classes' },
          { label: 'Attendance', to: '/attendance' },
          { label: 'Results', to: '/results' },
          { label: 'Announcements', to: '/announcements' },
        ]
      : profile.role === 'teacher'
        ? [
            { label: 'Dashboard', to: '/dashboard' },
            { label: 'Classes', to: '/classes' },
            { label: 'Attendance', to: '/attendance' },
            { label: 'Results', to: '/results' },
          ]
        : [
            { label: 'Dashboard', to: '/dashboard' },
            { label: 'Attendance', to: '/attendance' },
            { label: 'Results', to: '/results' },
            { label: 'Announcements', to: '/announcements' },
          ];

  const { signOut } = useAuth();

  return (
    <aside className="w-full border-b border-line bg-[#111a2d] p-4 xl:w-72 xl:border-b-0 xl:border-r">
      <div className="mb-6 flex items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-green">LearnLoop</p>
          <h2 className="mt-2 text-xl font-bold text-text">Digital Syndicate</h2>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-line bg-[#162338] p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Signed in as</p>
        <p className="mt-2 text-lg font-semibold text-text">{profile.full_name ?? 'School account'}</p>
        <p className="mt-1 text-sm capitalize text-muted">{profile.role.replace('_', ' ')}</p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <a
            key={item.to}
            href={item.to}
            className="block rounded-xl border border-transparent bg-transparent px-3 py-2.5 text-sm font-medium text-muted transition hover:border-line hover:bg-[#172339] hover:text-white"
          >
            {item.label}
          </a>
        ))}
      </nav>

      <button
        type="button"
        onClick={signOut}
        className="mt-6 w-full rounded-xl border border-line bg-[#172339] px-3 py-2.5 text-sm font-semibold text-white transition hover:border-accent"
      >
        Sign out
      </button>
    </aside>
  );
}
