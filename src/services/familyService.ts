import {
  collection,
  doc,
  getDoc,
  serverTimestamp,
  type WriteBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DEFAULT_STUDIO_ID } from "@/services/userService";
import type { EmergencyContact, Family } from "@/types/family";

export type CreateFamilyInput = {
  primaryParentUserId: string;
  primaryParentLastName: string;
  phone: string;
  emergencyContacts: EmergencyContact[];
};

export function addFamilyToBatch(
  batch: WriteBatch,
  input: CreateFamilyInput,
): string {
  const familyDocument = doc(
    collection(db, "studios", DEFAULT_STUDIO_ID, "families"),
  );

  batch.set(familyDocument, {
    id: familyDocument.id,
    studioId: DEFAULT_STUDIO_ID,
    familyName: `${input.primaryParentLastName.trim()} Family`.trim(),
    parentUserIds: [input.primaryParentUserId],
    primaryParentUserId: input.primaryParentUserId,
    phone: input.phone.trim(),
    emergencyContacts: input.emergencyContacts.map((contact) => ({
      name: contact.name.trim(),
      phone: contact.phone.trim(),
      relationship: contact.relationship.trim(),
    })),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return familyDocument.id;
}

export async function getFamilyById(
  familyId: string,
): Promise<Family | null> {
  const familyDocument = doc(
    db,
    "studios",
    DEFAULT_STUDIO_ID,
    "families",
    familyId,
  );
  const snapshot = await getDoc(familyDocument);

  return snapshot.exists() ? (snapshot.data() as Family) : null;
}
