import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { buildGitHubAuthorizeUrl } from "@/lib/github/api";

export async function GET(request: NextRequest) {
  const next = sanitizeNext(request.nextUrl.searchParams.get("next") ?? "/onboarding?step=upload&source=github_repository");
  const state = crypto.randomUUID();
  const authorizeUrl = buildGitHubAuthorizeUrl(state);

  if (!authorizeUrl) {
    return NextResponse.redirect(new URL(`/onboarding?step=upload&source=github_repository&error=${encodeURIComponent("GitHub is not configured yet.")}`, request.url));
  }

  const cookieStore = await cookies();
  cookieStore.set("prooffolio-github-state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    path: "/",
    maxAge: 60 * 10,
  });
  cookieStore.set("prooffolio-github-next", next, {
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    path: "/",
    maxAge: 60 * 10,
  });

  const url = new URL(authorizeUrl);
  url.searchParams.set("state", state);
  return NextResponse.redirect(url);
}

function sanitizeNext(value: string) {
  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/onboarding?step=upload&source=github_repository";
  }

  return value;
}
