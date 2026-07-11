# ProofFolio Security Checklist

- Keep `NEXT_PUBLIC_SUPABASE_ANON_KEY` public and never expose a Supabase service role key to browser code.
- Keep the `evidence` Storage bucket private and user-scoped.
- Apply migrations `202607060001`, `202607060002`, `202607100001`, and `202607110001` in order.
- Confirm row-level security remains enabled on `profiles`, `portfolios`, `evidence_items`, `project_drafts`, `proposal_reviews`, and `github_connections`.
- Reject non-PDF evidence uploads server-side by MIME type, extension, and file size.
- Derive the acting user only from the Supabase server session. Never trust client-provided owner IDs.
- Publish only approved content. Draft, rejected, and private evidence details must stay unavailable on `/p/[slug]`.
- Keep GitHub OAuth tokens server-side only and store them encrypted with `GITHUB_TOKEN_ENCRYPTION_KEY`.
- Request only public GitHub repository access. Do not request private repository scopes.
- Review screenshot and log output before sharing; neither should contain storage paths, OAuth tokens, or private evidence URLs.
