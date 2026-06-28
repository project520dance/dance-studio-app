import { DashboardCard } from "@/components/dashboard/DashboardCard";

const cards = [
  ["Attendance", "Track class attendance.", "/teacher/attendance", "✅"],
  ["Classes", "View class rosters and lesson plans.", "/teacher/classes", "🎓"],
  ["Private Lessons", "Manage private lesson schedules.", "/teacher/privates", "🎵"],
] as const;

export default function TeacherPage() {
  return (
    <section>
      <p className="text-sm font-semibold text-purple-600">Teacher Portal</p>
      <h1 className="mt-1 text-3xl font-bold">Welcome back!</h1>
      <p className="mt-2 text-slate-600">Teaching tools and class information will appear here.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([title, description, href, icon]) => (
          <DashboardCard key={title} title={title} description={description} href={href} icon={icon} />
        ))}
      </div>
    </section>
  );
}
