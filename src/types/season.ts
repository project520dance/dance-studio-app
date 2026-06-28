export type SeasonStatus = "draft" | "active" | "archived";
export type SeasonType =
  | "annual"
  | "semester"
  | "summer"
  | "intensive"
  | "workshop"
  | "custom";

export type Season = {
  id: string;
  studioId: string;
  name: string;
  seasonType: SeasonType;
  startDate: string;
  endDate: string;
  timeZone: string;
  registrationOpenAt: string;
  registrationCloseAt: string;
  status: SeasonStatus;
  isDefault: boolean;
  displayOrder: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SeasonInput = Pick<
  Season,
  | "name"
  | "seasonType"
  | "startDate"
  | "endDate"
  | "timeZone"
  | "registrationOpenAt"
  | "registrationCloseAt"
  | "status"
  | "isDefault"
  | "displayOrder"
>;
