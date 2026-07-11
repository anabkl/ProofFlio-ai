# V3.4-V3.5 Publishing and GitHub Evidence

## What shipped

- Explicit editor publishing with owner preview, publish, and unpublish.
- Public route at `/p/[slug]` for published portfolios only.
- Recruiter-focused public proof view using approved persisted content.
- Dynamic metadata, sitemap, robots, and Open Graph image generation for published portfolios.
- GitHub OAuth connection for public profile and public repositories only.
- Manual repository selection before import.
- Deterministic repository-based draft suggestions with an optional provider adapter left disabled by default.

## Public data boundary

The public route never exposes:

- user email
- owner user ID
- private storage paths
- rejected proposal content
- uploaded PDF contents
- unauthenticated storage URLs
- OAuth tokens

Published content is read through a dedicated SQL function that returns only safe fields for the public experience.

## GitHub flow

1. The signed-in user starts GitHub OAuth from `/onboarding`.
2. GitHub redirects to `/auth/github/callback`.
3. ProofFolio exchanges the code server-side and stores the token encrypted.
4. Only public repositories are cached.
5. The user explicitly selects repositories to import.
6. Import creates:
   - `evidence_items` rows with `source_type = github_repository`
   - linked `project_drafts`
   - pending `proposal_reviews`
7. Only approved or edited repository suggestions become portfolio-ready content.

## Environment variables

- `NEXT_PUBLIC_SITE_URL`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_CALLBACK_URL`
- `GITHUB_TOKEN_ENCRYPTION_KEY`
- `PROOFFOLIO_AI_PROVIDER` optional, defaults to deterministic-only behavior

## Current limits

- No private repository import
- No automated CV parsing
- No live AI provider behavior unless explicitly configured later
- No public contact delivery pipeline
- No public CV file exposure
