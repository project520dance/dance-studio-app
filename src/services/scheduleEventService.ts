import {
  collection,
  doc,
  getDoc,
  getDocs,
  runTransaction,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { scheduleEventConverter } from "@/lib/firestoreConverters";
import { requireAdmin } from "@/services/adminService";
import type {
  ScheduleEvent,
  ScheduleEventRoomId,
  ScheduleEventUpdateInput,
} from "@/types/scheduleEvent";

const ALLOWED_ROOM_IDS: ScheduleEventRoomId[] = [
  "studioA",
  "studioB",
  "studioC",
  "lobby",
  "other",
];

function scheduleEvents(studioId: string) {
  return collection(
    db,
    "studios",
    studioId,
    "scheduleEvents",
  ).withConverter(scheduleEventConverter);
}

export async function getScheduleEvents(): Promise<ScheduleEvent[]> {
  const { studioId } = await requireAdmin();
  const snapshot = await getDocs(scheduleEvents(studioId));
  return snapshot.docs
    .map((item) => item.data())
    .sort((a, b) => a.startDateTime.getTime() - b.startDateTime.getTime());
}

export async function getScheduleEvent(id: string): Promise<ScheduleEvent | null> {
  const { studioId } = await requireAdmin();
  const snapshot = await getDoc(doc(scheduleEvents(studioId), id));
  return snapshot.exists() ? snapshot.data() : null;
}

function validateUpdate(input: ScheduleEventUpdateInput) {
  if (!ALLOWED_ROOM_IDS.includes(input.roomId)) {
    throw new Error("Please select a valid room.");
  }
  if (!Number.isInteger(input.displayOrder) || input.displayOrder < 0) {
    throw new Error("Display order must be a non-negative whole number.");
  }
}

export async function updateScheduleEventDetails(
  id: string,
  input: ScheduleEventUpdateInput,
): Promise<void> {
  validateUpdate(input);
  const { studioId, userId } = await requireAdmin();
  const reference = doc(scheduleEvents(studioId), id);
  const snapshot = await getDoc(reference);

  if (!snapshot.exists()) throw new Error("Schedule event not found.");
  if (snapshot.data().status === "archived") {
    throw new Error("Archived events cannot be edited.");
  }

  await updateDoc(reference, {
    roomId: input.roomId,
    notes: input.notes.trim(),
    publicNotes: input.publicNotes.trim(),
    isVisibleToParents: input.isVisibleToParents,
    displayOrder: input.displayOrder,
    updatedBy: userId,
    updatedAt: new Date(),
  });
}

export async function cancelScheduleEvent(
  id: string,
  cancellationReason: string,
): Promise<void> {
  const reason = cancellationReason.trim();
  if (!reason) throw new Error("A cancellation reason is required.");
  const { studioId, userId } = await requireAdmin();
  const reference = doc(scheduleEvents(studioId), id);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists()) throw new Error("Schedule event not found.");
    if (snapshot.data().status !== "scheduled") {
      throw new Error("Only scheduled events can be cancelled.");
    }
    transaction.update(reference, {
      status: "cancelled",
      cancellationReason: reason,
      updatedBy: userId,
      updatedAt: new Date(),
    });
  });
}

export async function completeScheduleEvent(id: string): Promise<void> {
  const { studioId, userId } = await requireAdmin();
  const reference = doc(scheduleEvents(studioId), id);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists()) throw new Error("Schedule event not found.");
    const event = snapshot.data();
    if (event.status !== "scheduled") {
      throw new Error("Only scheduled events can be completed.");
    }
    if (event.endDateTime.getTime() > Date.now()) {
      throw new Error("This event has not ended yet.");
    }
    transaction.update(reference, {
      status: "completed",
      updatedBy: userId,
      updatedAt: new Date(),
    });
  });
}

export async function archiveScheduleEvent(id: string): Promise<void> {
  const { studioId, userId } = await requireAdmin();
  const reference = doc(scheduleEvents(studioId), id);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists()) throw new Error("Schedule event not found.");
    if (snapshot.data().status === "archived") {
      throw new Error("This event is already archived.");
    }
    transaction.update(reference, {
      status: "archived",
      updatedBy: userId,
      updatedAt: new Date(),
    });
  });
}
