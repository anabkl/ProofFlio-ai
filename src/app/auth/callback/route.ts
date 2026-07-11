import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sanitizeNextPath } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const providerError = searchParams.get("error");
  const next = sanitizeNextPath(searchParams.get("next"), "/dashboard");

  if (providerError || !code) {
    return NextResponse.redirect(signInRedirectUrl(origin, next));
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.redirect(signInRedirectUrl(origin, next));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(signInRedirectUrl(origin, next));
  }

  return NextResponse.redirect(new URL(next, origin));
}

function signInRedirectUrl(origin: string, next: string) {
  const url = new URL("/auth/sign-in", origin);
  url.searchParams.set("next", next);
  url.searchParams.set("error", "oauth");
  return url;
}
