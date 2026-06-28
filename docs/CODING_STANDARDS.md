# Coding Standards

## TypeScript

- Keep strict TypeScript enabled.
- Define domain objects in `src/types`.
- Avoid `any`.
- Type service inputs and returns.
- Use narrow unions for roles and statuses.

## React and Next.js

- Use App Router and route groups.
- Add `"use client"` only when needed.
- Keep pages focused on rendering and interaction.
- Move workflow orchestration into services.
- Prefer reusable components.

## Firebase

- Firebase access belongs in services.
- Pages and components do not import Firestore.
- Configuration comes from environment variables.
- Never commit `.env.local`.
- Use server timestamps, batches, aggregation queries, and ownership checks.
- Enforce authorization in Security Rules.

## Services

Services should return typed values, normalize writes, throw clear domain errors, hide Firestore paths, and avoid unnecessary reads.

## Naming

- Components and types: `PascalCase`
- Functions and variables: `camelCase`
- Fixed constants: `UPPER_SNAKE_CASE`
- Service files: `camelCaseService.ts`
- Routes: lowercase kebab-case

## Validation

Before committing:

```bash
npm run lint
npm run build
```

## Git

- Keep commits focused.
- Use descriptive messages.
- Never commit secrets.
- Review the complete diff.
- Avoid unrelated refactors in feature commits.

## Beginner-Friendly Code

Prefer clarity over cleverness, descriptive names, focused functions, and concise comments that explain why.
