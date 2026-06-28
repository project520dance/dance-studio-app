# UI Style Guide

## Product Personality

Project 520 should feel welcoming, modern, organized, parent-friendly, and energetic without being distracting.

## Branding

- Pink and purple primary accents
- Slate neutral surfaces and text
- Selective `from-pink-500 to-purple-600` gradients
- Never communicate status through color alone

## Layout

- Design mobile-first.
- Use one column by default.
- Add responsive columns at larger breakpoints.
- Keep readable widths and consistent spacing.
- Let tables scroll horizontally on small screens.

## Components

Reusable UI belongs in `components/ui`, `components/layout`, `components/dashboard`, or domain component folders such as `components/dancers`.

## Forms

- Use visible labels.
- Require only necessary fields.
- Do not ask users to type `None`.
- Disable saving controls while submitting.
- Preserve input after recoverable errors.
- Use `role="alert"` for errors.

## Data States

Every data-backed view needs loading, error, and useful empty states.

## Accessibility

- Use semantic HTML and keyboard-accessible controls.
- Preserve visible focus styles.
- Label icon-only controls.
- Use `aria-live` for meaningful async updates.
- Maintain sufficient contrast.

## Voice

Use clear, warm language and avoid exposing Firebase terminology to users.
