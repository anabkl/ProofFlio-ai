"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sanitizeNextPath } from "@/lib/auth/session";
import { ensureProfile } from "@/lib/profile/server";
import type { Locale } from "@/lib/content";

export type AuthActionState = {
  message: string;
  fieldErrors?: {
    email?: string;
    password?: string;
    displayName?: string;
    confirmPassword?: string;
    terms?: string;
  };
};

const emptyState: AuthActionState = { message: "" };

export async function signInAction(previousState: AuthActionState = emptyState, formData: FormData) {
  void previousState;
  const parsed = parseSignInForm(formData);

  if (parsed.fieldErrors) {
    return localizedState(parsed.locale, "validation", parsed.fieldErrors);
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return localizedState(parsed.locale, "missingConfig");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.email,
    password: parsed.password,
  });

  if (error) {
    return { message: error.message };
  }

  redirect(parsed.next);
}

export async function signUpAction(previousState: AuthActionState = emptyState, formData: FormData) {
  void previousState;
  const parsed = parseSignUpForm(formData);

  if (parsed.fieldErrors) {
    return localizedState(parsed.locale, "validation", parsed.fieldErrors);
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return localizedState(parsed.locale, "missingConfig");
  }

  const { data, error } = await supabase.auth.signUp({
    email: parsed.email,
    password: parsed.password,
  });

  if (error) {
    return { message: error.message };
  }

  if (data.user) {
    await ensureProfile(supabase, data.user, parsed.displayName);
  }

  redirect(parsed.next);
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/");
}

function parseSignInForm(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const locale = normalizeLocale(formData.get("locale"));
  const next = sanitizeNextPath(String(formData.get("next") ?? ""), "/dashboard");
  const fieldErrors: AuthActionState["fieldErrors"] = {};

  if (!email || !email.includes("@")) {
    fieldErrors.email = locale === "fr" ? "Entrez une adresse e-mail valide." : "Enter a valid email address.";
  }

  if (password.length < 6) {
    fieldErrors.password =
      locale === "fr" ? "Utilisez au moins 6 caractères." : "Use at least 6 characters.";
  }

  return {
    email,
    password,
    locale,
    next,
    fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
  };
}

function parseSignUpForm(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();
  const termsAccepted = formData.get("terms") === "on";
  const locale = normalizeLocale(formData.get("locale"));
  const next = sanitizeNextPath(String(formData.get("next") ?? ""), "/onboarding");
  const fieldErrors: AuthActionState["fieldErrors"] = {};

  if (!displayName) {
    fieldErrors.displayName =
      locale === "fr" ? "Ajoutez votre nom avant de créer un compte." : "Add your name before creating an account.";
  }

  if (!email || !email.includes("@")) {
    fieldErrors.email = locale === "fr" ? "Entrez une adresse e-mail valide." : "Enter a valid email address.";
  }

  if (password.length < 6) {
    fieldErrors.password =
      locale === "fr" ? "Utilisez au moins 6 caractères." : "Use at least 6 characters.";
  }

  if (confirmPassword !== password) {
    fieldErrors.confirmPassword =
      locale === "fr" ? "Les mots de passe ne correspondent pas." : "Passwords do not match.";
  }

  if (!termsAccepted) {
    fieldErrors.terms =
      locale === "fr"
        ? "Acceptez la note de confidentialité avant de créer un compte."
        : "Acknowledge the privacy note before creating an account.";
  }

  return {
    email,
    password,
    displayName,
    locale,
    next,
    fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
  };
}

function localizedState(
  locale: Locale,
  reason: "validation" | "missingConfig",
  fieldErrors?: AuthActionState["fieldErrors"],
): AuthActionState {
  if (reason === "missingConfig") {
    return {
      message:
        locale === "fr"
          ? "Supabase n'est pas encore configure. Ajoutez les variables d'environnement pour activer l'authentification."
          : "Supabase is not configured yet. Add the environment variables to enable authentication.",
    };
  }

  return {
    message:
      locale === "fr"
        ? "Corrigez les champs signales pour continuer."
        : "Fix the highlighted fields to continue.",
    fieldErrors,
  };
}

function normalizeLocale(value: FormDataEntryValue | null): Locale {
  return value === "fr" ? "fr" : "en";
}
