import type { Timestamp } from "firebase/firestore";

export type DancerStatus = "active" | "archived";

export type Dancer = {
  id: string;
  studioId: string;
  familyId: string | null;
  firstName: string;
  lastName: string;
  birthdate: string;
  medicalConditions: string;
  currentMedications: string;
  physician: string;
  allergies: string;
  additionalNotes: string;
  photoUrl: string | null;
  teamId: string | null;
  status: DancerStatus;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};
