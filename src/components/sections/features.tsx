"use client";

import { BookOpen, CalendarDays, ShoppingBasket, Camera } from "lucide-react";
import { useTranslations } from "next-intl";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion";

const FEATURES = [
  { icon: BookOpen, key: "library" },
  { icon: CalendarDays, key: "plan" },
  { icon: ShoppingBasket, key: "groceries" },
  { icon: Camera, key: "photo" },
] as const;

export function Features() {
  const t = useTranslations("features");
  return (
    <section id="features" className="mx-auto max-w-6xl px-5 py-20">
      <FadeIn className="max-w-2xl">
        <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {t("heading")}
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">{t("lead")}</p>
      </FadeIn>
      <Stagger className="mt-12 grid gap-6 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <StaggerItem key={f.key}>
            <div className="h-full rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-lg">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint text-brand">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                {t(`items.${f.key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t(`items.${f.key}.body`)}
              </p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
