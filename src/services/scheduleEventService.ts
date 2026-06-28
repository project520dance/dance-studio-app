import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { scheduleEventConverter } from "@/lib/firestoreConverters";
import { requireAdmin } from "@/services/adminService";
import type { ScheduleEvent } from "@/types/scheduleEvent";

function scheduleEvents(studioId: string) {
  return collection(
    db,
    "studios",
    studioId,
    "scheduleEvents",
  ).withConverter(scheduleEventConverter);
}

export async function getScheduleEvents(): Promise<ScheduleEvent[]> {
  const { studioId } = await requireAdmin();
  const snapshot = await getDocs(scheduleEvents(studioId));
  return snapshot.docs
    .map((item) => item.data())
    .sort((a, b) => a.startDateTime.getTime() - b.startDateTime.getTime());
}
