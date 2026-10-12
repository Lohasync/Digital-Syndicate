export function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-panel p-4 shadow-lg shadow-slate-950/10">
      <div className={`mb-3 h-2 w-12 rounded-full ${accent ?? 'bg-accent'}`} />
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-3 text-3xl font-bold text-text">{value}</p>
    </div>
  );
}
