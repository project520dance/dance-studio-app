# Schedule Events

Version 0.6.1 establishes the technical design for dated schedule occurrences.

A Schedule Series defines recurrence. A Schedule Event represents one occurrence on specific dates and times. Schedule Events will later support calendars, cancellations, substitutions, and attendance.

## Firestore Path

```text
studios/{studioId}/scheduleEvents/{eventId}
```

## Model

| Field | Type | Description |
| --- | --- | --- |
| `id` | string | Event document ID |
| `studioId` | string | Owning studio |
| `eventType` | string | Type of scheduled event |
| `source` | string | `series` or `manual` |
| `occurrenceKey` | string or null | Stable key used to prevent duplicate generated occurrences |
| `scheduleSeriesId` | string or null | Source Schedule Series |
| `seasonId` | string | Related Season |
| `programId` | string | Related Program |
| `classId` | string | Related Class |
| `roomId` | string | Canonical room identifier |
| `startDateTime` | timestamp | Current scheduled start instant |
| `endDateTime` | timestamp | Current scheduled end instant |
| `timeZone` | string | IANA time zone used to interpret and display the event |
| `status` | string | Event lifecycle status |
| `isVisibleToParents` | boolean | Whether the event may appear in parent-facing views |
| `notes` | string | Internal admin and teacher notes |
| `publicNotes` | string | Notes safe for parent-facing views |
| `teacherIds` | string[] | Assigned primary teachers |
| `substituteTeacherIds` | string[] | Assigned substitute teachers |
| `cancellationReason` | string | Reason for cancellation |
| `rescheduleReason` | string | Reason for rescheduling |
| `rescheduledFromEventId` | string or null | Original event when this is a replacement |
| `rescheduledToEventId` | string or null | Replacement event when this event was moved |
| `displayOrder` | number | Stable administrative ordering |
| `createdBy`, `updatedBy` | string | Audit user IDs |
| `createdAt`, `updatedAt` | timestamp | Audit timestamps |

## TypeScript Model

```ts
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
  roomId: string;
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
```

The initial admin interface supports only `eventType: "class"`. The broader union reserves stable values for future non-class events.

## Relationships

Generated events reference their source through `scheduleSeriesId`. Manual events use `scheduleSeriesId: null` and `source: "manual"`.

Events also store `seasonId`, `programId`, and `classId` directly. The service must verify that the Class belongs to the selected Season and Program and that all records belong to the same studio.

Schedule Events are snapshots. Later edits to a Schedule Series must not silently rewrite historical events.

## Occurrence Keys

Generated events use a deterministic `occurrenceKey`, such as:

```text
{scheduleSeriesId}_{localDate}
```

The future generator will use this key to make generation idempotent. Manual events use `occurrenceKey: null`.

The generator itself is not part of Version 0.6.1.

## Rooms

Schedule Events store `roomId`, never a free-text room name.

Temporary identifiers are:

```text
studioA
studioB
studioC
lobby
other
```

When Room Management exists, `roomId` will reference `studios/{studioId}/rooms/{roomId}` without requiring a field rename.

## Dates and Times

`startDateTime` and `endDateTime` are canonical Firestore timestamps. `timeZone` stores the IANA time zone used for entry and display.

The service must validate that both values exist and that `endDateTime` is later than `startDateTime`.

Separate persisted date and time strings are intentionally avoided because duplicate representations could become inconsistent.

## Notes and Parent Visibility

`notes` contains internal information and must not be returned by parent-facing services.

`publicNotes` contains information safe for parent display.

`isVisibleToParents` controls product visibility but does not replace authorization. Parent access must still be enforced through studio, family, dancer, and enrollment relationships plus Firestore Security Rules.

## Teachers and Substitutes

`teacherIds` and `substituteTeacherIds` are arrays so future events can support co-teaching and multiple substitutes.

These arrays remain empty until teacher management is implemented. Schedule Events store teacher IDs rather than embedded teacher names.

## Cancellation and Rescheduling

Cancellation updates the existing event:

```text
status = cancelled
cancellationReason = explanation
```

Rescheduling preserves history:

1. Mark the original event `rescheduled`.
2. Create a replacement event with the new dates and times.
3. Set `rescheduledToEventId` on the original event.
4. Set `rescheduledFromEventId` on the replacement event.
5. Store the rescheduling reason.
6. Perform the related writes in an atomic Firestore batch.

The original event's dates and times are not overwritten.

## Attendance Relationship

Attendance will attach to Schedule Events because attendance describes participation in one dated occurrence.

Future records will live at:

```text
studios/{studioId}/attendance/{attendanceId}
```

Each attendance record will reference at least:

```text
eventId
dancerId
classId
status
recordedBy
recordedAt
notes
```

Attendance must not be stored as an unbounded array inside a Schedule Event. Cancelled and superseded events must not accept new attendance.

Attendance records and attendance UI are not part of Version 0.6.1.

## Admin Routes

```text
/admin/schedule-events
/admin/schedule-events/new
/admin/schedule-events/[eventId]
```

The routes will use the established dedicated-editor architecture with loading, error, and empty states.

## Service Layer

`scheduleEventService.ts` will own:

- Firestore paths and converters
- Studio scoping and admin authorization
- Typed reads and writes
- Input normalization
- Date and time conversion
- Relationship validation
- Room validation
- Status-transition validation
- Manual event creation
- Event updates
- Cancellation
- Atomic rescheduling
- Completion and archive operations
- Parent-safe queries that exclude internal notes
- Deterministic occurrence-key enforcement when generation is introduced

Pages and components must not import Firestore directly.

## Exclusions

Version 0.6.1 does not include:

- Schedule Series event generation
- Recurrence expansion
- Background or scheduled jobs
- Attendance records or attendance UI
- Rosters or enrollment resolution
- Parent, teacher, admin, or public calendars
- Calendar export
- Teacher-management UI
- Substitute-assignment workflows
- Room Management
- Cancellation or rescheduling notifications
- Schedule conflict detection
- Waitlists
- Billing integration
- Cascading deletion
