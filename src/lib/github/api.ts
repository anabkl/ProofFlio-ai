import { getGitHubOAuthConfig } from "@/lib/github/config";

export type GitHubUserProfile = {
  id: number;
  login: string;
  name: string | null;
  avatarUrl: string;
  htmlUrl: string;
};

export type GitHubRepositoryRecord = {
  id: number;
  name: string;
  fullName: string;
  description: string;
  htmlUrl: string;
  primaryLanguage: string;
  topics: string[];
  defaultBranch: string;
  stars: number;
  updatedAt: string;
  ownerLogin: string;
  readmePresent: boolean;
};

const apiHeaders = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

export function buildGitHubAuthorizeUrl(state: string) {
  const config = getGitHubOAuthConfig();

  if (!config) {
    return null;
  }

  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.callbackUrl);
  url.searchParams.set("state", state);
  url.searchParams.set("scope", "");
  return url.toString();
}

export async function exchangeGitHubCodeForToken(code: string) {
  const config = getGitHubOAuthConfig();

  if (!config) {
    throw new Error("GitHub OAuth is not configured.");
  }

  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: config.callbackUrl,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("GitHub authorization exchange failed.");
  }

  const payload = (await response.json()) as {
    access_token?: string;
    scope?: string;
    error?: string;
    error_description?: string;
  };

  if (!payload.access_token) {
    throw new Error(payload.error_description || payload.error || "GitHub did not return an access token.");
  }

  return {
    accessToken: payload.access_token,
    scope: payload.scope ?? "",
  };
}

export async function fetchGitHubUserProfile(accessToken: string): Promise<GitHubUserProfile> {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      ...apiHeaders,
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to read the connected GitHub profile.");
  }

  const payload = (await response.json()) as {
    id: number;
    login: string;
    name: string | null;
    avatar_url: string;
    html_url: string;
  };

  return {
    id: payload.id,
    login: payload.login,
    name: payload.name,
    avatarUrl: payload.avatar_url,
    htmlUrl: payload.html_url,
  };
}

export async function fetchPublicRepositories(accessToken: string) {
  const response = await fetch(
    "https://api.github.com/user/repos?visibility=public&affiliation=owner,collaborator,organization_member&sort=updated&per_page=100",
    {
      headers: {
        ...apiHeaders,
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Unable to load public GitHub repositories.");
  }

  const payload = (await response.json()) as Array<{
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    html_url: string;
    language: string | null;
    topics?: string[];
    default_branch: string;
    stargazers_count: number;
    updated_at: string;
    private: boolean;
    owner: { login: string };
  }>;

  return payload
    .filter((repository) => !repository.private)
    .map((repository) => ({
      id: repository.id,
      name: repository.name,
      fullName: repository.full_name,
      description: repository.description ?? "",
      htmlUrl: repository.html_url,
      primaryLanguage: repository.language ?? "",
      topics: Array.isArray(repository.topics) ? repository.topics.slice(0, 8) : [],
      defaultBranch: repository.default_branch,
      stars: repository.stargazers_count ?? 0,
      updatedAt: repository.updated_at,
      ownerLogin: repository.owner.login,
      readmePresent: false,
    })) satisfies GitHubRepositoryRecord[];
}

export async function hydrateRepositoryReadmePresence(
  accessToken: string,
  repositories: GitHubRepositoryRecord[],
) {
  return Promise.all(
    repositories.map(async (repository) => ({
      ...repository,
      readmePresent: await fetchReadmePresence(accessToken, repository.fullName),
    })),
  );
}

async function fetchReadmePresence(accessToken: string, fullName: string) {
  const response = await fetch(`https://api.github.com/repos/${fullName}/readme`, {
    headers: {
      ...apiHeaders,
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (response.status === 404) {
    return false;
  }

  return response.ok;
}
