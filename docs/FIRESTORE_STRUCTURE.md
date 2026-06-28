# Firestore Structure

## Current Collections

```text
studios
└── {studioId}
    ├── users/{uid}
    ├── families/{familyId}
    └── dancers/{dancerId}
```

## Relationships

```text
Firebase Auth user
  → users/{uid}
  → families/{familyId}
  → dancers queried by familyId
```

Family and dancer creation during onboarding uses one atomic batch. The user is marked onboarded only when every write succeeds.

## Planned Collections

```text
studios/{studioId}
├── classes
├── enrollments
├── teachers
├── attendance
├── announcements
├── invoices
├── payments
├── competitions
├── costumes
├── privateLessons
├── documents
└── notifications
```

Family waivers are planned at `studios/{studioId}/families/{familyId}/waivers/{waiverId}`. Firestore creates this subcollection when its first document is written.

## Query Guidance

- Filter parent dancer queries by `familyId`.
- Verify dancer ownership.
- Use aggregation queries for counts.
- Add pagination before administrative lists become large.
- Use server timestamps.
- Add indexes only for real queries.

## Security

Firestore Security Rules must enforce user, family, role, and studio access. Client checks improve UX but are not a security boundary. Rules should be covered by Firebase Emulator tests before production.

## Modeling Principles

- Every record belongs to a studio.
- Families are the household and billing unit.
- Dancers reference families.
- Birthdates are stored; ages are calculated.
- Unbounded data belongs in collections, not arrays.
