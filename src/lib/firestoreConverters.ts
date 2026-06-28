import {
  Timestamp,
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
} from "firebase/firestore";
import type { Program } from "@/types/program";
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
