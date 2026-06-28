export function ComingSoonPage({ title }: { title: string }) {
  return (
    <section>
      <p className="text-sm font-semibold text-purple-600">Project 520</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">{title}</h1>
      <div className="mt-8 rounded-2xl border border-dashed border-purple-200 bg-white p-8">
        <h2 className="font-semibold">Coming Soon</h2>
        <p className="mt-2 text-sm text-slate-500">This area is ready for future features.</p>
      </div>
    </section>
  );
}
