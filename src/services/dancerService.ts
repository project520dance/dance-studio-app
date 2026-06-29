import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  where,
  type WriteBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { requireAdmin } from "@/services/adminService";
import { DEFAULT_STUDIO_ID } from "@/services/userService";
import type { Dancer, DancerStatus } from "@/types/dancer";

export type CreateDancerInput = {
  familyId: string;
  firstName: string;
  lastName: string;
  birthdate: string;
  medicalConditions: string;
  currentMedications: string;
  physician: string;
  allergies: string;
  additionalNotes: string;
};

export type AdminDancerInput = {
  firstName: string;
  lastName: string;
  birthdate: string;
  status: DancerStatus;
  medicalConditions: string;
  currentMedications: string;
  physician: string;
  allergies: string;
  additionalNotes: string;
};

export function addDancerToBatch(
  batch: WriteBatch,
  input: CreateDancerInput,
): string {
  const dancerDocument = doc(
    collection(db, "studios", DEFAULT_STUDIO_ID, "dancers"),
  );

  batch.set(dancerDocument, {
    id: dancerDocument.id,
    studioId: DEFAULT_STUDIO_ID,
    familyId: input.familyId,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    birthdate: input.birthdate,
    medicalConditions: input.medicalConditions.trim(),
    currentMedications: input.currentMedications.trim(),
    physician: input.physician.trim(),
    allergies: input.allergies.trim(),
    additionalNotes: input.additionalNotes.trim(),
    photoUrl: null,
    teamId: null,
    status: "active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return dancerDocument.id;
}

export async function getDancersByFamilyId(
  familyId: string,
): Promise<Dancer[]> {
  const dancersQuery = query(
    collection(db, "studios", DEFAULT_STUDIO_ID, "dancers"),
    where("familyId", "==", familyId),
  );
  const snapshot = await getDocs(dancersQuery);

  return snapshot.docs.map((document) => document.data() as Dancer);
}

export async function getDancerById(
  dancerId: string,
): Promise<Dancer | null> {
  const dancerDocument = doc(
    db,
    "studios",
    DEFAULT_STUDIO_ID,
    "dancers",
    dancerId,
  );
  const snapshot = await getDoc(dancerDocument);

  return snapshot.exists() ? (snapshot.data() as Dancer) : null;
}

export async function createDancer(
  input: CreateDancerInput,
): Promise<string> {
  const batch = writeBatch(db);
  const dancerId = addDancerToBatch(batch, input);

  await batch.commit();
  return dancerId;
}

export async function getActiveDancersForStudio(
  studioId: string,
): Promise<Dancer[]> {
  const activeDancersQuery = query(
    collection(db, "studios", studioId, "dancers"),
    where("status", "==", "active"),
  );
  const snapshot = await getDocs(activeDancersQuery);

  return snapshot.docs
    .map((document) => document.data() as Dancer)
    .sort((a, b) =>
      `${a.lastName} ${a.firstName}`.localeCompare(
        `${b.lastName} ${b.firstName}`,
      ),
    );
}

function validateAdminDancer(input: AdminDancerInput) {
  if (!input.firstName.trim()) throw new Error("First name is required.");
  if (!input.lastName.trim()) throw new Error("Last name is required.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.birthdate)) {
    throw new Error("Enter a valid birthdate.");
  }

  const [year, month, day] = input.birthdate.split("-").map(Number);
  const birthdate = new Date(Date.UTC(year, month - 1, day));
  if (
    birthdate.getUTCFullYear() !== year
    || birthdate.getUTCMonth() !== month - 1
    || birthdate.getUTCDate() !== day
  ) {
    throw new Error("Enter a valid birthdate.");
  }
  if (birthdate.getTime() > Date.now()) {
    throw new Error("Birthdate cannot be in the future.");
  }
  if (input.status !== "active" && input.status !== "archived") {
    throw new Error("Select a valid status.");
  }
}

export async function getDancerForAdmin(
  dancerId: string,
): Promise<Dancer | null> {
  const { studioId } = await requireAdmin();
  const snapshot = await getDoc(
    doc(db, "studios", studioId, "dancers", dancerId),
  );
  return snapshot.exists() ? (snapshot.data() as Dancer) : null;
}

export async function createDancerForAdmin(
  input: AdminDancerInput,
): Promise<string> {
  validateAdminDancer(input);
  const { studioId } = await requireAdmin();
  const reference = doc(collection(db, "studios", studioId, "dancers"));

  await setDoc(reference, {
    id: reference.id,
    studioId,
    familyId: null,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    birthdate: input.birthdate,
    status: input.status,
    medicalConditions: input.medicalConditions.trim(),
    currentMedications: input.currentMedications.trim(),
    physician: input.physician.trim(),
    allergies: input.allergies.trim(),
    additionalNotes: input.additionalNotes.trim(),
    photoUrl: null,
    teamId: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return reference.id;
}

export async function updateDancerForAdmin(
  dancerId: string,
  input: AdminDancerInput,
): Promise<void> {
  validateAdminDancer(input);
  const { studioId } = await requireAdmin();
  const reference = doc(db, "studios", studioId, "dancers", dancerId);
  const snapshot = await getDoc(reference);
  if (!snapshot.exists()) throw new Error("Student not found.");

  await updateDoc(reference, {
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    birthdate: input.birthdate,
    status: input.status,
    medicalConditions: input.medicalConditions.trim(),
    currentMedications: input.currentMedications.trim(),
    physician: input.physician.trim(),
    allergies: input.allergies.trim(),
    additionalNotes: input.additionalNotes.trim(),
    updatedAt: serverTimestamp(),
  });
}
