import { DashboardCard } from "@/components/dashboard/DashboardCard";

const cards = [
  ["My Dancers", "View dancer profiles and enrollment details.", "/parent/dancers", "🩰"],
  ["Schedule", "See upcoming classes, rehearsals, and events.", "/parent/schedule", "📅"],
  ["Payments", "Review balances and payment history.", "/parent/payments", "💳"],
  ["Private Lessons", "Browse lesson information and requests.", "/parent/privates", "🎵"],
  ["Waivers", "Check studio forms and waivers.", "/parent/waivers", "📄"],
  ["Notifications", "See reminders, deadlines, and schedule changes.", "/parent/notifications", "🔔"],
  ["Announcements", "Catch up on the latest studio news.", "/parent/announcements", "📢"],
  ["Documents", "Find calendars and studio resources.", "/parent/documents", "📁"],
  ["Competition Hub", "Team assignments, costumes, schedules, fees, and resources.", "/parent/competition-hub", "⭐"],
] as const;

export default function ParentPage() {
  return (
    <section>
      <div className="rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-white sm:p-8">
        <p className="text-sm font-medium text-pink-100">Parent Portal</p>
        <h1 className="mt-2 text-3xl font-bold">Welcome back!</h1>
        <p className="mt-2 text-purple-50">Everything you need for your dancers, all in one place.</p>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([title, description, href, icon], index) => (
          <DashboardCard key={title} title={title} description={description} href={href} icon={icon} accent={index % 2 === 0 ? "pink" : "purple"} />
        ))}
      </div>
    </section>
  );
}
