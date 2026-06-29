"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DancerAvatar } from "@/components/dancers/DancerAvatar";
import { Select } from "@/components/ui/Select";
import {
  AdminServiceError,
  getAllDancers,
  getAllFamilies,
} from "@/services/adminService";
import type { Dancer } from "@/types/dancer";

type StatusFilter = "active" | "archived" | "all";

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
  const [familyNames, setFamilyNames] = useState<Map<string, string>>(new Map());
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadDancers() {
      try {
        const [dancerItems, families] = await Promise.all([
          getAllDancers(),
          getAllFamilies(),
        ]);
        if (isActive) {
          setDancers(dancerItems);
          setFamilyNames(new Map(
            families.map((family) => [family.id, family.familyName]),
          ));
        }
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

  const visibleDancers = dancers.filter((dancer) =>
    statusFilter === "all" || dancer.status === statusFilter,
  );

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-purple-600">Admin Portal</p>
          <h1 className="mt-1 text-3xl font-bold">Students</h1>
          <p className="mt-2 text-slate-600">
            {visibleDancers.length} student{visibleDancers.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link className="rounded-lg bg-purple-600 px-4 py-3 text-sm font-semibold text-white" href="/admin/students/new">
          Add student
        </Link>
      </div>

      <div className="mt-6 max-w-xs">
        <Select label="Status filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
          <option value="all">All</option>
        </Select>
      </div>

      {visibleDancers.length > 0 ? (
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Dancer</th>
                  <th className="px-5 py-3 font-medium">Birthdate</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Family</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleDancers.map((dancer) => (
                  <tr key={dancer.id}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <DancerAvatar name={`${dancer.firstName} ${dancer.lastName}`} photoUrl={dancer.photoUrl} />
                        <span className="font-semibold">{dancer.firstName} {dancer.lastName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{formatBirthdate(dancer.birthdate)}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                        dancer.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {dancer.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {dancer.familyId
                        ? familyNames.get(dancer.familyId) ?? "Unknown family"
                        : "No family"}
                    </td>
                    <td className="px-5 py-4">
                      <Link className="font-semibold text-purple-600 hover:text-purple-700" href={`/admin/students/${dancer.id}`}>
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-purple-200 bg-white p-8">
          <h2 className="font-semibold">No students found</h2>
          <p className="mt-2 text-sm text-slate-500">No students match the selected status filter.</p>
        </div>
      )}
    </section>
  );
}
