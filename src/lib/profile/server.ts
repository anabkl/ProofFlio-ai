import type { User } from "@supabase/supabase-js";
import type { SupabaseServerClient } from "@/lib/supabase/server";

export type Profile = { displayName: string; headline: string };

export function profileNameFromEmail(email: string | undefined) {
  if (!email) {
    return "ProofFolio user";
  }

  return email.split("@")[0]?.replace(/[._-]+/g, " ") || "ProofFolio user";
}

/**
 * Creates the profile row on first sight only. Never overwrites an existing
 * display_name/headline, so a name set later on the Account page is never
 * clobbered by a later onboarding visit.
 */
export async function ensureProfile(
  supabase: SupabaseServerClient,
  user: User,
  displayNameHint?: string,
): Promise<Profile> {
  const { data: existing, error: selectError } = await supabase
    .from("profiles")
    .select("display_name,headline")
    .eq("id", user.id)
    .maybeSingle();

  if (selectError) {
    throw selectError;
  }

  if (existing) {
    return {
      displayName: String(existing.display_name ?? "") || profileNameFromEmail(user.email),
      headline: String(existing.headline ?? ""),
    };
  }

  const displayName = displayNameHint?.trim() || profileNameFromEmail(user.email);
  const { error: insertError } = await supabase.from("profiles").insert({
    id: user.id,
    display_name: displayName,
  });

  if (insertError) {
    throw insertError;
  }

  return { displayName, headline: "" };
}
