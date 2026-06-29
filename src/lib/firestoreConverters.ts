import {
  Timestamp,
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
} from "firebase/firestore";
import type { AttendanceRecord } from "@/types/attendance";
import type { Program } from "@/types/program";
import type { ScheduleEvent } from "@/types/scheduleEvent";
import type { ScheduleSeries } from "@/types/scheduleSeries";
import type { Season } from "@/types/season";
import type { StudioClass } from "@/types/studioClass";

type DatedDocument = {
  createdAt: Date;
  updatedAt: Date;
};

function createDatedConverter<T extends DatedDocument>(): FirestoreDataConverter<T> {
  return {
    toFirestore(value: T): DocumentData {
      return {
        ...value,
        createdAt: Timestamp.fromDate(value.createdAt),
        updatedAt: Timestamp.fromDate(value.updatedAt),
      };
    },
    fromFirestore(
      snapshot: QueryDocumentSnapshot,
      options: SnapshotOptions,
    ): T {
      const data = snapshot.data(options);
      return {
        ...data,
        id: snapshot.id,
        createdAt: (data.createdAt as Timestamp).toDate(),
        updatedAt: (data.updatedAt as Timestamp).toDate(),
      } as unknown as T;
    },
  };
}

// Firebase timestamp handling stays at the persistence boundary. The rest of
// the application works with standard JavaScript Date values.
export const seasonConverter = createDatedConverter<Season>();
export const programConverter = createDatedConverter<Program>();
export const studioClassConverter = createDatedConverter<StudioClass>();
export const scheduleSeriesConverter = createDatedConverter<ScheduleSeries>();

export const scheduleEventConverter: FirestoreDataConverter<ScheduleEvent> = {
  toFirestore(value: ScheduleEvent): DocumentData {
    return {
      ...value,
      startDateTime: Timestamp.fromDate(value.startDateTime),
      endDateTime: Timestamp.fromDate(value.endDateTime),
      createdAt: Timestamp.fromDate(value.createdAt),
      updatedAt: Timestamp.fromDate(value.updatedAt),
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions,
  ): ScheduleEvent {
    const data = snapshot.data(options);
    return {
      ...data,
      id: snapshot.id,
      startDateTime: (data.startDateTime as Timestamp).toDate(),
      endDateTime: (data.endDateTime as Timestamp).toDate(),
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate(),
    } as unknown as ScheduleEvent;
  },
};

export const attendanceConverter: FirestoreDataConverter<AttendanceRecord> = {
  toFirestore(value: AttendanceRecord): DocumentData {
    return {
      ...value,
      recordedAt: Timestamp.fromDate(value.recordedAt),
      lastModifiedAt: Timestamp.fromDate(value.lastModifiedAt),
      createdAt: Timestamp.fromDate(value.createdAt),
      updatedAt: Timestamp.fromDate(value.updatedAt),
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions,
  ): AttendanceRecord {
    const data = snapshot.data(options);
    return {
      ...data,
      id: snapshot.id,
      recordedAt: (data.recordedAt as Timestamp).toDate(),
      lastModifiedAt: (data.lastModifiedAt as Timestamp).toDate(),
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate(),
    } as unknown as AttendanceRecord;
  },
};
