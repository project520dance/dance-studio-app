"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { DancerAvatar } from "@/components/dancers/DancerAvatar";
import {
  DashboardServiceError,
  getParentDashboard,
  type ParentDashboard,
} from "@/services/dashboardService";

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

function formatBirthdate(birthdate: string): string {
  const [year, month, day] = birthdate.split("-").map(Number);

  if (!year || !month || !day) {
    return birthdate;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

export default function ParentPage() {
  const [dashboard, setDashboard] =
    useState<ParentDashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadDashboard() {
      try {
        const result = await getParentDashboard();
        if (isActive) {
          setDashboard(result);
        }
      } catch (dashboardError) {
        if (isActive) {
          setError(
            dashboardError instanceof DashboardServiceError
              ? dashboardError.message
              : "We couldn’t load your dashboard. Please try again.",
          );
        }
      }
    }

    void loadDashboard();

    return () => {
      isActive = false;
    };
  }, []);

  if (error) {
    return (
      <section className="rounded-2xl border border-red-100 bg-white p-8">
        <div className="flex size-10 items-center justify-center rounded-full bg-red-100 text-red-700" aria-hidden="true">!</div>
        <h1 className="mt-5 text-2xl font-bold">We couldn’t load your dashboard</h1>
        <p role="alert" className="mt-2 text-slate-600">{error}</p>
        <Link href="/loading-account" className="mt-6 inline-flex rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white">
          Try again
        </Link>
      </section>
    );
  }

  if (!dashboard) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center" aria-live="polite">
        <div className="mx-auto size-10 animate-spin rounded-full border-4 border-purple-100 border-t-purple-600" aria-hidden="true" />
        <h1 className="mt-5 text-xl font-semibold">Loading your dashboard</h1>
        <p className="mt-2 text-sm text-slate-500">We’re getting your family information.</p>
      </section>
    );
  }

  return (
    <section>
      <div className="rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-white sm:p-8">
        <p className="text-sm font-medium text-pink-100">Parent Portal</p>
        <h1 className="mt-2 text-3xl font-bold">
          Welcome back, {dashboard.profile.firstName}!
        </h1>
        <p className="mt-2 text-purple-50">
          {dashboard.family.familyName} · {dashboard.family.phone}
        </p>
      </div>

      <div className="mt-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-purple-600">Your family</p>
          <h2 className="mt-1 text-2xl font-bold">Dancers</h2>
        </div>
        <Link href="/parent/dancers/add" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white">
          Add Dancer
        </Link>
      </div>

      {dashboard.dancers.length > 0 ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {dashboard.dancers.map((dancer) => (
            <article key={dancer.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <DancerAvatar
                name={`${dancer.firstName} ${dancer.lastName}`}
                photoUrl={dancer.photoUrl}
              />
              <h3 className="mt-4 text-lg font-semibold">
                {dancer.firstName} {dancer.lastName}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Birthdate: {formatBirthdate(dancer.birthdate)}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-purple-200 bg-white p-6">
          <p className="font-semibold">No dancers added yet</p>
          <p className="mt-1 text-sm text-slate-500">Add your first dancer to get started.</p>
        </div>
      )}

      <div className="mt-10">
        <p className="text-sm font-semibold text-purple-600">Quick actions</p>
        <h2 className="mt-1 text-2xl font-bold">Studio tools</h2>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([title, description, href, icon], index) => (
          <DashboardCard
            key={title}
            title={title}
            description={description}
            href={href}
            icon={icon}
            accent={index % 2 === 0 ? "pink" : "purple"}
          />
        ))}
      </div>
    </section>
  );
}
