import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 text-slate-950">
      <header className="border-b border-white/80 bg-white/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Logo />
          <Link href="/login" className="text-sm font-semibold text-purple-700">
            Already have an account?
          </Link>
        </div>
      </header>
      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 md:items-center md:py-24">
        <div>
          <p className="font-semibold text-pink-600">Project 520</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Helping Families Stay Connected</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            A simple home for schedules, studio updates, dancer information, and everything your family needs throughout the season.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/login" className="rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 text-center font-semibold text-white">Login</Link>
            <Link href="/register" className="rounded-lg border border-purple-200 bg-white px-6 py-3 text-center font-semibold text-purple-700">Register</Link>
          </div>
        </div>
        <div className="space-y-4">
          {[
            ["📢", "Studio Announcements", "Important studio news and family updates will appear here."],
            ["📅", "Upcoming Events", "Performances, rehearsals, and special events will appear here."],
          ].map(([icon, title, description]) => (
            <article key={title} className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
              <span className="text-2xl" aria-hidden="true">{icon}</span>
              <h2 className="mt-4 text-xl font-semibold">{title}</h2>
              <p className="mt-2 text-slate-600">{description}</p>
            </article>
          ))}
        </div>
      </section>
      <footer className="border-t border-purple-100 bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm text-slate-600 sm:px-6 md:grid-cols-2">
          <div><p className="font-semibold text-slate-900">Project 520 Dance Studio</p><p className="mt-2">Helping dancers and families stay connected.</p></div>
          <div className="md:text-right"><p>Email: studio@example.com</p><p>Phone: (000) 000-0000</p><p className="mt-2">© {new Date().getFullYear()} Project 520 Dance Studio</p></div>
        </div>
      </footer>
    </main>
  );
}
