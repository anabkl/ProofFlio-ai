import { AuthForm } from "@/components/auth/auth-form";
import { redirectIfAuthenticated, sanitizeNextPath } from "@/lib/auth/session";
import { getEnabledOAuthProviders } from "@/lib/auth/oauth";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next = sanitizeNextPath(params.next, "/dashboard");
  await redirectIfAuthenticated(next);

  return <AuthForm mode="sign-in" next={next} oauthProviders={getEnabledOAuthProviders()} oauthError={params.error === "oauth"} />;
}
