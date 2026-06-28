import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { UserProfile } from "@/types/user";

const STUDIO_ID =
  process.env.NEXT_PUBLIC_DEFAULT_STUDIO_ID ?? "project520";

type CreateUserProfileInput = {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
};

function getUserDocument(uid: string) {
  return doc(db, "studios", STUDIO_ID, "users", uid);
}

export async function createUserProfile({
  uid,
  email,
  firstName,
  lastName,
}: CreateUserProfileInput): Promise<void> {
  const normalizedFirstName = firstName.trim();
  const normalizedLastName = lastName.trim();

  await setDoc(getUserDocument(uid), {
    uid,
    email,
    firstName: normalizedFirstName,
    lastName: normalizedLastName,
    displayName: `${normalizedFirstName} ${normalizedLastName}`.trim(),
    role: "parent",
    studioId: STUDIO_ID,
    status: "active",
    onboardingComplete: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getUserProfile(
  uid: string,
): Promise<UserProfile | null> {
  const snapshot = await getDoc(getUserDocument(uid));

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as UserProfile;
}
