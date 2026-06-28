"use client";

import { useEffect, useState } from "react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import {
  AdminServiceError,
  getAdminDashboardStats,
  type AdminDashboardStats,
} from "@/services/adminService";

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

const statDetails = [
  { key: "totalFamilies", label: "Total Families", icon: "👨‍👩‍👧‍👦" },
  { key: "totalDancers", label: "Total Dancers", icon: "🩰" },
  { key: "activeDancers", label: "Active Dancers", icon: "✨" },
] as const;

export default function AdminPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadStats() {
      try {
        const result = await getAdminDashboardStats();
        if (isActive) setStats(result);
      } catch (statsError) {
        if (isActive) {
          setError(
            statsError instanceof AdminServiceError
              ? statsError.message
              : "We couldn’t load the studio overview.",
          );
        }
      }
    }

    void loadStats();
    return () => {
      isActive = false;
    };
  }, []);

  return (
    <section>
      <p className="text-sm font-semibold text-purple-600">Studio overview</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      <p className="mt-2 text-slate-600">Welcome back! Here is your Project 520 workspace.</p>

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-100 bg-white p-6">
          <h2 className="font-semibold">We couldn’t load your dashboard</h2>
          <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>
        </div>
      ) : stats ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {statDetails.map((stat) => (
            <article key={stat.key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-2xl" aria-hidden="true">{stat.icon}</span>
              <p className="mt-4 text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="mt-1 text-3xl font-bold">{stats[stat.key]}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center" aria-live="polite">
          <div className="mx-auto size-10 animate-spin rounded-full border-4 border-purple-100 border-t-purple-600" aria-hidden="true" />
          <p className="mt-4 font-medium">Loading studio overview</p>
        </div>
      )}

      <div className="mt-10">
        <p className="text-sm font-semibold text-purple-600">Management</p>
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
            accent={index % 2 === 0 ? "purple" : "pink"}
          />
        ))}
      </div>
    </section>
  );
}
