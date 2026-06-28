import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  programConverter,
  scheduleSeriesConverter,
  seasonConverter,
  studioClassConverter,
} from "@/lib/firestoreConverters";
import { requireAdmin } from "@/services/adminService";
import type {
  ScheduleRoomId,
  ScheduleSeries,
  ScheduleSeriesInput,
} from "@/types/scheduleSeries";

const allowedRoomIds: ScheduleRoomId[] = ["studioA", "studioB", "studioC", "lobby", "other"];

function scheduleSeriesCollection(studioId: string) {
  return collection(db, "studios", studioId, "scheduleSeries").withConverter(scheduleSeriesConverter);
}

function validate(input: ScheduleSeriesInput) {
  if (!input.seasonId) throw new Error("Please select a season.");
  if (!input.programId) throw new Error("Please select a program.");
  if (!input.classId) throw new Error("Please select a class.");
  if (!input.dayOfWeek) throw new Error("Please select a day of the week.");
  if (!input.startTime || !input.endTime) throw new Error("Start and end times are required.");
  if (input.endTime <= input.startTime) throw new Error("End time must follow start time.");
  if (!allowedRoomIds.includes(input.roomId)) throw new Error("Please select a valid room.");
  if (!input.effectiveStartDate || !input.effectiveEndDate) {
    throw new Error("Start and end dates are required.");
  }
  if (input.effectiveEndDate < input.effectiveStartDate) {
    throw new Error("Ends On must follow Starts On.");
  }
  if (!Number.isInteger(input.displayOrder) || input.displayOrder < 0) {
    throw new Error("Display order must be a non-negative whole number.");
  }
}

async function validateReferences(studioId: string, input: ScheduleSeriesInput) {
  const [season, program, studioClass] = await Promise.all([
    getDoc(doc(db, "studios", studioId, "seasons", input.seasonId).withConverter(seasonConverter)),
    getDoc(doc(db, "studios", studioId, "programs", input.programId).withConverter(programConverter)),
    getDoc(doc(db, "studios", studioId, "classes", input.classId).withConverter(studioClassConverter)),
  ]);

  if (!season.exists() || season.data().status === "archived") {
    throw new Error("Select an available season.");
  }
  if (!program.exists() || program.data().status === "archived") {
    throw new Error("Select an available program.");
  }
  if (!studioClass.exists() || studioClass.data().status === "archived") {
    throw new Error("Select an available class.");
  }
  if (studioClass.data().seasonId !== input.seasonId) {
    throw new Error("The selected class does not belong to the selected season.");
  }
  if (studioClass.data().programId !== input.programId) {
    throw new Error("The selected class does not belong to the selected program.");
  }
}

export async function getScheduleSeries(): Promise<ScheduleSeries[]> {
  const { studioId } = await requireAdmin();
  const snapshot = await getDocs(scheduleSeriesCollection(studioId));
  return snapshot.docs.map((item) => item.data()).sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getScheduleSeriesItem(id: string): Promise<ScheduleSeries | null> {
  const { studioId } = await requireAdmin();
  const snapshot = await getDoc(doc(scheduleSeriesCollection(studioId), id));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function createScheduleSeries(input: ScheduleSeriesInput): Promise<string> {
  validate(input);
  const { studioId, userId } = await requireAdmin();
  await validateReferences(studioId, input);
  const reference = doc(scheduleSeriesCollection(studioId));
  const now = new Date();
  await setDoc(reference, {
    ...input,
    id: reference.id,
    studioId,
    notes: input.notes.trim(),
    createdBy: userId,
    updatedBy: userId,
    createdAt: now,
    updatedAt: now,
  });
  return reference.id;
}

export async function updateScheduleSeries(id: string, input: ScheduleSeriesInput): Promise<void> {
  validate(input);
  const { studioId, userId } = await requireAdmin();
  await validateReferences(studioId, input);
  await updateDoc(doc(scheduleSeriesCollection(studioId), id), {
    ...input,
    notes: input.notes.trim(),
    updatedBy: userId,
    updatedAt: new Date(),
  });
}

export async function archiveScheduleSeries(id: string): Promise<void> {
  const { studioId, userId } = await requireAdmin();
  const reference = doc(scheduleSeriesCollection(studioId), id);
  const snapshot = await getDoc(reference);
  if (!snapshot.exists()) throw new Error("Schedule series not found.");
  await updateDoc(reference, {
    status: "archived",
    updatedBy: userId,
    updatedAt: new Date(),
  });
}
