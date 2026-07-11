"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { signOutAction } from "@/app/auth/actions";
import { updateProfileAction, type ProfileActionState } from "@/app/account/actions";
import { AppShell } from "@/components/app-shell/app-shell";
import { useLocale } from "@/components/locale-provider";
import type { OAuthProvider } from "@/lib/auth/oauth";

const initialState: ProfileActionState = { status: "idle" };

export function AccountView({
  email,
  displayName,
  headline,
  connectedProviders,
}: {
  email: string;
  displayName: string;
  headline: string;
  connectedProviders: string[];
}) {
  const { locale, t } = useLocale();
  const [state, formAction] = useActionState(updateProfileAction, initialState);
  const user = { displayName, email };

  const providerRows: { key: "email" | OAuthProvider; label: string }[] = [
    { key: "email", label: t.account.providers.email },
    { key: "google", label: t.account.providers.google },
    { key: "github", label: t.account.providers.github },
    { key: "linkedin_oidc", label: t.account.providers.linkedin_oidc },
  ];

  return (
    <AppShell user={user} activeNav="account" pageTitle={t.account.title}>
      <div className="pf-container max-w-3xl py-8 sm:py-10">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#9ed0ff]">{t.account.kicker}</p>
        <h1 className="mt-3 text-3xl font-black text-white">{t.account.title}</h1>

        <section className="mt-8 rounded-xl border border-white/12 bg-[#0D1422]/80 p-6">
          <form action={formAction} className="space-y-5">
            <input type="hidden" name="locale" value={locale} />
            <div>
              <span className="mb-2 block text-sm font-black text-white/78">{t.account.emailLabel}</span>
              <p className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white/70">{email}</p>
            </div>
            <label className="block">
              <span className="mb-2 block text-sm font-black text-white/78">{t.account.displayNameLabel}</span>
              <input
                name="displayName"
                defaultValue={displayName}
                className="pf-focus w-full rounded-lg border border-white/12 bg-[#070B14] px-4 py-3 text-white"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-black text-white/78">{t.account.headlineLabel}</span>
              <input
                name="headline"
                defaultValue={headline}
                placeholder={t.account.headlinePlaceholder}
                className="pf-focus w-full rounded-lg border border-white/12 bg-[#070B14] px-4 py-3 text-white placeholder:text-white/28"
              />
            </label>
            {state.status === "error" ? (
              <div role="alert" className="rounded-lg border border-[#ff7a66]/30 bg-[#ff7a66]/10 px-4 py-3 text-sm font-bold text-[#ffd8d1]">
                {state.message}
              </div>
            ) : null}
            {state.status === "success" ? (
              <div role="status" className="rounded-lg border border-[#2DD4BF]/30 bg-[#2DD4BF]/10 px-4 py-3 text-sm font-bold text-[#5eead4]">
                {t.account.saved}
              </div>
            ) : null}
            <SaveButton label={t.account.save} pendingLabel={t.account.saving} />
          </form>
        </section>

        <section className="mt-6 rounded-xl border border-white/12 bg-[#0D1422]/60 p-6">
          <h2 className="text-sm font-black uppercase tracking-[0.18em] text-white/70">{t.account.providersTitle}</h2>
          <p className="mt-2 text-xs leading-5 text-white/50">{t.account.providersBody}</p>
          <ul className="mt-4 space-y-2">
            {providerRows.map((row) => {
              const connected = connectedProviders.includes(row.key);

              return (
                <li key={row.key} className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.03] px-4 py-3 text-sm font-bold">
                  <span className="text-white/80">{row.label}</span>
                  <span className={connected ? "flex items-center gap-1.5 text-[#5eead4]" : "flex items-center gap-1.5 text-white/40"}>
                    {connected ? <CheckCircle2 size={14} aria-hidden="true" /> : <XCircle size={14} aria-hidden="true" />}
                    {connected ? t.account.connected : t.account.notConnected}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-6 rounded-xl border border-dashed border-white/14 bg-white/[0.02] p-6">
          <h2 className="text-sm font-black uppercase tracking-[0.18em] text-white/50">{t.account.integrationsTitle}</h2>
          <p className="mt-2 text-xs leading-5 text-white/44">{t.account.integrationsBody}</p>
          <ul className="mt-4 space-y-2">
            <IntegrationRow label={t.account.integrations.githubImport} status={t.account.integrations.githubImportStatus} />
            <IntegrationRow label={t.account.integrations.linkedinImport} status={t.account.integrations.linkedinImportStatus} />
            <IntegrationRow label={t.account.integrations.cvParsing} status={t.account.integrations.cvParsingStatus} />
          </ul>
        </section>

        <section className="mt-6">
          <form action={signOutAction}>
            <button
              type="submit"
              className="pf-focus inline-flex items-center gap-2 rounded-lg border border-[#ff7a66]/30 bg-[#ff7a66]/10 px-5 py-3 text-sm font-black text-[#ffd8d1] transition hover:bg-[#ff7a66]/16"
            >
              {t.account.signOut}
            </button>
          </form>
        </section>
      </div>
    </AppShell>
  );
}

function SaveButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="pf-focus inline-flex items-center gap-2 rounded-lg bg-[#F8FAFC] px-5 py-3 text-sm font-black text-[#071021] transition hover:bg-[#BFDBFE] disabled:cursor-wait disabled:opacity-70"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

function IntegrationRow({ label, status }: { label: string; status: string }) {
  return (
    <li className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.02] px-4 py-3 text-sm font-bold opacity-70">
      <span className="text-white/70">{label}</span>
      <span className="rounded-full border border-[#FBBF24]/30 bg-[#FBBF24]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-[#FCD34D]">
        {status}
      </span>
    </li>
  );
}
