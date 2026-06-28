import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { programConverter } from "@/lib/firestoreConverters";
import { requireAdmin } from "@/services/adminService";
import type { Program, ProgramInput } from "@/types/program";

function programs(studioId: string) {
  return collection(db, "studios", studioId, "programs").withConverter(programConverter);
}

function validate(input: ProgramInput) {
  if (!input.name.trim()) throw new Error("Program name is required.");
  if (!input.programType) throw new Error("Program type is required.");
  if (!Number.isInteger(input.minimumAge) || input.minimumAge < 0) {
    throw new Error("Minimum age must be a non-negative whole number.");
  }
  if (!Number.isInteger(input.maximumAge) || input.maximumAge < input.minimumAge) {
    throw new Error("Maximum age must be a whole number greater than or equal to minimum age.");
  }
  if (!Number.isInteger(input.displayOrder) || input.displayOrder < 0) {
    throw new Error("Display order must be a non-negative whole number.");
  }
}

export async function getPrograms(): Promise<Program[]> {
  const { studioId } = await requireAdmin();
  const snapshot = await getDocs(programs(studioId));
  return snapshot.docs.map((item) => item.data()).sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getProgram(id: string): Promise<Program | null> {
  const { studioId } = await requireAdmin();
  const snapshot = await getDoc(doc(programs(studioId), id));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function createProgram(input: ProgramInput): Promise<string> {
  validate(input);
  const { studioId, userId } = await requireAdmin();
  const reference = doc(programs(studioId));
  const now = new Date();
  await setDoc(reference, {
    ...input,
    id: reference.id,
    studioId,
    name: input.name.trim(),
    description: input.description.trim(),
    createdBy: userId,
    updatedBy: userId,
    createdAt: now,
    updatedAt: now,
  });
  return reference.id;
}

export async function updateProgram(id: string, input: ProgramInput): Promise<void> {
  validate(input);
  const { studioId, userId } = await requireAdmin();
  await updateDoc(doc(programs(studioId), id), {
    ...input,
    name: input.name.trim(),
    description: input.description.trim(),
    updatedBy: userId,
    updatedAt: new Date(),
  });
}

export async function archiveProgram(id: string): Promise<void> {
  const program = await getProgram(id);
  if (!program) throw new Error("Program not found.");
  await updateProgram(id, { ...program, status: "archived" });
}
