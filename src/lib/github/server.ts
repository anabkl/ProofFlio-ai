import { buildGitHubProposal } from "@/lib/github/proposals";
import { decryptGitHubToken, encryptGitHubToken } from "@/lib/github/crypto";
import {
  fetchGitHubUserProfile,
  fetchPublicRepositories,
  hydrateRepositoryReadmePresence,
  type GitHubRepositoryRecord,
} from "@/lib/github/api";
import { getGitHubOAuthConfig } from "@/lib/github/config";
import type { SupabaseServerClient } from "@/lib/supabase/server";

type GitHubConnectionRow = {
  id: string;
  github_login: string;
  github_name: string | null;
  avatar_url: string | null;
  encrypted_access_token: string;
  token_scope: string | null;
  repository_cache: unknown;
  connected_at: string;
  last_synced_at: string | null;
};

export type GitHubConnectionState = {
  configured: boolean;
  connected: boolean;
  login: string;
  name: string;
  avatarUrl: string;
  repositories: GitHubRepositoryRecord[];
  connectedAt: string | null;
  lastSyncedAt: string | null;
  canSync: boolean;
};

const SYNC_COOLDOWN_MS = 90_000;

export async function saveGitHubConnection(
  supabase: SupabaseServerClient,
  userId: string,
  accessToken: string,
  scope: string,
) {
  const config = getGitHubOAuthConfig();

  if (!config) {
    throw new Error("GitHub OAuth is not configured.");
  }

  const profile = await fetchGitHubUserProfile(accessToken);
  const repositories = await fetchPublicRepositories(accessToken);

  const { error } = await supabase.from("github_connections").upsert({
    owner_user_id: userId,
    github_user_id: profile.id,
    github_login: profile.login,
    github_name: profile.name,
    avatar_url: profile.avatarUrl,
    encrypted_access_token: encryptGitHubToken(accessToken, config.tokenEncryptionKey),
    token_scope: scope,
    repository_cache: repositories,
    connected_at: new Date().toISOString(),
    last_synced_at: new Date().toISOString(),
  });

  if (error) {
    throw error;
  }

  return {
    profile,
    repositories,
  };
}

export async function getGitHubConnectionState(
  supabase: SupabaseServerClient,
  userId: string,
): Promise<GitHubConnectionState> {
  const { data, error } = await supabase
    .from("github_connections")
    .select("id,github_login,github_name,avatar_url,encrypted_access_token,token_scope,repository_cache,connected_at,last_synced_at")
    .eq("owner_user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return {
      configured: Boolean(getGitHubOAuthConfig()),
      connected: false,
      login: "",
      name: "",
      avatarUrl: "",
      repositories: [],
      connectedAt: null,
      lastSyncedAt: null,
      canSync: false,
    };
  }

  const repositories = normalizeRepositoryCache(data.repository_cache);
  const lastSyncedAt = typeof data.last_synced_at === "string" ? data.last_synced_at : null;

  return {
    configured: Boolean(getGitHubOAuthConfig()),
    connected: true,
    login: String(data.github_login ?? ""),
    name: String(data.github_name ?? ""),
    avatarUrl: String(data.avatar_url ?? ""),
    repositories,
    connectedAt: String(data.connected_at ?? ""),
    lastSyncedAt,
    canSync: !lastSyncedAt || Date.now() - new Date(lastSyncedAt).getTime() >= SYNC_COOLDOWN_MS,
  };
}

export async function syncGitHubRepositories(
  supabase: SupabaseServerClient,
  userId: string,
) {
  const connection = await getRequiredConnectionRow(supabase, userId);
  const config = getGitHubOAuthConfig();

  if (!config) {
    throw new Error("GitHub OAuth is not configured.");
  }

  if (connection.last_synced_at) {
    const elapsed = Date.now() - new Date(connection.last_synced_at).getTime();

    if (elapsed < SYNC_COOLDOWN_MS) {
      throw new Error("Please wait a moment before syncing GitHub again.");
    }
  }

  const accessToken = decryptGitHubToken(connection.encrypted_access_token, config.tokenEncryptionKey);
  const repositories = await fetchPublicRepositories(accessToken);

  const { error } = await supabase
    .from("github_connections")
    .update({
      repository_cache: repositories,
      last_synced_at: new Date().toISOString(),
    })
    .eq("id", connection.id)
    .eq("owner_user_id", userId);

  if (error) {
    throw error;
  }

  return repositories;
}

