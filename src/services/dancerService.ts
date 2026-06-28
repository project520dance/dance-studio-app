import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  writeBatch,
  where,
  type WriteBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DEFAULT_STUDIO_ID } from "@/services/userService";
import type { Dancer } from "@/types/dancer";

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
