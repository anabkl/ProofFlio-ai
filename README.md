# ProofFolio AI

ProofFolio AI is a bilingual premium UI demo for turning CV material, GitHub repositories, certificates, and professional profile data into a hosted portfolio experience.

This repository is intentionally frontend-only for the current sprint. The visible product language follows the core product principle: AI analyzes and proposes, while the user reviews, edits, approves, and publishes intentionally.

## Current Routes

- `/`
- `/demo`
- `/templates`
- `/templates/minimal-executive`
- `/templates/dark-tech`
- `/templates/creative-grid`
- `/templates/story-journey`
- `/templates/recruiter-focus`
- `/editor`

## Current Scope

- Next.js App Router, TypeScript, Tailwind CSS
- English and French UI
- RTL-ready locale metadata for a future Arabic locale
- Local mock data only
- Premium landing page and optional isolated hero WebGL enhancement
- Correct Free / Student / VIP pricing preview
- Five distinct living portfolio template demos
- Local-state editor preview with desktop and mobile views

No production auth, backend, database, payment, GitHub OAuth, CV parser, AI service, analytics persistence, moderation, or admin system is implemented yet.

## Product Alignment

The UI demo reflects Aya's product workflow through visible states and terminology:

- account and onboarding as future product flow
- CV, GitHub, and certificate evidence gathering
- AI proposal panels
- user review and approval before publishing
- template selection and customization
- public portfolio URL and recruiter snapshot framing
- analytics, notifications, subscriptions, moderation, and administration as future phases

## Commands

```bash
npm run dev
npm run lint
npm run build
npm run test:e2e
```

## Known Limitations

Pricing is a product preview only. Payments and billing are not enabled.

All demo profiles, repositories, certificates, analytics, AI insights, readiness scores, public URLs, and recruiter signals are fictional local mock data.
