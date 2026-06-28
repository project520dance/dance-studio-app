export type ScheduleSeriesStatus = "draft" | "active" | "archived";
export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";
export type ScheduleRoomId = "studioA" | "studioB" | "studioC" | "lobby" | "other";

export type ScheduleSeries = {
  id: string;
  studioId: string;
  seasonId: string;
  programId: string;
  classId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  roomId: ScheduleRoomId;
  effectiveStartDate: string;
  effectiveEndDate: string;
  notes: string;
  status: ScheduleSeriesStatus;
  displayOrder: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ScheduleSeriesInput = Pick<
  ScheduleSeries,
  | "seasonId"
  | "programId"
  | "classId"
  | "dayOfWeek"
  | "startTime"
  | "endTime"
  | "roomId"
  | "effectiveStartDate"
  | "effectiveEndDate"
  | "notes"
  | "status"
  | "displayOrder"
>;
