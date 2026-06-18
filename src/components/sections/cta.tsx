"use client";

import { FadeIn } from "@/components/motion";
import { AppStoreButton } from "@/components/app-store-button";

export function CTA() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <FadeIn>
        <div className="relative overflow-hidden rounded-3xl bg-brand px-8 py-16 text-center text-brand-foreground">
          <h2 className="mx-auto max-w-2xl font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Cook the week with a little less friction.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-brand-foreground/85">
            Build your library once, then let the plan and the grocery list
            follow from it.
          </p>
          <div className="mt-8 flex justify-center">
            <AppStoreButton className="bg-background text-foreground" />
          </div>
          <p className="mt-3 text-sm text-brand-foreground/75">
            On iPhone, iOS 17 and later.
          </p>
        </div>
      </FadeIn>
    </section>
  );
}
