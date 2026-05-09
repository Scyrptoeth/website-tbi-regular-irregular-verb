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

The first sample bank contains 40 original curated verbs:

- 20 regular verbs
- 20 irregular verbs
- 2 mixed test packages
- 10 original quiz questions

No official TOEFL, TOEIC, or IELTS questions are copied.
