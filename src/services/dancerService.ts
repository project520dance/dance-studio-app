import {
  collection,
  doc,
  serverTimestamp,
  type WriteBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DEFAULT_STUDIO_ID } from "@/services/userService";

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
