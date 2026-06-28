import { waitForCurrentUser } from "@/services/authService";
import { getUserProfile } from "@/services/userService";
import { getFamilyById } from "@/services/familyService";
import { getDancersByFamilyId } from "@/services/dancerService";
import type { UserProfile } from "@/types/user";
import type { Family } from "@/types/family";
import type { Dancer } from "@/types/dancer";

export type ParentDashboard = {
  profile: UserProfile;
  family: Family;
  dancers: Dancer[];
};

export class DashboardServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DashboardServiceError";
  }
}

export async function getParentDashboard(): Promise<ParentDashboard> {
  const user = await waitForCurrentUser();

  if (!user) {
    throw new DashboardServiceError(
      "Please sign in to view your parent dashboard.",
    );
  }

  const profile = await getUserProfile(user.uid);
  if (!profile) {
    throw new DashboardServiceError(
      "We could not find your studio profile. Please contact the studio for help.",
    );
  }

  if (!profile.familyId) {
    throw new DashboardServiceError(
      "Your family profile is not ready yet. Please complete onboarding or contact the studio.",
    );
  }

  const [family, dancers] = await Promise.all([
    getFamilyById(profile.familyId),
    getDancersByFamilyId(profile.familyId),
  ]);

  if (!family) {
    throw new DashboardServiceError(
      "We could not find your family information. Please contact the studio for help.",
    );
  }

  return { profile, family, dancers };
}
