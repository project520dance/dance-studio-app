import Link from "next/link";

type DashboardCardProps = {
  title: string;
  description: string;
  href: string;
  icon: string;
  accent?: "pink" | "purple";
};

export function DashboardCard({
  title,
  description,
  href,
  icon,
  accent = "purple",
}: DashboardCardProps) {
  const accentStyle = accent === "pink" ? "bg-pink-100" : "bg-purple-100";

  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-200 hover:shadow-md"
    >
      <span
        className={`flex size-11 items-center justify-center rounded-xl text-xl ${accentStyle}`}
        aria-hidden="true"
      >
        {icon}
      </span>
      <h2 className="mt-5 font-semibold">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      <span className="mt-4 inline-block text-sm font-medium text-purple-700">View details →</span>
    </Link>
  );
}
