# ProofFolio AI

ProofFolio AI is a bilingual premium product demo for turning CV material, GitHub repositories, certificates, and professional profile data into an evidence-first portfolio experience.

V3 adds the first real Supabase-backed foundation: auth, private evidence upload, manual project persistence, persisted proposal reviews, template selection, and editor handoff. The visible product language remains honest: prototype suggestions are not presented as real AI analysis.

V3 also adds a real authenticated product shell: a dashboard, account settings, an app sidebar/topbar with signed-in user state, and optional Google, GitHub, and LinkedIn sign-in alongside email/password. GitHub sign-in is identity-only and does not import repository data.

## Current Routes

- `/`
- `/demo`
- `/templates`
- `/templates/minimal-executive`
- `/templates/dark-tech`
- `/templates/creative-grid`
- `/templates/story-journey`
- `/templates/recruiter-focus`
- `/templates/developer-signature`
- `/templates/career-chronicle`
- `/auth/sign-in`
- `/auth/sign-up`
- `/auth/callback`
- `/dashboard`
- `/account`
- `/onboarding`
- `/editor`

## Current Scope

- Next.js App Router, TypeScript, Tailwind CSS
- English and French UI
- RTL-ready locale metadata for a future Arabic locale
- Supabase Auth, PostgreSQL, Storage, RLS migrations, and server actions for V3 onboarding
- Authenticated app shell (dashboard, account settings, sidebar/topbar, mobile navigation)
- Optional Google, GitHub, and LinkedIn sign-in (identity only, feature-flagged; see `docs/V3_SOCIAL_AUTH_SETUP.md`)
- Local mock/demo data remains for public visual routes
- Premium landing page and optional isolated hero WebGL enhancement
- Correct Free / Student / VIP pricing preview
- Seven distinct living portfolio template demos
- Local-state editor preview with desktop and mobile views

No payments, CV parser, AI provider integration, analytics persistence, moderation, admin system, GitHub repository import, or public publishing is implemented yet.

## Product Alignment

The UI demo reflects Aya's product workflow through visible states and terminology:

- account, dashboard, and onboarding as a real authenticated product flow
- CV, GitHub, and certificate evidence gathering
- AI proposal panels
- user review and approval before publishing
- template selection and customization
- public portfolio URL and recruiter snapshot framing
- analytics, notifications, subscriptions, moderation, and administration as future phases
- evidence-first onboarding at `/onboarding`

## Commands

```bash
npm run dev
npm run lint
npm run build
npm run test:e2e
```

## Known Limitations

Pricing is a product preview only. Payments and billing are not enabled.

The V3 backend foundation is real for authentication, portfolio drafts, private CV/certificate storage, manual projects, prototype review decisions, and saved template selection once Supabase environment variables and migrations are applied. Account settings, the dashboard, and the authenticated app shell are real once Supabase is configured; each optional OAuth provider only appears once explicitly enabled (see `docs/V3_SOCIAL_AUTH_SETUP.md`).

Still deferred:

- GitHub repository import.
- Automated CV parsing.
- External AI provider integration.
- Public publishing.
- Payments.

All public demo profiles, repositories, analytics, AI insights, readiness scores, public URLs, and recruiter signals remain fictional local mock data.
