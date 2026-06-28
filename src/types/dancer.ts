import type { Timestamp } from "firebase/firestore";

export type DancerStatus = "active";

export type Dancer = {
  id: string;
  studioId: string;
  familyId: string;
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
