# ProofFolio AI

ProofFolio AI is a bilingual premium product demo for turning CV material, GitHub repositories, certificates, and professional profile data into an evidence-first portfolio experience.

V3 adds the first real Supabase-backed foundation: auth, private evidence upload, manual project persistence, persisted proposal reviews, template selection, and editor handoff. The visible product language remains honest: prototype suggestions are not presented as real AI analysis.

<<<<<<< HEAD
V3 also adds a real authenticated product shell: a dashboard, account settings, an app sidebar/topbar with signed-in user state, and optional Google, GitHub, and LinkedIn sign-in alongside email/password. GitHub sign-in is identity-only and does not import repository data.
=======
V3.5 extends that foundation with explicit publishing, public portfolios at `/p/[slug]`, recruiter-ready public proof views, and a first GitHub evidence flow for user-selected public repositories only.
>>>>>>> origin/main

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
- `/p/[slug]`

## Current Scope

- Next.js App Router, TypeScript, Tailwind CSS
- English and French UI
- RTL-ready locale metadata for a future Arabic locale
- Supabase Auth, PostgreSQL, Storage, RLS migrations, and server actions for V3 onboarding
<<<<<<< HEAD
- Authenticated app shell (dashboard, account settings, sidebar/topbar, mobile navigation)
- Optional Google, GitHub, and LinkedIn sign-in (identity only, feature-flagged; see `docs/V3_SOCIAL_AUTH_SETUP.md`)
=======
- Public portfolio publishing with owner preview and published-only public access
- GitHub OAuth for public-profile and public-repository evidence import
>>>>>>> origin/main
- Local mock/demo data remains for public visual routes
- Premium landing page and optional isolated hero WebGL enhancement
- Correct Free / Student / VIP pricing preview
- Seven distinct living portfolio template demos
- Local-state editor preview with desktop and mobile views

<<<<<<< HEAD
No payments, CV parser, AI provider integration, analytics persistence, moderation, admin system, GitHub repository import, or public publishing is implemented yet.
=======
No payments, subscriptions, private repository import, CV parser, analytics dashboards, moderation, marketplace features, or admin tooling are implemented.
>>>>>>> origin/main

## Product Alignment

The UI demo reflects Aya's product workflow through visible states and terminology:

- account, dashboard, and onboarding as a real authenticated product flow
- CV, GitHub, and certificate evidence gathering
- AI proposal panels
- user review and approval before publishing
- explicit publish and unpublish controls
- template selection and customization
- public portfolio URL and recruiter snapshot framing
- deterministic GitHub repository suggestions with optional provider adapter disabled by default
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

Publishing is real for user-approved content only. Evidence files remain private, and public routes render only approved safe fields.

GitHub import is real for explicit user-selected public repositories only. Private repositories are never requested.

Still deferred:

<<<<<<< HEAD
- GitHub repository import.
=======
>>>>>>> origin/main
- Automated CV parsing.
- AI provider execution beyond the optional disabled-by-default adapter boundary.
- Payments and subscriptions.
- Public contact delivery and CV file exposure.

Public recruiter signals, project lists, and evidence context now come from persisted user-approved content when a portfolio is published. The landing page and template demos still contain fictional local mock profiles.
