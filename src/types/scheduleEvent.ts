export type ScheduleEventType =
  | "class"
  | "competition"
  | "convention"
  | "privateLesson"
  | "masterClass"
  | "rehearsal"
  | "recital"
  | "audition"
  | "meeting"
  | "studioClosed";

export type ScheduleEventSource = "series" | "manual";
export type ScheduleEventStatus =
  | "scheduled"
  | "cancelled"
  | "rescheduled"
  | "completed"
  | "archived";
export type ScheduleEventRoomId = "studioA" | "studioB" | "studioC" | "lobby" | "other";

export type ScheduleEvent = {
  id: string;
  studioId: string;
  eventType: ScheduleEventType;
  source: ScheduleEventSource;
  occurrenceKey: string | null;
  scheduleSeriesId: string | null;
  seasonId: string;
  programId: string;
  classId: string;
  roomId: ScheduleEventRoomId;
  startDateTime: Date;
  endDateTime: Date;
  timeZone: string;
  status: ScheduleEventStatus;
  isVisibleToParents: boolean;
  notes: string;
  publicNotes: string;
  teacherIds: string[];
  substituteTeacherIds: string[];
  cancellationReason: string;
  rescheduleReason: string;
  rescheduledFromEventId: string | null;
  rescheduledToEventId: string | null;
  displayOrder: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ScheduleEventUpdateInput = Pick<
  ScheduleEvent,
  | "roomId"
  | "notes"
  | "publicNotes"
  | "isVisibleToParents"
  | "displayOrder"
>;
