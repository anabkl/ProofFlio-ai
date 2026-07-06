import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { getOnboardingInitialState } from "@/lib/onboarding/server";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initialState = await getOnboardingInitialState(params);

  return <OnboardingFlow initialState={initialState} />;
}