export async function importGitHubRepositories(
  supabase: SupabaseServerClient,
  userId: string,
  portfolioId: string,
  selectedRepositoryIds: number[],
) {
  const connection = await getRequiredConnectionRow(supabase, userId);
  const config = getGitHubOAuthConfig();

  if (!config) {
    throw new Error("GitHub OAuth is not configured.");
  }

  const cachedRepositories = normalizeRepositoryCache(connection.repository_cache).filter((repository) =>
    selectedRepositoryIds.includes(repository.id),
  );

  if (cachedRepositories.length === 0) {
    throw new Error("Choose at least one GitHub repository to import.");
  }

  const accessToken = decryptGitHubToken(connection.encrypted_access_token, config.tokenEncryptionKey);
  const repositories = await hydrateRepositoryReadmePresence(accessToken, cachedRepositories);

  for (const repository of repositories) {
    const proposal = buildGitHubProposal(repository);
    const metadata = {
      fullName: repository.fullName,
      htmlUrl: repository.htmlUrl,
      primaryLanguage: repository.primaryLanguage,
      topics: repository.topics,
      defaultBranch: repository.defaultBranch,
      stars: repository.stars,
      updatedAt: repository.updatedAt,
      ownerLogin: repository.ownerLogin,
      importTimestamp: new Date().toISOString(),
      readmePresent: repository.readmePresent,
      proofContext: proposal.proofContext,
    };

    const { data: existingEvidence } = await supabase
      .from("evidence_items")
      .select("id,metadata")
      .eq("portfolio_id", portfolioId)
      .eq("owner_user_id", userId)
      .eq("source_type", "github_repository");

    const matchedEvidence = (existingEvidence ?? []).find((item) => {
      const existingMetadata = item.metadata as Record<string, unknown> | null;
      return existingMetadata?.fullName === repository.fullName;
    });

    const evidenceQuery = matchedEvidence
      ? supabase
          .from("evidence_items")
          .update({
            title: repository.name,
            description: repository.description || `Public repository ${repository.fullName}`,
            metadata,
          })
          .eq("id", matchedEvidence.id)
          .eq("portfolio_id", portfolioId)
          .eq("owner_user_id", userId)
          .select("id")
          .single()
      : supabase
          .from("evidence_items")
          .insert({
            owner_user_id: userId,
            portfolio_id: portfolioId,
            source_type: "github_repository",
            title: repository.name,
            description: repository.description || `Public repository ${repository.fullName}`,
            metadata,
          })
          .select("id")
          .single();

    const { data: evidence, error: evidenceError } = await evidenceQuery;

    if (evidenceError) {
      throw evidenceError;
    }

    const { data: existingProjects } = await supabase
      .from("project_drafts")
      .select("id,evidence_references")
      .eq("portfolio_id", portfolioId)
      .eq("owner_user_id", userId);

    const matchedProject = (existingProjects ?? []).find((project) => {
      const references = Array.isArray(project.evidence_references) ? project.evidence_references : [];
      return references.includes(evidence.id);
    });

    const projectQuery = matchedProject
      ? supabase
          .from("project_drafts")
          .update({
            title: proposal.title,
            summary: proposal.summary,
            stack: proposal.technologies,
            evidence_references: [evidence.id],
            repository_url: repository.htmlUrl,
            live_demo_url: "",
          })
          .eq("id", matchedProject.id)
          .eq("portfolio_id", portfolioId)
          .eq("owner_user_id", userId)
      : supabase.from("project_drafts").insert({
          owner_user_id: userId,
          portfolio_id: portfolioId,
          title: proposal.title,
          summary: proposal.summary,
          stack: proposal.technologies,
          evidence_references: [evidence.id],
          repository_url: repository.htmlUrl,
          live_demo_url: "",
          status: "draft",
        });

    const { error: projectError } = await projectQuery;

    if (projectError) {
      throw projectError;
    }

    const { error: reviewError } = await supabase.from("proposal_reviews").upsert(
      {
        portfolio_id: portfolioId,
        owner_user_id: userId,
        source_evidence_id: evidence.id,
        proposed_title: proposal.title,
        proposed_summary: proposal.summary,
        proposal_type: "prototype_project",
        review_state: "pending",
        edited_content: {},
      },
      { onConflict: "portfolio_id,owner_user_id,source_evidence_id,proposal_type" },
    );

    if (reviewError) {
      throw reviewError;
    }
  }

  await supabase
    .from("portfolios")
    .update({ onboarding_state: "review" })
    .eq("id", portfolioId)
    .eq("owner_user_id", userId);
}

