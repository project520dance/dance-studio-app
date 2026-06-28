import { writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  addFamilyToBatch,
  type CreateFamilyInput,
} from "@/services/familyService";
import {
  addDancerToBatch,
  type CreateDancerInput,
} from "@/services/dancerService";
import { addOnboardingCompletionToBatch } from "@/services/userService";

type CompleteParentOnboardingInput = {
  userId: string;
  parentLastName: string;
  family: Omit<
    CreateFamilyInput,
    "primaryParentUserId" | "primaryParentLastName"
  >;
  dancers: Omit<CreateDancerInput, "familyId">[];
};

export async function completeParentOnboarding({
  userId,
  parentLastName,
  family,
  dancers,
}: CompleteParentOnboardingInput): Promise<void> {
  const batch = writeBatch(db);
  const familyId = addFamilyToBatch(batch, {
    ...family,
    primaryParentUserId: userId,
    primaryParentLastName: parentLastName,
  });

  dancers.forEach((dancer) => {
    addDancerToBatch(batch, { ...dancer, familyId });
  });

  addOnboardingCompletionToBatch(batch, userId, familyId);
  await batch.commit();
}
