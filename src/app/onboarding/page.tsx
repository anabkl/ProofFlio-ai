import { AppShell } from "@/components/app-shell/app-shell";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { getOnboardingInitialState } from "@/lib/onboarding/server";
import { getSessionUser } from "@/lib/auth/session";
import { ensureProfile } from "@/lib/profile/server";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initialState = await getOnboardingInitialState(params);

  if (initialState.configured && initialState.authenticated) {
    const session = await getSessionUser();

    if (session) {
      const profile = await ensureProfile(session.supabase, session.user);
      const portfolioId = initialState.portfolio.id !== "setup-error" ? initialState.portfolio.id : null;

      return (
        <AppShell
          user={{ displayName: profile.displayName, email: session.user.email ?? "" }}
          activeNav="portfolio"
          portfolioId={portfolioId}
        >
          <OnboardingFlow initialState={initialState} hideHeader />
        </AppShell>
      );
    }
  }

  return <OnboardingFlow initialState={initialState} />;
}
