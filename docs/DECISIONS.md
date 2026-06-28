# Architecture Decisions

Record major decisions sequentially. Do not rewrite history; mark replaced decisions as superseded.

## Decision 001 — Families Are the Billing Unit

**Date:** 2026-06-27  
**Decision:** Model families separately from dancers.  
**Reason:** Invoices, discounts, waivers, emergency contacts, and communication often apply to siblings as a household.  
**Status:** Accepted

## Decision 002 — Firebase Access Uses Services

**Date:** 2026-06-27  
**Decision:** Pages and components do not call Firebase directly.  
**Reason:** Services simplify UI, centralize access, improve testing, and permit future backend changes.  
**Status:** Accepted

## Decision 003 — Records Are Scoped by Studio

**Date:** 2026-06-27  
**Decision:** Domain records live under `studios/{studioId}`.  
**Reason:** This supports data isolation, staging, and future multi-studio operation.  
**Status:** Accepted

## Decision 004 — Store Birthdate, Not Age

**Date:** 2026-06-27  
**Decision:** Store birthdates and calculate age dynamically.  
**Reason:** Stored ages become stale.  
**Status:** Accepted

## Decision 005 — Onboarding Uses Atomic Writes

**Date:** 2026-06-27  
**Decision:** Create the family, dancers, and onboarding update in one batch.  
**Reason:** Partial onboarding would leave inconsistent records.  
**Status:** Accepted

## Decision 006 — Dashboard Counts Use Aggregations

**Date:** 2026-06-27  
**Decision:** Use Firestore aggregation queries for counts.  
**Reason:** Downloading documents solely to count them does not scale.  
**Status:** Accepted

## Decision 007 — Security Rules Authorize Data

**Date:** 2026-06-27  
**Decision:** Firestore Security Rules are the authorization boundary.  
**Reason:** Browser code can be inspected and modified.  
**Status:** Accepted

## Decision 008 — Organize Services Before Version 1.0

**Date:** 2026-06-27  
**Decision:** Move services into domain folders before Version 1.0.  
**Reason:** Domain folders keep a growing service layer navigable.  
**Status:** Accepted

## Decision 009 — Schedule Events Are Dated Occurrences

**Date:** 2026-06-28
**Decision:** Schedule Series defines recurrence while Schedule Events represent individual dated occurrences.
**Reason:** Cancellations, substitutions, attendance, and event-specific notes apply to one occurrence rather than the recurring definition.
**Status:** Accepted

## Decision 010 — Schedule Events Use Date-Time Timestamps

**Date:** 2026-06-28
**Decision:** Store canonical event boundaries as `startDateTime` and `endDateTime` timestamps with an IANA `timeZone`.
**Reason:** Timestamp intervals support reliable ordering and querying while the time zone preserves correct local interpretation. Separate persisted date and time representations could drift out of sync.
**Status:** Accepted

## Decision 011 — Public Notes Are Separate from Internal Notes

**Date:** 2026-06-28
**Decision:** Store internal information in `notes` and parent-safe information in `publicNotes`.
**Reason:** Parent visibility must never expose administrative or teacher-only notes.
**Status:** Accepted

## Decision 012 — Rescheduling Creates a Replacement Event

**Date:** 2026-06-28
**Decision:** Rescheduling marks the original event as rescheduled and creates a linked replacement event in an atomic batch.
**Reason:** Preserving the original occurrence provides an audit trail and prevents notifications or future attendance from silently changing meaning.
**Status:** Accepted

## Decision 013 — Attendance Attaches to Schedule Events

**Date:** 2026-06-28
**Decision:** Attendance records reference a Schedule Event rather than a Schedule Series or Class alone.
**Reason:** Attendance describes participation in one dated occurrence. Separate attendance records also avoid unbounded arrays in event documents.
**Status:** Accepted

## Decision 014 — Event Types Support Non-Class Events

**Date:** 2026-06-28
**Decision:** Schedule Events include `eventType`. The initial supported value is `class`, with reserved values for competitions, conventions, private lessons, master classes, rehearsals, recitals, auditions, meetings, and studio closures.
**Reason:** A shared event model can support future studio scheduling without forcing every occurrence into the Class domain.
**Status:** Accepted

## Template

```text
## Decision NNN — Title
Date: YYYY-MM-DD
Decision: What was decided?
Reason: Why was it selected?
Status: Proposed, Accepted, Superseded, or Rejected
```
