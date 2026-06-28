# Application Architecture

## Structure

```text
src
├── app
│   ├── (public)
│   ├── (parent)
│   ├── (teacher)
│   └── (admin)
├── components
├── lib
├── services
├── types
└── utils
```

Route groups organize code without changing URLs.

## Layers

```text
Pages and components
  → Portal orchestration services
  → Domain services
  → Firebase Authentication and Firestore
```

Pages render UI and manage local state. Portal services coordinate workflows. Domain services own data access. Shared domain types live in `src/types`.

Current orchestration services include `dashboardService`, `parentDancerService`, `adminService`, and `onboardingService`. Domain services include `authService`, `userService`, `familyService`, and `dancerService`.

## Authentication Flow

```text
Login or registration
  → Firebase Authentication
  → /loading-account
  → Firestore user profile
  → onboarding or role portal
```

## Planned Service Organization

Before Version 1.0, services should move into domain folders:

```text
services
├── auth
├── admin
├── parent
├── dancers
├── families
├── scheduling
├── billing
└── competitions
```

Do not create empty modules before their domains exist.

## Rules

- Keep Firebase access inside services.
- Use TypeScript domain types.
- Keep portal-specific orchestration separated.
- Keep reusable UI in components.
- Use batches for related writes.
- Use aggregation queries for counts.
- Treat Security Rules as the authorization boundary.
- Keep credentials in environment variables.
- Keep Stripe server-side when introduced.
