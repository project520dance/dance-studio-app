"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { getClasses } from "@/services/classService";
import { getPrograms } from "@/services/programService";
import {
  archiveScheduleEvent,
  cancelScheduleEvent,
  completeScheduleEvent,
  getScheduleEvent,
  updateScheduleEventDetails,
} from "@/services/scheduleEventService";
import { getSeasons } from "@/services/seasonService";
import type { ScheduleEvent, ScheduleEventUpdateInput } from "@/types/scheduleEvent";

const initialValue: ScheduleEventUpdateInput = {
  roomId: "studioA",
  notes: "",
  publicNotes: "",
  isVisibleToParents: false,
  displayOrder: 0,
};

const statusLabels = {
  scheduled: "Scheduled",
  cancelled: "Cancelled",
  rescheduled: "Rescheduled",
  completed: "Completed",
  archived: "Archived",
};

export function ScheduleEventEditor({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [event, setEvent] = useState<ScheduleEvent | null>(null);
  const [value, setValue] = useState(initialValue);
  const [seasonName, setSeasonName] = useState("");
  const [programName, setProgramName] = useState("");
  const [className, setClassName] = useState("");
  const [showCancellation, setShowCancellation] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void Promise.all([
      getScheduleEvent(eventId),
      getSeasons(),
      getPrograms(),
      getClasses(),
    ]).then(([item, seasons, programs, classes]) => {
      if (!item) throw new Error("Schedule event not found.");
      setEvent(item);
      setValue({
        roomId: item.roomId,
        notes: item.notes,
        publicNotes: item.publicNotes,
        isVisibleToParents: item.isVisibleToParents,
        displayOrder: item.displayOrder,
      });
      setCancellationReason(item.cancellationReason);
      setSeasonName(seasons.find((season) => season.id === item.seasonId)?.name ?? "Unknown season");
      setProgramName(programs.find((program) => program.id === item.programId)?.name ?? "Unknown program");
      setClassName(classes.find((studioClass) => studioClass.id === item.classId)?.name ?? "Unknown class");
    }).catch((reason: unknown) => {
      setError(reason instanceof Error ? reason.message : "Unable to load this schedule event.");
    }).finally(() => setLoading(false));
  }, [eventId]);

  async function submit(formEvent: FormEvent) {
    formEvent.preventDefault();
    setSaving(true);
    setError("");
    try {
      await updateScheduleEventDetails(eventId, value);
      router.push("/admin/schedule-events");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save this schedule event.");
    } finally {
      setSaving(false);
    }
  }

  async function runAction(action: () => Promise<void>) {
    setSaving(true);
    setError("");
    try {
      await action();
      router.push("/admin/schedule-events");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update this schedule event.");
      setSaving(false);
    }
  }

  if (loading) return <p className="rounded-2xl bg-white p-8 text-center">Loading schedule event…</p>;
  if (!event) return <p role="alert" className="rounded-2xl border border-red-100 bg-white p-8 text-red-700">{error || "Schedule event not found."}</p>;

  const archived = event.status === "archived";
  const starts = new Intl.DateTimeFormat("en-US", {
    timeZone: event.timeZone,
    dateStyle: "full",
    timeStyle: "short",
  }).format(event.startDateTime);
  const ends = new Intl.DateTimeFormat("en-US", {
    timeZone: event.timeZone,
    dateStyle: "full",
    timeStyle: "short",
  }).format(event.endDateTime);

  return (
    <section className="mx-auto max-w-2xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-purple-600">Schedule event</p>
          <h1 className="mt-1 text-3xl font-bold">{className}</h1>
        </div>
        <span className="rounded-full bg-purple-50 px-3 py-1 text-sm font-semibold text-purple-700">
          {statusLabels[event.status]}
        </span>
      </div>

      <dl className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
        <div><dt className="text-sm font-medium text-slate-500">Event type</dt><dd className="mt-1">Class</dd></div>
        <div><dt className="text-sm font-medium text-slate-500">Source</dt><dd className="mt-1">{event.source === "series" ? "Schedule Series" : "Manual"}</dd></div>
        <div><dt className="text-sm font-medium text-slate-500">Season</dt><dd className="mt-1">{seasonName}</dd></div>
        <div><dt className="text-sm font-medium text-slate-500">Program</dt><dd className="mt-1">{programName}</dd></div>
        <div><dt className="text-sm font-medium text-slate-500">Class</dt><dd className="mt-1">{className}</dd></div>
        <div><dt className="text-sm font-medium text-slate-500">Time zone</dt><dd className="mt-1">{event.timeZone}</dd></div>
        <div><dt className="text-sm font-medium text-slate-500">Starts</dt><dd className="mt-1">{starts}</dd></div>
        <div><dt className="text-sm font-medium text-slate-500">Ends</dt><dd className="mt-1">{ends}</dd></div>
        <div className="sm:col-span-2"><dt className="text-sm font-medium text-slate-500">Schedule Series</dt><dd className="mt-1 break-all">{event.scheduleSeriesId ?? "None"}</dd></div>
      </dl>

      <form onSubmit={submit} className="mt-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
        <Select label="Room" disabled={archived || saving} value={value.roomId} onChange={(inputEvent) => setValue({ ...value, roomId: inputEvent.target.value as ScheduleEventUpdateInput["roomId"] })}>
          <option value="studioA">Studio A</option>
          <option value="studioB">Studio B</option>
          <option value="studioC">Studio C</option>
          <option value="lobby">Lobby</option>
          <option value="other">Other</option>
        </Select>
        <label className="block text-sm font-medium text-slate-700">
          Internal notes
          <textarea disabled={archived || saving} className="mt-2 min-h-28 w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-purple-500 disabled:bg-slate-50" value={value.notes} onChange={(inputEvent) => setValue({ ...value, notes: inputEvent.target.value })} />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Public notes
          <textarea disabled={archived || saving} className="mt-2 min-h-28 w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-purple-500 disabled:bg-slate-50" value={value.publicNotes} onChange={(inputEvent) => setValue({ ...value, publicNotes: inputEvent.target.value })} />
          <span className="mt-2 block text-xs font-normal text-slate-500">These notes may be shown to parents when visibility is enabled.</span>
        </label>
        <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
          <input type="checkbox" disabled={archived || saving} checked={value.isVisibleToParents} onChange={(inputEvent) => setValue({ ...value, isVisibleToParents: inputEvent.target.checked })} />
          Visible to parents
        </label>
        <Input label="Display order" type="number" min="0" step="1" disabled={archived || saving} value={value.displayOrder} onChange={(inputEvent) => setValue({ ...value, displayOrder: Number(inputEvent.target.value) })} />

        {event.status === "cancelled" && event.cancellationReason && (
          <p className="rounded-lg bg-slate-50 p-3 text-sm"><span className="font-semibold">Cancellation reason:</span> {event.cancellationReason}</p>
        )}
        {event.status === "rescheduled" && event.rescheduleReason && (
          <p className="rounded-lg bg-slate-50 p-3 text-sm"><span className="font-semibold">Reschedule reason:</span> {event.rescheduleReason}</p>
        )}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

        {!archived && (
          <div className="flex flex-wrap gap-3">
            <Button disabled={saving}>{saving ? "Saving…" : "Save event details"}</Button>
            {event.status === "scheduled" && (
              <>
                <Button type="button" variant="secondary" disabled={saving} onClick={() => setShowCancellation(true)}>Cancel event</Button>
                <Button type="button" variant="secondary" disabled={saving} onClick={() => {
                  // TODO: Replace browser confirmation with a reusable modal in a future UI polish release.
                  if (window.confirm("Mark this event complete?")) void runAction(() => completeScheduleEvent(eventId));
                }}>Mark complete</Button>
              </>
            )}
            <Button type="button" variant="secondary" disabled={saving} onClick={() => {
              // TODO: Replace browser confirmation with a reusable modal in a future UI polish release.
              if (window.confirm("Archive this event? This cannot be undone in Version 0.6.3.")) void runAction(() => archiveScheduleEvent(eventId));
            }}>Archive event</Button>
          </div>
        )}

        {showCancellation && event.status === "scheduled" && (
          <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <Input label="Cancellation reason" required value={cancellationReason} onChange={(inputEvent) => setCancellationReason(inputEvent.target.value)} />
            <div className="flex flex-wrap gap-3">
              <Button type="button" disabled={saving || !cancellationReason.trim()} onClick={() => runAction(() => cancelScheduleEvent(eventId, cancellationReason))}>Confirm cancellation</Button>
              <Button type="button" variant="secondary" disabled={saving} onClick={() => setShowCancellation(false)}>Keep event</Button>
            </div>
          </div>
        )}
      </form>
    </section>
  );
}
