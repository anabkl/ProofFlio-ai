import Link from "next/link";
import type { ReactNode } from "react";
import { UserMenu } from "@/components/app-shell/user-menu";
import type { AppShellUser } from "@/components/app-shell/types";

export function AppTopbar({
  pageTitle,
  statusSlot,
  user,
}: {
  pageTitle: string;
  statusSlot?: ReactNode;
  user: AppShellUser;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#05070d]/90 backdrop-blur-xl">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/dashboard" className="pf-focus flex shrink-0 items-center gap-2" aria-label="ProofFolio AI">
            <span className="grid h-9 w-9 place-items-center rounded-lg border border-[#4da3ff]/45 bg-[#08142a] text-sm font-black text-[#9ed0ff]">
              PF
            </span>
          </Link>
          <span className="min-w-0 truncate text-sm font-black text-white sm:text-base">{pageTitle}</span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {statusSlot}
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
