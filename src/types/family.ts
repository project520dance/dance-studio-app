import type { Timestamp } from "firebase/firestore";

export type EmergencyContact = {
  name: string;
  phone: string;
  relationship: string;
};

/**
 * Future waiver documents will live at:
 * studios/{studioId}/families/{familyId}/waivers/{waiverId}
 */
export type Family = {
  id: string;
  studioId: string;
  familyName: string;
  parentUserIds: string[];
  primaryParentUserId: string;
  phone: string;
  emergencyContacts: EmergencyContact[];
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};
