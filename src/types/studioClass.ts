export type StudioClassStatus = "draft" | "active" | "archived";
export type ActivityType =
  | "ballet"
  | "jazz"
  | "tap"
  | "hipHop"
  | "acro"
  | "contemporary"
  | "lyrical"
  | "musicalTheatre"
  | "technique"
  | "flexibility"
  | "strengthAndConditioning"
  | "choreography"
  | "privateLesson"
  | "openStudio"
  | "competitionRehearsal"
  | "rehearsal"
  | "convention"
  | "workshop"
  | "custom";

export type StudioClass = {
  id: string;
  studioId: string;
  seasonId: string;
  programId: string;
  name: string;
  description: string;
  activityType: ActivityType;
  status: StudioClassStatus;
  level: string;
  minimumAge: number;
  maximumAge: number;
  capacity: number;
  durationMinutes: number;
  displayOrder: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export type StudioClassInput = Pick<
  StudioClass,
  | "seasonId"
  | "programId"
  | "name"
  | "description"
  | "activityType"
  | "status"
  | "level"
  | "minimumAge"
  | "maximumAge"
  | "capacity"
  | "durationMinutes"
  | "displayOrder"
>;
