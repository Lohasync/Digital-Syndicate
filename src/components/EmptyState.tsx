export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-[#111a2d] p-8 text-center">
      <p className="text-lg font-semibold text-text">{title}</p>
      <p className="mt-2 text-sm text-muted">{message}</p>
    </div>
  );
}
