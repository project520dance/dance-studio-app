import { waitForCurrentUser } from "@/services/authService";
import { getUserProfile } from "@/services/userService";
import {
  createDancer,
  getDancerById,
  getDancersByFamilyId,
  type CreateDancerInput,
} from "@/services/dancerService";
import type { Dancer } from "@/types/dancer";

export class ParentDancerServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParentDancerServiceError";
  }
}

async function getCurrentFamilyId(): Promise<string> {
  const user = await waitForCurrentUser();
  if (!user) {
    throw new ParentDancerServiceError(
      "Please sign in to view your dancers.",
    );
  }

  const profile = await getUserProfile(user.uid);
  if (!profile) {
    throw new ParentDancerServiceError(
      "We could not find your studio profile.",
    );
  }

  if (!profile.familyId) {
    throw new ParentDancerServiceError(
      "Please complete family onboarding before adding dancers.",
    );
  }

  return profile.familyId;
}

export async function getParentDancers(): Promise<Dancer[]> {
  return getDancersByFamilyId(await getCurrentFamilyId());
}

export async function getParentDancerById(
  dancerId: string,
): Promise<Dancer> {
  const familyId = await getCurrentFamilyId();
  const dancer = await getDancerById(dancerId);

  if (!dancer || dancer.familyId !== familyId) {
    throw new ParentDancerServiceError(
      "We could not find this dancer profile.",
    );
  }

  return dancer;
}

export async function createParentDancer(
  input: Omit<CreateDancerInput, "familyId">,
): Promise<string> {
  return createDancer({
    ...input,
    familyId: await getCurrentFamilyId(),
  });
}
