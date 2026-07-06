"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { signInAction, signUpAction, type AuthActionState } from "@/app/auth/actions";
import { useLocale } from "@/components/locale-provider";
import { localeMeta, locales } from "@/lib/content";

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
  next: string;
};

const initialState: AuthActionState = { message: "" };

export function AuthForm({ mode, next }: AuthFormProps) {
  const { locale, localeReady, setLocale, t } = useLocale();
  const action = mode === "sign-in" ? signInAction : signUpAction;
  const [state, formAction] = useActionState(action, initialState);
  const isSignIn = mode === "sign-in";
  const alternateHref = `${isSignIn ? "/auth/sign-up" : "/auth/sign-in"}?next=${encodeURIComponent(next)}`;

  return (
    <main className="min-h-screen overflow-hidden bg-[#05070d] pt-24 text-white">
      <div className="absolute inset-0 pf-grid-v3 opacity-40" aria-hidden="true" />
      <section className="pf-container relative z-10 grid min-h-[calc(100svh-96px)] items-center gap-8 py-12 lg:grid-cols-[.9fr_1.1fr]">
        <div className="max-w-xl">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#2DD4BF]">{t.auth.kicker}</p>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-6xl">
            {isSignIn ? t.auth.signInTitle : t.auth.signUpTitle}
          </h1>
          <p className="mt-5 text-lg leading-8 text-[#A8B3C7]">
            {isSignIn ? t.auth.signInBody : t.auth.signUpBody}
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {t.auth.proofPoints.map((point) => (
              <div key={point} className="rounded-lg border border-white/10 bg-white/[0.055] p-4 text-sm font-bold leading-6 text-white/72">
                <ShieldCheck className="mb-3 text-[#2DD4BF]" size={18} />
                {point}
              </div>
            ))}
          </div>
        </div>

        <div className="relative rounded-xl border border-white/12 bg-[#0D1422]/86 p-5 shadow-[0_34px_120px_rgba(0,0,0,.36)] backdrop-blur">
          <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#4E8CFF] to-transparent" aria-hidden="true" />
          <div className="mb-5 flex justify-end">
            <div className="flex rounded-md border border-white/12 bg-white/6 p-1" aria-label={t.nav.language}>
              {locales.map((item) => (
                <button
                  key={item}
                  type="button"
                  disabled={!localeReady}
                  onClick={() => setLocale(item)}
                  className={[
                    "pf-focus rounded-md px-2.5 py-1.5 text-xs font-black transition",
                    locale === item ? "bg-white text-[#071021]" : "text-white/62 hover:bg-white/8 hover:text-white",
                  ].join(" ")}
                >
                  {localeMeta[item].label}
                </button>
              ))}
            </div>
          </div>
          <form action={formAction} className="space-y-5" noValidate>
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="next" value={next} />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#9ed0ff]">
                {isSignIn ? t.auth.signInAction : t.auth.signUpAction}
              </p>
              <h2 className="mt-3 text-2xl font-black text-white">{t.auth.formTitle}</h2>
            </div>

            {state.message ? (
              <div className="rounded-lg border border-[#ff7a66]/30 bg-[#ff7a66]/10 px-4 py-3 text-sm font-bold leading-6 text-[#ffd8d1]" role="alert">
                {state.message}
              </div>
            ) : null}

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-black text-white/78">
                <Mail size={16} />
                {t.auth.email}
              </span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                className="pf-focus w-full rounded-lg border border-white/12 bg-[#070B14] px-4 py-3 text-white placeholder:text-white/28"
                placeholder={t.auth.emailPlaceholder}
                aria-invalid={Boolean(state.fieldErrors?.email)}
                aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
              />
              {state.fieldErrors?.email ? <span id="email-error" className="mt-2 block text-sm font-bold text-[#ffb4a8]">{state.fieldErrors.email}</span> : null}
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-black text-white/78">
                <LockKeyhole size={16} />
                {t.auth.password}
              </span>
              <input
                name="password"
                type="password"
                autoComplete={isSignIn ? "current-password" : "new-password"}
                className="pf-focus w-full rounded-lg border border-white/12 bg-[#070B14] px-4 py-3 text-white placeholder:text-white/28"
                placeholder={t.auth.passwordPlaceholder}
                aria-invalid={Boolean(state.fieldErrors?.password)}
                aria-describedby={state.fieldErrors?.password ? "password-error" : undefined}
              />
              {state.fieldErrors?.password ? <span id="password-error" className="mt-2 block text-sm font-bold text-[#ffb4a8]">{state.fieldErrors.password}</span> : null}
            </label>

            <SubmitButton label={isSignIn ? t.auth.signInAction : t.auth.signUpAction} />
          </form>

          <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.045] p-4 text-sm font-semibold leading-6 text-white/62">
            {isSignIn ? t.auth.needAccount : t.auth.haveAccount}{" "}
            <Link href={alternateHref} className="pf-focus rounded-sm font-black text-[#9ed0ff] hover:text-white">
              {isSignIn ? t.auth.createAccount : t.auth.backToSignIn}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  const { t } = useLocale();

  return (
    <button
      type="submit"
      disabled={pending}
      className="pf-focus inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#F8FAFC] px-5 py-3 text-sm font-black text-[#071021] transition hover:bg-[#BFDBFE] disabled:cursor-wait disabled:opacity-70"
    >
      {pending ? t.auth.loading : label}
      <ArrowRight size={17} />
    </button>
  );
}
