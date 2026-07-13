import Link from "next/link";
import type { ReactNode } from "react";
import { UserMenu } from "@/components/app-shell/user-menu";
import type { AppShellUser } from "@/components/app-shell/types";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";

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
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--pf-bg)]/90 backdrop-blur-xl transition-colors duration-200">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/dashboard" className="pf-focus flex shrink-0 items-center gap-2">
            <Logo variant="mark" size={30} className="text-[var(--pf-text)]" />
          </Link>
          <span className="min-w-0 truncate text-sm font-black text-[var(--pf-text)] sm:text-base">{pageTitle}</span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {statusSlot}
          <ThemeToggle className="hidden sm:inline-flex" />
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
