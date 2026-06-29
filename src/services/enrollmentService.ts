import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  enrollmentConverter,
  programConverter,
  seasonConverter,
  studioClassConverter,
} from "@/lib/firestoreConverters";
import { requireAdmin } from "@/services/adminService";
import type { Dancer } from "@/types/dancer";
import type {
  CreateEnrollmentInput,
  Enrollment,
  EnrollmentStatus,
  UpdateEnrollmentInput,
} from "@/types/enrollment";
import type { Season } from "@/types/season";
import type { StudioClass } from "@/types/studioClass";
import { validateDate } from "@/utils/scheduleDateTime";

function enrollments(studioId: string) {
  return collection(
    db,
    "studios",
    studioId,
    "enrollments",
  ).withConverter(enrollmentConverter);
}

function enrollmentId(classId: string, dancerId: string) {
  return `${classId}_${dancerId}`;
}

function validateDates(
  startDate: string,
  endDate: string | null,
  season: Season,
  status: EnrollmentStatus,
) {
  validateDate(startDate, "Start date");
  if (endDate) validateDate(endDate, "End date");
  if (startDate < season.startDate || startDate > season.endDate) {
    throw new Error("Start date must be within the season.");
  }
  if (endDate && (endDate < startDate || endDate > season.endDate)) {
    throw new Error(
      "End date must follow the start date and remain within the season.",
    );
  }
  if ((status === "withdrawn" || status === "completed") && !endDate) {
    throw new Error("An end date is required for this status.");
  }
}

function validateRelationships(
  studioClass: StudioClass,
  season: Season,
  programStatus: string,
) {
  if (
    studioClass.seasonId !== season.id
    || studioClass.status === "archived"
    || season.status === "archived"
    || programStatus === "archived"
  ) {
    throw new Error(
      "The selected class, season, and program must be valid and available.",
    );
  }
}

function validateStatusTransition(
  current: EnrollmentStatus,
  next: EnrollmentStatus,
) {
  const transitions: Record<EnrollmentStatus, EnrollmentStatus[]> = {
    active: ["active", "withdrawn", "completed"],
    withdrawn: ["withdrawn", "active"],
    completed: ["completed"],
    archived: ["archived"],
  };
  if (!transitions[current].includes(next)) {
    throw new Error(`Enrollment cannot change from ${current} to ${next}.`);
  }
}

