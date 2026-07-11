export const oauthProviders = ["google", "github", "linkedin_oidc"] as const;
export type OAuthProvider = (typeof oauthProviders)[number];

function isEnabled(value: string | undefined) {
  return value === "true" || value === "1";
}

/**
 * NEXT_PUBLIC_* vars must be referenced as static literals so Next.js can inline
 * them at build time for the browser bundle; dynamic `process.env[key]` lookups
 * would always resolve to undefined on the client.
 */
export function getEnabledOAuthProviders(): OAuthProvider[] {
  const enabled: OAuthProvider[] = [];

  if (isEnabled(process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED)) {
    enabled.push("google");
  }

  if (isEnabled(process.env.NEXT_PUBLIC_AUTH_GITHUB_ENABLED)) {
    enabled.push("github");
  }

  if (isEnabled(process.env.NEXT_PUBLIC_AUTH_LINKEDIN_ENABLED)) {
    enabled.push("linkedin_oidc");
  }

  return enabled;
}
