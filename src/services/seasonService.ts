import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { seasonConverter } from "@/lib/firestoreConverters";
import { requireAdmin } from "@/services/adminService";
import type { Season, SeasonInput } from "@/types/season";

function seasons(studioId: string) {
  return collection(db, "studios", studioId, "seasons").withConverter(seasonConverter);
}

function validate(input: SeasonInput) {
  if (!input.name.trim()) throw new Error("Season name is required.");
  if (!input.seasonType) throw new Error("Season type is required.");
  if (!input.startDate || !input.endDate) throw new Error("Season dates are required.");
  if (input.endDate < input.startDate) throw new Error("End date must follow start date.");
  if (!input.timeZone.trim()) throw new Error("Time zone is required.");
  if (!input.registrationOpenAt || !input.registrationCloseAt) {
    throw new Error("Registration dates are required.");
  }
  if (input.registrationCloseAt < input.registrationOpenAt) throw new Error("Registration close date must follow registration open date.");
  if (!Number.isInteger(input.displayOrder) || input.displayOrder < 0) {
    throw new Error("Display order must be a non-negative whole number.");
  }
}

async function clearDefault(studioId: string, exceptId: string) {
  const snapshot = await getDocs(query(seasons(studioId), where("isDefault", "==", true)));
  const batch = writeBatch(db);
  snapshot.docs.forEach((item) => {
    if (item.id !== exceptId) batch.update(item.ref, { isDefault: false });
  });
  await batch.commit();
}

export async function getSeasons(): Promise<Season[]> {
  const { studioId } = await requireAdmin();
  const snapshot = await getDocs(seasons(studioId));
  return snapshot.docs.map((item) => item.data()).sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getSeason(id: string): Promise<Season | null> {
  const { studioId } = await requireAdmin();
  const snapshot = await getDoc(doc(seasons(studioId), id));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function createSeason(input: SeasonInput): Promise<string> {
  validate(input);
  const { studioId, userId } = await requireAdmin();
  const reference = doc(seasons(studioId));
  const now = new Date();
  await setDoc(reference, {
    ...input,
    id: reference.id,
    studioId,
    name: input.name.trim(),
    timeZone: input.timeZone.trim(),
    createdBy: userId,
    updatedBy: userId,
    createdAt: now,
    updatedAt: now,
  });
  if (input.isDefault) await clearDefault(studioId, reference.id);
  return reference.id;
}

export async function updateSeason(id: string, input: SeasonInput): Promise<void> {
  validate(input);
  const { studioId, userId } = await requireAdmin();
  await updateDoc(doc(seasons(studioId), id), {
    ...input,
    name: input.name.trim(),
    timeZone: input.timeZone.trim(),
    updatedBy: userId,
    updatedAt: new Date(),
  });
  if (input.isDefault) await clearDefault(studioId, id);
}

export async function archiveSeason(id: string): Promise<void> {
  const season = await getSeason(id);
  if (!season) throw new Error("Season not found.");
  await updateSeason(id, { ...season, status: "archived", isDefault: false });
}
