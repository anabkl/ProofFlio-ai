# ProofFolio AI V3 Backend Architecture

## What V3 Implements

V3 adds the first real backend-backed product slice for ProofFolio AI:

- Supabase email/password authentication.
- A user-owned portfolio draft created during onboarding.
- Private PDF uploads for CV and certificates.
- Manual project evidence saved to the database.
- Deterministic prototype draft suggestions from stored evidence.
- Persisted approve, edit and reject review decisions.
- Template selection saved on the portfolio draft.
- Editor handoff through `/editor?portfolio=<portfolio-id>&onboarding=ready`.
- Explicit publish and unpublish actions from the editor.
- Public published portfolios at `/p/[slug]`.
- GitHub OAuth for explicit public-repository evidence import only.

## Data Model

- `profiles`: one profile per Supabase authenticated user.
- `portfolios`: user-owned portfolio drafts with title, slug, selected template, status and onboarding state.
- `evidence_items`: CV uploads, certificate uploads, manual projects and imported GitHub repository evidence tied to a portfolio.
- `project_drafts`: manual or GitHub-backed project drafts with stack data and evidence references.
- `proposal_reviews`: persisted review decisions for prototype suggestions.
- `github_connections`: encrypted GitHub OAuth tokens, connection metadata, and cached public repository lists per owner.

## Ownership Model

Every user-owned row stores either `id = auth.uid()` for profiles or `owner_user_id = auth.uid()` for portfolio-related records. Portfolio evidence, project drafts and proposal reviews are all scoped to the owning user and portfolio draft.

## RLS Approach

Row Level Security is enabled on every user-owned table. Authenticated users may select, insert, update and delete only records where the row owner matches `auth.uid()`.

Published portfolio rendering does not rely on a broad anonymous table policy. Instead, a dedicated SQL function returns only safe published fields for `/p/[slug]`, while private evidence paths, user IDs, rejected reviews and private notes remain unavailable.

## Storage Approach

The migration creates a private Supabase Storage bucket named `evidence`. File paths are user-scoped:

```text
<user-id>/<portfolio-id>/<source-type>/<timestamp>-<file-name>
```

Storage object policies allow authenticated users to access only files where the first path segment matches their Supabase user ID.

## Supabase Client Structure

- `src/lib/supabase/client.ts`: browser-safe client for client components.
- `src/lib/supabase/server.ts`: server-safe client for server components and server actions.
- `src/lib/supabase/middleware.ts`: session refresh helper used by the Next.js `src/proxy.ts` request hook.

The app builds without local Supabase variables. When credentials are missing, protected persistence is blocked and the onboarding page renders a clearly labeled non-persistent preview.

## Real vs Deferred

Real in V3:

- Auth.
- Database-backed portfolio draft creation.
- Private storage upload path for CV and certificate PDFs.
- Manual project persistence.
- Proposal review persistence.
- Saved template choice.
- Publish and unpublish workflow.
- Public recruiter-ready route for published portfolios only.
- GitHub connection, public repository selection, import, re-sync and disconnect.

Deferred:

- Automated CV parsing.
- External AI provider execution beyond the disabled-by-default adapter boundary.
- Payments and billing.
- Analytics and admin tooling.
