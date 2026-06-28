import {
  collection,
  getCountFromServer,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { waitForCurrentUser } from "@/services/authService";
import { getUserProfile } from "@/services/userService";
import type { Family } from "@/types/family";
import type { Dancer } from "@/types/dancer";

export type AdminDashboardStats = {
  totalFamilies: number;
  totalDancers: number;
  activeDancers: number;
};

export class AdminServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminServiceError";
  }
}

export type AdminContext = {
  studioId: string;
  userId: string;
};

export async function requireAdmin(): Promise<AdminContext> {
  const user = await waitForCurrentUser();
  if (!user) {
    throw new AdminServiceError(
      "Please sign in to view the admin portal.",
    );
  }

  const profile = await getUserProfile(user.uid);
  if (!profile || profile.role !== "admin") {
    throw new AdminServiceError(
      "You do not have permission to view the admin portal.",
    );
  }

  return { studioId: profile.studioId, userId: user.uid };
}

function getFamiliesCollection(studioId: string) {
  return collection(
    db,
    "studios",
    studioId,
    "families",
  );
}

function getDancersCollection(studioId: string) {
  return collection(
    db,
    "studios",
    studioId,
    "dancers",
  );
}

export async function getAllFamilies(): Promise<Family[]> {
  const { studioId } = await requireAdmin();
  const snapshot = await getDocs(getFamiliesCollection(studioId));

  return snapshot.docs
    .map((document) => document.data() as Family)
    .sort((a, b) => a.familyName.localeCompare(b.familyName));
}

export async function getAllDancers(): Promise<Dancer[]> {
  const { studioId } = await requireAdmin();
  const snapshot = await getDocs(getDancersCollection(studioId));

  return snapshot.docs
    .map((document) => document.data() as Dancer)
    .sort((a, b) =>
      `${a.lastName} ${a.firstName}`.localeCompare(
        `${b.lastName} ${b.firstName}`,
      ),
    );
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const { studioId } = await requireAdmin();

  const familiesCollection = getFamiliesCollection(studioId);
  const dancersCollection = getDancersCollection(studioId);
  const activeDancersQuery = query(
    dancersCollection,
    where("status", "==", "active"),
  );
  const [
    familyCountSnapshot,
    dancerCountSnapshot,
    activeDancerCountSnapshot,
  ] = await Promise.all([
    getCountFromServer(familiesCollection),
    getCountFromServer(dancersCollection),
    getCountFromServer(activeDancersQuery),
  ]);

  return {
    totalFamilies: familyCountSnapshot.data().count,
    totalDancers: dancerCountSnapshot.data().count,
    activeDancers: activeDancerCountSnapshot.data().count,
  };
}