export async function getEnrollmentsForClass(
  classId: string,
): Promise<Enrollment[]> {
  const { studioId } = await requireAdmin();
  const snapshot = await getDocs(
    query(enrollments(studioId), where("classId", "==", classId)),
  );
  return snapshot.docs
    .map((item) => item.data())
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export async function getEnrollment(
  classId: string,
  id: string,
): Promise<Enrollment | null> {
  const { studioId } = await requireAdmin();
  const snapshot = await getDoc(doc(enrollments(studioId), id));
  const enrollment = snapshot.exists() ? snapshot.data() : null;
  return enrollment?.classId === classId ? enrollment : null;
}

export async function createEnrollment(
  classId: string,
  input: CreateEnrollmentInput,
): Promise<string> {
  if (!input.dancerId) throw new Error("Select a dancer.");
  const { studioId, userId } = await requireAdmin();
  const id = enrollmentId(classId, input.dancerId);
  const enrollmentReference = doc(enrollments(studioId), id);
  const classReference = doc(
    collection(db, "studios", studioId, "classes").withConverter(
      studioClassConverter,
    ),
    classId,
  );
  const dancerReference = doc(
    db,
    "studios",
    studioId,
    "dancers",
    input.dancerId,
  );

  await runTransaction(db, async (transaction) => {
    const [classSnapshot, dancerSnapshot, enrollmentSnapshot] =
      await Promise.all([
        transaction.get(classReference),
        transaction.get(dancerReference),
        transaction.get(enrollmentReference),
      ]);
    if (!classSnapshot.exists()) throw new Error("Class not found.");
    if (!dancerSnapshot.exists()) throw new Error("Dancer not found.");
    if (enrollmentSnapshot.exists()) {
      throw new Error("This dancer already has an enrollment for this class.");
    }

    const studioClass = classSnapshot.data();
    const dancer = dancerSnapshot.data() as Dancer;
    if (dancer.status !== "active") {
      throw new Error("Archived dancers cannot be enrolled.");
    }
    const seasonReference = doc(
      collection(db, "studios", studioId, "seasons").withConverter(
        seasonConverter,
      ),
      studioClass.seasonId,
    );
    const programReference = doc(
      collection(db, "studios", studioId, "programs").withConverter(
        programConverter,
      ),
      studioClass.programId,
    );
    const [seasonSnapshot, programSnapshot] = await Promise.all([
      transaction.get(seasonReference),
      transaction.get(programReference),
    ]);
    if (!seasonSnapshot.exists() || !programSnapshot.exists()) {
      throw new Error("The class season or program could not be found.");
    }
    const season = seasonSnapshot.data();
    validateRelationships(studioClass, season, programSnapshot.data().status);
    validateDates(input.startDate, input.endDate, season, "active");

    const now = new Date();
    transaction.set(enrollmentReference, {
      id,
      studioId,
      dancerId: input.dancerId,
      seasonId: studioClass.seasonId,
      programId: studioClass.programId,
      classId,
      status: "active",
      enrollmentSource: "admin",
      startDate: input.startDate,
      endDate: input.endDate,
      notes: input.notes.trim(),
      enrolledAt: now,
      lastStatusChangedAt: now,
      createdBy: userId,
      updatedBy: userId,
      createdAt: now,
      updatedAt: now,
    });
  });
  return id;
}

export async function updateEnrollment(
  classId: string,
  id: string,
  input: UpdateEnrollmentInput,
): Promise<void> {
  if (input.status === "archived") {
    throw new Error("Use the archive action to archive an enrollment.");
  }
  const { studioId, userId } = await requireAdmin();
  const reference = doc(enrollments(studioId), id);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists() || snapshot.data().classId !== classId) {
      throw new Error("Enrollment not found.");
    }
    const current = snapshot.data();
    if (current.status === "archived") {
      throw new Error("Archived enrollments cannot be edited.");
    }
    const seasonReference = doc(
      collection(db, "studios", studioId, "seasons").withConverter(
        seasonConverter,
      ),
      current.seasonId,
    );
    const seasonSnapshot = await transaction.get(seasonReference);
    if (!seasonSnapshot.exists()) throw new Error("Season not found.");
    validateStatusTransition(current.status, input.status);
    validateDates(
      input.startDate,
      input.endDate,
      seasonSnapshot.data(),
      input.status,
    );
    const now = new Date();
    transaction.update(reference, {
      status: input.status,
      startDate: input.startDate,
      endDate: input.endDate,
      notes: input.notes.trim(),
      lastStatusChangedAt:
        current.status === input.status ? current.lastStatusChangedAt : now,
      updatedBy: userId,
      updatedAt: now,
    });
  });
}

export async function archiveEnrollment(
  classId: string,
  id: string,
): Promise<void> {
  const { studioId, userId } = await requireAdmin();
  const reference = doc(enrollments(studioId), id);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists() || snapshot.data().classId !== classId) {
      throw new Error("Enrollment not found.");
    }
    if (snapshot.data().status === "archived") {
      throw new Error("This enrollment is already archived.");
    }
    const now = new Date();
    transaction.update(reference, {
      status: "archived",
      lastStatusChangedAt: now,
      updatedBy: userId,
      updatedAt: now,
    });
  });
}

// TODO: Use this derived roster as the attendance roster source in a future
// release, replacing the temporary all-active-dancers attendance roster.
export async function getRosterForClass(
  classId: string,
  date: string,
): Promise<Dancer[]> {
  validateDate(date, "Roster date");
  const { studioId } = await requireAdmin();
  const snapshot = await getDocs(
    query(
      enrollments(studioId),
      where("classId", "==", classId),
      where("status", "==", "active"),
    ),
  );
  const effectiveEnrollments = snapshot.docs
    .map((item) => item.data())
    .filter(
      (item) =>
        item.startDate <= date && (!item.endDate || item.endDate >= date),
    );
  const dancers = await Promise.all(
    effectiveEnrollments.map(async (enrollment) => {
      const snapshot = await getDoc(
        doc(db, "studios", studioId, "dancers", enrollment.dancerId),
      );
      return snapshot.exists() ? (snapshot.data() as Dancer) : null;
    }),
  );
  return dancers
    .filter((dancer): dancer is Dancer => dancer !== null)
    .sort((a, b) =>
      `${a.lastName} ${a.firstName}`.localeCompare(
        `${b.lastName} ${b.firstName}`,
      ),
    );
}
