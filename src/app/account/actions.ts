"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Locale } from "@/lib/content";

export type ProfileActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const emptyState: ProfileActionState = { status: "idle" };

export async function updateProfileAction(previousState: ProfileActionState = emptyState, formData: FormData) {
  void previousState;
  const displayName = String(formData.get("displayName") ?? "").trim();
  const headline = String(formData.get("headline") ?? "").trim();
  const locale = normalizeLocale(formData.get("locale"));

  if (!displayName) {
    return {
      status: "error" as const,
      message: locale === "fr" ? "Ajoutez un nom affiché avant d'enregistrer." : "Add a display name before saving.",
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      status: "error" as const,
      message: locale === "fr" ? "Supabase n'est pas configuré." : "Supabase is not configured.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error" as const,
      message: locale === "fr" ? "Session expirée. Reconnectez-vous." : "Session expired. Sign in again.",
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName, headline })
    .eq("id", user.id);

  if (error) {
    return {
      status: "error" as const,
      message: locale === "fr" ? "Impossible d'enregistrer vos modifications." : "Could not save your changes.",
    };
  }

  revalidatePath("/account");
  return { status: "success" as const };
}

function normalizeLocale(value: FormDataEntryValue | null): Locale {
  return value === "fr" ? "fr" : "en";
}
