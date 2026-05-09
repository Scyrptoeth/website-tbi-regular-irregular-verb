# Website TBI Regular and Irregular Verb

Fresh-start MVP for Bimbel Persiapantubel students to learn English regular and irregular verb forms for TBI preparation.

## Current Scope

- Dashboard with actionable progress chart.
- Global search across active verb content.
- Materi table for Verb-1, Verb-2, Verb-3, meaning, pattern, and common mistakes.
- Flipcard active recall with local progress.
- Test packages with A-D answers, final submit lock, score, and Indonesian explanations.
- SuperAdmin summary that clearly labels the production boundary.

This implementation is a static/live MVP. Browser localStorage is used only for demo progress. Production student operations should use server-side auth, database-backed progress, attempt snapshots, role checks, and audit logs.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- lucide-react
- Vitest

## Commands

```bash
npm run typecheck
npm run test
npm run lint
npm run build
npm run dev
```

## Content Baseline

The current learning bank contains 400 original curated verbs:

- 200 regular verbs
- 200 irregular verbs
- 40 mixed test packages
- 400 original quiz questions with full verb-bank coverage tracking

No official TOEFL, TOEIC, or IELTS questions are copied.
