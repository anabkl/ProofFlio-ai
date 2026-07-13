"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { LayoutDashboard, LogOut, Settings, SquareUserRound } from "lucide-react";
import { signOutAction } from "@/app/auth/actions";
import { useLocale } from "@/components/locale-provider";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import type { AppShellUser } from "@/components/app-shell/types";

export function UserMenu({ user }: { user: AppShellUser }) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const initials = initialsFromName(user.displayName || user.email);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handlePointerDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handlePointerDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`${t.appShell.accountMenu}: ${user.displayName || user.email}`}
        className="pf-focus flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--pf-text)]/6 py-1 pl-1 pr-3 text-sm font-black text-[var(--pf-text)] transition hover:bg-[var(--pf-text)]/10"
      >
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--pf-blue)]/22 text-xs font-black text-[var(--pf-blue)]" aria-hidden="true">
          {initials}
        </span>
        <span className="hidden max-w-[140px] truncate sm:inline">{user.displayName || user.email}</span>
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label={t.appShell.accountMenu}
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 rounded-xl border border-[var(--line)] bg-[var(--pf-surface)] p-2 shadow-[0_24px_80px_rgba(0,0,0,.4)]"
        >
          <div className="px-3 py-2">
            <p className="truncate text-sm font-black text-[var(--pf-text)]">{user.displayName || t.appShell.signedInAs}</p>
            <p className="truncate text-xs font-semibold text-[var(--pf-muted)]">{user.email}</p>
          </div>
          <div className="my-1 h-px bg-[var(--line)]" role="separator" />
          <div className="flex items-center justify-between px-3 py-2 sm:hidden">
            <span className="text-sm font-bold text-[var(--pf-muted)]">{t.theme.label}</span>
            <ThemeToggle />
          </div>
          <div className="my-1 h-px bg-[var(--line)] sm:hidden" role="separator" />
          <MenuLink href="/dashboard" icon={LayoutDashboard} label={t.nav.dashboard} onSelect={() => setOpen(false)} />
          <MenuLink href="/onboarding" icon={SquareUserRound} label={t.nav.myPortfolio} onSelect={() => setOpen(false)} />
          <MenuLink href="/account" icon={Settings} label={t.nav.accountSettings} onSelect={() => setOpen(false)} />
          <div className="my-1 h-px bg-[var(--line)]" role="separator" />
          <form action={signOutAction}>
            <button
              type="submit"
              role="menuitem"
              className="pf-focus flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-bold text-[var(--pf-red)] transition hover:bg-[var(--pf-text)]/6"
            >
              <LogOut size={16} aria-hidden="true" />
              {t.auth.signOut}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function MenuLink({
  href,
  icon: Icon,
  label,
  onSelect,
}: {
  href: string;
  icon: typeof LayoutDashboard;
  label: string;
  onSelect: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onSelect}
      className="pf-focus flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-[var(--pf-text)]/78 transition hover:bg-[var(--pf-text)]/6 hover:text-[var(--pf-text)]"
    >
      <Icon size={16} aria-hidden="true" />
      {label}
    </Link>
  );
}

function initialsFromName(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "PF";
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
