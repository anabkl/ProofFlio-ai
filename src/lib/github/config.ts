export type GitHubOAuthConfig = {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  tokenEncryptionKey: string;
};

export function getGitHubOAuthConfig(): GitHubOAuthConfig | null {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const callbackUrl = process.env.GITHUB_CALLBACK_URL;
  const tokenEncryptionKey = process.env.GITHUB_TOKEN_ENCRYPTION_KEY;

  if (!clientId || !clientSecret || !callbackUrl || !tokenEncryptionKey) {
    return null;
  }

  return {
    clientId,
    clientSecret,
    callbackUrl,
    tokenEncryptionKey,
  };
}

export function isGitHubConfigured() {
  return Boolean(getGitHubOAuthConfig());
}

export function isOptionalAiProviderConfigured() {
  return Boolean(process.env.PROOFFOLIO_AI_PROVIDER && process.env.PROOFFOLIO_AI_PROVIDER !== "off");
}
