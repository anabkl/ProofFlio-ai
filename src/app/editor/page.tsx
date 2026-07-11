import { AppShell } from "@/components/app-shell/app-shell";
import { PersistentEditorPage } from "@/components/editor/persistent-editor-page";
import { getEditorInitialState } from "@/lib/editor/server";
import { getSessionUser } from "@/lib/auth/session";
import { ensureProfile } from "@/lib/profile/server";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const initialState = await getEditorInitialState(await searchParams);

  if (initialState.mode === "ready") {
    const session = await getSessionUser();

    if (session) {
      const profile = await ensureProfile(session.supabase, session.user);

      return (
        <AppShell
          user={{ displayName: profile.displayName, email: session.user.email ?? "" }}
          activeNav="editor"
          portfolioId={initialState.portfolio.id}
        >
          <PersistentEditorPage initialState={initialState} hideHeader />
        </AppShell>
      );
    }
  }

  return <PersistentEditorPage initialState={initialState} />;
}
