import {
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  where,
  type DocumentReference,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  programConverter,
  scheduleEventConverter,
  scheduleSeriesConverter,
  seasonConverter,
  studioClassConverter,
} from "@/lib/firestoreConverters";
import { requireAdmin } from "@/services/adminService";
import type { ScheduleEvent } from "@/types/scheduleEvent";
import type {
  ScheduleGenerationError,
  ScheduleGenerationResult,
} from "@/types/scheduleGeneration";
import type { ScheduleSeries } from "@/types/scheduleSeries";
import type { Season } from "@/types/season";
import type { Program } from "@/types/program";
import type { StudioClass } from "@/types/studioClass";
import {
  addDays,
  dayOfWeek,
  localDateTimeToDate,
  todayInTimeZone,
  validateDate,
  validateTime,
  validateTimeZone,
} from "@/utils/scheduleDateTime";

const DEFAULT_HORIZON_DAYS = 90;

type Candidate = {
  reference: DocumentReference<ScheduleEvent>;
  event: ScheduleEvent;
};

function seriesCollection(studioId: string) {
  return collection(db, "studios", studioId, "scheduleSeries").withConverter(scheduleSeriesConverter);
}

function eventCollection(studioId: string) {
  return collection(db, "studios", studioId, "scheduleEvents").withConverter(scheduleEventConverter);
}

function seasonCollection(studioId: string) {
  return collection(db, "studios", studioId, "seasons").withConverter(seasonConverter);
}

function programCollection(studioId: string) {
  return collection(db, "studios", studioId, "programs").withConverter(programConverter);
}

function classCollection(studioId: string) {
  return collection(db, "studios", studioId, "classes").withConverter(studioClassConverter);
}

function validateSeries(
  series: ScheduleSeries,
  season: Season | undefined,
  program: Program | undefined,
  studioClass: StudioClass | undefined,
) {
  if (!season) throw new Error("Season was not found.");
  if (!program) throw new Error("Program was not found.");
  if (!studioClass) throw new Error("Class was not found.");
  if (season.status === "archived") throw new Error("Season is archived.");
  if (program.status === "archived") throw new Error("Program is archived.");
  if (studioClass.status === "archived") throw new Error("Class is archived.");
  if (studioClass.seasonId !== series.seasonId) {
    throw new Error("Class does not belong to the selected season.");
  }
  if (studioClass.programId !== series.programId) {
    throw new Error("Class does not belong to the selected program.");
  }
  validateDate(series.effectiveStartDate, "Series start date");
  validateDate(series.effectiveEndDate, "Series end date");
  validateDate(season.startDate, "Season start date");
  validateDate(season.endDate, "Season end date");
  if (series.effectiveEndDate < series.effectiveStartDate) {
    throw new Error("Series end date must follow its start date.");
  }
  if (season.endDate < season.startDate) {
    throw new Error("Season end date must follow its start date.");
  }
  validateTime(series.startTime, "Start time");
  validateTime(series.endTime, "End time");
  if (series.endTime <= series.startTime) {
    throw new Error("End time must follow start time.");
  }
  validateTimeZone(season.timeZone);
}

