"use client";

import { useTranslations } from "next-intl";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion";

const STEPS = [
  { n: "01", key: "library" },
  { n: "02", key: "plan" },
  { n: "03", key: "shop" },
] as const;

export function HowItWorks() {
  const t = useTranslations("howItWorks");
  return (
    <section id="how-it-works" className="border-y border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <FadeIn className="max-w-2xl">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("heading")}
          </h2>
        </FadeIn>
        <Stagger className="mt-12 grid gap-8 md:grid-cols-3">
          {STEPS.map((s) => (
            <StaggerItem key={s.n}>
              <div className="font-heading text-5xl font-bold text-brand/30">
                {s.n}
              </div>
              <h3 className="mt-3 text-xl font-semibold text-foreground">
                {t(`steps.${s.key}.title`)}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {t(`steps.${s.key}.body`)}
              </p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
