import { UnconfiguredNotice } from "@/components/app-shell/unconfigured-notice";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { getDashboardState } from "@/lib/dashboard/server";
import { requireUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function Page() {
  const result = await requireUser("/dashboard");

  if (!result.configured) {
    return <UnconfiguredNotice pageTitle="Dashboard" />;
  }

  const state = await getDashboardState(result.supabase, result.user);

  return <DashboardView state={state} />;
}
