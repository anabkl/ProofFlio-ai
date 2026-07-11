# ProofFolio AI V3.3 Persistent Editor Workspace

## Scope

V3.3 turns `/editor` into a private, user-owned content workspace. It does not add public publishing, GitHub OAuth, automated parsing, LLM generation, payments or analytics.

## Handoff and ownership

The persisted route is:

`/editor?portfolio=<portfolio-id>&onboarding=ready`

The server loader reads the authenticated Supabase user, then queries the requested portfolio with both `id` and `owner_user_id`. An unavailable or foreign portfolio returns the same non-disclosing access state. An unauthenticated request redirects to sign-in with the complete editor URL as its return path.

The browser never receives a service role key. Editor queries and actions use the public anon key plus the server-side user session, with existing RLS policies as the database boundary.

## Data model

Apply migrations in order:

1. `202607060001_v3_evidence_foundation.sql`
2. `202607060002_tighten_child_portfolio_ownership.sql`
3. `202607100001_persistent_editor_settings.sql`

The V3.3 migration adds:

- `portfolios.profile_settings JSONB`
- `portfolios.design_settings JSONB`
- `project_drafts.repository_url TEXT`
- `project_drafts.live_demo_url TEXT`

Existing manual-project links are backfilled from the linked evidence metadata where available. No new public table or Storage policy is introduced.

## Persisted capabilities

- Portfolio title and portfolio-specific headline
- Selected template
- Accent, typography, layout, project presentation, spacing and motion preferences
- Section visibility and order for projects, evidence and certificates
- Approved manual-project title, summary, technologies, repository URL and demo URL
- Explicit saving, saved, unsaved and failed states
- Debounced text saving with an explicit save action
- A per-portfolio local recovery buffer for unsaved text only

## Evidence integrity

Only manual projects linked to an `approved` or `edited` `proposal_reviews` record enter the portfolio preview. Pending or rejected suggestions are excluded.

The editor can display private evidence filenames, source types and review state. It intentionally does not select or serialize `evidence_items.storage_path`, generate signed URLs, or expose unauthenticated Storage URLs.

## Missing setup behavior

- `/editor` without a portfolio ID remains an explicitly labeled visual preview.
- A portfolio URL without Supabase configuration shows a setup-required state.
- Failed saves keep unsaved text in the local recovery buffer and never report success.
- The persistent editor migration must be applied before credential-backed editor tests can pass.

## Deferred

- Public publishing and public portfolio URLs
- Full version history or multi-user collaboration
- GitHub import and OAuth
- Automated CV/certificate parsing
- LLM-generated content
- Payments and analytics
