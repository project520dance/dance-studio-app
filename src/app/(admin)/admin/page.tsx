import { DashboardCard } from "@/components/dashboard/DashboardCard";

const cards = [
  ["Students", "View student profiles and enrollment details.", "/admin/students", "🩰"],
  ["Teachers", "Manage teacher profiles and availability.", "/admin/teachers", "👩‍🏫"],
  ["Classes", "Organize the studio class schedule.", "/admin/classes", "🎓"],
  ["Payments", "Review studio payment summaries.", "/admin/payments", "💳"],
  ["Invoices", "View and organize studio invoices.", "/admin/invoices", "🧾"],
  ["Private Lessons", "Coordinate private lesson requests.", "/admin/privates", "🎵"],
  ["Announcements", "Prepare updates for studio families.", "/admin/announcements", "📢"],
  ["Reports", "Explore placeholder studio summaries.", "/admin/reports", "📊"],
  ["Studio Settings", "Manage fees, staff, waivers, and studio configuration.", "/admin/settings", "⚙️"],
] as const;

export default function AdminPage() {
  return (
    <section>
      <p className="text-sm font-semibold text-purple-600">Studio overview</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      <p className="mt-2 text-slate-600">Welcome back! Here is your Project 520 workspace.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([title, description, href, icon], index) => (
          <DashboardCard key={title} title={title} description={description} href={href} icon={icon} accent={index % 2 === 0 ? "purple" : "pink"} />
        ))}
      </div>
    </section>
  );
}
