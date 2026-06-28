"use client";

import { useEffect, useState } from "react";
import { DancerAvatar } from "@/components/dancers/DancerAvatar";
import {
  AdminServiceError,
  getAllDancers,
} from "@/services/adminService";
import type { Dancer } from "@/types/dancer";

function formatBirthdate(birthdate: string): string {
  const [year, month, day] = birthdate.split("-").map(Number);
  if (!year || !month || !day) return birthdate;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

export default function StudentsPage() {
  const [dancers, setDancers] = useState<Dancer[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadDancers() {
      try {
        const result = await getAllDancers();
        if (isActive) setDancers(result);
      } catch (dancerError) {
        if (isActive) {
          setError(
            dancerError instanceof AdminServiceError
              ? dancerError.message
              : "We couldn’t load the student list.",
          );
        }
      }
    }

    void loadDancers();
    return () => {
      isActive = false;
    };
  }, []);

  if (error) {
    return (
      <section className="rounded-2xl border border-red-100 bg-white p-8">
        <h1 className="text-2xl font-bold">We couldn’t load students</h1>
        <p role="alert" className="mt-2 text-slate-600">{error}</p>
      </section>
    );
  }

  if (!dancers) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center" aria-live="polite">
        <div className="mx-auto size-10 animate-spin rounded-full border-4 border-purple-100 border-t-purple-600" aria-hidden="true" />
        <h1 className="mt-5 text-xl font-semibold">Loading students</h1>
      </section>
    );
  }

  return (
    <section>
      <p className="text-sm font-semibold text-purple-600">Admin Portal</p>
      <h1 className="mt-1 text-3xl font-bold">Students</h1>
      <p className="mt-2 text-slate-600">
        {dancers.length} dancer{dancers.length === 1 ? "" : "s"}
      </p>

      {dancers.length > 0 ? (
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Dancer</th>
                  <th className="px-5 py-3 font-medium">Birthdate</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Family ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dancers.map((dancer) => (
                  <tr key={dancer.id}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <DancerAvatar name={`${dancer.firstName} ${dancer.lastName}`} photoUrl={dancer.photoUrl} />
                        <span className="font-semibold">{dancer.firstName} {dancer.lastName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{formatBirthdate(dancer.birthdate)}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold capitalize text-green-700">
                        {dancer.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">{dancer.familyId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-purple-200 bg-white p-8">
          <h2 className="font-semibold">No students yet</h2>
          <p className="mt-2 text-sm text-slate-500">Student records will appear here after onboarding.</p>
        </div>
      )}
    </section>
  );
}
