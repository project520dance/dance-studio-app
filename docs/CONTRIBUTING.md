# Contributing

Follow this workflow for every Project 520 change.

## 1. Create a Feature Branch

```bash
git switch -c feature/descriptive-name
```

Keep each branch focused on one milestone, feature, fix, or documentation task.

## 2. Read the Documentation

Review the relevant files in `/docs` before coding, especially:

- `ARCHITECTURE.md`
- `DATABASE_SCHEMA.md`
- `CODING_STANDARDS.md`
- `DECISIONS.md`

## 3. Request a Unified Diff

Ask Codex to prepare one complete unified diff before applying changes.

The request should clearly state:

- Goal
- Requirements
- Excluded work
- Expected routes, types, or services

## 4. Review Before Applying

Review the complete diff for:

- Correct scope
- Security and privacy
- Firestore read/write efficiency
- Type safety
- Mobile usability
- Consistency with documented decisions

## 5. Apply and Validate

After approval, apply the change and run:

```bash
npm run lint
npm run build
```

Run relevant automated tests once test coverage is available.

## 6. Review the Applied Diff

```bash
git status
git diff
```

Confirm that `.env.local`, credentials, generated output, and unrelated files are not staged.

## 7. Commit

```bash
git add .
git commit -m "Describe the completed change"
```

Use a concise message that describes the outcome.

## 8. Push

```bash
git push -u origin feature/descriptive-name
```

Open a pull request when working through a review workflow.

## Engineering Expectations

- Keep Firebase access inside services.
- Update documentation when architecture or schema changes.
- Add important decisions to `DECISIONS.md`.
- Do not bypass lint or build failures.
- Never commit secrets.