export async function disconnectGitHubConnection(
  supabase: SupabaseServerClient,
  userId: string,
  portfolioId: string,
) {
  const { data: githubEvidence, error: evidenceError } = await supabase
    .from("evidence_items")
    .select("id")
    .eq("portfolio_id", portfolioId)
    .eq("owner_user_id", userId)
    .eq("source_type", "github_repository");

  if (evidenceError) {
    throw evidenceError;
  }

  const evidenceIds = (githubEvidence ?? []).map((item) => item.id);

  if (evidenceIds.length > 0) {
    const { data: githubProjects, error: projectLookupError } = await supabase
      .from("project_drafts")
      .select("id,evidence_references")
      .eq("portfolio_id", portfolioId)
      .eq("owner_user_id", userId);

    if (projectLookupError) {
      throw projectLookupError;
    }

    const projectIds = (githubProjects ?? [])
      .filter((project) => Array.isArray(project.evidence_references) && project.evidence_references.some((reference) => evidenceIds.includes(reference)))
      .map((project) => project.id);

    const { error: projectError } =
      projectIds.length > 0
        ? await supabase
            .from("project_drafts")
            .delete()
            .in("id", projectIds)
            .eq("portfolio_id", portfolioId)
            .eq("owner_user_id", userId)
        : { error: null };

    if (projectError) {
      throw projectError;
    }

    const { error: reviewError } = await supabase
      .from("proposal_reviews")
      .delete()
      .eq("portfolio_id", portfolioId)
      .eq("owner_user_id", userId)
      .in("source_evidence_id", evidenceIds);

    if (reviewError) {
      throw reviewError;
    }

    const { error: deleteEvidenceError } = await supabase
      .from("evidence_items")
      .delete()
      .eq("portfolio_id", portfolioId)
      .eq("owner_user_id", userId)
      .eq("source_type", "github_repository");

    if (deleteEvidenceError) {
      throw deleteEvidenceError;
    }
  }

  const { error } = await supabase.from("github_connections").delete().eq("owner_user_id", userId);

  if (error) {
    throw error;
  }
}

async function getRequiredConnectionRow(
  supabase: SupabaseServerClient,
  userId: string,
): Promise<GitHubConnectionRow> {
  const { data, error } = await supabase
    .from("github_connections")
    .select("id,github_login,github_name,avatar_url,encrypted_access_token,token_scope,repository_cache,connected_at,last_synced_at")
    .eq("owner_user_id", userId)
    .single();

  if (error || !data) {
    throw new Error("Connect GitHub before importing repositories.");
  }

  return {
    id: String(data.id),
    github_login: String(data.github_login ?? ""),
    github_name: typeof data.github_name === "string" ? data.github_name : null,
    avatar_url: typeof data.avatar_url === "string" ? data.avatar_url : null,
    encrypted_access_token: String(data.encrypted_access_token ?? ""),
    token_scope: typeof data.token_scope === "string" ? data.token_scope : null,
    repository_cache: data.repository_cache,
    connected_at: String(data.connected_at ?? ""),
    last_synced_at: typeof data.last_synced_at === "string" ? data.last_synced_at : null,
  };
}

function normalizeRepositoryCache(value: unknown): GitHubRepositoryRecord[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const record = item as Record<string, unknown>;
    const id = typeof record.id === "number" ? record.id : null;
    const name = typeof record.name === "string" ? record.name : "";
    const fullName = typeof record.fullName === "string" ? record.fullName : "";
    const description = typeof record.description === "string" ? record.description : "";
    const htmlUrl = typeof record.htmlUrl === "string" ? record.htmlUrl : "";
    const primaryLanguage = typeof record.primaryLanguage === "string" ? record.primaryLanguage : "";
    const defaultBranch = typeof record.defaultBranch === "string" ? record.defaultBranch : "main";
    const stars = typeof record.stars === "number" ? record.stars : 0;
    const updatedAt = typeof record.updatedAt === "string" ? record.updatedAt : "";
    const ownerLogin = typeof record.ownerLogin === "string" ? record.ownerLogin : "";
    const readmePresent = typeof record.readmePresent === "boolean" ? record.readmePresent : false;
    const topics = Array.isArray(record.topics) ? record.topics.filter((topic): topic is string => typeof topic === "string") : [];

    if (id === null || !name || !fullName || !htmlUrl) {
      return [];
    }

    return [
      {
        id,
        name,
        fullName,
        description,
        htmlUrl,
        primaryLanguage,
        topics,
        defaultBranch,
        stars,
        updatedAt,
        ownerLogin,
        readmePresent,
      },
    ];
  });
}
