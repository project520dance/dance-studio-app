export type ScheduleGenerationError = {
  scheduleSeriesId: string;
  scheduleSeriesName: string;
  message: string;
};

export type ScheduleGenerationResult = {
  generatedThrough: string;
  seriesProcessed: number;
  eventsCreated: number;
  eventsSkipped: number;
  errors: ScheduleGenerationError[];
};
