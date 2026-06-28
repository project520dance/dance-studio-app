"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { getClasses } from "@/services/classService";
import { getPrograms } from "@/services/programService";
import {
  archiveScheduleSeries,
  createScheduleSeries,
  getScheduleSeriesItem,
  updateScheduleSeries,
} from "@/services/scheduleSeriesService";
import { getSeasons } from "@/services/seasonService";
import type { Program } from "@/types/program";
import type { ScheduleSeriesInput } from "@/types/scheduleSeries";
import type { Season } from "@/types/season";
import type { StudioClass } from "@/types/studioClass";

const initialValue: ScheduleSeriesInput = {
  seasonId: "",
  programId: "",
  classId: "",
  dayOfWeek: "monday",
  startTime: "",
  endTime: "",
  roomId: "studioA",
  effectiveStartDate: "",
  effectiveEndDate: "",
  notes: "",
  status: "draft",
  displayOrder: 0,
};

export function ScheduleSeriesEditor({ seriesId }: { seriesId?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [classes, setClasses] = useState<StudioClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void Promise.all([
      getSeasons(),
      getPrograms(),
      getClasses(),
      seriesId ? getScheduleSeriesItem(seriesId) : Promise.resolve(null),
    ]).then(([seasonItems, programItems, classItems, item]) => {
      setSeasons(seasonItems.filter((season) => season.status !== "archived"));
      setPrograms(programItems.filter((program) => program.status !== "archived"));
      setClasses(classItems.filter((studioClass) => studioClass.status !== "archived"));
      if (seriesId && !item) throw new Error("Schedule series not found.");
      if (item) setValue({ ...initialValue, ...item });
    }).catch((reason: unknown) => {
      setError(reason instanceof Error ? reason.message : "Unable to load the schedule series editor.");
    }).finally(() => setLoading(false));
  }, [seriesId]);

  const availableClasses = classes.filter((studioClass) => (
    (!value.seasonId || studioClass.seasonId === value.seasonId)
    && (!value.programId || studioClass.programId === value.programId)
  ));

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (seriesId) await updateScheduleSeries(seriesId, value);
      else await createScheduleSeries(value);
      router.push("/admin/schedule-series");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save this schedule series.");
    } finally {
      setSaving(false);
    }
  }

  async function archive() {
    if (!seriesId) return;
    setSaving(true);
    setError("");
    try {
      await archiveScheduleSeries(seriesId);
      router.push("/admin/schedule-series");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to archive this schedule series.");
      setSaving(false);
    }
  }

  if (loading) return <p className="rounded-2xl bg-white p-8 text-center">Loading schedule series…</p>;

  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold">{seriesId ? "Edit schedule series" : "New schedule series"}</h1>
      <form onSubmit={submit} className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <Select label="Season" required value={value.seasonId} onChange={(event) => setValue({ ...value, seasonId: event.target.value, classId: "" })}>
            <option value="">Select season</option>
            {seasons.map((season) => <option key={season.id} value={season.id}>{season.name}</option>)}
          </Select>
          <Select label="Program" required value={value.programId} onChange={(event) => setValue({ ...value, programId: event.target.value, classId: "" })}>
            <option value="">Select program</option>
            {programs.map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}
          </Select>
        </div>
        <Select label="Class" required value={value.classId} onChange={(event) => setValue({ ...value, classId: event.target.value })}>
          <option value="">Select class</option>
          {availableClasses.map((studioClass) => <option key={studioClass.id} value={studioClass.id}>{studioClass.name}</option>)}
        </Select>
        <Select label="Day of week" value={value.dayOfWeek} onChange={(event) => setValue({ ...value, dayOfWeek: event.target.value as ScheduleSeriesInput["dayOfWeek"] })}>
          <option value="monday">Monday</option>
          <option value="tuesday">Tuesday</option>
          <option value="wednesday">Wednesday</option>
          <option value="thursday">Thursday</option>
          <option value="friday">Friday</option>
          <option value="saturday">Saturday</option>
          <option value="sunday">Sunday</option>
        </Select>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Start time" type="time" required value={value.startTime} onChange={(event) => setValue({ ...value, startTime: event.target.value })} />
          <Input label="End time" type="time" required value={value.endTime} onChange={(event) => setValue({ ...value, endTime: event.target.value })} />
        </div>
        <Select label="Room" value={value.roomId} onChange={(event) => setValue({ ...value, roomId: event.target.value as ScheduleSeriesInput["roomId"] })}>
          <option value="studioA">Studio A</option>
          <option value="studioB">Studio B</option>
          <option value="studioC">Studio C</option>
          <option value="lobby">Lobby</option>
          <option value="other">Other</option>
        </Select>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Starts On" type="date" required value={value.effectiveStartDate} onChange={(event) => setValue({ ...value, effectiveStartDate: event.target.value })} />
          <Input label="Ends On" type="date" required value={value.effectiveEndDate} onChange={(event) => setValue({ ...value, effectiveEndDate: event.target.value })} />
        </div>
        <label className="block text-sm font-medium text-slate-700">
          Notes
          <textarea className="mt-2 min-h-28 w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-purple-500" value={value.notes} onChange={(event) => setValue({ ...value, notes: event.target.value })} />
        </label>
        <Select label="Status" value={value.status} onChange={(event) => setValue({ ...value, status: event.target.value as ScheduleSeriesInput["status"] })}>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </Select>
        <Input label="Display order" type="number" min="0" step="1" value={value.displayOrder} onChange={(event) => setValue({ ...value, displayOrder: Number(event.target.value) })} />
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <Button disabled={saving}>{saving ? "Saving…" : "Save schedule series"}</Button>
          {seriesId && value.status !== "archived" && (
            <Button type="button" variant="secondary" disabled={saving} onClick={archive}>Archive</Button>
          )}
        </div>
      </form>
    </section>
  );
}
