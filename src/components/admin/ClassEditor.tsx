"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { archiveStudioClass, createStudioClass, getStudioClass, updateStudioClass } from "@/services/classService";
import { getPrograms } from "@/services/programService";
import { getSeasons } from "@/services/seasonService";
import type { Program } from "@/types/program";
import type { Season } from "@/types/season";
import type { StudioClassInput } from "@/types/studioClass";

const initialValue: StudioClassInput = {
  name: "",
  description: "",
  seasonId: "",
  programId: "",
  activityType: "ballet",
  status: "draft",
  level: "",
  minimumAge: 0,
  maximumAge: 0,
  capacity: 1,
  durationMinutes: 60,
  displayOrder: 0,
};

export function ClassEditor({ classId }: { classId?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void Promise.all([
      getSeasons(),
      getPrograms(),
      classId ? getStudioClass(classId) : Promise.resolve(null),
    ]).then(([seasonItems, programItems, item]) => {
      setSeasons(seasonItems.filter((season) => season.status !== "archived"));
      setPrograms(programItems.filter((program) => program.status !== "archived"));
      if (classId && !item) throw new Error("Class not found.");
      if (item) setValue({ ...initialValue, ...item });
    }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load the class editor."))
      .finally(() => setLoading(false));
  }, [classId]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (classId) await updateStudioClass(classId, value);
      else await createStudioClass(value);
      router.push("/admin/classes");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save this class.");
    } finally {
      setSaving(false);
    }
  }

  async function archive() {
    if (!classId) return;
    setSaving(true);
    try {
      await archiveStudioClass(classId);
      router.push("/admin/classes");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to archive this class.");
      setSaving(false);
    }
  }

  if (loading) return <p className="rounded-2xl bg-white p-8 text-center">Loading class…</p>;

  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold">{classId ? "Edit class" : "New class"}</h1>
      <form onSubmit={submit} className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
        <Input label="Class name" required value={value.name} onChange={(event) => setValue({ ...value, name: event.target.value })} />
        <label className="block text-sm font-medium text-slate-700">
          Description
          <textarea className="mt-2 min-h-28 w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-purple-500" value={value.description} onChange={(event) => setValue({ ...value, description: event.target.value })} />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <Select label="Season" required value={value.seasonId} onChange={(event) => setValue({ ...value, seasonId: event.target.value })}>
            <option value="">Select season</option>
            {seasons.map((season) => <option key={season.id} value={season.id}>{season.name}</option>)}
          </Select>
          <Select label="Program" required value={value.programId} onChange={(event) => setValue({ ...value, programId: event.target.value })}>
            <option value="">Select program</option>
            {programs.map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}
          </Select>
        </div>
        <Select label="Activity type" value={value.activityType} onChange={(event) => setValue({ ...value, activityType: event.target.value as StudioClassInput["activityType"] })}>
          <option value="ballet">Ballet</option>
          <option value="jazz">Jazz</option>
          <option value="tap">Tap</option>
          <option value="hipHop">Hip Hop</option>
          <option value="acro">Acro</option>
          <option value="contemporary">Contemporary</option>
          <option value="lyrical">Lyrical</option>
          <option value="musicalTheatre">Musical Theatre</option>
          <option value="technique">Technique</option>
          <option value="flexibility">Flexibility</option>
          <option value="strengthAndConditioning">Strength &amp; Conditioning</option>
          <option value="choreography">Choreography</option>
          <option value="privateLesson">Private Lesson</option>
          <option value="openStudio">Open Studio</option>
          <option value="competitionRehearsal">Competition Rehearsal</option>
          <option value="rehearsal">Rehearsal</option>
          <option value="convention">Convention</option>
          <option value="workshop">Workshop</option>
          <option value="custom">Custom</option>
        </Select>
        <Select label="Status" value={value.status} onChange={(event) => setValue({ ...value, status: event.target.value as StudioClassInput["status"] })}>
          <option value="draft">Draft</option><option value="active">Active</option><option value="archived">Archived</option>
        </Select>
        <Input label="Level" required value={value.level} onChange={(event) => setValue({ ...value, level: event.target.value })} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Minimum age" type="number" min="0" step="1" required value={value.minimumAge} onChange={(event) => setValue({ ...value, minimumAge: Number(event.target.value) })} />
          <Input label="Maximum age" type="number" min="0" step="1" required value={value.maximumAge} onChange={(event) => setValue({ ...value, maximumAge: Number(event.target.value) })} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Capacity" type="number" min="1" step="1" required value={value.capacity} onChange={(event) => setValue({ ...value, capacity: Number(event.target.value) })} />
          <Input label="Duration in minutes" type="number" min="1" step="1" required value={value.durationMinutes} onChange={(event) => setValue({ ...value, durationMinutes: Number(event.target.value) })} />
        </div>
        <Input label="Display order" type="number" min="0" step="1" value={value.displayOrder} onChange={(event) => setValue({ ...value, displayOrder: Number(event.target.value) })} />
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <Button disabled={saving}>{saving ? "Saving…" : "Save class"}</Button>
          {classId && value.status !== "archived" && <Button type="button" variant="secondary" disabled={saving} onClick={archive}>Archive</Button>}
          {classId && (
            <Link className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700" href={`/admin/classes/${classId}/enrollments`}>
              Manage enrollments
            </Link>
          )}
        </div>
      </form>
    </section>
  );
}
