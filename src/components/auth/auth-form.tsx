"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { signInAction, signUpAction, type AuthActionState } from "@/app/auth/actions";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { useLocale } from "@/components/locale-provider";
import { WorkspaceHeader } from "@/components/workspace-header";
import type { OAuthProvider } from "@/lib/auth/oauth";

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
  next: string;
  oauthProviders: OAuthProvider[];
  oauthError?: boolean;
};

const initialState: AuthActionState = { message: "" };

export function AuthForm({ mode, next, oauthProviders, oauthError }: AuthFormProps) {
  const { locale, t } = useLocale();
  const action = mode === "sign-in" ? signInAction : signUpAction;
  const [state, formAction] = useActionState(action, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const isSignIn = mode === "sign-in";
  const alternateHref = `${isSignIn ? "/auth/sign-up" : "/auth/sign-in"}?next=${encodeURIComponent(next)}`;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#05070d] text-white">
      <a href="#auth-main" className="pf-focus sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-black focus:text-[#071021]">
        {t.nav.skip}
      </a>
      <WorkspaceHeader contextLabel={t.auth.kicker} />
      <main id="auth-main" className="relative overflow-hidden">
        <div className="absolute inset-0 pf-grid-v3 opacity-40" aria-hidden="true" />
        <section className="pf-container relative z-10 grid min-h-[calc(100svh-64px)] items-center gap-8 py-10 lg:grid-cols-[.9fr_1.1fr] lg:py-12">
          <div className="max-w-xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#2DD4BF]">{t.auth.kicker}</p>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:mt-5 sm:text-6xl">
              {isSignIn ? t.auth.signInTitle : t.auth.signUpTitle}
            </h1>
            <p className="mt-4 text-base leading-7 text-[#A8B3C7] sm:mt-5 sm:text-lg sm:leading-8">
              {isSignIn ? t.auth.signInBody : t.auth.signUpBody}
            </p>
            <div className="mt-6 grid grid-cols-3 gap-2 sm:mt-8 sm:gap-3">
              {t.auth.proofPoints.map((point) => (
                <div key={point} className="rounded-lg border border-white/10 bg-white/[0.055] p-2.5 text-[11px] font-bold leading-4 text-white/72 sm:p-4 sm:text-sm sm:leading-6">
                  <ShieldCheck className="mb-1.5 text-[#2DD4BF] sm:mb-3" size={16} />
                  {point}
                </div>
              ))}
            </div>
          </div>

          <div className="relative rounded-xl border border-white/12 bg-[#0D1422]/86 p-5 shadow-[0_34px_120px_rgba(0,0,0,.36)] backdrop-blur">
            <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#4E8CFF] to-transparent" aria-hidden="true" />
            <form action={formAction} className="space-y-5" noValidate>
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="next" value={next} />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#9ed0ff]">
                {isSignIn ? t.auth.signInAction : t.auth.signUpAction}
              </p>
              <h2 className="mt-3 text-2xl font-black text-white">{t.auth.formTitle}</h2>
            </div>

            {oauthError ? (
              <div className="rounded-lg border border-[#ff7a66]/30 bg-[#ff7a66]/10 px-4 py-3 text-sm font-bold leading-6 text-[#ffd8d1]" role="alert">
                {t.auth.oauthError}
              </div>
            ) : null}

            {state.message ? (
              <div className="rounded-lg border border-[#ff7a66]/30 bg-[#ff7a66]/10 px-4 py-3 text-sm font-bold leading-6 text-[#ffd8d1]" role="alert">
                {state.message}
              </div>
            ) : null}

            {!isSignIn ? (
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-black text-white/78">
                  <UserRound size={16} />
                  {t.auth.displayName}
                </span>
                <input
                  name="displayName"
                  type="text"
                  autoComplete="name"
                  className="pf-focus w-full rounded-lg border border-white/12 bg-[#070B14] px-4 py-3 text-white placeholder:text-white/28"
                  placeholder={t.auth.displayNamePlaceholder}
                  aria-invalid={Boolean(state.fieldErrors?.displayName)}
                  aria-describedby={state.fieldErrors?.displayName ? "displayName-error" : undefined}
                />
                {state.fieldErrors?.displayName ? (
                  <span id="displayName-error" className="mt-2 block text-sm font-bold text-[#ffb4a8]">
                    {state.fieldErrors.displayName}
                  </span>
                ) : null}
              </label>
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

            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <label htmlFor="auth-password" className="flex items-center gap-2 text-sm font-black text-white/78">
                  <LockKeyhole size={16} />
                  {t.auth.password}
                </label>
                {isSignIn ? (
                  <span className="text-xs font-bold text-white/38" title={t.auth.forgotPasswordComingSoon}>
                    {t.auth.forgotPassword}
                  </span>
                ) : null}
              </div>
              <div className="relative">
                <input
                  id="auth-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isSignIn ? "current-password" : "new-password"}
                  className="pf-focus w-full rounded-lg border border-white/12 bg-[#070B14] px-4 py-3 pr-11 text-white placeholder:text-white/28"
                  placeholder={t.auth.passwordPlaceholder}
                  aria-invalid={Boolean(state.fieldErrors?.password)}
                  aria-describedby={state.fieldErrors?.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? t.auth.hidePassword : t.auth.showPassword}
                  className="pf-focus absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-white/50 hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {state.fieldErrors?.password ? <span id="password-error" className="mt-2 block text-sm font-bold text-[#ffb4a8]">{state.fieldErrors.password}</span> : null}
            </div>

            {!isSignIn ? (
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-black text-white/78">
                  <LockKeyhole size={16} />
                  {t.auth.confirmPassword}
                </span>
                <input
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className="pf-focus w-full rounded-lg border border-white/12 bg-[#070B14] px-4 py-3 text-white placeholder:text-white/28"
                  placeholder={t.auth.confirmPasswordPlaceholder}
                  aria-invalid={Boolean(state.fieldErrors?.confirmPassword)}
                  aria-describedby={state.fieldErrors?.confirmPassword ? "confirmPassword-error" : undefined}
                />
                {state.fieldErrors?.confirmPassword ? (
                  <span id="confirmPassword-error" className="mt-2 block text-sm font-bold text-[#ffb4a8]">
                    {state.fieldErrors.confirmPassword}
                  </span>
                ) : null}
              </label>
            ) : null}

            {!isSignIn ? (
              <label className="flex items-start gap-3 text-sm leading-6 text-white/68">
                <input
                  name="terms"
                  type="checkbox"
                  className="pf-focus mt-0.5 h-4 w-4 shrink-0 rounded border-white/24 bg-[#070B14]"
                  aria-invalid={Boolean(state.fieldErrors?.terms)}
                  aria-describedby={state.fieldErrors?.terms ? "terms-error" : undefined}
                />
                <span>{t.auth.terms}</span>
              </label>
            ) : null}
            {state.fieldErrors?.terms ? <span id="terms-error" className="-mt-3 block text-sm font-bold text-[#ffb4a8]">{state.fieldErrors.terms}</span> : null}

            <SubmitButton label={isSignIn ? t.auth.signInAction : t.auth.signUpAction} />
          </form>

          <div className="mt-6">
            <OAuthButtons providers={oauthProviders} next={next} />
          </div>

          <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.045] p-4 text-sm font-semibold leading-6 text-white/62">
            {isSignIn ? t.auth.needAccount : t.auth.haveAccount}{" "}
            <Link href={alternateHref} className="pf-focus rounded-sm font-black text-[#9ed0ff] hover:text-white">
              {isSignIn ? t.auth.createAccount : t.auth.backToSignIn}
            </Link>
          </div>
        </div>
        </section>
      </main>
    </div>
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
