# ProofFolio AI Implementation Plan

## Current UI Demo

- Keep the premium bilingual demo focused on product clarity.
- Maintain the EN/FR dictionary structure and future RTL metadata.
- Continue improving visual quality while keeping WebGL optional and isolated.
- Preserve the rule that AI proposes and users approve before publishing.

## First Functional MVP

- Add authentication, onboarding, and email verification.
- Create portfolio, project, certificate, skill, and version models.
- Implement draft, preview, publish, and public URL flows.
- Add user-approved AI proposal states before any generated text becomes public.
- Add persistence for editor state and template customization.

## Production SaaS Phase

- Add GitHub OAuth and repository sync.
- Add CV import, parsing, and user confirmation.
- Add analytics, notifications, and recruiter contact persistence.
- Add Free / Student / VIP subscriptions, invoices, payments, and provider webhooks.
- Add custom domain support for VIP when product-ready.

## Later Enterprise / Administration Phase

- Add moderation queues for contact and public content.
- Add administrator tools, audit logs, refunds, support workflows, and operational dashboards.
- Add organization or school-level controls only after the core individual product works.

## Quality Checklist

- Lint, build, and smoke tests pass.
- English and French remain complete.
- Pricing stays Free / Student / VIP.
- Template pages remain visually distinct.
- No backend or payment claims are introduced before real implementation.
