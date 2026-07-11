"use client";

import { useLocale } from "@/components/locale-provider";
import { WorkspaceHeader } from "@/components/workspace-header";

export function UnconfiguredNotice({ pageTitle }: { pageTitle: string }) {
  const { t } = useLocale();

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#05070d] text-white">
      <WorkspaceHeader contextLabel={pageTitle} />
      <main className="pf-container flex min-h-[60vh] items-center py-16">
        <div className="max-w-xl rounded-xl border border-white/12 bg-[#0D1422]/80 p-8">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FBBF24]">{t.onboarding.previewStatus}</p>
          <h1 className="mt-4 text-2xl font-black text-white">{t.editor.unavailable.setup_required.title}</h1>
          <p className="mt-3 text-sm leading-7 text-white/60">{t.onboarding.persistenceBlocked}</p>
        </div>
      </main>
    </div>
  );
}
