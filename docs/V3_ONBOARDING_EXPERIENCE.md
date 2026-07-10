# ProofFolio AI V3.2 Evidence Onboarding

## Scope

V3.2 upgrades `/onboarding` into a premium evidence-building workspace without adding GitHub OAuth, automated CV parsing, LLM APIs, payments, publishing, or analytics.

## Experience Model

The onboarding flow is organized around a saved evidence draft:

1. Evidence sources
2. Secure upload or manual project entry
3. Deterministic prototype draft suggestions
4. User review
5. Template recommendation
6. Evidence-ready editor handoff

## Persistent Draft Recovery

Authenticated users resume the latest draft instead of silently overwriting it. The recovery panel shows:

- sources added
- uploads completed
- projects added
- suggestions approved
- template selected

Users can resume the current draft or start a new draft. Starting a new draft inserts a separate portfolio record with a unique draft slug.

## Evidence Source Workspace

The workspace displays exactly four sources:

- CV
- Certificates
- Manual project
- GitHub - Coming soon

CV and certificate uploads remain PDF-only and private. Manual project evidence is entered by the user. GitHub is disabled and does not imply OAuth or repository import.

Saved evidence can be removed with confirmation. Removal deletes linked proposal reviews and deletes linked manual project drafts when applicable.

## Proposal Review

Prototype draft suggestions are deterministic and source-backed. They are not labeled as AI analysis.

Each suggestion shows:

- source badge
- source title
- proposed summary
- proof context
- persisted review state
- approve, edit, and reject actions

Rejected suggestions move into an audit section and are excluded from the approved evidence count.

## Accessibility

- Step controls use `aria-current="step"`.
- Keyboard users can move between steps.
- Focus returns to the active workspace panel after step navigation.
- Server and client errors are exposed as visible alerts.
- The layout is tested at 390 x 844 for horizontal overflow.

## Deferred Features

The following remain intentionally deferred:

- GitHub OAuth and repository import
- automated CV parsing
- LLM-generated analysis
- public publishing
- payments
- analytics
