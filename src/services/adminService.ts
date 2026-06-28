import {
  collection,
  getCountFromServer,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { waitForCurrentUser } from "@/services/authService";
import {
  DEFAULT_STUDIO_ID,
  getUserProfile,
} from "@/services/userService";
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

async function requireAdmin(): Promise<void> {
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
}

function getFamiliesCollection() {
  return collection(
    db,
    "studios",
    DEFAULT_STUDIO_ID,
    "families",
  );
}

function getDancersCollection() {
  return collection(
    db,
    "studios",
    DEFAULT_STUDIO_ID,
    "dancers",
  );
}

export async function getAllFamilies(): Promise<Family[]> {
  await requireAdmin();
  const snapshot = await getDocs(getFamiliesCollection());

  return snapshot.docs
    .map((document) => document.data() as Family)
    .sort((a, b) => a.familyName.localeCompare(b.familyName));
}

export async function getAllDancers(): Promise<Dancer[]> {
  await requireAdmin();
  const snapshot = await getDocs(getDancersCollection());

  return snapshot.docs
    .map((document) => document.data() as Dancer)
    .sort((a, b) =>
      `${a.lastName} ${a.firstName}`.localeCompare(
        `${b.lastName} ${b.firstName}`,
      ),
    );
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  await requireAdmin();

  const familiesCollection = getFamiliesCollection();
  const dancersCollection = getDancersCollection();
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
