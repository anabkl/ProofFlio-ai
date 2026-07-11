import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { exchangeGitHubCodeForToken } from "@/lib/github/api";
import { saveGitHubConnection } from "@/lib/github/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const expectedState = cookieStore.get("prooffolio-github-state")?.value;
  const next = cookieStore.get("prooffolio-github-next")?.value ?? "/onboarding?step=upload&source=github_repository";
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  cookieStore.delete("prooffolio-github-state");
  cookieStore.delete("prooffolio-github-next");

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL(`/onboarding?step=upload&source=github_repository&error=${encodeURIComponent("GitHub authorization could not be verified.")}`, request.url));
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.redirect(new URL(`/onboarding?step=upload&source=github_repository&error=${encodeURIComponent("Supabase is not configured yet.")}`, request.url));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL(`/auth/sign-in?next=${encodeURIComponent(next)}`, request.url));
  }

  try {
    const token = await exchangeGitHubCodeForToken(code);
    await saveGitHubConnection(supabase, user.id, token.accessToken, token.scope);
    return NextResponse.redirect(new URL(next, request.url));
  } catch (error) {
    const message = error instanceof Error ? error.message : "GitHub could not be connected.";
    return NextResponse.redirect(new URL(`/onboarding?step=upload&source=github_repository&error=${encodeURIComponent(message)}`, request.url));
  }
}