function buildCandidates({
  series,
  season,
  studioId,
  userId,
  horizonDays,
}: {
  series: ScheduleSeries;
  season: Season;
  studioId: string;
  userId: string;
  horizonDays: number;
}) {
  const today = todayInTimeZone(season.timeZone);
  const horizonEnd = addDays(today, horizonDays);
  const generationStart = [today, series.effectiveStartDate, season.startDate].sort().at(-1)!;
  const generationEnd = [horizonEnd, series.effectiveEndDate, season.endDate].sort()[0];
  const candidates: Candidate[] = [];

  if (generationStart > generationEnd) return { candidates, horizonEnd };

  for (
    let occurrenceDate = generationStart;
    occurrenceDate <= generationEnd;
    occurrenceDate = addDays(occurrenceDate, 1)
  ) {
    if (dayOfWeek(occurrenceDate) !== series.dayOfWeek) continue;
    const occurrenceKey = `${series.id}_${occurrenceDate}`;
    const now = new Date();
    const event: ScheduleEvent = {
      id: occurrenceKey,
      studioId,
      eventType: "class",
      source: "series",
      occurrenceKey,
      scheduleSeriesId: series.id,
      seasonId: series.seasonId,
      programId: series.programId,
      classId: series.classId,
      roomId: series.roomId,
      startDateTime: localDateTimeToDate(
        occurrenceDate,
        series.startTime,
        season.timeZone,
      ),
      endDateTime: localDateTimeToDate(
        occurrenceDate,
        series.endTime,
        season.timeZone,
      ),
      timeZone: season.timeZone,
      status: "scheduled",
      isVisibleToParents: false,
      notes: series.notes.trim(),
      publicNotes: "",
      teacherIds: [],
      substituteTeacherIds: [],
      cancellationReason: "",
      rescheduleReason: "",
      rescheduledFromEventId: null,
      rescheduledToEventId: null,
      displayOrder: series.displayOrder,
      createdBy: userId,
      updatedBy: userId,
      createdAt: now,
      updatedAt: now,
    };
    candidates.push({
      reference: doc(eventCollection(studioId), occurrenceKey),
      event,
    });
  }

  return { candidates, horizonEnd };
}

async function writeMissingCandidates(candidates: Candidate[]) {
  if (candidates.length === 0) return { created: 0, skipped: 0 };

  return runTransaction(db, async (transaction) => {
    const snapshots = await Promise.all(
      candidates.map((candidate) => transaction.get(candidate.reference)),
    );
    let created = 0;
    let skipped = 0;

    snapshots.forEach((snapshot, index) => {
      if (snapshot.exists()) {
        skipped += 1;
        return;
      }
      transaction.set(candidates[index].reference, candidates[index].event);
      created += 1;
    });

    return { created, skipped };
  });
}

export async function generateScheduleEvents({
  horizonDays = DEFAULT_HORIZON_DAYS,
}: {
  horizonDays?: number;
} = {}): Promise<ScheduleGenerationResult> {
  if (!Number.isInteger(horizonDays) || horizonDays < 1 || horizonDays > 365) {
    throw new Error("Generation horizon must be between 1 and 365 days.");
  }

  const { studioId, userId } = await requireAdmin();
  const [seriesSnapshot, seasonSnapshot, programSnapshot, classSnapshot] = await Promise.all([
    getDocs(query(seriesCollection(studioId), where("status", "==", "active"))),
    getDocs(seasonCollection(studioId)),
    getDocs(programCollection(studioId)),
    getDocs(classCollection(studioId)),
  ]);
  const seasons = new Map(seasonSnapshot.docs.map((item) => [item.id, item.data()]));
  const programs = new Map(programSnapshot.docs.map((item) => [item.id, item.data()]));
  const classes = new Map(classSnapshot.docs.map((item) => [item.id, item.data()]));
  const errors: ScheduleGenerationError[] = [];
  let eventsCreated = 0;
  let eventsSkipped = 0;
  let generatedThrough = "";

  for (const seriesDocument of seriesSnapshot.docs) {
    const series = seriesDocument.data();
    const season = seasons.get(series.seasonId);
    const program = programs.get(series.programId);
    const studioClass = classes.get(series.classId);
    const scheduleSeriesName = studioClass?.name ?? `Schedule series ${series.id}`;

    try {
      validateSeries(series, season, program, studioClass);
      const generated = buildCandidates({
        series,
        season: season!,
        studioId,
        userId,
        horizonDays,
      });
      generatedThrough = generated.horizonEnd > generatedThrough
        ? generated.horizonEnd
        : generatedThrough;
      const writeResult = await writeMissingCandidates(generated.candidates);
      eventsCreated += writeResult.created;
      eventsSkipped += writeResult.skipped;
    } catch (reason) {
      errors.push({
        scheduleSeriesId: series.id,
        scheduleSeriesName,
        message: reason instanceof Error ? reason.message : "Unable to generate this series.",
      });
    }
  }

  return {
    generatedThrough,
    seriesProcessed: seriesSnapshot.size,
    eventsCreated,
    eventsSkipped,
    errors,
  };
}
