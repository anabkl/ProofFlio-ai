"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { LayoutDashboard, LogOut, Settings, SquareUserRound } from "lucide-react";
import { signOutAction } from "@/app/auth/actions";
import { useLocale } from "@/components/locale-provider";
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
        className="pf-focus flex items-center gap-2 rounded-full border border-white/12 bg-white/6 py-1 pl-1 pr-3 text-sm font-black text-white transition hover:bg-white/10"
      >
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#4da3ff]/22 text-xs font-black text-[#9ed0ff]" aria-hidden="true">
          {initials}
        </span>
        <span className="hidden max-w-[140px] truncate sm:inline">{user.displayName || user.email}</span>
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label={t.appShell.accountMenu}
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 rounded-xl border border-white/12 bg-[#0D1422] p-2 shadow-[0_24px_80px_rgba(0,0,0,.4)]"
        >
          <div className="px-3 py-2">
            <p className="truncate text-sm font-black text-white">{user.displayName || t.appShell.signedInAs}</p>
            <p className="truncate text-xs font-semibold text-white/50">{user.email}</p>
          </div>
          <div className="my-1 h-px bg-white/10" role="separator" />
          <MenuLink href="/dashboard" icon={LayoutDashboard} label={t.nav.dashboard} onSelect={() => setOpen(false)} />
          <MenuLink href="/onboarding" icon={SquareUserRound} label={t.nav.myPortfolio} onSelect={() => setOpen(false)} />
          <MenuLink href="/account" icon={Settings} label={t.nav.accountSettings} onSelect={() => setOpen(false)} />
          <div className="my-1 h-px bg-white/10" role="separator" />
          <form action={signOutAction}>
            <button
              type="submit"
              role="menuitem"
              className="pf-focus flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-bold text-[#ffb4a8] transition hover:bg-white/6"
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
      className="pf-focus flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-white/78 transition hover:bg-white/6 hover:text-white"
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
