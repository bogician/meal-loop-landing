"use client";

import { useTranslations } from "next-intl";
import { FadeIn } from "@/components/motion";
import { AppStoreButton } from "@/components/app-store-button";

export function CTA() {
  const t = useTranslations("cta");
  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <FadeIn>
        <div className="relative overflow-hidden rounded-3xl bg-brand px-8 py-16 text-center text-brand-foreground">
          <h2 className="mx-auto max-w-2xl font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            {t("heading")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-brand-foreground/85">
            {t("body")}
          </p>
          <div className="mt-8 flex justify-center">
            <AppStoreButton className="bg-background text-foreground" />
          </div>
          <p className="mt-3 text-sm text-brand-foreground/75">
            {t("availability")}
          </p>
        </div>
      </FadeIn>
    </section>
  );
}
