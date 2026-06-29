export type EnrollmentStatus =
  | "active"
  | "withdrawn"
  | "completed"
  | "archived";

export type EnrollmentSource = "admin" | "parent" | "import" | "system";

export type Enrollment = {
  id: string;
  studioId: string;
  dancerId: string;
  seasonId: string;
  programId: string;
  classId: string;
  status: EnrollmentStatus;
  enrollmentSource: EnrollmentSource;
  startDate: string;
  endDate: string | null;
  notes: string;
  enrolledAt: Date;
  lastStatusChangedAt: Date;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateEnrollmentInput = Pick<
  Enrollment,
  "dancerId" | "startDate" | "endDate" | "notes"
>;

export type UpdateEnrollmentInput = Pick<
  Enrollment,
  "status" | "startDate" | "endDate" | "notes"
>;
