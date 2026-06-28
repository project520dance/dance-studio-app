import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type NextOrObserver,
  type User,
  type UserCredential,
  type Unsubscribe,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

export async function registerWithEmail(
  email: string,
  password: string,
): Promise<UserCredential> {
  return createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
}

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<UserCredential> {
  return signInWithEmailAndPassword(getFirebaseAuth(), email, password);
}

export async function logout(): Promise<void> {
  await signOut(getFirebaseAuth());
}

export function getCurrentUser(): User | null {
  return getFirebaseAuth().currentUser;
}

export function subscribeToAuthState(
  observer: NextOrObserver<User>,
): Unsubscribe {
  return onAuthStateChanged(getFirebaseAuth(), observer);
}
