export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export type AttendanceSource =
  | "admin"
  | "teacher"
  | "parent"
  | "qr"
  | "import"
  | "system";

export type AttendanceRecord = {
  id: string;
  studioId: string;
  eventId: string;
  dancerId: string;
  seasonId: string;
  programId: string;
  classId: string;
  status: AttendanceStatus;
  notes: string;
  attendanceSource: AttendanceSource;
  recordedBy: string;
  recordedAt: Date;
  lastModifiedAt: Date;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export type AttendanceInput = {
  dancerId: string;
  status: AttendanceStatus;
  notes: string;
};
