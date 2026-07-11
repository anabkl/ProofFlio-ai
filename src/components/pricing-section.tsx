"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, CreditCard, Sparkles } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import type { Copy } from "@/lib/content";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type BillingMode = "monthly" | "yearly";

export function PricingSection() {
  const { t } = useLocale();
  const [billing, setBilling] = useState<BillingMode>("monthly");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setHydrated(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <section id="plans" className="pricing-aurora relative overflow-hidden bg-[#02040a] py-24">
      <div className="absolute inset-0 pricing-grid opacity-70" />
      <div className="pricing-beam pricing-beam-a" aria-hidden="true" />
      <div className="pricing-beam pricing-beam-b" aria-hidden="true" />
      <div className="pf-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#9ed0ff]">{t.plans.kicker}</p>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">{t.plans.title}</h2>
          <p className="mt-5 text-base leading-8 text-white/64 sm:text-lg">{t.plans.body}</p>
          <div
            className="mx-auto mt-8 inline-flex rounded-lg border border-white/12 bg-white/7 p-1"
            aria-label={t.plans.billingLabel}
          >
            {(["monthly", "yearly"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                data-testid={`billing-${mode}`}
                disabled={!hydrated}
                onClick={() => setBilling(mode)}
                aria-pressed={billing === mode}
                aria-label={mode === "monthly" ? t.plans.monthly : t.plans.yearly}
                className={cn(
                  "pf-focus inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-black transition",
                  billing === mode ? "bg-white text-[#071021] shadow-[0_8px_28px_rgba(255,255,255,.16)]" : "text-white/62 hover:bg-white/8 hover:text-white",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-2 w-2 rounded-full transition",
                    billing === mode ? "bg-[#2dd4bf]" : "bg-white/24",
                  )}
                />
                {mode === "monthly" ? t.plans.monthly : t.plans.yearly}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {t.plans.tiers.map((tier, index) => (
            <PricingCard
              key={tier.id}
              tier={tier}
              price={billing === "monthly" ? tier.monthlyPrice : tier.yearlyPrice}
              billing={billing}
              featured={tier.id === "student"}
              aspirational={tier.id === "vip"}
              index={index}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-90px" }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.08 }}
          className="mt-10 rounded-lg border border-white/12 bg-[#071021]/82 p-3 shadow-[0_30px_120px_rgba(0,0,0,.36)] backdrop-blur"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-4 pt-2">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#9ed0ff]">{t.plans.tableTitle}</p>
              <p className="mt-2 text-sm leading-6 text-white/56">{t.plans.disclaimer}</p>
            </div>
            <CreditCard size={22} className="text-white/32" aria-hidden="true" />
          </div>
          <div className="overflow-x-auto" tabIndex={0} aria-label={t.plans.tableTitle}>
            <table className="min-w-[820px] w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr className="text-left text-white">
                  <th className="rounded-l-md border-y border-l border-white/10 bg-white/8 px-4 py-4 font-black">
                    {t.plans.feature}
                  </th>
                  {t.plans.tiers.map((tier) => (
                    <th
                      key={tier.id}
                      className={cn(
                        "border-y border-white/10 px-4 py-4 text-right font-black",
                        tier.id === "student" && "bg-[#4da3ff]/14 text-[#d8ecff]",
                        tier.id === "vip" && "rounded-r-md border-r bg-[#8b5cf6]/12 text-[#efe7ff]",
                        tier.id === "free" && "bg-white/8",
                      )}
                    >
                      {tier.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {t.plans.comparison.map(([feature, free, student, vip]) => (
                  <tr key={feature} className="group">
                    <td className="border-b border-white/8 px-4 py-4 font-bold text-white/72 group-hover:text-white">
                      {feature}
                    </td>
                    {[free, student, vip].map((value, index) => (
                      <td
                        key={`${feature}-${index}`}
                        className={cn(
                          "border-b border-white/8 px-4 py-4 text-right font-semibold text-white/58 group-hover:text-white/86",
                          index === 1 && "bg-[#4da3ff]/7",
                          index === 2 && "bg-[#8b5cf6]/7",
                        )}
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function PricingCard({
  tier,
  price,
  billing,
  featured,
  aspirational,
  index,
}: {
  tier: Copy["plans"]["tiers"][number];
  price: string;
  billing: BillingMode;
  featured: boolean;
  aspirational: boolean;
  index: number;
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-90px" }}
      transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.08 }}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setTilt({
          x: ((event.clientY - rect.top) / rect.height - 0.5) * -5,
          y: ((event.clientX - rect.left) / rect.width - 0.5) * 5,
        });
      }}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
      style={{ transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
      data-testid={`pricing-plan-${tier.id}`}
      data-billing={billing}
      className={cn(
        "relative min-h-[360px] rounded-lg border p-6 transition will-change-transform",
        featured
          ? "border-[#4da3ff]/60 bg-[#071b36]/92 shadow-[0_0_90px_rgba(77,163,255,.20)]"
          : "border-white/12 bg-white/[0.055]",
        aspirational && "border-[#a78bfa]/45 bg-[#160f2d]/84",
      )}
    >
      <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/55 to-transparent" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-white">{tier.name}</h3>
          {"badge" in tier && tier.badge ? (
            <span
              className={cn(
                "mt-3 inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-black",
                featured
                  ? "border-[#4da3ff]/40 bg-[#4da3ff]/16 text-[#cfe8ff]"
                  : "border-[#a78bfa]/36 bg-[#a78bfa]/12 text-[#efe7ff]",
              )}
            >
              {featured ? <BadgeCheck size={15} /> : <Sparkles size={15} />}
              {tier.badge}
            </span>
          ) : null}
        </div>
        <div className={cn("h-12 w-12 rounded-lg border", featured ? "border-[#4da3ff]/40 bg-[#4da3ff]/14" : "border-white/12 bg-white/8")} />
      </div>
      <div className="mt-8 text-4xl font-black tracking-tight text-white sm:text-5xl" aria-live="polite">
        {price}
      </div>
      <p className="mt-5 min-h-20 text-base leading-7 text-white/62">{tier.description}</p>
      <button
        type="button"
        className={cn(
          "pf-focus mt-8 inline-flex w-full items-center justify-center rounded-md px-4 py-3 text-sm font-black transition",
          featured
            ? "bg-[#f7fbff] text-[#071021] hover:bg-[#9ed0ff]"
            : "border border-white/14 bg-white/7 text-white hover:bg-white/12",
          aspirational && "border-[#a78bfa]/30 bg-[#efe7ff] text-[#120a24] hover:bg-white",
        )}
      >
        {tier.cta}
      </button>
    </motion.article>
  );
}
