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

## Template

```text
## Decision NNN — Title
Date: YYYY-MM-DD
Decision: What was decided?
Reason: Why was it selected?
Status: Proposed, Accepted, Superseded, or Rejected
```
