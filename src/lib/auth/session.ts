import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient, type SupabaseServerClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/profile/server";

export function sanitizeNextPath(value: string | null | undefined, fallback: string): string {
  if (!value) {
    return fallback;
  }

  if (!value.startsWith("/") || value.startsWith("//") || value.includes("://") || value.includes("\\")) {
    return fallback;
  }

  return value;
}

export type SessionUser = { supabase: SupabaseServerClient; user: User };

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return { supabase, user };
}

export type RequireUserResult =
  | { configured: true; supabase: SupabaseServerClient; user: User }
  | { configured: false };

export async function requireUser(nextPath: string): Promise<RequireUserResult> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { configured: false };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/sign-in?next=${encodeURIComponent(sanitizeNextPath(nextPath, nextPath))}`);
  }

  return { configured: true, supabase, user };
}

export type MarketingUser = { displayName: string; email: string };

/**
 * Lightweight, non-redirecting lookup for marketing pages that only need to
 * decide between a logged-out and logged-in navigation state.
 */
export async function getMarketingUser(): Promise<MarketingUser | null> {
  const session = await getSessionUser();

  if (!session) {
    return null;
  }

  const profile = await ensureProfile(session.supabase, session.user);
  return { displayName: profile.displayName, email: session.user.email ?? "" };
}

export async function redirectIfAuthenticated(next: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(sanitizeNextPath(next, "/dashboard"));
  }
}
