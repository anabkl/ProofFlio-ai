# V3 Social Authentication Setup

ProofFolio supports Google, GitHub and LinkedIn as **sign-in** providers through
Supabase Auth. This document covers provider configuration only. No secrets
are included here — configure them in the Supabase dashboard and in your own
environment, never in source control.

## Important product note

LinkedIn (and the other providers) are **authentication only** in this
sprint. Signing in with LinkedIn does not import a LinkedIn profile, posts,
or connections. GitHub sign-in is likewise identity-only: it does not read or
import any repository data on its own. It is unrelated to the separate GitHub
*evidence import* feature (`/auth/github`), which reads public repositories
only after a user explicitly connects it from the onboarding flow. Do not
conflate the two GitHub integrations — they use different OAuth apps,
different scopes and different callback routes.

## How the flow works

1. A user clicks a provider button on `/auth/sign-in` or `/auth/sign-up`.
2. The browser calls `supabase.auth.signInWithOAuth({ provider, options: { redirectTo } })`,
   which redirects to the provider's consent screen.
3. The provider redirects back to **Supabase's** fixed callback URL
   (`https://<project-ref>.supabase.co/auth/v1/callback`) — this is
   configured on the provider's side, not in this app.
4. Supabase then redirects the browser to this app's callback route,
   `src/app/auth/callback/route.ts`, with a `code` query parameter.
5. That route exchanges the code for a session server-side
   (`exchangeCodeForSession`) and redirects to the validated `next` path
   (default `/dashboard`).

## 1. Enable a provider in Supabase

In the Supabase dashboard: **Authentication → Providers**, enable the
provider and paste in its Client ID / Client Secret (see per-provider steps
below). Supabase's own callback URL is shown on that page — copy it, you'll
need it when registering the OAuth app with the provider.

## 2. Allow this app's callback URL

In **Authentication → URL Configuration**, add this app's callback route to
the **Redirect URLs** allowlist for every environment you run:

```text
http://127.0.0.1:3210/auth/callback
https://<your-production-domain>/auth/callback
```

Supabase rejects any `redirectTo` that isn't on this list, so local dev and
production both need an entry.

## 3. Per-provider OAuth app setup

### Google

1. Google Cloud Console → APIs & Services → Credentials → Create OAuth
   client ID (type: Web application).
2. Authorized redirect URI: the Supabase callback URL from step 1
   (`https://<project-ref>.supabase.co/auth/v1/callback`).
3. Copy the Client ID / Client Secret into Supabase's Google provider config.
4. Set `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true` in this app's environment.

### GitHub

1. GitHub → Settings → Developer settings → OAuth Apps → New OAuth App.
2. Authorization callback URL: the Supabase callback URL from step 1.
3. Copy the Client ID / Client Secret into Supabase's GitHub provider config.
4. Set `NEXT_PUBLIC_AUTH_GITHUB_ENABLED=true`.

Request only the default identity scopes (`read:user user:email`). This
integration must not request repository read access. It is a separate OAuth
App registration from the one used by `GITHUB_CLIENT_ID` /
`GITHUB_CLIENT_SECRET` in `.env.example`, which powers the unrelated
evidence-import connection and requests different scopes (read access to
public repositories, not sign-in identity).

### LinkedIn (OIDC)

1. LinkedIn Developer Portal → Create app → add the "Sign In with LinkedIn
   using OpenID Connect" product.
2. Authorized redirect URL: the Supabase callback URL from step 1.
3. In Supabase, enable the **LinkedIn (OIDC)** provider (`linkedin_oidc`) and
   paste the Client ID / Client Secret.
4. Set `NEXT_PUBLIC_AUTH_LINKEDIN_ENABLED=true`.

Only request the default `openid profile email` scopes. Do not request
posting, connections, or profile-data scopes — this integration is sign-in
only, and the product must not claim to import a LinkedIn profile or claim
otherwise (see Account settings, which explicitly separates "authentication
providers" from "product data integrations").

## 4. Feature flags

Each provider button only renders when its flag is explicitly `"true"`:

```text
NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true
NEXT_PUBLIC_AUTH_GITHUB_ENABLED=true
NEXT_PUBLIC_AUTH_LINKEDIN_ENABLED=true
```

Leaving a flag unset (the `.env.example` default) hides that button entirely
instead of rendering a non-functional one. See `src/lib/auth/oauth.ts`.
