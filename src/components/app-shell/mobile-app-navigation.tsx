import Link from "next/link";
import { appNavIcons } from "@/components/app-shell/app-sidebar";
import type { AppNavItem, AppNavKey } from "@/components/app-shell/types";

export function MobileAppNavigation({
  items,
  activeNav,
  label,
}: {
  items: AppNavItem[];
  activeNav: AppNavKey;
  label: string;
}) {
  const visibleItems = items.filter((item) => item.key !== "account");

  return (
    <nav
      aria-label={label}
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-[var(--line)] bg-[var(--pf-bg)]/96 backdrop-blur-xl transition-colors duration-200 lg:hidden"
    >
      {visibleItems.map((item) => {
        const Icon = appNavIcons[item.key];
        const isActive = item.key === activeNav;

        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={[
              "pf-focus flex min-h-[52px] flex-1 flex-col items-center justify-center gap-1 px-1 py-2 text-[10px] font-bold",
              isActive ? "text-[var(--pf-text)]" : "text-[var(--pf-muted)]",
            ].join(" ")}
          >
            <Icon size={18} aria-hidden="true" />
            <span className="max-w-full truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
