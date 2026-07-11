import type { GitHubRepositoryRecord } from "@/lib/github/api";

export function buildGitHubProposal(repository: GitHubRepositoryRecord) {
  const stack = [repository.primaryLanguage, ...repository.topics].filter(Boolean);
  const repositoryLabel = repository.fullName.replace(/[-_]+/g, " ");
  const headline = repository.description.trim() || `Evidence-backed work from ${repository.name}.`;
  const summaryParts = [headline];

  if (stack.length > 0) {
    summaryParts.push(`Stack focus: ${stack.join(", ")}.`);
  }

  if (repository.readmePresent) {
    summaryParts.push("README available for public project context.");
  }

  if (repository.stars > 0) {
    summaryParts.push(`${repository.stars} GitHub stars at import time.`);
  }

  return {
    title: toTitleCase(repositoryLabel),
    summary: summaryParts.join(" "),
    proofContext: [
      "Draft suggestion generated from repository metadata.",
      repository.primaryLanguage ? `Primary language: ${repository.primaryLanguage}.` : "",
      repository.topics.length > 0 ? `Topics: ${repository.topics.join(", ")}.` : "",
      repository.readmePresent ? "README detected during import." : "No README detected during import.",
      `Default branch: ${repository.defaultBranch}.`,
      `Last updated: ${repository.updatedAt}.`,
    ]
      .filter(Boolean)
      .join(" "),
    technologies: stack.slice(0, 8),
  };
}

function toTitleCase(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}
