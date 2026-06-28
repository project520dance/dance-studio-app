export type ProgramStatus = "active" | "archived";
export type ProgramType =
  | "competition"
  | "recreational"
  | "privateLessons"
  | "intensive"
  | "workshop"
  | "openStudio"
  | "custom";
export type ProgramVisibility = "public" | "invitationOnly" | "internal";

export type Program = {
  id: string;
  studioId: string;
  name: string;
  description: string;
  programType: ProgramType;
  minimumAge: number;
  maximumAge: number;
  visibility: ProgramVisibility;
  status: ProgramStatus;
  displayOrder: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ProgramInput = Pick<
  Program,
  | "name"
  | "description"
  | "programType"
  | "minimumAge"
  | "maximumAge"
  | "visibility"
  | "status"
  | "displayOrder"
>;
