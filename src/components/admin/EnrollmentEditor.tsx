"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { getAllDancers } from "@/services/adminService";
import { getStudioClass } from "@/services/classService";
import {
  archiveEnrollment,
  createEnrollment,
  getEnrollment,
  updateEnrollment,
} from "@/services/enrollmentService";
import { getPrograms } from "@/services/programService";
import { getSeasons } from "@/services/seasonService";
import type { Dancer } from "@/types/dancer";
import type { EnrollmentStatus } from "@/types/enrollment";
import type { Program } from "@/types/program";
import type { Season } from "@/types/season";
import type { StudioClass } from "@/types/studioClass";

type EnrollmentValue = {
  dancerId: string;
  status: EnrollmentStatus;
  startDate: string;
  endDate: string;
  notes: string;
};

const initialValue: EnrollmentValue = {
  dancerId: "",
  status: "active",
  startDate: "",
  endDate: "",
  notes: "",
};

export function EnrollmentEditor({
  classId,
  enrollmentId,
}: {
  classId: string;
  enrollmentId?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [studioClass, setStudioClass] = useState<StudioClass | null>(null);
  const [dancers, setDancers] = useState<Dancer[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void Promise.all([
      getStudioClass(classId),
      getAllDancers(),
      getSeasons(),
      getPrograms(),
      enrollmentId
        ? getEnrollment(classId, enrollmentId)
        : Promise.resolve(null),
    ])
      .then(([classItem, dancerItems, seasonItems, programItems, item]) => {
        if (!classItem) throw new Error("Class not found.");
        if (enrollmentId && !item) throw new Error("Enrollment not found.");
        setStudioClass(classItem);
        setDancers(dancerItems);
        setSeasons(seasonItems);
        setPrograms(programItems);
        if (item) {
          setValue({
            dancerId: item.dancerId,
            status: item.status,
            startDate: item.startDate,
            endDate: item.endDate ?? "",
            notes: item.notes,
          });
        }
      })
      .catch((reason: unknown) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Unable to load the enrollment editor.",
        ),
      )
      .finally(() => setLoading(false));
  }, [classId, enrollmentId]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (enrollmentId) {
        await updateEnrollment(classId, enrollmentId, {
          status: value.status,
          startDate: value.startDate,
          endDate: value.endDate || null,
          notes: value.notes,
        });
      } else {
        await createEnrollment(classId, {
          dancerId: value.dancerId,
          startDate: value.startDate,
          endDate: value.endDate || null,
          notes: value.notes,
        });
      }
      router.push(`/admin/classes/${classId}/enrollments`);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to save the enrollment.",
      );
      setSaving(false);
    }
  }

  async function archive() {
    if (!enrollmentId) return;
    setSaving(true);
    setError("");
    try {
      await archiveEnrollment(classId, enrollmentId);
      router.push(`/admin/classes/${classId}/enrollments`);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to archive the enrollment.",
      );
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="rounded-2xl bg-white p-8 text-center">Loading enrollment…</p>;
  }

  const season = seasons.find((item) => item.id === studioClass?.seasonId);
  const program = programs.find((item) => item.id === studioClass?.programId);
  const dancer = dancers.find((item) => item.id === value.dancerId);
  const archived = value.status === "archived";

  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold">
        {enrollmentId ? "Edit enrollment" : "New enrollment"}
      </h1>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <dl className="grid gap-4 sm:grid-cols-3">
          <div><dt className="text-xs font-semibold uppercase text-slate-500">Class</dt><dd className="mt-1">{studioClass?.name}</dd></div>
          <div><dt className="text-xs font-semibold uppercase text-slate-500">Season</dt><dd className="mt-1">{season?.name}</dd></div>
          <div><dt className="text-xs font-semibold uppercase text-slate-500">Program</dt><dd className="mt-1">{program?.name}</dd></div>
        </dl>
      </div>
      <form onSubmit={submit} className="mt-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
        {enrollmentId ? (
          <Input label="Dancer" value={dancer ? `${dancer.firstName} ${dancer.lastName}` : "Unknown dancer"} readOnly />
        ) : (
          <Select label="Dancer" required value={value.dancerId} onChange={(event) => setValue({ ...value, dancerId: event.target.value })}>
            <option value="">Select dancer</option>
            {dancers.filter((item) => item.status === "active").map((item) => (
              <option key={item.id} value={item.id}>{item.firstName} {item.lastName}</option>
            ))}
          </Select>
        )}
        {enrollmentId && !archived && (
          <Select label="Status" value={value.status} onChange={(event) => setValue({ ...value, status: event.target.value as EnrollmentStatus })}>
            <option value="active">Active</option>
            <option value="withdrawn">Withdrawn</option>
            <option value="completed">Completed</option>
          </Select>
        )}
        {archived && <Input label="Status" value="Archived" readOnly />}
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Start date" type="date" required disabled={archived} value={value.startDate} onChange={(event) => setValue({ ...value, startDate: event.target.value })} />
          <Input label="End date" type="date" disabled={archived} value={value.endDate} onChange={(event) => setValue({ ...value, endDate: event.target.value })} />
        </div>
        <label className="block text-sm font-medium text-slate-700">
          Notes
          <textarea className="mt-2 min-h-28 w-full rounded-lg border border-slate-300 p-3 disabled:bg-slate-100" disabled={archived} value={value.notes} onChange={(event) => setValue({ ...value, notes: event.target.value })} />
        </label>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div className="flex flex-wrap gap-3">
          {!archived && <Button disabled={saving}>{saving ? "Saving…" : "Save enrollment"}</Button>}
          {enrollmentId && !archived && <Button type="button" variant="secondary" disabled={saving} onClick={archive}>Archive</Button>}
          <Link className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-slate-600" href={`/admin/classes/${classId}/enrollments`}>Cancel</Link>
        </div>
      </form>
    </section>
  );
}
