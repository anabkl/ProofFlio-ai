"use client";

import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { signOutAction } from "@/app/auth/actions";
import { useLocale } from "@/components/locale-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function AuthNavStatus() {
  const { t } = useLocale();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    let active = true;
    supabase.auth.getUser().then((result: { data: { user: unknown } }) => {
      if (active) {
        setIsAuthenticated(Boolean(result.data.user));
      }
    });

    const { data } = supabase.auth.onAuthStateChange((_event: string, session: { user?: unknown } | null) => {
      setIsAuthenticated(Boolean(session?.user));
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="pf-focus inline-flex items-center gap-2 rounded-md border border-white/12 bg-white/6 px-3 py-2 text-xs font-black text-white/70 transition hover:bg-white/10 hover:text-white"
      >
        <LogOut size={14} />
        {t.auth.signOut}
      </button>
    </form>
  );
}
