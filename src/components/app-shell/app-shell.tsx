"use client";

import type { ReactNode } from "react";
import { AppSidebar } from "@/components/app-shell/app-sidebar";
import { AppTopbar } from "@/components/app-shell/app-topbar";
import { MobileAppNavigation } from "@/components/app-shell/mobile-app-navigation";
import { useLocale } from "@/components/locale-provider";
import type { AppNavItem, AppNavKey, AppShellUser } from "@/components/app-shell/types";

export type { AppNavKey, AppShellUser } from "@/components/app-shell/types";

export function AppShell({
  user,
  activeNav,
  pageTitle,
  portfolioId = null,
  statusSlot,
  children,
}: {
  user: AppShellUser;
  activeNav: AppNavKey;
  pageTitle?: string;
  portfolioId?: string | null;
  statusSlot?: ReactNode;
  children: ReactNode;
}) {
  const { t } = useLocale();
  const portfolioHref = portfolioId ? `/editor?portfolio=${portfolioId}&onboarding=ready` : "/onboarding";
  const editorHref = portfolioId ? `/editor?portfolio=${portfolioId}&onboarding=ready` : "/editor";

  const items: AppNavItem[] = [
    { key: "dashboard", href: "/dashboard", label: t.nav.dashboard },
    { key: "portfolio", href: portfolioHref, label: t.nav.myPortfolio },
    { key: "evidence", href: "/onboarding?step=upload", label: t.nav.evidence },
    { key: "editor", href: editorHref, label: t.nav.editor },
    { key: "templates", href: "/templates", label: t.nav.templates },
    { key: "account", href: "/account", label: t.nav.accountSettings },
  ];

  const resolvedTitle = pageTitle ?? items.find((item) => item.key === activeNav)?.label ?? t.nav.dashboard;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#05070d] text-white">
      <a
        href="#app-main"
        className="pf-focus sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-black focus:text-[#071021]"
      >
        {t.nav.skip}
      </a>
      <AppTopbar pageTitle={resolvedTitle} statusSlot={statusSlot} user={user} />
      <div className="mx-auto flex w-full max-w-[1440px]">
        <AppSidebar items={items} activeNav={activeNav} />
        <main id="app-main" className="min-w-0 flex-1 pb-20 lg:pb-0">
          {children}
        </main>
      </div>
      <MobileAppNavigation items={items} activeNav={activeNav} label={t.appShell.mobileNavLabel} />
    </div>
  );
}
