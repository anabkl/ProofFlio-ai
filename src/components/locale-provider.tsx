"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { copy, getCopy, localeMeta, locales, type Copy, type Locale } from "@/lib/content";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Copy;
  localeReady: boolean;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function isLocale(value: string | null): value is Locale {
  return Boolean(value && locales.includes(value as Locale));
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [localeLoaded, setLocaleLoaded] = useState(false);
  const userChangedLocale = useRef(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const stored = window.localStorage.getItem("prooffolio-locale");

      if (!userChangedLocale.current && isLocale(stored)) {
        setLocaleState(stored);
      }

      setLocaleLoaded(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!localeLoaded) {
      return;
    }

    const meta = localeMeta[locale];
    document.documentElement.lang = locale;
    document.documentElement.dir = meta.dir;
    window.localStorage.setItem("prooffolio-locale", locale);
  }, [locale, localeLoaded]);

  const value = useMemo(
    () => ({
      locale,
      setLocale: (nextLocale: Locale) => {
        userChangedLocale.current = true;
        setLocaleState(nextLocale);
      },
      t: getCopy(locale),
      localeReady: localeLoaded,
    }),
    [locale, localeLoaded],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    return { locale: "en" as Locale, setLocale: () => undefined, t: copy.en, localeReady: true };
  }

  return context;
}
