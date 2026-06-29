"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getAllDancers } from "@/services/adminService";
import { getStudioClass } from "@/services/classService";
import { getEnrollmentsForClass } from "@/services/enrollmentService";
import type { Dancer } from "@/types/dancer";
import type { Enrollment, EnrollmentStatus } from "@/types/enrollment";
import type { StudioClass } from "@/types/studioClass";

type Filter = EnrollmentStatus | "all";
const filters: { label: string; value: Filter }[] = [
  { label: "Active", value: "active" },
  { label: "Withdrawn", value: "withdrawn" },
  { label: "Completed", value: "completed" },
  { label: "Archived", value: "archived" },
  { label: "All", value: "all" },
];

export function EnrollmentList({ classId }: { classId: string }) {
  const [studioClass, setStudioClass] = useState<StudioClass | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [dancers, setDancers] = useState<Dancer[]>([]);
  const [filter, setFilter] = useState<Filter>("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void Promise.all([
      getStudioClass(classId),
      getEnrollmentsForClass(classId),
      getAllDancers(),
    ])
      .then(([classItem, enrollmentItems, dancerItems]) => {
        if (!classItem) throw new Error("Class not found.");
        setStudioClass(classItem);
        setEnrollments(enrollmentItems);
        setDancers(dancerItems);
      })
      .catch((reason: unknown) =>
        setError(reason instanceof Error ? reason.message : "Unable to load enrollments."),
      )
      .finally(() => setLoading(false));
  }, [classId]);

  const filteredEnrollments = useMemo(
    () => filter === "all" ? enrollments : enrollments.filter((item) => item.status === filter),
    [enrollments, filter],
  );
  const dancerNames = new Map(dancers.map((dancer) => [
    dancer.id,
    `${dancer.firstName} ${dancer.lastName}`,
  ]));

  if (loading) return <p className="rounded-2xl bg-white p-8 text-center">Loading enrollments…</p>;

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link className="text-sm font-semibold text-purple-700" href={`/admin/classes/${classId}`}>← Back to class</Link>
          <h1 className="mt-2 text-3xl font-bold">{studioClass?.name} enrollments</h1>
        </div>
        <Link className="inline-flex min-h-11 items-center rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white" href={`/admin/classes/${classId}/enrollments/new`}>Add enrollment</Link>
      </div>
      <div className="mt-6 flex flex-wrap gap-2" aria-label="Enrollment status filters">
        {filters.map((item) => (
          <button key={item.value} type="button" onClick={() => setFilter(item.value)} className={`rounded-full px-4 py-2 text-sm font-semibold ${filter === item.value ? "bg-purple-600 text-white" : "border border-slate-200 bg-white text-slate-700"}`}>
            {item.label}
          </button>
        ))}
      </div>
      {error && <p role="alert" className="mt-6 text-sm text-red-600">{error}</p>}
      {!error && filteredEnrollments.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-slate-600">No {filter === "all" ? "" : `${filter} `}enrollments found.</p>
          <Link className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white" href={`/admin/classes/${classId}/enrollments/new`}>Add enrollment</Link>
        </div>
      )}
      {filteredEnrollments.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {filteredEnrollments.map((enrollment) => (
            <Link key={enrollment.id} href={`/admin/classes/${classId}/enrollments/${enrollment.id}`} className="grid gap-2 border-b border-slate-100 p-5 last:border-b-0 hover:bg-slate-50 sm:grid-cols-4">
              <span className="font-semibold">{dancerNames.get(enrollment.dancerId) ?? "Unknown dancer"}</span>
              <span className="capitalize text-slate-600">{enrollment.status}</span>
              <span className="text-slate-600">{enrollment.startDate}</span>
              <span className="text-slate-600">{enrollment.endDate ?? "Ongoing"}</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
