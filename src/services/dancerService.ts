import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
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
