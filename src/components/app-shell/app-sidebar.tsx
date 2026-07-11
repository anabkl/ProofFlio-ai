import Link from "next/link";
import { FolderKanban, LayoutDashboard, LayoutTemplate, ScanSearch, Settings, Wand2 } from "lucide-react";
import type { AppNavItem, AppNavKey } from "@/components/app-shell/types";

export const appNavIcons: Record<AppNavKey, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  portfolio: FolderKanban,
  evidence: ScanSearch,
  editor: Wand2,
  templates: LayoutTemplate,
  account: Settings,
};

export function AppSidebar({ items, activeNav }: { items: AppNavItem[]; activeNav: AppNavKey }) {
  return (
    <nav
      aria-label="Product navigation"
      className="sticky top-16 hidden h-[calc(100svh-64px)] w-60 shrink-0 flex-col gap-1 overflow-y-auto border-r border-white/10 bg-[#070B14]/50 p-4 lg:flex"
    >
      {items.map((item) => {
        const Icon = appNavIcons[item.key];
        const isActive = item.key === activeNav;

        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={[
              "pf-focus flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition",
              isActive ? "bg-white/10 text-white" : "text-white/62 hover:bg-white/6 hover:text-white",
            ].join(" ")}
          >
            <Icon size={18} aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
