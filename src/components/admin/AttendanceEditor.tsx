"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { type AttendanceFormValue } from "@/components/admin/AttendanceRow";
import { AttendanceTable } from "@/components/admin/AttendanceTable";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  getAttendanceWorkspace,
  saveAttendanceForEvent,
} from "@/services/attendanceService";
import { getClasses } from "@/services/classService";
import { getPrograms } from "@/services/programService";
import { getSeasons } from "@/services/seasonService";
import type {
  AttendanceInput,
  AttendanceRecord,
} from "@/types/attendance";
import type { Dancer } from "@/types/dancer";
import type { ScheduleEvent } from "@/types/scheduleEvent";

const roomLabels = {
  studioA: "Studio A",
  studioB: "Studio B",
  studioC: "Studio C",
  lobby: "Lobby",
  other: "Other",
};

const statusLabels = {
  scheduled: "Scheduled",
  cancelled: "Cancelled",
  rescheduled: "Rescheduled",
  completed: "Completed",
  archived: "Archived",
};

export function AttendanceEditor({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [event, setEvent] = useState<ScheduleEvent | null>(null);
  const [dancers, setDancers] = useState<Dancer[]>([]);
  const [records, setRecords] = useState<Map<string, AttendanceRecord>>(new Map());
  const [values, setValues] = useState<Map<string, AttendanceFormValue>>(new Map());
  const [dirtyDancerIds, setDirtyDancerIds] = useState<Set<string>>(new Set());
  const [className, setClassName] = useState("");
  const [seasonName, setSeasonName] = useState("");
  const [programName, setProgramName] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void Promise.all([
      getAttendanceWorkspace(eventId),
      getClasses(),
      getSeasons(),
      getPrograms(),
    ]).then(([workspace, classes, seasons, programs]) => {
      setEvent(workspace.event);
      setCurrentTime(Date.now());
      setDancers(workspace.dancers);
      setClassName(classes.find((item) => item.id === workspace.event.classId)?.name ?? "Unknown class");
      setSeasonName(seasons.find((item) => item.id === workspace.event.seasonId)?.name ?? "Unknown season");
      setProgramName(programs.find((item) => item.id === workspace.event.programId)?.name ?? "Unknown program");
      const recordMap = new Map(
        workspace.records.map((record) => [record.dancerId, record]),
      );
      setRecords(recordMap);
      setValues(new Map(
        workspace.records.map((record) => [
          record.dancerId,
          { status: record.status, notes: record.notes },
        ]),
      ));
    }).catch((reason: unknown) => {
      setError(reason instanceof Error ? reason.message : "Unable to load attendance.");
    }).finally(() => setLoading(false));
  }, [eventId]);

  const visibleDancers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return dancers;
    return dancers.filter((dancer) =>
      `${dancer.firstName} ${dancer.lastName}`.toLowerCase().includes(term),
    );
  }, [dancers, search]);

  function updateValue(dancerId: string, next: AttendanceFormValue) {
    setValues((current) => new Map(current).set(dancerId, next));
    setDirtyDancerIds((current) => new Set(current).add(dancerId));
  }

  async function save() {
    const inputs: AttendanceInput[] = [...dirtyDancerIds].flatMap((dancerId) => {
      const value = values.get(dancerId);
      if (!value?.status) return [];
      return [{ dancerId, status: value.status, notes: value.notes }];
    });

    setSaving(true);
    setError("");
    try {
      await saveAttendanceForEvent(eventId, inputs);
      router.push(`/admin/schedule-events/${eventId}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save attendance.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="rounded-2xl bg-white p-8 text-center">Loading attendance…</p>;
  if (!event) return <p role="alert" className="rounded-2xl border border-red-100 bg-white p-8 text-red-700">{error || "Schedule event not found."}</p>;

  const canTakeAttendance = (
    event.eventType === "class"
    && (event.status === "scheduled" || event.status === "completed")
    && event.startDateTime.getTime() <= currentTime
  );
  const eventTime = new Intl.DateTimeFormat("en-US", {
    timeZone: event.timeZone,
    dateStyle: "full",
    timeStyle: "short",
  }).format(event.startDateTime);

  return (
    <section>
      <p className="text-sm font-semibold text-purple-600">Attendance</p>
      <h1 className="mt-1 text-3xl font-bold">{className}</h1>

      <dl className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
        <div><dt className="text-sm font-medium text-slate-500">Class</dt><dd className="mt-1">{className}</dd></div>
        <div><dt className="text-sm font-medium text-slate-500">Season</dt><dd className="mt-1">{seasonName}</dd></div>
        <div><dt className="text-sm font-medium text-slate-500">Program</dt><dd className="mt-1">{programName}</dd></div>
        <div><dt className="text-sm font-medium text-slate-500">Room</dt><dd className="mt-1">{roomLabels[event.roomId]}</dd></div>
        <div><dt className="text-sm font-medium text-slate-500">Event status</dt><dd className="mt-1">{statusLabels[event.status]}</dd></div>
        <div><dt className="text-sm font-medium text-slate-500">Event date/time</dt><dd className="mt-1">{eventTime}</dd></div>
      </dl>

      {!canTakeAttendance && (
        <p role="alert" className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Attendance is not available for this event.
        </p>
      )}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <Input label="Search dancers" type="search" value={search} onChange={(inputEvent) => setSearch(inputEvent.target.value)} />
        <p className="mt-3 text-sm text-slate-500">
          Version 0.7.0 temporarily lists all active dancers.
        </p>
      </div>

      <div className="mt-6">
        <AttendanceTable
          dancers={visibleDancers}
          records={records}
          values={values}
          disabled={!canTakeAttendance || saving}
          onChange={updateValue}
        />
      </div>

      {error && <p role="alert" className="mt-6 text-sm text-red-600">{error}</p>}
      <div className="mt-6">
        <Button disabled={!canTakeAttendance || saving || dirtyDancerIds.size === 0} onClick={save}>
          {saving ? "Saving…" : "Save attendance"}
        </Button>
      </div>
    </section>
  );
}
