import type { Timestamp } from "firebase/firestore";

export type UserRole =
  | "parent"
  | "teacher"
  | "admin";

export type UserStatus = "active";

export type UserProfile = {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  role: UserRole;
  studioId: string;
  familyId: string | null;
  status: UserStatus;
  onboardingComplete: boolean;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};
