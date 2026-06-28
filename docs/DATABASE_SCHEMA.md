# Database Schema

All records are scoped through `studioId`. The default studio is configured with `NEXT_PUBLIC_DEFAULT_STUDIO_ID`. Timestamps use Firestore server timestamps.

## User Profile

Path: `studios/{studioId}/users/{uid}`

| Field | Type | Description |
| --- | --- | --- |
| `uid` | string | Firebase Authentication user ID |
| `email` | string | Authentication email |
| `firstName`, `lastName` | string | User name |
| `displayName` | string | Combined display name |
| `role` | string | `parent`, `teacher`, or `admin` |
| `studioId` | string | Owning studio |
| `familyId` | string or null | Connected family |
| `status` | string | Currently `active` |
| `onboardingComplete` | boolean | Parent onboarding state |
| `createdAt`, `updatedAt` | timestamp | Audit timestamps |

Authentication proves identity; this profile describes the user's role and studio relationship.

## Family

Path: `studios/{studioId}/families/{familyId}`

| Field | Type | Description |
| --- | --- | --- |
| `id` | string | Family document ID |
| `studioId` | string | Owning studio |
| `familyName` | string | Generated from the primary parent's surname |
| `parentUserIds` | string[] | Connected parent users |
| `primaryParentUserId` | string | Primary parent |
| `phone` | string | Main family phone |
| `emergencyContacts` | object[] | Name, phone, and relationship |
| `createdAt`, `updatedAt` | timestamp | Audit timestamps |

Families are the household and future billing unit.

## Dancer

Path: `studios/{studioId}/dancers/{dancerId}`

| Field | Type | Description |
| --- | --- | --- |
| `id` | string | Dancer document ID |
| `studioId`, `familyId` | string | Studio and family relationships |
| `firstName`, `lastName` | string | Dancer name |
| `birthdate` | string | `YYYY-MM-DD`; age is calculated |
| `medicalConditions` | string | Optional |
| `currentMedications` | string | Optional |
| `physician` | string | Optional |
| `allergies` | string | Optional |
| `additionalNotes` | string | Optional |
| `photoUrl` | string or null | Future profile photo |
| `teamId` | string or null | Future team assignment |
| `status` | string | Currently `active` |
| `createdAt`, `updatedAt` | timestamp | Audit timestamps |

## Future Domains

Classes, enrollments, teachers, attendance, announcements, waivers, invoices, payments, competitions, costumes, private lessons, documents, and notifications.
