import { AccountView } from "@/components/account/account-view";
import { UnconfiguredNotice } from "@/components/app-shell/unconfigured-notice";
import { ensureProfile } from "@/lib/profile/server";
import { requireUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function Page() {
  const result = await requireUser("/account");

  if (!result.configured) {
    return <UnconfiguredNotice pageTitle="Account settings" />;
  }

  const profile = await ensureProfile(result.supabase, result.user);
  const connectedProviders = (result.user.identities ?? [])
    .map((identity) => identity.provider)
    .filter((provider): provider is string => typeof provider === "string");

  return (
    <AccountView
      email={result.user.email ?? ""}
      displayName={profile.displayName}
      headline={profile.headline}
      connectedProviders={connectedProviders}
    />
  );
}
