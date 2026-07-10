# ProofFolio AI V3.1 Live Supabase Verification

Date: 2026-07-07  
Branch: `feat/v3-backend-verification`

## Current Run Status

This workspace run could not complete live Supabase verification because the required variables were not visible to the `prooffolio-ai` process:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `E2E_TEST_EMAIL`
- `E2E_TEST_PASSWORD`

No secret values were printed. The project folder did not contain `.env`, `.env.local`, or `.env.development.local`, and the shell environment did not expose the required variables.

## Checks Passed In This Run

- Confirmed the current project branch is `feat/v3-backend-verification`.
- Confirmed no LabOps files were modified by this sprint.
- Confirmed `.env.example` documents only the public Supabase URL, public anon key, and optional E2E credential names.
- Confirmed no `service_role` key or service-role-like public variable is referenced in `src`, `tests`, `supabase`, or `.env.example`.
- Confirmed Supabase browser and server clients return `null` when public Supabase configuration is missing.
- Confirmed unauthenticated configured Supabase access to `/onboarding` redirects to sign-in, and missing-env mode stays a non-persistent preview.
- Confirmed server actions derive the user from `supabase.auth.getUser()` server-side and do not trust client-provided owner IDs.
- Confirmed portfolio ownership is checked before onboarding server actions mutate evidence, projects, proposals, templates, or editor handoff state.
- Confirmed onboarding no longer returns private `storage_path` values in client-facing evidence state.
- Confirmed upload handling now validates PDF extension, MIME type, and 10 MB file size server-side before Storage upload.
- Confirmed invalid upload messages are localized for English and French.

## Live Checks Blocked By Missing Setup

The following checks require the real Supabase environment variables and E2E credentials to be available to the app and Playwright process:

- Email/password sign-up.
- Email/password sign-in.
- Redirect-back behavior after authentication.
- User-owned portfolio draft creation against the live database.
- Private CV Storage upload plus `evidence_items` record creation.
- Private certificate Storage upload plus `evidence_items` record creation.
- Manual project `project_drafts` persistence plus linked evidence metadata.
- Approve, edit, and reject proposal review persistence after refresh.
- Saved template selection persistence when `/onboarding` has no `template` query parameter.
- Editor handoff to `/editor?portfolio=<portfolio-id>&onboarding=ready`.
- User A to user B RLS isolation for reads, updates, deletes, and Storage paths.
- Storage bucket privacy and user-scoped object access in the live project.

## Applied Migrations Expected

Both migrations are expected to be applied to the live Supabase project:

- `supabase/migrations/202607060001_v3_evidence_foundation.sql`
- `supabase/migrations/202607060002_tighten_child_portfolio_ownership.sql`

The second migration remains the ownership-tightening migration and was not replaced.

## RLS Behavior Verified By Migration Inspection

- `profiles`, `portfolios`, `evidence_items`, `project_drafts`, and `proposal_reviews` all enable row-level security.
- Portfolio policies restrict select, insert, update, and delete to `owner_user_id = auth.uid()`.
- Evidence, project draft, and proposal review policies restrict owner access and require the referenced portfolio to belong to `auth.uid()`.
- Storage bucket `evidence` is private with a 10 MB limit and `application/pdf` allowed MIME type.
- Storage object policies scope select, insert, update, and delete to paths whose first folder equals `auth.uid()`.

## Known Risks

- Live sign-up can be blocked by Supabase email confirmation settings if the E2E account is not pre-confirmed.
- Playwright credential-dependent tests only execute when all required environment variables are visible to the Playwright process.
- The app still stores private Storage paths in the database for server-side evidence tracking; those paths are no longer returned in onboarding client state.
- The current implementation does not parse CVs, connect GitHub, publish portfolios, run LLM analysis, or use payments; those remain intentionally out of scope.

## Exact Manual Verification Steps

1. Expose the required variables to the `prooffolio-ai` app and test process without printing their values.
2. Start the app locally.
3. Open `/auth/sign-up?next=/onboarding` and create an email/password account.
4. Sign out, then open `/auth/sign-in?next=/onboarding?step=upload` and confirm redirect-back to onboarding.
5. On `/onboarding`, confirm a draft portfolio is created for the authenticated user.
6. Upload a valid PDF CV and confirm a private `evidence/<user-id>/<portfolio-id>/cv/...` object plus one `evidence_items` row.
7. Upload a valid PDF certificate and confirm a private `evidence/<user-id>/<portfolio-id>/certificate/...` object plus one `evidence_items` row.
8. Attempt a non-PDF upload in English and French and confirm it is rejected before Storage upload.
9. Add a manual project and confirm both `evidence_items` and `project_drafts` records reference the same owned portfolio.
10. Approve one proposal, edit one proposal, reject one proposal, refresh `/onboarding?step=review`, and confirm all states persist.
11. Select `dark-tech`, then reload `/onboarding?step=template` with no `template` query parameter and confirm the saved template is preserved.
12. Continue to the editor and confirm the URL is `/editor?portfolio=<portfolio-id>&onboarding=ready`.
13. Sign in as a second test user and confirm user B cannot select, update, or delete user A portfolio/evidence rows.
14. As user B, attempt to upload or read an object under user A's Storage path and confirm access is denied.
15. Run `npm run lint`, `npm run build`, and `npm run test:e2e`.
