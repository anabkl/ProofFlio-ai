"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useLocale } from "@/components/locale-provider";
import type { OAuthProvider } from "@/lib/auth/oauth";

const providerBadge: Record<OAuthProvider, string> = {
  google: "G",
  github: "gh",
  linkedin_oidc: "in",
};

export function OAuthButtons({ providers, next }: { providers: OAuthProvider[]; next: string }) {
  const { t } = useLocale();
  const [pendingProvider, setPendingProvider] = useState<OAuthProvider | null>(null);
  const [error, setError] = useState(false);

  if (providers.length === 0) {
    return null;
  }

  async function handleClick(provider: OAuthProvider) {
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    setError(false);
    setPendingProvider(provider);

    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });

    if (oauthError) {
      setError(true);
      setPendingProvider(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.18em] text-white/40">
        <span className="h-px flex-1 bg-white/10" aria-hidden="true" />
        {t.auth.orContinueWith}
        <span className="h-px flex-1 bg-white/10" aria-hidden="true" />
      </div>
      {error ? (
        <p role="alert" className="text-sm font-bold text-[#ffb4a8]">
          {t.auth.oauthError}
        </p>
      ) : null}
      <div className="grid gap-2">
        {providers.map((provider) => (
          <button
            key={provider}
            type="button"
            disabled={pendingProvider !== null}
            onClick={() => handleClick(provider)}
            className="pf-focus inline-flex items-center justify-center gap-3 rounded-lg border border-white/12 bg-white/[0.05] px-4 py-3 text-sm font-black text-white transition hover:bg-white/10 disabled:cursor-wait disabled:opacity-60"
          >
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-white/10 text-[11px] font-black" aria-hidden="true">
              {providerBadge[provider]}
            </span>
            {t.auth.oauth[provider]}
          </button>
        ))}
      </div>
    </div>
  );
}
