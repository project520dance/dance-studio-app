import {
  collection,
  doc,
  serverTimestamp,
  type WriteBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DEFAULT_STUDIO_ID } from "@/services/userService";
import type { EmergencyContact } from "@/types/family";

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
