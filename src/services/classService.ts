import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  programConverter,
  seasonConverter,
  studioClassConverter,
} from "@/lib/firestoreConverters";
import { requireAdmin } from "@/services/adminService";
import type { StudioClass, StudioClassInput } from "@/types/studioClass";

function classes(studioId: string) {
  return collection(db, "studios", studioId, "classes").withConverter(studioClassConverter);
}

function validate(input: StudioClassInput) {
  if (!input.name.trim()) throw new Error("Class name is required.");
  if (!input.seasonId) throw new Error("Please select a season.");
  if (!input.programId) throw new Error("Please select a program.");
  if (!input.activityType) throw new Error("Activity type is required.");
  if (!input.level.trim()) throw new Error("Level is required.");
  if (!Number.isInteger(input.minimumAge) || input.minimumAge < 0) {
    throw new Error("Minimum age must be a non-negative whole number.");
  }
  if (!Number.isInteger(input.maximumAge) || input.maximumAge < input.minimumAge) {
    throw new Error("Maximum age must be a whole number greater than or equal to minimum age.");
  }
  if (!Number.isInteger(input.capacity) || input.capacity < 1) {
    throw new Error("Capacity must be a positive whole number.");
  }
  if (!Number.isInteger(input.durationMinutes) || input.durationMinutes < 1) {
    throw new Error("Duration must be a positive whole number.");
  }
  if (!Number.isInteger(input.displayOrder) || input.displayOrder < 0) {
    throw new Error("Display order must be a non-negative whole number.");
  }
}

export async function getClasses(): Promise<StudioClass[]> {
  const { studioId } = await requireAdmin();
  const snapshot = await getDocs(classes(studioId));
  return snapshot.docs.map((item) => item.data()).sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getStudioClass(id: string): Promise<StudioClass | null> {
  const { studioId } = await requireAdmin();
  const snapshot = await getDoc(doc(classes(studioId), id));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function createStudioClass(input: StudioClassInput): Promise<string> {
  validate(input);
  const { studioId, userId } = await requireAdmin();
  const [season, program] = await Promise.all([
    getDoc(doc(db, "studios", studioId, "seasons", input.seasonId).withConverter(seasonConverter)),
    getDoc(doc(db, "studios", studioId, "programs", input.programId).withConverter(programConverter)),
  ]);
  if (!season.exists() || season.data().status === "archived") throw new Error("Select an available season.");
  if (!program.exists() || program.data().status === "archived") throw new Error("Select an available program.");
  const reference = doc(classes(studioId));
  const now = new Date();
  await setDoc(reference, {
    ...input,
    id: reference.id,
    studioId,
    name: input.name.trim(),
    description: input.description.trim(),
    level: input.level.trim(),
    createdBy: userId,
    updatedBy: userId,
    createdAt: now,
    updatedAt: now,
  });
  return reference.id;
}

export async function updateStudioClass(id: string, input: StudioClassInput): Promise<void> {
  validate(input);
  const { studioId, userId } = await requireAdmin();
  const [season, program] = await Promise.all([
    getDoc(doc(db, "studios", studioId, "seasons", input.seasonId).withConverter(seasonConverter)),
    getDoc(doc(db, "studios", studioId, "programs", input.programId).withConverter(programConverter)),
  ]);
  if (!season.exists() || season.data().status === "archived") throw new Error("Select an available season.");
  if (!program.exists() || program.data().status === "archived") throw new Error("Select an available program.");
  await updateDoc(doc(classes(studioId), id), {
    ...input,
    name: input.name.trim(),
    description: input.description.trim(),
    level: input.level.trim(),
    updatedBy: userId,
    updatedAt: new Date(),
  });
}

export async function archiveStudioClass(id: string): Promise<void> {
  const item = await getStudioClass(id);
  if (!item) throw new Error("Class not found.");
  await updateStudioClass(id, { ...item, status: "archived" });
}
