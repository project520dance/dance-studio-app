import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  attendanceConverter,
  scheduleEventConverter,
} from "@/lib/firestoreConverters";
import { requireAdmin } from "@/services/adminService";
import { getActiveDancersForStudio } from "@/services/dancerService";
import type {
  AttendanceInput,
  AttendanceRecord,
  AttendanceStatus,
} from "@/types/attendance";
import type { Dancer } from "@/types/dancer";
import type { ScheduleEvent } from "@/types/scheduleEvent";

const ATTENDANCE_STATUSES: AttendanceStatus[] = [
  "present",
  "absent",
  "late",
  "excused",
];

export type AttendanceWorkspace = {
  event: ScheduleEvent;
  records: AttendanceRecord[];
  dancers: Dancer[];
};

function attendanceCollection(studioId: string) {
  return collection(
    db,
    "studios",
    studioId,
    "attendance",
  ).withConverter(attendanceConverter);
}

function eventReference(studioId: string, eventId: string) {
  return doc(
    db,
    "studios",
    studioId,
    "scheduleEvents",
    eventId,
  ).withConverter(scheduleEventConverter);
}

function validateInputs(inputs: AttendanceInput[]) {
  if (inputs.length === 0) {
    throw new Error("Select at least one attendance status to save.");
  }
  if (inputs.length > 100) {
    throw new Error("Attendance may be saved for at most 100 dancers at a time.");
  }

  const dancerIds = new Set<string>();
  inputs.forEach((input) => {
    if (!input.dancerId) throw new Error("Dancer is required.");
    if (dancerIds.has(input.dancerId)) {
      throw new Error("Each dancer may appear only once.");
    }
    dancerIds.add(input.dancerId);
    if (!ATTENDANCE_STATUSES.includes(input.status)) {
      throw new Error("Select a valid attendance status.");
    }
    if (typeof input.notes !== "string") {
      throw new Error("Attendance notes are invalid.");
    }
  });
}

function validateEvent(event: ScheduleEvent) {
  if (event.eventType !== "class") {
    throw new Error("Attendance is only available for class events.");
  }
  if (event.status !== "scheduled" && event.status !== "completed") {
    throw new Error("Attendance is not available for this event.");
  }
  if (event.startDateTime.getTime() > Date.now()) {
    throw new Error("Attendance cannot be recorded before the event starts.");
  }
}

export async function getAttendanceWorkspace(
  eventId: string,
): Promise<AttendanceWorkspace> {
  const { studioId } = await requireAdmin();
  const recordsQuery = query(
    attendanceCollection(studioId),
    where("eventId", "==", eventId),
  );
  const [eventSnapshot, recordsSnapshot, dancers] = await Promise.all([
    getDoc(eventReference(studioId, eventId)),
    getDocs(recordsQuery),
    getActiveDancersForStudio(studioId),
  ]);

  if (!eventSnapshot.exists()) throw new Error("Schedule event not found.");

  return {
    event: eventSnapshot.data(),
    records: recordsSnapshot.docs.map((item) => item.data()),
    dancers,
  };
}

export async function saveAttendanceForEvent(
  eventId: string,
  inputs: AttendanceInput[],
): Promise<void> {
  validateInputs(inputs);
  const { studioId, userId } = await requireAdmin();
  const activeDancers = await getActiveDancersForStudio(studioId);
  const activeDancerIds = new Set(activeDancers.map((dancer) => dancer.id));
  const eventRef = eventReference(studioId, eventId);
  const attendanceRefs = inputs.map((input) =>
    doc(attendanceCollection(studioId), `${eventId}_${input.dancerId}`),
  );

  await runTransaction(db, async (transaction) => {
    const [eventSnapshot, attendanceSnapshots] = await Promise.all([
      transaction.get(eventRef),
      Promise.all(attendanceRefs.map((reference) => transaction.get(reference))),
    ]);

    if (!eventSnapshot.exists()) throw new Error("Schedule event not found.");
    const event = eventSnapshot.data();
    validateEvent(event);
    const now = new Date();

    inputs.forEach((input, index) => {
      const attendanceSnapshot = attendanceSnapshots[index];
      if (!attendanceSnapshot.exists() && !activeDancerIds.has(input.dancerId)) {
        throw new Error("A selected dancer is not active.");
      }

      const normalizedNotes = input.notes.trim();
      if (attendanceSnapshot.exists()) {
        transaction.update(attendanceRefs[index], {
          status: input.status,
          notes: normalizedNotes,
          attendanceSource: "admin",
          recordedBy: userId,
          lastModifiedAt: now,
          updatedBy: userId,
          updatedAt: now,
        });
        return;
      }

      const record: AttendanceRecord = {
        id: `${eventId}_${input.dancerId}`,
        studioId,
        eventId,
        dancerId: input.dancerId,
        seasonId: event.seasonId,
        programId: event.programId,
        classId: event.classId,
        status: input.status,
        notes: normalizedNotes,
        attendanceSource: "admin",
        recordedBy: userId,
        recordedAt: now,
        lastModifiedAt: now,
        createdBy: userId,
        updatedBy: userId,
        createdAt: now,
        updatedAt: now,
      };
      transaction.set(attendanceRefs[index], record);
    });
  });
}
