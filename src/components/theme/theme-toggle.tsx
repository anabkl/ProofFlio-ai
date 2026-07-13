"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { useTheme, type Theme } from "@/components/theme/theme-provider";

const OPTIONS: { value: Theme; icon: typeof Sun }[] = [
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
  { value: "system", icon: Monitor },
];

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const { t } = useLocale();

  return (
    <div
      role="radiogroup"
      aria-label={t.theme.label}
      className={`inline-flex items-center gap-0.5 rounded-full border p-0.5 ${className ?? ""}`}
      style={{ borderColor: "var(--line)" }}
    >
      {OPTIONS.map(({ value, icon: Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={t.theme[value]}
            title={t.theme[value]}
            onClick={() => setTheme(value)}
            className="pf-focus relative inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-200"
            style={{
              color: active ? "var(--pf-text)" : "var(--pf-muted)",
              background: active ? "var(--pf-card)" : "transparent",
            }}
          >
            <Icon size={14} strokeWidth={2.25} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
